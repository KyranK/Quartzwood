#File: services/cards.py

#region Imports
from sqlmodel import Session, select
from quartzwood.models.card import CardInstance
from quartzwood.models.enums import Condition, FoilType, StampType
from quartzwood.services.scryfall import get_card_by_set_and_number, extract_card_fields

from quartzwood.services.storage import get_storage_id_by_name
#endregion

#region Cards
    #region Create
def add_card(
    session: Session,
    set_number: str,
    set_code: str,
    condition: Condition,
    quantity: int = 1,
    storage_name: str = None,
    foil_type: FoilType = FoilType.none,
    stamp_type: StampType = StampType.none,
    language: str = "en",
    notes: str = None,
) -> list[CardInstance] | str:
    """
    Resolves card via Scryfall then writes to DB.
    Returns the CardInstance on success, or an error string on failure.
    """
    scryfall_data = get_card_by_set_and_number(set_number, set_code)

    if scryfall_data is None:
        return f"Card not found: {set_code} {set_number}"

    fields = extract_card_fields(scryfall_data)
    
    storage_id = None
    if storage_name: 
        storage_id = get_storage_id_by_name(session,storage_name)
        if storage_id is None:
            raise ValueError(f"Collection '{storage_name}' not found")

    cards = []
    for _ in range(quantity):
        card = CardInstance(
            scryfall_id=fields["scryfall_id"],
            set_number=fields["set_number"],
            set_code=fields["set_code"],
            name=fields["name"],
            condition=condition,
            foil_type=foil_type,
            stamp_type=stamp_type,
            language=language,
            storage_id=storage_id,
            notes=notes,
        )

        session.add(card)
        cards.append(card)

    session.commit()
    for card in cards:
        session.refresh(card)
    return cards

    #endregion
    #region Read
def get_all_cards(session: Session) -> list[CardInstance]:
    return session.exec(select(CardInstance)).all()


def get_cards_by_storage(session: Session, storage_id: int) -> list[CardInstance]:
    return session.exec(select(CardInstance).where(CardInstance.storage_id == storage_id)).all()


def get_grouped_cards_by_storage(session: Session, storage_id: int) -> list[dict]:
    cards = get_cards_by_storage(session, storage_id)
    groups = {}
    for card in cards:
        key = (card.name, card.set_code, card.set_number, card.condition, card.foil_type)
        if key in groups:
            groups[key]["count"] += 1
        else:
            groups[key] = {
                "name": card.name,
                "set_code": card.set_code,
                "set_number": card.set_number,
                "condition": card.condition.value,
                "foil_type": card.foil_type.value,
                "count": 1
            }
    return list(groups.values())


def get_cards_grouped(session: Session) -> list[dict]:
    cards = session.exec(select(CardInstance)).all()
    
    groups = {}
    for card in cards:
        key = (card.name, card.set_code, card.set_number, card.condition, card.foil_type)
        if key in groups:
            groups[key]["count"] += 1
        else:
            groups[key] = {
                "name": card.name,
                "set_code": card.set_code,
                "set_number": card.set_number,
                "condition": card.condition.value,
                "foil_type": card.foil_type.value,
                "count": 1
            }
    return list(groups.values())


def get_cards_filtered(
    session: Session,
    set_number: str,
    set_code: str,
    condition: Condition = None,
    foil_type: FoilType = None,
    storage_name: str = None,
) -> list[CardInstance]:
    
    query = select(CardInstance).where(
        CardInstance.set_number == set_number,
        CardInstance.set_code == set_code,
    )

    if condition:
        query = query.where(CardInstance.condition == condition)
    if foil_type:
        query = query.where(CardInstance.foil_type == foil_type)
    if storage_name:
        storage_id = get_storage_id_by_name(session, storage_name)
        query = query.where(CardInstance.storage_id == storage_id)

    return session.exec(query).all()

    #endregion
    #region Update
def update_cards(
    session: Session,
    set_number: str, 
    set_code: str, 
    # filters
    condition: Condition = None,
    foil_type: FoilType = None,
    storage_name: str = None,
    # updates
    new_condition: Condition = None,
    new_foil_type: FoilType = None,
    new_storage_name: str = None,
    new_notes: str = None,
) -> list[CardInstance]:
    
    cards = get_cards_filtered(
      session = session,
      set_number = set_number,
      set_code = set_code,
      condition = condition,
      foil_type = foil_type,
      storage_name = storage_name,
  )

    if new_storage_name:
        new_storage_id = get_storage_id_by_name(session, new_storage_name)
        if new_storage_id is None:
            raise ValueError(f"Storage '{new_storage_name}' not found")

    for card in cards:
        if new_condition:
            card.condition = new_condition
        if new_foil_type:
            card.foil_type = new_foil_type
        if new_notes:
            card.notes = new_notes
        if new_storage_name:
            card.storage_id = new_storage_id
        session.add(card)

    session.commit()
    for card in cards:
        session.refresh(card)
    return cards

    #endregion
    #region Delete
def delete_cards(
    session: Session,
    set_number: str, 
    set_code: str, 
    # filters
    condition: Condition = None,
    foil_type: FoilType = None,
    storage_name: str = None,
) -> list[CardInstance]:
    
    cards = get_cards_filtered(
      session = session,
      set_number = set_number,
      set_code = set_code,
      condition = condition,
      foil_type = foil_type,
      storage_name = storage_name,
  )
    
    for card in cards:
        session.delete(card)
    session.commit()

    return cards

    #endregion
#endregion

#EOF