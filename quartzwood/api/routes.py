from fastapi import Request
from fastapi.responses import HTMLResponse, JSONResponse
from quartzwood.api.app import app, templates
from quartzwood.db import get_session
from quartzwood.services.cards import get_cards_grouped
from quartzwood.services.collection import get_all_collections
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
@app.get("/api/entities")
def api_entities():
    with get_session() as session:
        entities = get_all_entities(session)
        return [{"id": e.id, "name": e.name, "type": e.type.value, "location": e.location} for e in entities]
#endregion