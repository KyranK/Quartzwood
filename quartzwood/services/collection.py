from sqlmodel import Session, select
from quartzwood.models.collection import Collection
from quartzwood.models.storage import Storage
from quartzwood.models.card import CardInstance
from quartzwood.models.enums import Condition, FoilType, StampType
from quartzwood.services.scryfall import get_card_by_set_and_number, extract_card_fields
from quartzwood.db import get_session


#region Collection
    #region Create
def create_collection(session: Session, name: str, description: str = None) -> Collection:
    collection = Collection(name=name, description=description)
    session.add(collection)
    session.commit()
    session.refresh(collection)
    return collection
    
    #endregion
    #region Read
def get_all_collections(session: Session) -> list[Collection]:
    return session.exec(select(Collection)).all()


def get_collection_id_by_name(session: Session, collection_name: str) -> int | None:
    collection = session.exec(select(Collection).where(Collection.name == collection_name)).first()
    return collection.id if collection else None

    #endregion
    #region update
def update_collection(
        session: Session,
        collection_name: str,
        # update fields
        new_name: str = None,
        new_description: str = None,
        new_location: str = None
) -> Collection:
    collection_id = get_collection_id_by_name(session, collection_name)
    if collection_id is None:
            raise ValueError(f"Collection '{collection_name}' not found")
    
    collection = session.get(Collection, collection_id)

    if new_name:
        collection.name = new_name
    if new_description:
        collection.description = new_description
    if new_location:
        collection.location = new_location

    session.add(collection)
    session.commit()
    session.refresh(collection)
      
    return collection

    #endregion
    #region Delete
def delete_collection(  
    session: Session,
    collection_name: str,
    relocate_collection_name: str = None,
    force: bool = False
) -> Collection:
    collection_id = get_collection_id_by_name(session, collection_name)
    if collection_id is None:
        raise ValueError(f"Collection '{collection_name}' not found")
    
    storages = get_storage_by_collection_id(session, collection_id)
    
    if storages:
        if relocate_collection_name:
            relocate_id = get_collection_id_by_name(session, relocate_collection_name)
            if relocate_id is None:
                raise ValueError(f"Relocate target '{relocate_collection_name}' not found")
            for storage in storages:
                storage.collection_id = relocate_id
                session.add(storage)
        elif force:
            for storage in storages:
                storage.collection_id = None
                session.add(storage)
        else:
            raise ValueError(f"Collection '{collection_name}' has {len(storages)} storage(s). Use --relocate or --force.")
    

    collection = session.get(Collection, collection_id)
    session.delete(collection)
    session.commit()

    return collection

    #endregion
#endregion
#region Storage
    #region Create
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

    #endregion
    #region Read
def get_all_storage(session: Session) -> list[Storage]:
    return session.exec(select(Storage)).all()


def get_storage_id_by_name(session: Session, storage_name: str) -> int | None:
    storage = session.exec(select(Storage).where(Storage.name == storage_name)).first()
    return storage.id if storage else None


def get_storage_by_collection_id(
        session: Session,
        collection_id: int
) -> list[Storage] | None:
    return session.exec(select(Storage).where(Storage.collection_id == collection_id)).all()


def get_storage_by_name(
    session: Session,
    name: str
) -> Storage | None:
    storage = session.exec(select(Storage).where(storage.name == name)).first()
    return storage if storage else None

    #endregion
    #region Update
def update_storage(
    session: Session, 
    name: str, 
    # New fields
    new_name: str = None,
    new_collection_name: str = None, 
    new_description: str = None
) -> Storage:
    
    storage = get_storage_by_name(session, name)
    if storage is None:
        raise ValueError(f"Storage '{name}' not found")
    
    if new_name:
        storage.name = new_name
    if new_collection_name:
        new_collection_id = get_collection_id_by_name(session, new_collection_name)
        if new_collection_id is None:
            raise ValueError(f"New collection '{new_collection_name}' not found")
        storage.collection_id = new_collection_id
    if new_description:
        storage.description = new_description

    session.add(storage)
    session.commit()
    session.refresh(storage)
    return storage

    #endregion
    #region Delete
def delete_storage(
    session: Session,
    storage_name: str,
    # Orphanage
    relocate_storage_name: str = None,
    force_flag: bool = False,
) -> Storage:
    # check if storage exist -> get id
    storage_id = get_storage_id_by_name(session, storage_name)
    if storage_id is None:
        raise ValueError(f"Storage '{storage_name}' not found")
    
    # get cards from storage
    cards = get_cards_by_storage(session, storage_id)
    if cards:
    # Relocate cards
        # relocate
        if relocate_storage_name:
            new_storage_id = get_storage_id_by_name(session, relocate_storage_name)
            if new_storage_id is None:
                raise ValueError(f"Storage to relocate to: '{relocate_storage_name}' not found")
            
            for card in cards:
                card.storage_id = new_storage_id
                session.add(card)
        # force orphanage
        elif force_flag:
            for card in cards:
                card.storage_id = None
                session.add(card)
        # Raise
        else:
            raise ValueError(f"Storage '{storage_name}' has {len(cards)} card(s). Use --relocate or --force.")

    # Delete storage
    storage = session.get(Storage, storage_id)
    session.delete(storage)
    # commit & return
    session.commit()
    return storage
    

#endregion
#region Cards
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


def get_cards_filtered(
    session: Session,
    set_number: str,
    set_code: str,
    condition: Condition = None,
    foil_type: FoilType = None,
    storage_name: str = None,
) -> list[CardInstance]:
    
    query = select(CardInstance).where(
        CardInstance.set_number == set_number,
        CardInstance.set_code == set_code,
    )

    if condition:
        query = query.where(CardInstance.condition == condition)
    if foil_type:
        query = query.where(CardInstance.foil_type == foil_type)
    if storage_name:
        storage_id = get_storage_id_by_name(session, storage_name)
        query = query.where(CardInstance.storage_id == storage_id)

    return session.exec(query).all()


def update_cards(
    session: Session,
    set_number: str, 
    set_code: str, 
    # filters
    condition: Condition = None,
    foil_type: FoilType = None,
    storage_name: str = None,
    # updates
    new_condition: Condition = None,
    new_foil_type: FoilType = None,
    new_storage_name: str = None,
    new_notes: str = None,
) -> list[CardInstance]:
    
    cards = get_cards_filtered(
      session = session,
      set_number = set_number,
      set_code = set_code,
      condition = condition,
      foil_type = foil_type,
      storage_name = storage_name,
  )

    if new_storage_name:
        new_storage_id = get_storage_id_by_name(session, new_storage_name)
    if new_storage_id is None:
        raise ValueError(f"Storage '{new_storage_name}' not found")

    for card in cards:
        if new_condition:
            card.condition = new_condition
        if new_foil_type:
            card.foil_type = new_foil_type
        if new_notes:
            card.notes = new_notes
        if new_storage_name:
            card.storage_id = new_storage_id
        session.add(card)

    session.commit()
    for card in cards:
        session.refresh(card)
    return cards


def delete_cards(
    session: Session,
    set_number: str, 
    set_code: str, 
    # filters
    condition: Condition = None,
    foil_type: FoilType = None,
    storage_name: str = None,
) -> list[CardInstance]:
    
    cards = get_cards_filtered(
      session = session,
      set_number = set_number,
      set_code = set_code,
      condition = condition,
      foil_type = foil_type,
      storage_name = storage_name,
  )
    
    for card in cards:
        session.delete(card)
    session.commit()

    return cards

#endregion










