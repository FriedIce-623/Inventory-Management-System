from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
from models.db_models import Shop, Product, Sale
from schemas.pydantic_schemas import SaleCreate, SaleOut
from core.security import get_current_shop

router = APIRouter(prefix="/sales", tags=["Sales"])


@router.post("/", response_model=SaleOut, status_code=201)
def log_sale(data: SaleCreate, db: Session = Depends(get_db), shop: Shop = Depends(get_current_shop)):
    product = db.query(Product).filter(Product.id == data.product_id, Product.shop_id == shop.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.current_stock < data.quantity_sold:
        raise HTTPException(status_code=400, detail=f"Insufficient stock. Available: {product.current_stock}")

    # Decrement stock automatically
    product.current_stock -= data.quantity_sold

    sale = Sale(
        shop_id=shop.id,
        product_id=data.product_id,
        quantity_sold=data.quantity_sold,
        sale_date=data.sale_date or datetime.utcnow(),
        notes=data.notes,
    )
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale


@router.get("/", response_model=List[SaleOut])
def get_sales(
    product_id: Optional[int] = None,
    db: Session = Depends(get_db),
    shop: Shop = Depends(get_current_shop)
):
    query = db.query(Sale).filter(Sale.shop_id == shop.id)
    if product_id:
        query = query.filter(Sale.product_id == product_id)
    return query.order_by(Sale.sale_date.desc()).all()


@router.get("/summary")
def sales_summary(db: Session = Depends(get_db), shop: Shop = Depends(get_current_shop)):
    """Returns total sales count and units sold per product."""
    sales = db.query(Sale).filter(Sale.shop_id == shop.id).all()
    summary = {}
    for sale in sales:
        pid = sale.product_id
        if pid not in summary:
            summary[pid] = {"product_id": pid, "total_units_sold": 0, "total_transactions": 0}
        summary[pid]["total_units_sold"] += sale.quantity_sold
        summary[pid]["total_transactions"] += 1
    return list(summary.values())