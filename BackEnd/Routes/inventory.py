from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.db_models import Shop, Product
from schemas.pydantic_schemas import ProductCreate, ProductUpdate, ProductOut
from core.security import get_current_shop
from fastapi import APIRouter, Depends
from core.security import oauth2_scheme

router = APIRouter()
@router.get("/products")
def get_products(token: str = Depends(oauth2_scheme)):
    return {"message": "Protected route working"}
router = APIRouter(prefix="/inventory", tags=["Inventory"])


def _to_product_out(product: Product) -> ProductOut:
    return ProductOut(
        id=product.id,
        shop_id=product.shop_id,
        name=product.name,
        category=product.category,
        unit=product.unit,
        current_stock=product.current_stock,
        reorder_threshold=product.reorder_threshold,
        cost_price=product.cost_price,
        selling_price=product.selling_price,
        needs_restock=product.current_stock < product.reorder_threshold,
    )


@router.get("/", response_model=List[ProductOut])
def list_products(db: Session = Depends(get_db), shop: Shop = Depends(get_current_shop)):
    products = db.query(Product).filter(Product.shop_id == shop.id).all()
    return [_to_product_out(p) for p in products]


@router.get("/alerts", response_model=List[ProductOut])
def low_stock_alerts(db: Session = Depends(get_db), shop: Shop = Depends(get_current_shop)):
    """Returns only products that are below their reorder threshold."""
    products = db.query(Product).filter(Product.shop_id == shop.id).all()
    return [_to_product_out(p) for p in products if p.current_stock < p.reorder_threshold]


@router.post("/", response_model=ProductOut, status_code=201)
def add_product(data: ProductCreate, db: Session = Depends(get_db), shop: Shop = Depends(get_current_shop)):
    product = Product(**data.model_dump(), shop_id=shop)
    db.add(product)
    db.commit()
    db.refresh(product)
    return _to_product_out(product)


@router.patch("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db), shop: Shop = Depends(get_current_shop)):
    product = db.query(Product).filter(Product.id == product_id, Product.shop_id == shop).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return _to_product_out(product)


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db), shop: Shop = Depends(get_current_shop)):
    product = db.query(Product).filter(Product.id == product_id, Product.shop_id == shop).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()