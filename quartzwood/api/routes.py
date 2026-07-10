from fastapi import Request
from fastapi.responses import HTMLResponse, JSONResponse
from quartzwood.api.app import app, templates
from quartzwood.db import get_session
from quartzwood.services.cards import(
    get_cards_grouped,
    get_grouped_cards_by_storage,
    get_all_cards,
    get_card_by_id,
    get_cards_filtered,
)
from quartzwood.services.collection import (
    get_all_collections,
    get_collections_by_entity_id,
    get_collection_by_name,
    get_collection_by_id,
    )
from quartzwood.services.storage import(
    get_all_storage,
    get_storage_by_name,
    get_storage_by_collection_id
)
from quartzwood.services.entity import get_all_entities

#region Jinja2 (temporary)
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    with get_session() as session:
        cards = get_cards_grouped(session)
        collections = get_all_collections(session)
        storages = get_all_storage(session)
        return templates.TemplateResponse(
            request=request,
            name="index.html",
            context={
                "cards": cards,
                "collections": collections,
                "storages": storages,
            }
        )
#endregion

#region JSON API
    #region Entites
@app.get("/api/entities")
def api_get_all_entities():
    with get_session() as session:
        entities = get_all_entities(session)
        return [{"id": e.id, "name": e.name, "type": e.type.value, "location": e.location} for e in entities]
    #endregion
    #region Collections
@app.get("/api/collections/") # All Collections
def api_get_all_collections():
    with get_session() as session:
        collections = get_all_collections(session)
        return [{"id": c.id, "name": c.name, "description": c.description, "location": c.location, "owner_id": c.entity_id,} for c in collections]

@app.get("/api/collections/{name_id}") # Collections by name
def api_get_all_collections(name_id: str):
    with get_session() as session:
        c = get_collection_by_name(session, name_id)
        if c:
            return [{"id": c.id, "name": c.name, "description": c.description, "location": c.location, "owner_id": c.entity_id}]

@app.get("/api/entities/{entity_id}/collections") # Collections by entity(id)
def api_get_collections_by_entity(entity_id: int):
    with get_session() as session:
        collections = get_collections_by_entity_id(session, entity_id)
        return [{"id": c.id, "name": c.name, "description": c.description, "location": c.location, "owner_id": c.entity_id,} for c in collections]
    #endregion
    #region Storages
@app.get("/api/storage") # All storages
def api_get_all_storage():
    with get_session() as session:
        storages = get_all_storage(session)
        return[{"id": s.id, "name": s.name, "description": s.description, "collection_id": s.collection_id} for s in storages]
    
@app.get("/api/storage/{storage_name}") # All storages
def api_get_storage_by_name(storage_name: str):
    with get_session() as session:
        storages = get_storage_by_name(session, storage_name)
        if storages:
            return[{"id": storages.id, "name": storages.name, "description": storages.description, "collection_id": storages.collection_id}]    
        
@app.get("/api/storage/by-collection/{collection_name}")
def api_get_storage_by_collection(collection_name: str):
    with get_session() as session:
        collection = get_collection_by_name(session, collection_name)
        if collection is None:
            return []
        storages = get_storage_by_collection_id(session, collection.id)
        return [{"id": s.id, "name": s.name, "description": s.description, "collection_id": s.collection_id} for s in storages]
    
@app.get("/api/storage/{storage_name}/info")
def api_get_storage_info(storage_name: str):
    with get_session() as session:
        storage = get_storage_by_name(session, storage_name)
        if storage is None:
            return {"name": storage_name, "collection": None}
        collection = None
        if storage.collection_id:
            col = get_collection_by_id(session, storage.collection_id)
            collection = col.name if col else None
        return {"name": storage_name, "collection": collection}
    #endregion
    #region Cards
@app.get("/api/cards")
def api_get_all_cards():
    with get_session() as session:
        return get_all_cards(session)

@app.get("/api/storage/{storage_name}/cards")
def api_get_cards_by_storage(storage_name: str):
    with get_session() as session:
        storage = get_storage_by_name(session, storage_name)
        if storage is None:
            return []
        return get_grouped_cards_by_storage(session, storage.id)

@app.get("/api/card/{card_id}")
def api_get_card(card_id: int):
    with get_session() as session:
        card = get_card_by_id(session, card_id)
        if card is None:
            return JSONResponse(status_code=404, content={"detail": "Card not found"})
        return {
            "id": card.id,
            "name": card.name,
            "set_code": card.set_code,
            "set_number": card.set_number,
            "scryfall_id": card.scryfall_id,
            "condition": card.condition.value,
            "foil_type": card.foil_type.value,
            "stamp_type": card.stamp_type.value,
            "language": card.language,
            "notes": card.notes,
            "storage_id": card.storage_id,
            "acquired_date": str(card.acquired_date) if card.acquired_date else None,
            "purchase_price": card.purchase_price,
        }
    
@app.get("/api/storage/{storage_name}/cards/{set_code}/{set_number}")
def api_get_collated_storage_cards(
    storage_name: str,
    set_code: str,
    set_number: int
):
    with get_session() as session:
        storage = get_storage_by_name(session, storage_name)
        if storage is None:
            return []
        cards = get_cards_filtered(
            session, set_number, set_code,
            storage_name=storage_name
        )
        return cards


    #endregion

#endregion