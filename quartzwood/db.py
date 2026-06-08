from sqlmodel import SQLModel, create_engine, Session
from contextlib import contextmanager

DATABASE_URL = "sqlite:///quartzwood.db"

engine = create_engine(DATABASE_URL, echo=False)


def init_db():
    # Imports required so SQLModel sees the tables before creating them
    from quartzwood.models.collection import Collection
    from quartzwood.models.storage import Storage
    from quartzwood.models.card import CardInstance

    SQLModel.metadata.create_all(engine)


@contextmanager
def get_session():
    with Session(engine) as session:
        yield session