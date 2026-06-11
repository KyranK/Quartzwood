#File: cli/main.py

#region Imports
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
    get_cards_grouped,
    update_cards,
    delete_cards,
    update_collection as svc_update_collection,
    delete_collection as svc_delete_collection,
    update_storage as svc_update_storage,
)
from sqlalchemy.exc import IntegrityError, OperationalError

app = typer.Typer()

#endregion
#region Init
@app.command()
def init():
    """Initialise the database."""
    init_db()
    typer.echo("Database initialised.")

#endregion
#region Collection
    #region Create
@app.command()
def new_collection(name: str, description: str = None):
    """Create a new collection."""
    with get_session() as session:
        try:
            collection = create_collection(session, name=name, description=description)
            typer.echo(f"Created collection: [{collection.id}] {collection.name}")
        except Exception as e:
            handle_errors(e, name)

    #endregion
    #region Read
@app.command()
def list_collections():
    """List all collections."""
    with get_session() as session:
        collections = get_all_collections(session)
        for c in collections:
            typer.echo(f"[{c.id}] {c.name}")

    #endregion
    #region Update
@app.command()
def update_collection(
    collection_name: str,
    # update fields
    new_name: str = Option(None, "--new-name", "-N"),
    new_description: str = Option(None, "--description", "-D"),
    new_location: str = Option(None, "--new_location", "-L"),
):
    with get_session() as session:
        try:
            svc_update_collection(
            session,
            collection_name = collection_name,
            # update fields
            new_name = new_name,
            new_description = new_description,
            new_location = new_location,
            )
            typer.echo(f"Updated collection: {new_name if new_name else collection_name}")
        except Exception as e:
            handle_errors(e, new_name if new_name else collection_name)

    #endregion
    #region delete
@app.command()
def delete_collection(
    collection_name: str,
    relocate_collection_name: str = Option(None, "--relocate", "-r"),
    force: bool = Option(False, "--force"),
):
    with get_session() as session:
        try:
            svc_delete_collection(
                session,
                collection_name = collection_name,
                relocate_collection_name = relocate_collection_name,
                force = force,
            )
        except Exception as e:
            handle_errors(e, collection_name)

    #endregion
#endregion
#region Storage
    #region Create
@app.command()
def new_storage(
    name: str, 
    collection_name: str = Option(None, "--collection-name", "-c"),
    description: str = None
    ):
    """Create a new storage location."""
    with get_session() as session:
        try:
            storage = create_storage(session, name=name, collection_name=collection_name, description=description)
            typer.echo(f"Created storage: [{storage.id}] {storage.name}")
        except Exception as e:
            handle_errors(e, name)

    #endregion
    #region Read
@app.command()
def list_storage():
    """List all storage locations."""
    with get_session() as session:
        storages = get_all_storage(session)
        for s in storages:
            typer.echo(f"[{s.id}] {s.name} (collection: {s.collection_id})")
    
    #endregion
    #region Update
@app.command()
def update_storage(
    name: str, 
    # New fields
    new_name: str = Option(None, "--new-name", "-N"),
    new_collection_name: str = Option(None, "--relocate", "-r"),
    new_description: str = Option(None, "--description", "-d"),
):
    with get_session() as session:
        try:
            svc_update_storage(
                session,
                name = name,
                # New fields
                new_name = new_name,
                new_collection_name = new_collection_name, 
                new_description = new_description,
            )
        except Exception as e:
            handle_errors(e, name)

    
    #endregion
    #region Delete

    #endregion
#endregion
#region Cards
    #region Create
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

    #endregion
    #region Read
@app.command()
def list_cards():
    """List all cards."""
    with get_session() as session:
        groups = get_cards_grouped(session)
        for g in groups:
            count = f"{g['count']}x " if g['count'] > 1 else ""
            typer.echo(f"{count}{g['name']} ({g['set_code']} {g['set_number']}) {g['condition']} foil:{g['foil_type']}")

    #endregion
    #region Update
@app.command()
def update(
    # Card
    set_number: str, 
    set_code: str,
    # filters
    condition: Condition = Option(None, "--condition", "-c"),
    foil_type: FoilType = Option(None, "--foil", "-f"),
    storage_name: str = Option(None, "--storage", "-s"),
    # Changes
    new_condition: Condition = Option(None, "--new-condition", "-C"),
    new_foil_type: FoilType = Option(None, "--new-foil", "-F"),
    new_storage_name: str = Option(None, "--new-storage", "-S"),
    new_notes: str = Option(None, "--notes", "-n"),
):
    ### update cards ###
    with get_session() as session:
        try:
            cards = update_cards(
                session=session,
                set_number = set_number,
                set_code = set_code,
                storage_name = storage_name,
                condition = condition,
                foil_type = foil_type,
                new_condition = new_condition,
                new_foil_type = new_foil_type,
                new_storage_name = new_storage_name,
                new_notes = new_notes
            )
            if not cards:
                typer.echo("No cards found matching those filters")
            else:
                typer.echo(f"Updated {len(cards)} card(s)")
        except ValueError as e:
            typer.echo(f"Error: {e}")


    #endregion
    #region Delete
@app.command()
def rmv_cards(
    # Card
    set_number: str, 
    set_code: str,
    # filters
    condition: Condition = Option(None, "--condition", "-c"),
    foil_type: FoilType = Option(None, "--foil", "-f"),
    storage_name: str = Option(None, "--storage", "-s"),
):
    ### remove cards ###
    with get_session() as session:
        try:
            cards = delete_cards(
                session=session,
                set_number = set_number,
                set_code = set_code,
                storage_name = storage_name,
                condition = condition,
                foil_type = foil_type,
            )
            if not cards:
                typer.echo("No cards found matching those filters")
            else:
                typer.echo(f"Removed {len(cards)} card(s)")
        except ValueError as e:
            typer.echo(f"Error: {e}")
    #endregion
#endregion

#region Helper Funcs
def handle_errors(e: Exception, target_name: str = None):
    if isinstance(e, ValueError):
        typer.echo(f"Error: {e}")
    elif isinstance(e, IntegrityError):
        typer.echo(f"Error: '{target_name}' already exists")
    elif isinstance(e, OperationalError):
        typer.echo(f"Database error: {e}")
    else:
        typer.echo(f"Unexpected error: {e}")

#endregion
#region App Entry
if __name__ == "__main__":
    app()
#endregion