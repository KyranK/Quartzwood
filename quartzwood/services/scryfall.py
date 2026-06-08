import httpx
from typing import Optional


SCRYFALL_BASE = "https://api.scryfall.com"


def get_card_by_set_and_number(collector_number: str, set_code: str) -> Optional[dict]:
    """
    Fetch card data from Scryfall by set code and collector number.
    e.g. get_card_by_set_and_number("MH3", "187")
    """
    url = f"{SCRYFALL_BASE}/cards/{set_code.lower()}/{collector_number}"
    
    try:
        response = httpx.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError:
        return None
    except httpx.RequestError:
        return None


def extract_card_fields(scryfall_data: dict) -> dict:
    """
    Pull only the fields we care about from a Scryfall response.
    """
    return {
        "scryfall_id": scryfall_data.get("id"),
        "set_number": scryfall_data.get("collector_number"),	# Scryfall calls this collector_number
        "set_code": scryfall_data.get("set").upper(),
        "name": scryfall_data.get("name"),
    }