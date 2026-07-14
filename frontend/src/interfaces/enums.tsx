enum Condition{
    near_mint = "NM",
    lightly_played = "LP",
    moderately_played = "MP",
    heavily_played = "HP",
    damaged = "DMG",
}

enum FoilType{
    none = "none",
    traditional = "traditional",
    pre_modern = "pre_modern",
    from_the_vault = "from_the_vault",
    etched = "etched",
    textured = "textured",
    fracture = "fracture",
    double_rainbow = "double_rainbow",
    confetti = "confetti",
    galaxy = "galaxy",
    gilded = "gilded",
    halo = "halo",
    invisible_ink = "invisible_ink",
    neon_ink = "neon_ink",
    oil_slick = "oil_slick",
    silverscreen = "silverscreen",
    step_and_compleat = "step_and_compleat",
    surge = "surge",
}

enum StampType{
    none = "none",
    promo = "promo",
    prerelease = "prerelease",
}

enum EntityType{
    personal = "personal",
    club = "club",
    friend = "friend",
    shop = "shop",
}

//TODO: Add language enum

export {
    Condition,
    FoilType,
    StampType,
    EntityType,
}