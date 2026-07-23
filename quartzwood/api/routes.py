from fastapi import Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi import Body
from quartzwood.api.app import app, templates
from quartzwood.db import get_session
from quartzwood.models.card import CardInstance
from quartzwood.services.cards import(
    get_all_cards_grouped,
    get_grouped_cards_by_storage,
    get_all_cards,
    get_card_by_id,
    get_cards_filtered,
    add_card,
    delete_card_by_id,
    get_cards_by_storage_id, 
    update_card_by_id,
    get_grouped_cards_by_storage
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
    get_storage_by_collection_id,
    get_storage_by_id
)
from quartzwood.services.entity import get_all_entities
from quartzwood.services.scryfall import(
    get_card_by_set_and_number,
    extract_card_fields
)


#region Jinja2 (temporary)
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    with get_session() as session:
        cards = get_all_cards_grouped(session)
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


#region Entites
    #region Read
@app.get("/api/entities") # All Entites
def api_get_all_entities():
    with get_session() as session:
        entities = get_all_entities(session)
        return [{"id": e.id, "name": e.name, "type": e.type.value, "location": e.location} for e in entities]
    #endregion
#endregion
#region Collections
    #region Read
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
#endregion
#region Storages
    #region Read
@app.get("/api/storage") # All storages
def api_get_all_storage():
    with get_session() as session:
        storages = get_all_storage(session)
        return[{"id": s.id, "name": s.name, "description": s.description, "collection_id": s.collection_id} for s in storages]

"""
@app.get("/api/storage/{storage_name}") # Storage by name
def api_get_storage_by_name(storage_name: str):
    with get_session() as session:
        storages = get_storage_by_name(session, storage_name)
        if storages:
            return[{"id": storages.id, "name": storages.name, "description": storages.description, "collection_id": storages.collection_id}]    
"""    

@app.get("/api/storage/{storage_id}") # Storage by id    
def api_get_storage_by_id(storage_id: int):
    with get_session() as session:
        return get_storage_by_id(session, storage_id)

@app.get("/api/storage/by-collection/{collection_name}") # Storage by Collection
def api_get_storage_by_collection(collection_name: str):
    with get_session() as session:
        collection = get_collection_by_name(session, collection_name)
        if collection is None:
            return []
        storages = get_storage_by_collection_id(session, collection.id)
        return [{"id": s.id, "name": s.name, "description": s.description, "collection_id": s.collection_id} for s in storages]
    #endregion
#endregion
#region Cards
    #region Add
# FIX:
# Need to control where card is added
@app.post("/api/add-cards") # Add Card
def api_add_card(data: dict = Body(...)):
    with get_session() as session:
        try:
            result = add_card(
                session=session,
                set_number=data["set_number"],
                set_code=data["set_code"],
                condition=data["condition"],
                storage_name=data.get("storage_name"),
                foil_type=data.get("foil_type", "none"),
                stamp_type=data.get("stamp_type", "none"),
                language=data.get("language", "en"),
                notes=data.get("notes"),
                quantity=data.get("quantity", 1),
            )
            if isinstance(result, str):
                return JSONResponse(status_code=400, content={"detail": result})
            return {"success": True, "count": len(result)}
        except ValueError as e:
            return JSONResponse(status_code=400, content={"detail": str(e)})
    #endregion

    #region Read
@app.get("/api/cards") # All cards in DB
def api_get_all_cards():
    with get_session() as session:
        return get_all_cards(session)


@app.get("/api/card/{card_id}") # Card by id
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


@app.get("/api/storage/{storage_id}/cards") # Cards by Storage
def api_get_cards_by_storage(storage_id: int):
    with get_session() as session:
        storage = get_cards_by_storage_id(session, storage_id)
        if storage is None:
            return []
        return get_grouped_cards_by_storage(session, storage_id)

    # Get Cards by collection
@app.get("/api/collection/{collection_id}/cards")
def api_get_cards_by_collection(collection_id: int):
    #T0D0:
    pass


    # Get Cards by entity
@app.get("/api/entity/{entity_id}/cards")
def api_get_cards_by_entity(entity_id: int):
    #T0D0
    pass


"""
@app.get("/api/storage/{storage_name}/cards/{set_code}/{set_number}") # Card by Storage + setID
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
"""  

    #endregion
    #region Update

@app.put("/api/card/{card_id}")
def api_update_card(card_id: int, data: dict):
    with get_session() as session:
        try:
            card = update_card_by_id(
                session=session,
                c_id=card_id,
                n_set_number=data.set_number or "",
                n_set_code=data.set_code or "",
                n_condition=data.condition,
                n_foil=data.foil_type,
                n_storage_id=data.storage_id,
                n_notes=data.notes or ""
            )
            return {"success": True}
        except ValueError as e:
            return JSONResponse(status_code=404, content={"detail": str(e)})
    #endregion
    #region Delete
@app.delete("/api/card/{card_id}") # Delete Card by C-ID
def api_delete_card(card_id: int):
    with get_session() as session:
        # Check if card id is valid
        card = get_card_by_id(session, card_id)
        if card is None:
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        # Delete
        return delete_card_by_id(session, card_id)
    #endregiion

#endregion
#region Scryfall
@app.post("/api/card/{card_id}/refresh-scryfall") # Update Scryfall ID/Img
def api_refresh_scryfall(card_id: int):
    with get_session() as session:
        card = session.get(CardInstance, card_id)
        if card is None:
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        
        print(f"Refreshing: {card.set_code} {card.set_number}")
        scryfall_data = get_card_by_set_and_number(card.set_number, card.set_code)
        if scryfall_data is None:
            return JSONResponse(status_code=404, content={"detail": "Card not found on Scryfall"})
        print(f"Refreshing: {card.set_code} {card.set_number}")

        fields = extract_card_fields(scryfall_data)
        card.scryfall_id = fields["scryfall_id"]
        card.name = fields["name"]
        session.add(card)
        session.commit()
        return {"success": True}
#endregion
#region Misc
@app.get("/api/storage/{storage_id}/info") # Path by Storage
def api_get_storage_info(storage_id: int):
    with get_session() as session:
        storage = get_storage_by_id(session, storage_id)
        if storage is None:
            return {"name": storage.name, "collection": None}
        collection = None
        if storage.collection_id:
            col = get_collection_by_id(session, storage.collection_id)
            collection = col.name if col else None
        return {"name": storage.name, "collection": collection}
#endregion