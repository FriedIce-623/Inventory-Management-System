from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class StateEnum(str, enum.Enum):
    rajasthan = "Rajasthan"
    maharashtra = "Maharashtra"
    karnataka = "Karnataka"
    gujarat = "Gujarat"
    uttar_pradesh = "Uttar Pradesh"
    tamil_nadu = "Tamil Nadu"
    west_bengal = "West Bengal"
    kerala = "Kerala"
    # Add more as needed


class Shop(Base):
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Regional info — critical for localised forecasting
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    city = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    products = relationship("Product", back_populates="shop", cascade="all, delete")
    sales = relationship("Sale", back_populates="shop", cascade="all, delete")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)

    name = Column(String, nullable=False)
    category = Column(String, nullable=True)      # e.g. "beverages", "grains"
    unit = Column(String, default="units")         # kg, litres, units, etc.
    current_stock = Column(Float, default=0.0)
    reorder_threshold = Column(Float, default=10.0)  # alert if stock < this
    cost_price = Column(Float, nullable=True)
    selling_price = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    shop = relationship("Shop", back_populates="products")
    sales = relationship("Sale", back_populates="product")


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    quantity_sold = Column(Float, nullable=False)
    sale_date = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String, nullable=True)  # e.g. "festival spike", "bulk order"

    shop = relationship("Shop", back_populates="sales")
    product = relationship("Product", back_populates="sales")