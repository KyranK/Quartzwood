interface Card {
    id: number | null
    name: string
    set_code: string
    set_number: string
    scryfall_id: string
    condition: string
    foil_type: string
    count: number
    // instance-level fields (null when grouped)
    stamp_type?: string
    language?: string
    notes?: string | null
    acquired_date?: string | null
    purchase_price?: number | null
}

export default Card;