from sqlmodel import Session, select
from quartzwood.models.collection import Collection
from quartzwood.models.storage import Storage
from quartzwood.models.card import CardInstance
from quartzwood.models.enums import Condition, FoilType, StampType
from quartzwood.services.scryfall import get_card_by_set_and_number, extract_card_fields
from quartzwood.db import get_session


# --- Collection ---

def create_collection(session: Session, name: str, description: str = None) -> Collection:
    collection = Collection(name=name, description=description)
    session.add(collection)
    session.commit()
    session.refresh(collection)
    return collection


def get_all_collections(session: Session) -> list[Collection]:
    return session.exec(select(Collection)).all()


# --- Storage ---

def create_storage(session: Session, name: str, collection_id: int = None, description: str = None) -> Storage:
    storage = Storage(name=name, collection_id=collection_id, description=description)
    session.add(storage)
    session.commit()
    session.refresh(storage)
    return storage


def get_all_storage(session: Session) -> list[Storage]:
    return session.exec(select(Storage)).all()


# --- Cards ---

def add_card(
    session: Session,
    set_number: str,
    set_code: str,
    condition: Condition,
    storage_id: int = None,
    foil_type: FoilType = FoilType.none,
    stamp_type: StampType = StampType.none,
    language: str = "en",
    notes: str = None,
) -> CardInstance | str:
    """
    Resolves card via Scryfall then writes to DB.
    Returns the CardInstance on success, or an error string on failure.
    """
    scryfall_data = get_card_by_set_and_number(set_number, set_code)

    if scryfall_data is None:
        return f"Card not found: {set_code} {set_number}"

    fields = extract_card_fields(scryfall_data)

    card = CardInstance(
        scryfall_id=fields["scryfall_id"],
        set_number=fields["set_number"],
        set_code=fields["set_code"],
        name=fields["name"],
        condition=condition,
        foil_type=foil_type,
        stamp_type=stamp_type,
        language=language,
        storage_id=storage_id,
        notes=notes,
    )

    session.add(card)
    session.commit()
    session.refresh(card)
    return card


def get_all_cards(session: Session) -> list[CardInstance]:
    return session.exec(select(CardInstance)).all()


def get_cards_by_storage(session: Session, storage_id: int) -> list[CardInstance]:
    return session.exec(select(CardInstance).where(CardInstance.storage_id == storage_id)).all()

