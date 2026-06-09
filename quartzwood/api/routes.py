from fastapi import Request
from fastapi.responses import HTMLResponse
from quartzwood.api.app import app, templates
from quartzwood.db import get_session
from quartzwood.services.collection import get_cards_grouped, get_all_collections, get_all_storage


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