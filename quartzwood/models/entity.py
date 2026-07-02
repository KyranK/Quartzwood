from typing import Optional
from sqlmodel import SQLModel, Field
from quartzwood.models.enums import EntityType

class Entity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    type: EntityType = EntityType.personal
    location: Optional[str] = None