# core_logic.py
#import google.generativeai as genai
import json
from typing import List
from .models import Batch, ShiftEntry, Product
from sqlalchemy.orm import Session
import numpy as np
import os
from collections import defaultdict
from google import generativeai as genai
from dotenv import load_dotenv
import re



load_dotenv()  # ✅ loads .env file

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

APP_CONFIG = {
    "api_key": "AIzaSyBRRtjyJjmK3OxKJW7RSmF4VAkbX--0KOA",
}


def _format_records_for_ai(records: dict) -> str:
    """
    Formats a dictionary of ProductRecord objects into a string suitable
    for the AI agent. Each key in `records` is a product name, and
    the value is a list of ProductRecord objects.
    """
    context = "Here is the historical productivity data:\n\n"
    record_count = 1

    for product_name, batches in records.items():
        for batch in batches:
            # Use getattr for optional fields or dot notation
            batch_no = getattr(batch, "batch_no", "N/A")
            date = getattr(batch, "date", "N/A")
            inputs = getattr(batch, "inputs", {})
            outputs = getattr(batch, "outputs", {})
            combined = getattr(batch, "combined_productivity", "N/A")
            single = getattr(batch, "single_productivity", {})

            context += f"--- Record {record_count} (Product: {product_name}, Batch: {batch_no}) ---\n"
            context += f"Date: {date}\n"
            context += "Inputs: " + json.dumps(inputs) + "\n"
            context += "Outputs: " + json.dumps(outputs) + "\n"
            context += f"Combined Productivity: {combined}\n"
            context += "Single Input Productivity: " + json.dumps(single) + "\n\n"

            record_count += 1

    return context



def perform_calculation(inputs: dict, outputs: dict) -> dict:
    """
    Performs the core productivity calculation based on input and output dictionaries.
    This logic is migrated directly from the `calculate_productivity` method.

    Args:
        inputs: A dictionary of input names and their numeric values.
        outputs: A dictionary of output names and their numeric values.

    Returns:
        A dictionary containing the calculated results or an error message.
    """
    total_input_value = 0
    valid_inputs = {}
    for key, value in inputs.items():
        try:
            float_value = float(value)
            total_input_value += float_value
            valid_inputs[key] = float_value
        except (ValueError, TypeError):
            # In a web API, we log errors instead of showing a pop-up
            print(f"Warning: Could not convert input '{key}' with value '{value}' to a number.")
            continue

    if not outputs:
        return {"error": "Output data is missing."}

    first_output_key = list(outputs.keys())[0]
    output_name_formatted = first_output_key.replace('_', ' ').title()
    try:
        first_output_value = float(outputs[first_output_key])
    except (ValueError, TypeError):
        return {"error": f"Invalid output value: '{outputs[first_output_key]}'."}

    # 1. Calculate Combined Input Productivity
    if total_input_value != 0:
        total_productivity = first_output_value / total_input_value
        total_productivity_text = f"Productivity = {total_productivity:.2f}"
    else:
        total_productivity_text = "Productivity = Cannot divide by zero"

    # 2. Calculate Single Input Productivity
    individual_productivity_results = {}
    if valid_inputs:
        for input_name, input_value in valid_inputs.items():
            if input_value != 0:
                individual_productivity = first_output_value / input_value
                result_text = f"{individual_productivity:.2f}"
            else:
                result_text = "Cannot divide by zero"
            individual_productivity_results[f"{input_name} / {output_name_formatted}"] = result_text

    return {
        "combined_productivity": total_productivity_text,
        "single_productivity": individual_productivity_results,
        "processed_inputs": valid_inputs,
        "processed_outputs": {output_name_formatted: first_output_value}
    }


def get_ai_analysis(calculation_data: dict) -> dict:
    """
    Analyzes a single calculation's data using the Gemini API.
    This logic is migrated from the `analyze_with_ai` method.

    Args:
        calculation_data: A dictionary containing all data from a calculation.

    Returns:
        A dictionary with the parsed AI analysis or an error message.
    """
    api_key = APP_CONFIG.get("api_key")
    if not api_key or api_key == "AIzaSyBRRtjyJjmK3OxKJW7RSmF4VAkbX--0KOA":
        return {"error": "API Key is not configured."}

    # Format the data into a string for the prompt
    prompt_data = f"Combined Input Productivity: {calculation_data.get('combined_productivity', 'N/A')}\n"
    prompt_data += f"Targeted Productivity: {calculation_data.get('targeted_productivity', 'N/A')}\n"
    prompt_data += f"Standard Productivity: {calculation_data.get('standard_productivity', 'N/A')}\n"
    prompt_data += "\nInputs Used:\n" + "".join(f"- {n}: {v}\n" for n, v in calculation_data.get('inputs', {}).items())
    prompt_data += "\nOutput Used:\n" + "".join(f"- {n}: {v}\n" for n, v in calculation_data.get('outputs', {}).items())
    prompt_data += "\nSingle Input Productivity Scores:\n" + "".join(f"- {n}: {v}\n" for n, v in calculation_data.get('single_productivity', {}).items())

    system_instruction = """You are an expert productivity analyst. Analyze the provided manufacturing data.
    Your response MUST be structured exactly as follows, using these exact headers in brackets:

    [EFFICIENCY SCORE]
    Provide a single, overall efficiency score as a percentage (e.g., 85%).

    [AI PREDICTION]
    Provide a brief, one or two-sentence prediction about future productivity if current trends continue.

    [TOP INEFFICIENCIES]
    Identify the top 2-3 most significant inefficiencies as a bulleted list.

    [AI PRESCRIPTIONS]
    Provide a bulleted list of 2-3 specific, actionable steps to improve productivity.
    """
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('models/gemini-2.5-flash', system_instruction=system_instruction)
        response = model.generate_content(prompt_data)
        ai_text = response.text

        def parse_section(text, start_tag, end_tag):
            try:
                start = text.index(start_tag) + len(start_tag)
                end = text.index(end_tag)
                return text[start:end].strip().replace('* ', '- ')
            except ValueError:
                return f"Section '{start_tag}' not found in AI response."

        ai_text_with_end_tag = ai_text + "\n[END]"
        analysis = {
            "efficiency_score": parse_section(ai_text_with_end_tag, "[EFFICIENCY SCORE]", "[AI PREDICTION]"),
            "ai_prediction": parse_section(ai_text_with_end_tag, "[AI PREDICTION]", "[TOP INEFFICIENCIES]"),
            "top_inefficiencies": parse_section(ai_text_with_end_tag, "[TOP INEFFICIENCIES]", "[AI PRESCRIPTIONS]"),
            "ai_prescriptions": parse_section(ai_text_with_end_tag, "[AI PRESCRIPTIONS]", "[END]"),
        }
        return analysis
    except Exception as e:
        return {"error": f"An error occurred during AI analysis: {e}"}


def format_records_for_ai1(records: dict):
    """
    Create a readable summary of product, batch, and shift data for RAG.
    Handles missing fields gracefully (no KeyErrors).
    """
    formatted = []

    # --- Products ---
    if "products" in records:
        formatted.append("🧩 Products:")
        for p in records["products"]:
            name = p.get("name") or p.get("product_name") or f"Product-{p.get('id', 'N/A')}"
            formatted.append(
                f"  - {name} | Unit: {p.get('unit', 'N/A')} | Cost: {p.get('unit_cost', 'N/A')}"
            )

    # --- Batches ---
    if "batches" in records:
        formatted.append("\n📦 Batches:")
        for b in records["batches"]:
            batch_name = b.get("name") or b.get("batch_no") or f"Batch-{b.get('id', 'N/A')}"
            formatted.append(
                f"  - {batch_name} | Date: {b.get('date', 'N/A')} | Total Output: {b.get('total_output', 'N/A')}"
            )

    # --- Shift Entries ---
    if "shift_entries" in records:
        formatted.append("\n👷 Shift Entries:")
        for s in records["shift_entries"]:
            formatted.append(
                f"  - Batch ID: {s.get('batch_id', 'N/A')} | Hours: {s.get('labour_hours', 'N/A')} | Energy: {s.get('energy_kwh', 'N/A')}"
            )

    return "\n".join(formatted)



def get_rag_chatbot_response(records: dict, query: str) -> dict:
    """
    Uses Gemini to answer questions based only on provided records.
    """
    api_key = APP_CONFIG.get("api_key")
    if not api_key:
        return {"error": "API Key is not configured."}

    records_context = format_records_for_ai1(records)
    system_instruction = (
        "You are a helpful assistant for the Productix app. "
        "Answer questions *only* from the given data. "
        "If info is missing, say it's not available."
    )
    prompt = records_context + "\nUser Question: " + query

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("models/gemini-2.5-flash", system_instruction=system_instruction)
        response = model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e:
        return {"error": f"Chatbot error: {e}"}


def get_ai_agent_report(records: dict, goal: str) -> dict:
    """
    Performs a multi-step analysis of records to generate a report.
    This logic is migrated from the `AIAgentDialog` class.
    """
    api_key = APP_CONFIG.get("api_key")
    if not api_key: return {"error": "API Key is not configured."}

    records_context = _format_records_for_ai(records)

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('models/gemini-2.5-flash')

        # Step 1: Create a plan
        plan_prompt = f"Based on the user goal '{goal}' and the following data, create a step-by-step plan to analyze the data.\n\nData:\n{records_context}"
        plan_response = model.generate_content(plan_prompt)
        plan = plan_response.text

        # Step 2: Execute the plan and generate the report
        report_prompt = f"Execute the following plan using the provided data to achieve the user's goal '{goal}'. Generate a detailed report of your findings, citing specific data points.\n\nPlan:\n{plan}\n\nData:\n{records_context}"
        report_response = model.generate_content(report_prompt)
        report = report_response.text

        return {"plan": plan, "report": report}
    except Exception as e:
        return {"error": f"An error occurred in the AI agent: {e}"}





# -----------------------------
# Helper: calculate inefficiencies
# -----------------------------


def ai_analysis_for_batch(batch: Batch, shift_entries: list[ShiftEntry]):
    """
    Takes a Batch object and its ShiftEntry list,
    returns AI analysis with:
    - predicted output
    - top 3 inefficiencies
    - top inefficiency scores
    - 3 actionable recommendations
    """
    # Prepare shift data
    shift_data_for_ai = []
    for e in shift_entries:
        input_materials = json.loads(e.input_materials) if isinstance(e.input_materials, str) else e.input_materials or []
        output_products = json.loads(e.output_products) if isinstance(e.output_products, str) else e.output_products or []
        shift_data_for_ai.append({
            "shift_no": e.shift_no,
            "date": str(e.date),
            "input_materials": input_materials,
            "output_products": output_products
        })

    # Build AI prompt
    prompt = f"""
You are a production analyst. Here is the shift data for batch {batch.batch_number}:

{json.dumps(shift_data_for_ai, indent=2)}

Please provide the following in a JSON object:
1. predicted_output_next_shift: numeric prediction for the next shift output
2. top_3_inefficiencies: array of top 3 inefficiency sources with explanation
3. top_inefficiency_scores: array of numeric scores (0-100) corresponding to each top inefficiency
4. ai_recommendations: array of 3 short actionable recommendations (1-2 sentences each)

Return ONLY valid JSON, no extra text.
"""

    # Call AI model
    model = genai.GenerativeModel("models/gemini-2.5-flash")
    try:
        response = model.generate_content(prompt, request_options={"timeout": 60})
        raw_text = response.text.strip() if hasattr(response, "text") else ""

        # Extract JSON safely
        match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if match:
            try:
                ai_result = json.loads(match.group(0))
            except Exception:
                ai_result = {"error": "Failed to parse AI response JSON"}
        else:
            ai_result = {"error": "No JSON found in AI response"}

    except Exception as e:
        ai_result = {"error": f"AI generation failed: {str(e)}"}

    return ai_result

# -----------------------------
# Product-level AI Trend Analysis
# -----------------------------

# -----------------------------
# RAG Chatbot Function
# -----------------------------

def rag_chat_response(db: Session, organization_id: int, query: str):
    """
    Returns a context-aware answer from organization-specific data
    using Google GenAI (Gemini). The response is based on products,
    batches, and shift entries.
    """

    # ------------------------
    # Fetch Products
    # ------------------------
    products = db.query(Product).filter(Product.organization_id == organization_id).all()
    product_context = "\n".join(
        [f"Product {p.id}: {p.name} | Description: {p.description or 'No description'}" for p in products]
    ) or "No products available."

    # ------------------------
    # Fetch Batches
    # ------------------------
    batches = db.query(Batch).filter(Batch.organization_id == organization_id).all()
    batch_context = "\n".join(
        [
            f"Batch {b.id} ({b.batch_no}) | Product: {b.product.name if b.product else 'N/A'} "
            f"| Start: {b.start_date} | End: {b.end_date or 'Ongoing'} | Status: {b.status.value if b.status else 'N/A'}"
            for b in batches
        ]
    ) or "No batches available."

    # ------------------------
    # Fetch Shift Entries
    # ------------------------
    shift_entries = (
        db.query(ShiftEntry)
        .join(Batch, ShiftEntry.batch_id == Batch.id)
        .filter(Batch.organization_id == organization_id)
        .all()
    )
    shift_context = "\n".join(
        [
            f"{s.date} | Shift {s.shift_no.value if s.shift_no else 'N/A'} | Batch {s.batch.batch_no if s.batch else s.batch_id}\n"
            f"  - Output Units: {s.output_units or 0}\n"
            f"  - Energy: {float(s.energy_kwh or 0)} kWh @ {float(s.unit_price_kwh or 0)} per kWh (Cost: {float(s.energy_cost or 0)})\n"
            f"  - Machine: {float(s.machine_hours or 0)} hrs @ {float(s.unit_price_machine_hour or 0)} per hr (Cost: {float(s.machine_cost or 0)})\n"
            f"  - Worker: {float(s.worker_hours or 0)} hrs @ {float(s.unit_price_worker_hour or 0)} per hr (Cost: {float(s.worker_cost or 0)})\n"
            f"  - Total Cost: {float(s.total_cost or 0)}"
            for s in shift_entries
        ]
    ) or "No shift entries available."

    # ------------------------
    # Build Prompt for GenAI
    # ------------------------
    prompt = f"""
You are a productivity assistant. Use only the following organization data to answer.

Products:
{product_context}

Batches:
{batch_context}

Shift Entries:
{shift_context}

User question: {query}

Provide a clear, actionable answer based only on the data above.
"""

    # ------------------------
    # Generate Response using Gemini AI
    # ------------------------
    model = genai.GenerativeModel("models/gemini-2.5-flash")
    response = model.generate_content(prompt)

    # Wrap the response in dictionary for FastAPI
    answer_text = response.text if response.text else "No relevant data found."
    return {"response": {"text": answer_text}}
