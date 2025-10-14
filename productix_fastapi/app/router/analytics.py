from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, List
from ..database import get_db
from ..models import AIAnalysis, Product, Batch, ShiftEntry, User
from ..deps import get_current_user
from ..schemas import AnalysisCountResponse, ProductivityRecordsResponse, ProductRecord

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get(
    "/productivity-records",
    summary="Fetch productivity records for logged-in tenant",
    response_model=ProductivityRecordsResponse
)
def get_productivity_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, List[ProductRecord]]:
    """
    Returns all productivity records for the current user's tenant.
    Fetches products, their batches, and shift entries.
    Calculates combined and single productivity for each shift entry.
    Output format is a dictionary keyed by product name.
    """
    records_dict: Dict[str, List[ProductRecord]] = {}

    # Fetch all products for this organization
    products = db.query(Product).filter(
        Product.organization_id == current_user.organization_id
    ).all()

    for product in products:
        records_dict[product.name] = []

        # Fetch all batches for this product
        batches = db.query(Batch).filter(
            Batch.organization_id == current_user.organization_id,
            Batch.product_id == product.id
        ).all()

        for batch in batches:
            # Fetch all shift entries for this batch
            shifts = db.query(ShiftEntry).filter(
                ShiftEntry.organization_id == current_user.organization_id,
                ShiftEntry.batch_id == batch.id
            ).all()

            for shift in shifts:
                # Calculate combined and single productivity
                inputs = shift.input_materials or {}
                outputs = shift.output_products or {}

                combined_productivity = None
                single_productivity = {}

                # Example: Combined productivity = sum(outputs.values()) / sum(inputs.values()) * 100
                try:
                    total_input = sum(float(v) for v in inputs.values())
                    total_output = sum(float(v) for v in outputs.values())
                    if total_input > 0:
                        combined_productivity = round((total_output / total_input) * 100, 2)
                except Exception:
                    combined_productivity = None

                # Single productivity: input_key / output_key ratios
                for input_key, input_val in inputs.items():
                    for output_key, output_val in outputs.items():
                        try:
                            ratio = (float(output_val) / float(input_val)) * 100
                            single_productivity[f"{input_key} / {output_key}"] = round(ratio, 2)
                        except Exception:
                            single_productivity[f"{input_key} / {output_key}"] = None

                combined_record = ProductRecord(
                    calculation_id=shift.id,
                    date=shift.date.isoformat() if shift.date else None,
                    inputs=inputs,
                    outputs=outputs,
                    combined_productivity=combined_productivity,
                    single_productivity=single_productivity
                )
                records_dict[product.name].append(combined_record)

    return  records_dict


@router.get(
    "/analysis-count",
    summary="Get count of AI analyses for tenant",
    response_model=AnalysisCountResponse
)
def get_analysis_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the total number of AI analysis records for the current user's tenant.
    """
    count = db.query(AIAnalysis).filter(
        AIAnalysis.organization_id == current_user.organization_id
    ).count()
    return {"analysis_count": count}