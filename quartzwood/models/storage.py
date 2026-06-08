from typing import Optional
from sqlmodel import SQLModel, Field


class Storage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    description: Optional[str] = None
    collection_id: Optional[int] = Field(default=None, foreign_key="collection.id")