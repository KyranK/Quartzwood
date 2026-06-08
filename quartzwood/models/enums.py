from enum import Enum


class Condition(str, Enum):
    near_mint = "NM"
    lightly_played = "LP"
    moderately_played = "MP"
    heavily_played = "HP"
    damaged = "DMG"


class FoilType(str, Enum):
    none = "none"
    traditional = "traditional"
    pre_modern = "pre_modern"
    from_the_vault = "from_the_vault"
    etched = "etched"
    textured = "textured"
    fracture = "fracture"
    double_rainbow = "double_rainbow"
    confetti = "confetti"
    galaxy = "galaxy"
    gilded = "gilded"
    halo = "halo"
    invisible_ink = "invisible_ink"
    neon_ink = "neon_ink"
    oil_slick = "oil_slick"
    silverscreen = "silverscreen"
    step_and_compleat = "step_and_compleat"
    surge = "surge"


class StampType(str, Enum):
    none = "none"
    promo = "promo"
    prerelease = "prerelease"


class EntityType(str, Enum):
    personal = "personal"
    club = "club"
    friend = "friend"
    shop = "shop"