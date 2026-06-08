from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "sqlite:///quartzwood.db"

engine = create_engine(DATABASE_URL, echo=True)


def init_db():
    # Imports required so SQLModel sees the tables before creating them
    from quartzwood.models.collection import Collection
    from quartzwood.models.storage import Storage
    from quartzwood.models.card import CardInstance

    SQLModel.metadata.create_all(engine)


def get_session() -> Session:
    return Session(engine)