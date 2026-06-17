#File: services/cli_helper.py

#region Imports
from quartzwood.db import get_session

from quartzwood.services.storage import get_all_storage
from quartzwood.services.collection import get_all_collections
#endregion

#region Auto-complete
def autocomplete_storage_names(incomplete: str) -> list[str]:
    with get_session() as session:
        storages = get_all_storage(session)
        return [s.name for s in storages if s.name.lower().startswith(incomplete.lower())]

def autocomplete_collection_names(incomplete: str) -> list[str]:
    with get_session() as session:
        collections = get_all_collections(session)
        return [c.name for c in collections if c.name.lower().startswith(incomplete.lower())]
#endregion

#EOF