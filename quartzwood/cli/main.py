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
    get_cards_grouped as svc_get_cards_grouped,
    update_cards,
    delete_cards,
    update_collection as svc_update_collection,
    delete_collection as svc_delete_collection,
    update_storage as svc_update_storage,
    delete_storage as svc_delete_storage,
    get_storage_by_name as svc_get_storage_by_name,
    get_cards_by_storage as svc_get_cards_by_storage,
    get_grouped_cards_by_storage as svc_get_grouped_cards_by_storage,
    get_collection_id_by_name as svc_get_collection_id_by_name,
    get_storage_by_collection_id as svc_get_storage_by_collection_id,
    autocomplete_storage_names,
    autocomplete_collection_names,
)
from sqlalchemy.exc import IntegrityError, OperationalError
from rich.table import Table
from rich.console import Console
app = typer.Typer()
console = Console()  

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
#region Init
    #region typer
@app.command()
def init():
    """Initialise the database."""
    init_db()
    typer.echo("Database initialised.")

    #endregion
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


@app.command()
def view_collection(
    collection_name: str = Argument(..., autocompletion=autocomplete_collection_names)
):
    with get_session() as session:
        try:
            # check collection exist -> get id
            collection_id = svc_get_collection_id_by_name(session, collection_name)
            if collection_id is None:
                typer.echo(f"Collection '{collection_name}' not found")
                return
            
            # get storages by collection_id
            storages = svc_get_storage_by_collection_id(session, collection_id)
            if storages is None:
                storages = []
            if not storages:
                # Collection has no storages
                # return empty table
                pass

            # table (Collection.name) [storage_name, size]
            table = Table(title=f"{collection_name}")
            table.add_column("Storage")
            table.add_column("Cards Stored")

            for storage in storages:
                table.add_row(
                    storage.name,
                    # TODO: swap to COUNT query when moving to Postgres for library feature
                    str(len(svc_get_cards_by_storage(session, storage.id)))
                )
            # print
            console.print(table)

        except Exception as e:
            handle_errors(e, collection_name)

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
def rmv_collection( 
    collection_name: str,
    relocate_collection_name: str = Option(None, "--relocate", "-r"),
    force: bool = Option(False, "--force"),
):
    with get_session() as session:
        try:
            collection = svc_delete_collection(
                session,
                collection_name = collection_name,
                relocate_collection_name = relocate_collection_name,
                force = force,
            )
            typer.echo(f"Deleted Collection: {collection.name} ")
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
    

@app.command()
def view_storage(
    storage_name: str = Argument(..., autocompletion=autocomplete_storage_names)
):
    with get_session() as session:
        try:
            storage = svc_get_storage_by_name(session, storage_name)
            if storage is None:
                typer.echo(f"Storage {storage_name} not found")
                return

            cards = svc_get_grouped_cards_by_storage(session, storage.id)
            if not cards:
                # If storage has no cards
                # that's ok just return empty table
                pass
            
            table = Table(title=f"{storage_name}")
            table.add_column("Count")
            table.add_column("Name")
            table.add_column("set Id")
            table.add_column("Condition")
            table.add_column("Foil")

            for card in cards:
                table.add_row(
                    str(card["count"]),
                    card["name"],
                    card["set_number"] + "-" + card["set_code"],
                    card["condition"],
                    card["foil_type"]
                )
            console.print(table)
        except Exception as e:
            handle_errors(e, storage_name)

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
            storage = svc_update_storage(
                session,
                name = name,
                # New fields
                new_name = new_name,
                new_collection_name = new_collection_name, 
                new_description = new_description,
            )
            typer.echo(f"Updated Storage: {storage.name}")
        except Exception as e:
            handle_errors(e, name)

    
    #endregion
    #region Delete
@app.command()
def rmv_storage(
    storage_name: str,
    # Orphanage
    relocate_storage_name: str = Option(None, "--relocate", "-r"),
    force_flag: bool = Option(False, "--force"),
):
    with get_session() as session:
        try:
            storage = svc_delete_storage(
                session,
                storage_name = storage_name,
                relocate_storage_name = relocate_storage_name,
                force_flag = force_flag,
            )
            typer.echo(f"Storage Deleted: {storage.name}")
        except Exception as e:
            handle_errors(e, storage_name)

    #endregion
#endregion
#region Cards
    #region Create
@app.command()
def add(
    set_number: str,
    set_code: str,
    condition: Condition,
    quantity: int = Option(1, "--quantity", "-q"),
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
                quantity=quantity,
                foil_type=foil_type,
                stamp_type=stamp_type,
                language=language,
                notes=notes,
            )
            if isinstance(result, str):
                typer.echo(f"Error: {result}")
            else:
                typer.echo(f"Added {len(result)}x {result[0].name} ({result[0].set_code} {result[0].set_number}) {result[0].condition.value}")
        except Exception as e:
            handle_errors(e, f"{set_code} {set_number}")

    #endregion
    #region Read
@app.command()
def list_cards():
    """List all cards."""
    with get_session() as session:
        groups = svc_get_cards_grouped(session)
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
        except Exception as e:
            handle_errors(e, f"{set_code} {set_number}")


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
        except Exception as e:
            handle_errors(e, f"{set_code} {set_number}")
    #endregion
#endregion
#region App Entry
if __name__ == "__main__":
    app()
#endregion