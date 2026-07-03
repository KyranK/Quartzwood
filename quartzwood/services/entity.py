#File: services/entity.py

#region Imports
from sqlmodel import Session, select
from quartzwood.models.entity import Entity

from quartzwood.models.enums import EntityType
#endregion

#region Entity
    #region Create
def create_entity(
    session: Session,
    name: str, 
    type: EntityType,
    location: str = None
) -> Entity:
    
    entity = Entity(name = name, type = type, location = location)
    session.add(entity)
    session.commit()
    session.refresh(entity)
    return entity


# quartzwood/services/entity.py — add this function

def seed_default_entity(
    session: Session,
    config: dict
):
    # Local import(s) to avoid circular dependancies
    from quartzwood.services.collection import create_collection
    from quartzwood.services.storage import create_storage
    

    create_entity(session, **config["entity"])
    for c in config["collections"]:
        create_collection(session, **c)
    for s in config["storages"]:
        create_storage(session, **s)
    #endregion
    #region Read
def get_all_entities(session: Session) -> list[Entity]:
    return session.exec(select(Entity)).all()


def get_entity_by_name(
    session: Session,
    name: str
) -> Entity | None:
    entity = session.exec(select(Entity).where(Entity.name == name)).first()
    return entity if entity else None


def get_entity_id_by_name(    
    session: Session,
    name: str
) -> int | None:
    entity = session.exec(select(Entity).where(Entity.name == name)).first()
    return entity.id if entity else None

    #endregion
    #region Update
def update_entity(
    session: Session,
    name: str,
    #new values
    new_name: str = None,
    type: EntityType = None,
    location: str = None,
) -> Entity:
    entity = get_entity_by_name(session, name)
    if entity is None:
        raise ValueError(f"Entity '{name}' not found")
    
    if new_name:
        entity.name = new_name
    if type:
        entity.type = type
    if location:
        entity.location = location

    session.add(entity)
    session.commit()
    session.refresh(entity)
    return entity

    #endregion
    #region delete
def delete_entity(
    session: Session,
    name: str,
    # Orphanage
    collection_transfer_entity: str = None,
    force_flag: bool = False
) -> Entity:
    entity = get_entity_by_name(session, name)
    if entity is None:
        raise ValueError(f"Entity '{name}' not found")
    
    # check for children
    orphans = get_collections_by_entity_id(session, entity.id)

    if orphans:
        # relocate
        if collection_transfer_entity:
            adoptor = get_entity_by_name(session, collection_transfer_entity)
            if adoptor is None:
                raise ValueError(f"Entity '{name}' not found")
            for collection in orphans:
                collection.entity_id = adoptor.id
                session.add(collection)
        # force orphanage        
        elif force_flag:
            for collection in orphans:
                collection.entity_id = None
                session.add(collection)
        # Raise
        else:
            raise ValueError(f"Entity '{entity.name}' has {len(orphans)} collection(s). Use --relocate or --force.")
    # Delete storage
    session.delete(entity)
    # commit & return
    session.commit()
    return entity

    #endregion
#endregion

#EOF