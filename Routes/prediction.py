from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.db_models import Shop, Product, Sale
from schemas.pydantic_schemas import PredictionOut
from core.security import get_current_shop
from ml.forecaster import generate_forecast

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.get("/{product_id}", response_model=PredictionOut)
def predict_product(
    product_id: int,
    forecast_days: int = Query(default=14, ge=1, le=90),
    db: Session = Depends(get_db),
    shop: Shop = Depends(get_current_shop),
):
    product = db.query(Product).filter(Product.id == product_id, Product.shop_id == shop.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    sales = db.query(Sale).filter(Sale.product_id == product_id, Sale.shop_id == shop.id).all()

    predicted_demand, suggested_reorder, confidence = generate_forecast(
        sales=sales,
        current_stock=product.current_stock,
        forecast_days=forecast_days,
        state=shop.state,
    )

    return PredictionOut(
        product_id=product.id,
        product_name=product.name,
        forecast_days=forecast_days,
        predicted_demand=predicted_demand,
        current_stock=product.current_stock,
        suggested_reorder=suggested_reorder,
        confidence=confidence,
    )


@router.get("/", response_model=List[PredictionOut])
def predict_all(
    forecast_days: int = Query(default=14, ge=1, le=90),
    db: Session = Depends(get_db),
    shop: Shop = Depends(get_current_shop),
):
    """Runs forecasts for all products in the shop at once."""
    products = db.query(Product).filter(Product.shop_id == shop.id).all()
    results = []

    for product in products:
        sales = db.query(Sale).filter(Sale.product_id == product.id, Sale.shop_id == shop.id).all()
        predicted_demand, suggested_reorder, confidence = generate_forecast(
            sales=sales,
            current_stock=product.current_stock,
            forecast_days=forecast_days,
            state=shop.state,
        )
        results.append(PredictionOut(
            product_id=product.id,
            product_name=product.name,
            forecast_days=forecast_days,
            predicted_demand=predicted_demand,
            current_stock=product.current_stock,
            suggested_reorder=suggested_reorder,
            confidence=confidence,
        ))

    return results