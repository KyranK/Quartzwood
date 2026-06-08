import typer
from quartzwood.db import get_session, init_db
from quartzwood.models.enums import Condition, FoilType, StampType
from quartzwood.services.collection import (
    create_collection,
    get_all_collections,
    create_storage,
    get_all_storage,
    add_card,
    get_all_cards,
)

app = typer.Typer()


@app.command()
def init():
    """Initialise the database."""
    init_db()
    typer.echo("Database initialised.")


@app.command()
def new_collection(name: str, description: str = None):
    """Create a new collection."""
    with get_session() as session:
        collection = create_collection(session, name=name, description=description)
        typer.echo(f"Created collection: [{collection.id}] {collection.name}")


@app.command()
def new_storage(name: str, collection_id: int = None, description: str = None):
    """Create a new storage location."""
    with get_session() as session:
        storage = create_storage(session, name=name, collection_id=collection_id, description=description)
        typer.echo(f"Created storage: [{storage.id}] {storage.name}")


@app.command()
def add(
    set_number: str,
    set_code: str,
    condition: Condition,
    storage_id: int = None,
    foil_type: FoilType = FoilType.none,
    stamp_type: StampType = StampType.none,
    language: str = "en",
    notes: str = None,
):
    """Add a card to the collection."""
    with get_session() as session:
        result = add_card(
            session=session,
            set_number=set_number,
            set_code=set_code,
            condition=condition,
            storage_id=storage_id,
            foil_type=foil_type,
            stamp_type=stamp_type,
            language=language,
            notes=notes,
        )
        if isinstance(result, str):
            typer.echo(f"Error: {result}")
        else:
            typer.echo(f"Added: [{result.id}] {result.name} ({result.set_code} {result.set_number}) {result.condition.value}")


@app.command()
def list_collections():
    """List all collections."""
    with get_session() as session:
        collections = get_all_collections(session)
        for c in collections:
            typer.echo(f"[{c.id}] {c.name}")
            

@app.command()
def list_cards():
    """List all cards."""
    with get_session() as session:
        cards = get_all_cards(session)
        for c in cards:
            typer.echo(f"[{c.id}] {c.name} ({c.set_code} {c.set_number}) {c.condition.value} foil:{c.foil_type.value}")
            

@app.command()
def list_storage():
    """List all storage locations."""
    with get_session() as session:
        storages = get_all_storage(session)
        for s in storages:
            typer.echo(f"[{s.id}] {s.name} (collection: {s.collection_id})")


if __name__ == "__main__":
    app()