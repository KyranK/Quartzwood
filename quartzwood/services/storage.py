#File: services/storage.py

#region Imports
from sqlmodel import Session, select
from quartzwood.models.storage import Storage


from quartzwood.services.collection import get_collection_id_by_name
from quartzwood.services.storage import get_cards_by_storage
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
) -> list[Storage]:
    return session.exec(select(Storage).where(Storage.collection_id == collection_id)).all()



def get_storage_by_name(
    session: Session,
    name: str
) -> Storage | None:
    storage = session.exec(select(Storage).where(Storage.name == name)).first()
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
#endregion

#EOF