from fastapi import Request
from fastapi.responses import HTMLResponse, JSONResponse
from quartzwood.api.app import app, templates
from quartzwood.db import get_session
from quartzwood.services.cards import get_cards_grouped
from quartzwood.services.collection import (
    get_all_collections,
    get_collections_by_entity_id,
    get_collection_by_name
    )
from quartzwood.services.storage import get_all_storage
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
def api_entities():
    with get_session() as session:
        entities = get_all_entities(session)
        return [{"id": e.id, "name": e.name, "type": e.type.value, "location": e.location} for e in entities]
    #endregion
    #region Collections
@app.get("/api/collections/")
def api_collections():
    with get_session() as session:
        collections = get_all_collections(session)
        return [{"id": c.id, "name": c.name, "description": c.description, "location": c.location, "owner_id": c.entity_id,} for c in collections]

@app.get("/api/collections/{name_id}")
def api_collections(name_id: str):
    with get_session() as session:
        c = get_collection_by_name(session, name_id)
        if c:
            return [{"id": c.id, "name": c.name, "description": c.description, "location": c.location, "owner_id": c.entity_id}]

@app.get("/api/collections/{entity_id}")
def api_collections(entity_id: int):
    with get_session() as session:
        collections = get_collections_by_entity_id(session, entity_id)
        return [{"id": c.id, "name": c.name, "description": c.description, "location": c.location, "owner_id": c.entity_id,} for c in collections]

    #endregion

    

#endregion