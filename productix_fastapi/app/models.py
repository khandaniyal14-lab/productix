from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Tenant(Base):
    __tablename__ = "tenants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")
    created_at = Column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant")

class AIData(Base):
    __tablename__ = "ai_data"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    data_json = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class ProductivityCalculation(Base):
    __tablename__ = "productivity_calculations"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    combined_productivity = Column(String, nullable=False)
    single_productivity = Column(JSON, nullable=False)
    processed_inputs = Column(JSON, nullable=False)
    processed_outputs = Column(JSON, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)


class AIAnalysis(Base):
    __tablename__ = "ai_analysis"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    efficiency_score = Column(String)
    ai_prediction = Column(Text)
    top_inefficiencies = Column(Text)
    ai_prescriptions = Column(Text)
    request_data = Column(JSON, nullable=False)

    # keep reference to calculation
    combined_productivity = Column(String)
    targeted_productivity = Column(String)
    standard_productivity = Column(String)
    inputs = Column(JSON)
    outputs = Column(JSON)
    single_productivity = Column(JSON)

    created_at = Column(DateTime, default=datetime.utcnow)

class ChatbotHistory(Base):
    __tablename__ = "chatbot_history"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    query = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    records = Column(JSON, nullable=True)  # store which records were passed

    created_at = Column(DateTime, default=datetime.utcnow)

class AIReport(Base):
    __tablename__ = "ai_reports"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    goal = Column(Text, nullable=False)
    plan = Column(Text, nullable=False)
    report = Column(Text, nullable=False)
    records_used = Column(JSON, nullable=True)
    request_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

