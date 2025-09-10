# core_logic.py
import google.generativeai as genai
import json

# This dictionary holds settings that your service will need.
# In a real-world scenario, the API key should be loaded securely
# from an environment variable, not hardcoded.
APP_CONFIG = {
    "api_key": "AIzaSyDayivPID60hBMZCcWHAqctT1U0Wr9ACYg",
}


def _format_records_for_ai(records: dict) -> str:
    """
    Formats a dictionary of calculation records from the database into a single,
    well-structured string that can be used as context for the AI models.
    This logic is extracted from the ChatbotDialog and AIAgentDialog classes.
    """
    context = "Here is the historical productivity data:\n\n"
    # The records from the desktop app are nested in a dictionary by product name.
    # We need to iterate through them to flatten the list for the AI.
    record_count = 1
    for product_name, batches in records.items():
        for batch in batches:
            context += f"--- Record {record_count} (Product: {product_name}, Batch: {batch.get('batch_no', 'N/A')}) ---\n"
            context += f"Date: {batch.get('date', 'N/A')}\n"
            context += "Inputs: " + json.dumps(batch.get('inputs', {})) + "\n"
            context += "Outputs: " + json.dumps(batch.get('outputs', {})) + "\n"
            context += f"Combined Productivity: {batch.get('combined', 'N/A')}\n"
            context += "Single Input Productivity: " + json.dumps(batch.get('single', {})) + "\n\n"
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
    if not api_key or api_key == "YOUR_API_KEY_HERE":
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
        model = genai.GenerativeModel('gemini-1.5-flash-latest', system_instruction=system_instruction)
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


def get_rag_chatbot_response(records: dict, query: str) -> dict:
    """
    Answers a user's question based on a provided history of records (RAG).
    This logic is migrated from the `ChatbotDialog` class.
    """
    api_key = APP_CONFIG.get("api_key")
    if not api_key: return {"error": "API Key is not configured."}

    records_context = _format_records_for_ai(records)
    system_instruction = """You are a helpful assistant for the Productix application. Your task is to answer the user's questions based *only* on the provided productivity records data. Do not make up information. If the answer cannot be found in the data, clearly state that the information is not in the provided records."""
    prompt = records_context + "\nUser Question: " + query

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash-latest', system_instruction=system_instruction)
        response = model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e:
        return {"error": f"An error occurred in the chatbot: {e}"}


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
        model = genai.GenerativeModel('gemini-1.5-flash-latest')

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

