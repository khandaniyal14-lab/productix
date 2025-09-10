# fastapi_app.py
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List
from fastapi import Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from .models import User, Tenant, AIData, ProductivityCalculation, AIAnalysis,ChatbotHistory, AIReport
from .schemas import SignUpSchema, LoginSchema, TokenSchema
from .auth import hash_password, verify_password, create_access_token
from .dependencies import  get_current_user
from fastapi.security import HTTPBearer
security = HTTPBearer()
Base.metadata.create_all(bind=engine)
# Import the core logic functions from the file we just created
from .core_logic import (
    perform_calculation,
    get_ai_analysis,
    get_rag_chatbot_response,
    get_ai_agent_report
)
app = FastAPI(
    title="Productix AI & Calculation Engine",
    description="A high-performance API for all productivity calculations and AI-driven analysis features of the Productix application.",
    version="1.0.0"
)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # add production URL here later, e.g. "https://yourdomain.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Allowed origins
    allow_credentials=True,
    allow_methods=["*"],         # Allow all HTTP methods
    allow_headers=["*"],         # Allow all headers
)

# --- Pydantic Models for Request & Response Validation ---
# These models define the expected structure of the data for each endpoint.

class ChatbotRequest(BaseModel):
    query: str
    records: Dict[str, Any]

class Calculate(BaseModel):
    inputs: Dict[str, float]   # e.g., {"Electricity Consumption": 20}
    outputs: Dict[str, float]

class AnalysisRequest(BaseModel):
    """Defines the expected JSON for an /analyze request."""
    combined_productivity: str
    single_productivity: Dict[str, str]
    inputs: Dict[str, Any]
    outputs: Dict[str, Any]
    targeted_productivity: str | None = None
    standard_productivity: str | None = None

class ChatbotRequest(BaseModel):
    """Defines the expected JSON for a /chatbot request."""
    # The record structure matches what the desktop app's database provides.
    records: Dict[str, List[Dict[str, Any]]] = Field(..., example={"Product A": [{"batch_no": "101", "inputs": {"Labor": 50}, "outputs": {"Units": 1000}}]})
    query: str = Field(..., example="Which batch for Product A had the highest labor productivity?")

class AgentRequest(BaseModel):
    """Defines the expected JSON for an /agent request."""
    records: Dict[str, List[Dict[str, Any]]]
    goal: str = Field(..., example="Find the root cause of our declining efficiency across all products.")


# --- API Endpoints ---

@app.post("/calculate", summary="Calculate Productivity Scores")
def calculate_productivity(
    request: Calculate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Perform calculation
    result = perform_calculation(request.inputs, request.outputs)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    # Save output in DB
    calc = ProductivityCalculation(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        processed_inputs=request.inputs,
        processed_outputs=request.outputs,
        combined_productivity=result["combined_productivity"],
        single_productivity=result["single_productivity"]
    )
    db.add(calc)
    db.commit()
    db.refresh(calc)

    return result


@app.post("/analyze", summary="Get Structured AI Analysis")
def analyze_calculation(
    request: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Perform AI analysis
    result = get_ai_analysis(request.dict())
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    # Save output in DB
    analysis = AIAnalysis(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        request_data=request.dict(),
        efficiency_score=result.get("efficiency_score"),
        ai_prediction=result.get("ai_prediction"),
        top_inefficiencies=result.get("top_inefficiencies"),
        ai_prescriptions=result.get("ai_prescriptions")
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return result


@app.post("/chatbot", summary="Run RAG Chatbot")
def run_chatbot(
    request: ChatbotRequest,
    db: Session = Depends(get_db),
    current_user: "User" = Depends(get_current_user)
):
    # --- DEBUG PRINTS ---
   

    # Only include tenant-specific records if using DB
    tenant_records = request.records  # or filter/query DB if persistent records are stored

    # Generate chatbot response
    result = get_rag_chatbot_response(tenant_records, request.query)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    # Save chatbot session in DB
    convo = ChatbotHistory(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        records=request.records,
        query=request.query,
        response=result["response"]
    )
    db.add(convo)
    db.commit()
    db.refresh(convo)

    return result

@app.post("/agent", summary="Run AI Agent for Reporting")
def run_ai_agent(
    request: AgentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only include tenant-specific records if using DB
    tenant_records = request.records  # or query DB if persistent records are saved

    # Generate report
    result = get_ai_agent_report(tenant_records, request.goal)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    # Save report in DB
    report = AIReport(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        records_used=request.records,
        goal=request.goal,
        plan=result["plan"],
        report=result["report"]
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return result

# Optional: Explicitly add security scheme to OpenAPI
@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/signup", response_model=TokenSchema)
def signup(user: SignUpSchema, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    tenant = Tenant(name=user.name)
    db.add(tenant)
    db.commit()
    db.refresh(tenant)

    hashed_password = hash_password(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        tenant_id=tenant.id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token({"user_id": new_user.id, "tenant_id": tenant.id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=TokenSchema)
def login(credentials: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"user_id": user.id, "tenant_id": user.tenant_id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/productivity-records", summary="Fetch productivity records for logged-in tenant")
def get_productivity_records(
    db: Session = Depends(get_db),
    current_user: "User" = Depends(get_current_user)
) -> Dict[str, List[Dict]]:
    """
    Returns all productivity records for the current user's tenant.
    Output format is a dictionary keyed by product name.
    """
    tenant_id = current_user.tenant_id

    # Query productivity calculations for this tenant
    records = db.query(ProductivityCalculation).filter(
        ProductivityCalculation.tenant_id == tenant_id
    ).all()

    # Convert SQLAlchemy objects to dict
    records_dict: Dict[str, List[Dict]] = {}

    for r in records:
        # Assuming each calculation has a 'processed_outputs' dict with product keys
        for product_name, product_data in r.processed_outputs.items():
            if product_name not in records_dict:
                records_dict[product_name] = []
            # Combine inputs and outputs if needed
            combined_record = {
                "batch_no": r.id,  # or another identifier if you have batch_no
                "date": r.created_at.isoformat() if hasattr(r, 'created_at') else None,
                "inputs": r.processed_inputs,
                "outputs": r.processed_outputs,
                "combined": r.combined_productivity,   # string
                "single": r.single_productivity 
            }
            records_dict[product_name].append(combined_record)

    return records_dict

@app.get("/analysis-count", summary="Get count of AI analyses for tenant")
def get_analysis_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = db.query(AIAnalysis).filter(
        AIAnalysis.tenant_id == current_user.tenant_id
    ).count()
    return {"analysis_count": count}