from fastapi import FastAPI

from .router import uploads

from .router import Dashboard, Productivity_calculator, agent, ai_analysis, analytics, chatbot, login
from .router import auth, User
from .database import Base, engine
from app.router import organization
from app.router import Product
from app.router import Batch    
from fastapi.middleware.cors import CORSMiddleware
from app.router import shift_entries
from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.openapi.utils import get_openapi
from app.router import system_admin_router



#Base.metadata.drop_all(bind=engine)   # drops all tables
Base.metadata.create_all(bind=engine) 

app = FastAPI(title="Multi-tenant Productivity CRM")

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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Custom OpenAPI schema with security definition
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="My API",
        version="1.0.0",
        description="API with JWT auth",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    for path in openapi_schema["paths"]:
        for method in openapi_schema["paths"][path]:
            openapi_schema["paths"][path][method]["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

app.include_router(auth.router)
app.include_router(User.router)
app.include_router(organization.router)
app.include_router(Product.router)
app.include_router(Batch.router)
app.include_router(shift_entries.router)
app.include_router(agent.router)
app.include_router(Dashboard.router)
app.include_router(ai_analysis.router)
app.include_router(analytics.router)
app.include_router(chatbot.router)
app.include_router(login.router)
app.include_router(Productivity_calculator.router)
app.include_router(system_admin_router.router)
app.include_router(uploads.router)