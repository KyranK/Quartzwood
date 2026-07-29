#File: services/cards.py

#region Imports
from sqlmodel import Session, select
from quartzwood.models.card import CardInstance
from quartzwood.models.enums import Condition, FoilType, StampType
from quartzwood.services.scryfall import get_card_by_set_and_number, extract_card_fields


#endregion

#region Cards
    #region Create
def add_card(
    session: Session,
    set_number: str,
    set_code: str,
    condition: Condition,
    quantity: int = 1,
    storage_id: str = None,
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

    # All cards
def get_all_cards(session: Session) -> list[CardInstance]: 
    return session.exec(select(CardInstance)).all()

def get_all_cards_grouped(session) -> list[dict]:
    cards = get_all_cards(session)
    return group_cards(cards)

    # Cards by ID
def get_card_by_id(session: Session, card_id: int) -> CardInstance | None:
    return session.get(CardInstance, card_id)

    # Cards by Storage
def get_cards_by_storage_id(session: Session, storage_id: int) -> list[CardInstance]:
    return session.exec(select(CardInstance).where(CardInstance.storage_id == storage_id)).all()


def get_grouped_cards_by_storage(session: Session, storage_id: int) -> list[dict]:
    cards = get_cards_by_storage_id(session, storage_id)
    return group_cards(cards)


    # Cards by Collection

    
    # Cards by Entity


    # Cards by filter
def get_cards_filtered(
    session: Session,
    set_number: str,
    set_code: str,
    condition: Condition = None,
    foil_type: FoilType = None,
    storage_id: int = None,
) -> list[CardInstance]:
    # Local import to avoid circular dependancy with storage.py
    from quartzwood.services.storage import get_storage_id_by_name
    
    query = select(CardInstance).where(
        CardInstance.set_number == set_number,
        CardInstance.set_code == set_code,
    )

    if condition:
        query = query.where(CardInstance.condition == condition)
    if foil_type:
        query = query.where(CardInstance.foil_type == foil_type)
    if storage_id:
        query = query.where(CardInstance.storage_id == storage_id)

    return session.exec(query).all()




    #endregion
    #region Update

    # Update by ID
def update_card_by_id(
    session: Session,
    c_id: int,
    #updates
    n_set_number: str = "",
    n_set_code: str = "",
    n_condition: Condition = None,
    n_foil: FoilType = None,
    n_storage_id: int = None,
    n_notes: str = ""
) -> CardInstance:
    
    card = get_card_by_id(session, c_id)
    if card == None:
        raise ValueError(f"Card with id:'{c_id}' not found")
    
    if n_set_number:
        card.set_number = n_set_number
    if n_set_code:
        card.set_code = n_set_code
    if n_condition:
        card.condition = n_condition
    if n_foil:
        card.foil_type = n_foil
    if n_storage_id:
        card.storage_id = n_storage_id
    if n_notes:
        card.notes = n_notes

    session.commit()
    session.refresh(card)

    return card
    

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
    # Local import to prevent circular import with storage.py
    from quartzwood.services.storage import get_storage_id_by_name
    
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

    # Delete by id
def delete_card_by_id(
        session: Session,
        card_id: int
    ):
    card = get_card_by_id(session, card_id)
    session.delete(card)

    session.commit()
    return card

    #endregion
#endregion
#region Misc
def group_cards(cards: list) -> list[dict]:

    groups = {}
    for card in cards:
        key = (card.name, card.set_code, card.set_number, card.condition, card.foil_type)
        if key in groups:
            groups[key]["count"] += 1
            groups[key]["id"] = None  # multiple instances, no single id
        else:
            groups[key] = {
                "scryfall_id": card.scryfall_id, 
                "name": card.name,
                "set_code": card.set_code,
                "set_number": card.set_number,
                "condition": card.condition.value,
                "foil_type": card.foil_type.value,
                "count": 1,
                "id": card.id,
            }
    return list(groups.values())
#endregion
#EOF