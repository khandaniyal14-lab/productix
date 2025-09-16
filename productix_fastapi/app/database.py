from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql://postgres.jdzgzudaphddkkkwhubf:Facebookkhan1@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,     # ✅ Detect dead connections and reconnect
    pool_recycle=1800,      # ✅ Recycle connections every 30 min
    pool_size=5,            # ✅ Max 5 connections (adjust if needed)
    max_overflow=10,        # ✅ Allow temporary extra connections
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
