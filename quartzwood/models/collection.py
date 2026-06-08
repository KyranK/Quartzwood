from typing import Optional
from sqlmodel import SQLModel, Field


class Collection(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    description: Optional[str] = None
    location: Optional[str] = None
    # entity_id: Optional[int] = Field(default=None, foreign_key="entity.id")