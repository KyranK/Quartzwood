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

def get_collection_id_by_name(session: Session, collection_name: str) -> int | None:
    collection = session.exec(select(Collection).where(Collection.name == collection_name)).first()
    return collection.id if collection else None


def create_storage(session: Session, name: str, collection_name: str = None, description: str = None) -> Storage:
    collection_id = None
    if collection_name:
        collection_id = get_collection_id_by_name(session, collection_name)
        if collection_id is None:
            raise ValueError(f"Collection '{collection_name}' not found")
        
    storage = Storage(name=name, collection_id=collection_id, description=description)
    session.add(storage)
    session.commit()
    session.refresh(storage)
    return storage


def get_all_storage(session: Session) -> list[Storage]:
    return session.exec(select(Storage)).all()


# --- Cards ---
def get_storage_id_by_name(session: Session, storage_name: str) -> int | None:
    storage = session.exec(select(Storage).where(Storage.name == storage_name)).first()
    return storage.id if storage else None


def add_card(
    session: Session,
    set_number: str,
    set_code: str,
    condition: Condition,
    quantity: int = 1,
    storage_name: str = None,
    foil_type: FoilType = FoilType.none,
    stamp_type: StampType = StampType.none,
    language: str = "en",
    notes: str = None,
) -> list[CardInstance] | str:
    """
    Resolves card via Scryfall then writes to DB.
    Returns the CardInstance on success, or an error string on failure.
    """
    scryfall_data = get_card_by_set_and_number(set_number, set_code)

    if scryfall_data is None:
        return f"Card not found: {set_code} {set_number}"

    fields = extract_card_fields(scryfall_data)
    
    storage_id = None
    if storage_name: 
        storage_id = get_storage_id_by_name(session,storage_name)
        if storage_id is None:
            raise ValueError(f"Collection '{storage_name}' not found")

    cards = []
    for _ in range(quantity):
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
        cards.append(card)

    session.commit()
    for card in cards:
        session.refresh(card)
    return cards


def get_all_cards(session: Session) -> list[CardInstance]:
    return session.exec(select(CardInstance)).all()


def get_cards_by_storage(session: Session, storage_id: int) -> list[CardInstance]:
    return session.exec(select(CardInstance).where(CardInstance.storage_id == storage_id)).all()

def get_cards_grouped(session: Session) -> list[dict]:
    cards = session.exec(select(CardInstance)).all()
    
    groups = {}
    for card in cards:
        key = (card.name, card.set_code, card.set_number, card.condition, card.foil_type)
        if key in groups:
            groups[key]["count"] += 1
        else:
            groups[key] = {
                "name": card.name,
                "set_code": card.set_code,
                "set_number": card.set_number,
                "condition": card.condition.value,
                "foil_type": card.foil_type.value,
                "count": 1
            }
    
    return list(groups.values())