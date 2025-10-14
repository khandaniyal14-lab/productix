from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from app.database import get_db
from app.models import Product, Batch, ShiftEntry
from app.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db), tenant=Depends(get_current_user)):
    org_id = tenant.organization_id

    # --- Basic counts ---
    total_products = db.query(Product).filter(Product.organization_id == org_id).count()
    running_batches = db.query(Batch).filter(
        Batch.organization_id == org_id, Batch.status == "open"
    ).count()
    shifts_today = (
        db.query(ShiftEntry)
        .filter(ShiftEntry.organization_id == org_id, ShiftEntry.date == date.today())
        .count()
    )

    # --- Aggregates ---
    total_output_units = 0.0
    total_cost = 0.0
    productivity_ratios = []

    # --- Loop through products for totals ---
    products = db.query(Product).filter(Product.organization_id == org_id).all()
    for product in products:
        product_entries = (
            db.query(ShiftEntry)
            .join(Batch, ShiftEntry.batch_id == Batch.id)
            .filter(Batch.product_id == product.id)
            .all()
        )

        product_output = 0.0
        product_input_cost = 0.0

        for entry in product_entries:
            # --- Output total ---
            if entry.output_products:
                for val in entry.output_products.values():
                    product_output += float(val.get("amount", 0))

            # --- Input cost total ---
            if entry.input_materials:
                for val in entry.input_materials.values():
                    amt = float(val.get("amount", 0))
                    price = float(val.get("unit_price", 0))
                    product_input_cost += amt * price

        if product_output > 0 and product_input_cost > 0:
            ratio = (product_output / product_input_cost) * 100
            productivity_ratios.append(ratio)

        total_output_units += product_output
        total_cost += product_input_cost

    # --- Calculated metrics ---
    avg_cost_per_unit = round(total_cost / total_output_units, 2) if total_output_units else 0
    avg_productivity_ratio = (
        round(sum(productivity_ratios) / len(productivity_ratios), 2)
        if productivity_ratios else 0
    )

    # --- Response matching your UI ---
    return {
        "title": "Dashboard Analytics",
        "subtitle": "Real-time insights into your production metrics",
        "metrics": {
            "total_products": total_products,
            "running_batches": running_batches,
            "shifts_today": shifts_today,
            "total_output_units": round(total_output_units, 2),
            "avg_cost_per_unit": f"${avg_cost_per_unit:.2f}",
            "productivity_ratio": f"{avg_productivity_ratio:.2f}",
        },
    }
