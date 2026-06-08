import typer
from typer import Argument, Option
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
        try:
            collection = create_collection(session, name=name, description=description)
            typer.echo(f"Created collection: [{collection.id}] {collection.name}")
        except ValueError as e:
            typer.echo(f"Error: {e}")


@app.command()
def new_storage(name: str, collection_name: str = None, description: str = None):
    """Create a new storage location."""
    with get_session() as session:
        try:
            storage = create_storage(session, name=name, collection_name=collection_name, description=description)
            typer.echo(f"Created storage: [{storage.id}] {storage.name}")
        except ValueError as e:
            typer.echo(f"Error: {e}")


@app.command()
def add(
    set_number: str,
    set_code: str,
    condition: Condition,
    quanitity: int = Option(1, "--quantity", "-q"),
    storage_name: str = Option(None, "--storage-name", "-s"),
    foil_type: FoilType = Option(FoilType.none, "--foil", "-f"),
    stamp_type: StampType = Option(StampType.none, "--stamp", "-st"),
    language: str = Option("en", "--language", "-l"),
    notes: str = Option(None, "--notes", "-n"),
):
    """Add a card to the collection."""
    with get_session() as session:
        try:
            result = add_card(
                session=session,
                set_number=set_number,
                set_code=set_code,
                condition=condition,
                storage_name=storage_name,
                quantity=quanitity,
                foil_type=foil_type,
                stamp_type=stamp_type,
                language=language,
                notes=notes,
            )
            if isinstance(result, str):
                typer.echo(f"Error: {result}")
            else:
                typer.echo(f"Added {len(result)}x {result[0].name} ({result[0].set_code} {result[0].set_number}) {result[0].condition.value}")
        except ValueError as e:
            typer.echo(f"Error: {e}")


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