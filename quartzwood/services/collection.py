#File: services/Collection.py

#region Imports
from sqlmodel import Session, select
from quartzwood.models.collection import Collection

from quartzwood.services.storage import get_storage_by_collection_id
#endregion

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

#EOF