import re
import json
from typing import Optional, Dict, Any, List
import google.generativeai as genai
 # adjust to your config path
from datetime import date
# core_logic.py
#import google.generativeai as genai
import json
from typing import List
from ..models import Batch, ShiftEntry, Product
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
    "api_key": "AIzaSyDayivPID60hBMZCcWHAqctT1U0Wr9ACYg",
}

# Keep a small utility for printing DB values exactly, else "N/A"
def _fmt(v):
    if v is None:
        return "N/A"
    if isinstance(v, (date,)):
        return v.isoformat()
    return str(v)


def detect_intent(query: str) -> Dict[str, Any]:
    """
    Lightweight intent detection:
    - entity_type: "product" | "batch" | "shift" | "analytics" | "unknown"
    - entity_identifier: extracted id/name if present (e.g. '89' or 'Batch-89' or product name)
    """
    q = query.lower()
    # batch id like "batch 89" or "batch-89" or "batch-89"
    m = re.search(r"batch[\s\-#]*([0-9A-Za-z\-]+)", q)
    if m:
        return {"entity_type": "batch", "identifier": m.group(1)}

    # product name (heuristic: "product nestle" or "nestle juice" or "nestle_juice")
    m = re.search(r"product[s]?\s+([a-z0-9_\- ]+)", q)
    if m:
        return {"entity_type": "product", "identifier": m.group(1).strip()}

    # direct product name mentions without the word 'product'
    m = re.search(r"nestle[_ ]?juice|[a-z0-9_]+", query, re.I)
    # We avoid matching generic tokens here; DB lookup will confirm
    if "batch" not in q and ("product" in q or "products" in q or "show me" in q or "list" in q):
        return {"entity_type": "product", "identifier": None}

    if "shift" in q or "shift entry" in q or "shift entries" in q:
        return {"entity_type": "shift", "identifier": None}

    # analytics questions
    if any(tok in q for tok in ["highest", "lowest", "average", "mean", "max", "min", "which batch", "which product"]):
        return {"entity_type": "analytics", "identifier": None}

    # fallback
    return {"entity_type": "unknown", "identifier": None}


def answer_batch(db, org_id: int, identifier: Optional[str]) -> Optional[str]:
    """
    Return a string answer for a batch. identifier may be batch_number or id fragment.
    """
    from app.models import Batch, ShiftEntry

    if identifier:
        # Try exact match on batch_number
        batch = db.query(Batch).filter(
            Batch.organization_id == org_id,
            Batch.batch_number.ilike(f"%{identifier}%")
        ).first()
    else:
        # If no identifier, list batches
        batches = db.query(Batch).filter(Batch.organization_id == org_id).limit(50).all()
        if not batches:
            return None
        lines = ["📦 Batches:"]
        for b in batches:
            lines.append(f"- {b.batch_number} | Product ID: {b.product_id} | Start: {_fmt(b.start_date)} | End: {_fmt(b.end_date)} | Status: {_fmt(b.status.value if b.status else None)}")
        return "\n".join(lines)

    if not batch:
        return None

    # Get shift entries for batch
    shifts = db.query(ShiftEntry).filter(
        ShiftEntry.batch_id == batch.id
    ).order_by(ShiftEntry.date.asc()).all()

    lines = [
        f"📦 Batch: {batch.batch_number}",
        f"Product ID: {batch.product_id}",
        f"Start Date: {_fmt(batch.start_date)}",
        f"End Date: {_fmt(batch.end_date)}",
        f"Status: {_fmt(batch.status.value if batch.status else None)}",
    ]

    if shifts:
        lines.append("\n👷 Shift Entries:")
        for s in shifts:
            # input_materials and output_products are JSONDecimal -> native types
            inputs = json.dumps(s.input_materials) if s.input_materials is not None else "N/A"
            outputs = json.dumps(s.output_products) if s.output_products is not None else "N/A"
            lines.append(f"- Date: {_fmt(s.date)} | Shift: {_fmt(s.shift_no)} | Inputs: {inputs} | Outputs: {outputs} | Notes: {_fmt(s.admin_notes)}")
    else:
        lines.append("\n👷 Shift Entries: None found for this batch.")

    return "\n".join(lines)


def answer_product(db, org_id: int, identifier: Optional[str]) -> Optional[str]:
    """
    Return string answer for products. identifier may be partial name.
    """
    from app.models import Product, Batch

    if identifier:
        products = db.query(Product).filter(
            Product.organization_id == org_id,
            Product.name.ilike(f"%{identifier}%")
        ).all()
    else:
        products = db.query(Product).filter(Product.organization_id == org_id).all()

    if not products:
        return None

    lines = ["🧩 Products:"]
    for p in products:
        # Get recent batches summary
        recent_batches = db.query(Batch).filter(Batch.product_id == p.id).order_by(Batch.start_date.desc()).limit(5).all()
        lines.append(f"- {p.name} | Description: {_fmt(p.description)}")
        lines.append(f"  • Input fields: {json.dumps(p.input_fields) if p.input_fields is not None else 'N/A'}")
        lines.append(f"  • Output fields: {json.dumps(p.output_fields) if p.output_fields is not None else 'N/A'}")
        if recent_batches:
            b_summ = ", ".join([f"{b.batch_number}({ _fmt(b.start_date) })" for b in recent_batches])
            lines.append(f"  • Recent batches: {b_summ}")
    return "\n".join(lines)


def answer_shift(db, org_id: int) -> Optional[str]:
    """
    Return a list / summary of recent shift entries for the organization.
    """
    from app.models import ShiftEntry, Batch

    shifts = (
        db.query(ShiftEntry)
        .join(Batch, ShiftEntry.batch_id == Batch.id)
        .filter(ShiftEntry.organization_id == org_id)
        .order_by(ShiftEntry.date.desc())
        .limit(50)
        .all()
    )
    if not shifts:
        return None

    lines = ["👷 Shift Entries:"]
    for s in shifts:
        product = getattr(s.batch, "product", None)
        product_name = product.name if product else f"ProductID:{s.batch.product_id if s.batch else 'N/A'}"
        inputs = json.dumps(s.input_materials) if s.input_materials is not None else "N/A"
        outputs = json.dumps(s.output_products) if s.output_products is not None else "N/A"
        lines.append(
            f"- Date: {_fmt(s.date)} | Batch: {s.batch.batch_number if s.batch else s.batch_id} | Product: {product_name} | Shift: {_fmt(s.shift_no)} | Inputs: {inputs} | Outputs: {outputs}"
        )
    return "\n".join(lines)


def run_analytics(db, org_id: int, query: str) -> Optional[str]:
    """
    Very small analytic handlers: highest/lowest/average by total outputs per batch (if asked).
    If no analytic intent matched, return None to fall back to RAG.
    """
    from app.models import Batch, ShiftEntry
    # Example: "which batch had highest total output" - we do not have total_output column on batch,
    # but we can sum shift_entries.output_products amounts if structured consistently.
    q = query.lower()
    if any(tok in q for tok in ["highest output", "max output", "which batch had highest"]):
        # Try aggregating from shift_entries.output_products
        batches = db.query(Batch).filter(Batch.organization_id == org_id).all()
        batch_sums = []
        for b in batches:
            shifts = db.query(ShiftEntry).filter(ShiftEntry.batch_id == b.id).all()
            total = 0.0
            found = False
            for s in shifts:
                if s.output_products:
                    # output_products expected as dict {field: {"amount": X}}
                    for v in (s.output_products or {}).values():
                        try:
                            amt = float(v.get("amount", 0))
                            total += amt
                            found = True
                        except Exception:
                            continue
            if found:
                batch_sums.append((b, total))
        if not batch_sums:
            return "No output quantities found for any batch to compute highest output."
        batch_sums.sort(key=lambda t: t[1], reverse=True)
        top_batch, top_total = batch_sums[0]
        return f"Batch with highest total output: {top_batch.batch_number} — total output (aggregated from shifts): {top_total}"
    if any(tok in q for tok in ["average energy", "avg energy", "average hours"]):
        shifts = db.query(ShiftEntry).filter(ShiftEntry.organization_id == org_id).all()
        if not shifts:
            return "No shift entries available to compute averages."
        # Try energy/hours if stored inside input_materials or admin_notes - schema doesn't have direct energy/hours fields.
        # Return fallback message explaining nothing to compute
        return "Your shifts don't store explicit 'energy' or 'labour_hours' fields in the current schema. To compute these averages, add 'energy' or 'labour_hours' in `ShiftEntry.input_materials` or add explicit columns."
    return None


def get_rag_chatbot_response(records: dict, query: str) -> dict:
    """
    Fallback to your existing RAG/GenAI system. This uses format_records_for_ai1-like
    formatting if desired. Keep minimal here: pass records as the context.
    """
    api_key = APP_CONFIG.get("api_key")
    if not api_key:
        return {"error": "API key not configured."}

    # Build a minimal prompt using JSON context + user question
    try:
        records_json = json.dumps(records, default=str)
    except Exception:
        records_json = str(records)

    system_instruction = (
        "You are an assistant for Productix. Answer only from the provided records."
    )
    prompt = f"Context:\n{records_json}\n\nUser Question: {query}"

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("models/gemini-2.5-flash", system_instruction=system_instruction)
        response = model.generate_content(prompt)
        answer = getattr(response, "text", "").strip() or "No response generated."
        return {"response": answer}
    except Exception as e:
        return {"error": f"RAG error: {str(e)}"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from ..deps import get_current_user

from typing import Dict, Any
import json

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


def serialize(obj):
    data = {}
    for k, v in obj.__dict__.items():
        if not k.startswith("_sa_"):
            data[k] = v
    return data


@router.post("/rag", summary="Run RAG Chatbot (hybrid DB + AI)", response_model=schemas.ChatbotResponse)
def chatbot_query(payload: Dict[str, Any], db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = payload.get("query")
    if not query:
        raise HTTPException(status_code=400, detail="Query is required.")

    org_id = current_user.organization_id

    try:
        # 1) Detect intent
        intent = detect_intent(query)

        # 2) Direct DB answers based on intent
        answer = None
        if intent["entity_type"] == "batch":
            answer = answer_batch(db, org_id, intent.get("identifier"))
        elif intent["entity_type"] == "product":
            answer = answer_product(db, org_id, intent.get("identifier"))
        elif intent["entity_type"] == "shift":
            answer = answer_shift(db, org_id)
        elif intent["entity_type"] == "analytics":
            answer = run_analytics(db, org_id, query)

        # 3) If we found a DB answer, return it (and save history)
        if answer:
            # Save history (store records minimally)
            try:
                from app.models import ChatbotHistory
                history = ChatbotHistory(
                    organization_id=org_id,
                    user_id=current_user.id,
                    query=query,
                    response=answer,
                    records={}  # Keep minimal: we could attach serialized records if desired
                )
                db.add(history)
                db.commit()
            except Exception:
                # Do not fail the whole request on history save error
                db.rollback()

            return {"query": query, "response": {"text": answer}}

        # 4) If no DB direct answer, prepare context data and call RAG fallback
        # Fetch org-level records to include as context for RAG (limited size)
        products = db.query(models.Product).filter(models.Product.organization_id == org_id).limit(200).all()
        batches = db.query(models.Batch).filter(models.Batch.organization_id == org_id).limit(200).all()
        shift_entries = db.query(models.ShiftEntry).filter(models.ShiftEntry.organization_id == org_id).limit(500).all()

        context_data = {
            "products": [serialize(p) for p in products],
            "batches": [serialize(b) for b in batches],
            "shift_entries": [serialize(s) for s in shift_entries],
        }

        rag_result = get_rag_chatbot_response(context_data, query)
        if "error" in rag_result:
            # return an error-like message but include DB context info
            return {"query": query, "response": {"text": f"RAG error: {rag_result['error']}. You can still query products/batches directly."}}

        rag_text = rag_result.get("response") if isinstance(rag_result, dict) else str(rag_result)

        # Save to history
        try:
            from app.models import ChatbotHistory
            history = ChatbotHistory(
                organization_id=org_id,
                user_id=current_user.id,
                query=query,
                response=rag_text,
                records=context_data
            )
            db.add(history)
            db.commit()
        except Exception:
            db.rollback()

        return {"query": query, "response": {"text": rag_text}}

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"query": query, "response": {"text": f"Error processing request: {str(e)}"}}
