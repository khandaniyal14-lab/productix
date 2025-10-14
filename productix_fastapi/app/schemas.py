from pydantic import BaseModel, EmailStr
from typing import Any, Dict, Optional, List, Union
from decimal import Decimal
from datetime import datetime,date
from .models import UserRole


# Login / Auth Schemas
# -------------------
class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
# ------------------------
# AUTH
# ------------------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    id: int
    role: UserRole
    organization_id: Optional[int]


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ------------------------
# USER
# ------------------------
class UserBase(BaseModel):
    name: Optional[str] = None
    email: EmailStr


class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.org_user


class UserResponse(UserBase):
    id: int
    role: UserRole
    organization_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ------------------------
# ORGANIZATION
# ------------------------
class OrganizationBase(BaseModel):
    name: str
    subscription_plan: Optional[str] = "free"


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationResponse(OrganizationBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# ------------------------
# PRODUCT
# ------------------------
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    input_fields: Optional[List[str]] = []  # New field for dynamic input fields
    output_fields: Optional[List[str]] = []  # New field for dynamic output fields
    organization_id: Optional[int] = None  # Set automatically from current user's org


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]


class ProductResponse(ProductBase):
    id: int
    organization_id: int
    created_at: Optional[datetime] = None 

    class Config:
        from_attributes = True


# ------------------------
# BATCH
# ------------------------
class ProductOut(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class BatchBase(BaseModel):
    batch_number: Optional[str] = None

class BatchCreate(BatchBase):
    product_id: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = "open"

class BatchUpdate(BaseModel):
    batch_number: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = "open"

class BatchResponse(BatchBase):
    id: int
    product_id: int
    batch_number: str
    start_date: Optional[date]
    end_date: Optional[date] = None
    status: str
    product: ProductOut  # Include product info for frontend
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class BatchReportResponse(BaseModel):
    batch_id: int
    batch_no: str
    product_id: int
    status: str

    # ✅ Totals (combined inputs + outputs)
    totals: Dict[str, Union[int, float]]

    # ✅ Cost and output metrics
    total_input_cost: float
    total_output: float
    input_cost_per_unit: float

    # ✅ Productivity per input (input used per unit of output)
    Combined_productivity_ratio: float

    # ⚠️ New field: inputs missing unit price
    missing_unit_prices: Optional[List[str]] = []
    per_input_stats: dict[str, dict]

    class Config:
        orm_mode = True





class InputMaterial(BaseModel):
    amount: float
    unit_price: Optional[float] = None

# Each output product only has amount
class OutputProduct(BaseModel):
    amount: float

# Base schema for shift entry
class ShiftEntryBase(BaseModel):
    batch_id: int
    date: date
    shift_no: str  # morning, evening, night

    input_materials: Optional[Dict[str, InputMaterial]] = None  # {field_name: {amount, unit_price}}
    output_products: Optional[Dict[str, OutputProduct]] = None  # {field_name: {amount}}
    admin_notes: Optional[str] = None

    class Config:
        orm_mode = True

# Schema for creating a shift entry
class ShiftEntryCreate(ShiftEntryBase):
    pass

# Schema for updating a shift entry
class ShiftEntryUpdate(ShiftEntryBase):
    pass

# Schema for returning shift entry
class ShiftEntryOut(ShiftEntryBase):
    id: int
    organization_id: int
    created_at: datetime


# ------------------------
# PRODUCTIVITY CALCULATION
# ------------------------

class ProductivityCalculationCreate(BaseModel):
    inputs: Dict[str, float]
    outputs: Dict[str, float]
    
class ProductivityCalculationResponse(BaseModel):
    id: int
    organization_id: int
    user_id: int
    processed_inputs: Dict[str, float]
    processed_outputs: Dict[str, float]
    combined_productivity: str
    single_productivity: Dict[str, float]

    class Config:
        orm_mode = True


# ------------------------
# AI ANALYSIS   
# ------------------------
class AIAnalysisCreate(BaseModel):
    inputs: Dict[str, float]   # e.g., {"Electricity Consumption": 49}
    outputs: Dict[str, float]  # e.g., {"Good Units Produced": 30}
    combined_productivity: Dict[str, float]   # e.g., {"overall": 50}
    single_productivity: Dict[str, float]     # e.g., {"Electricity / Good Units Produced": 10}
    targeted_productivity: Optional[Dict[str, float]] = None
    standard_productivity: Optional[Dict[str, float]] = None


class AIAnalysisResponse(BaseModel):
    id: int
    organization_id: int
    user_id: int
    request_data: Dict
    efficiency_score: Optional[str]  # returning '58.1%' as string
    ai_prediction: Optional[str]     # returning a raw text string
    top_inefficiencies: Optional[str]  # returning multi-line string
    ai_prescriptions: Optional[str]    # returning multi-line string
    created_at: datetime                   # returning ISO string

    class Config:
        orm_mode = True
        

# ------------------------
# CHATBOT   
# ------------------------

class ChatbotRequest(BaseModel):
    records: List[Dict]
    query: str
    
class ChatbotResponse(BaseModel):
    query: str
    response: Dict[str, Any]

    class Config:
        orm_mode = True
class ChatbotHistoryResponse(BaseModel):
    id: int
    organization_id: int
    user_id: int
    records: List[Dict]
    query: str
    response: Dict
    created_at: str

    class Config:
        from_attributes = True

# ------------------------
# AI AGENT





## ------------------------

class ProductRecord(BaseModel):
    calculation_id: int
    date: Optional[str]  # ISO format string
    inputs: Dict[str, Any]      # Flexible: depends on your processed_inputs structure
    outputs: Dict[str, Any]     # Flexible: depends on processed_outputs
    combined_productivity: Optional[float]
    single_productivity: Dict[str, Optional[float]]
from pydantic import RootModel
class ProductivityRecordsResponse(RootModel):
    root: Dict[str, List[ProductRecord]]




class AnalysisCountResponse(BaseModel):
    analysis_count: int

class AgentRequest(BaseModel):
    records: Dict[str, List[ProductRecord]]  # List of product records
    goal: str

class AIText(BaseModel):
    text: str  # Wrap AI string in a dict

class AIReportResponse(BaseModel):
    id: int
    organization_id: int
    user_id: int
    goal: str
    plan: dict   # {"text": str}
    report: dict # {"text": str}
    created_at: str
    class Config:
        from_attributes = True


