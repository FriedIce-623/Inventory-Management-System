from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class ShopRegister(BaseModel):
    name: str
    owner_name: str
    email: EmailStr
    password: str
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None

class ShopLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ShopOut(BaseModel):
    id: int
    name: str
    owner_name: str
    email: str
    state: Optional[str]
    district: Optional[str]
    city: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Products ─────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    category: Optional[str] = None
    unit: Optional[str] = "units"
    current_stock: Optional[float] = 0.0
    reorder_threshold: Optional[float] = 10.0
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    current_stock: Optional[float] = None
    reorder_threshold: Optional[float] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None

class ProductOut(BaseModel):
    id: int
    shop_id: int
    name: str
    category: Optional[str]
    unit: str
    current_stock: float
    reorder_threshold: float
    cost_price: Optional[float]
    selling_price: Optional[float]
    needs_restock: bool = False   # computed field

    class Config:
        from_attributes = True


# ─── Sales ────────────────────────────────────────────────────────────────────

class SaleCreate(BaseModel):
    product_id: int
    quantity_sold: float
    sale_date: Optional[datetime] = None
    notes: Optional[str] = None

class SaleOut(BaseModel):
    id: int
    shop_id: int
    product_id: int
    quantity_sold: float
    sale_date: datetime
    notes: Optional[str]

    class Config:
        from_attributes = True


# ─── Predictions ──────────────────────────────────────────────────────────────

class PredictionOut(BaseModel):
    product_id: int
    product_name: str
    forecast_days: int
    predicted_demand: float
    current_stock: float
    suggested_reorder: float
    confidence: str   # "high" | "medium" | "low" based on data availability