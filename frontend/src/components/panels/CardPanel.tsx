import type Card from "../../interfaces/card"
import DeleteButton from "../buttons/DeleteButton"
import EditButton from "../buttons/EditButton"
import CardDetails from "./cardDetails"
import { useState, useEffect } from "react"
import CardEdit from "./cardEdit"
import * as apiCards from "../../api/cards"
import * as apiScry from "../../api/scryfall"

interface CardPanelProps {
    card: Card
    onUpdate?: (updated: Card) => void
    onDelete?: () => void
}

function CardPanel({ card, onUpdate, onDelete }: CardPanelProps) {

    //
    const [editmode, seteditmode] = useState(false)
    const [currentCard, setCurrentCard] = useState<Card>(card)

    function handleDeleteCard(c_id: number | null){
        console.log("Request to delete card: " + ({c_id}) )
        if (c_id != null) {
            apiCards.deleteCard(c_id)
            .then(() =>
                {onDelete?.()
                })
        }
    }
    function handleEditCard(c_id: number | null){
        console.log("Request to Edit card: " + ({c_id}) )
        seteditmode(!editmode)
    }
    function handleSave(updated: Card) {   
    const setChanged = updated.set_code !== currentCard.set_code || updated.set_number !== currentCard.set_number
    console.log('setChanged:', setChanged, updated.set_code, updated.set_number)

    apiCards.updateCard(updated.id, {
        condition: updated.condition,
        foil_type: updated.foil_type,
        stamp_type: updated.stamp_type,
        language: updated.language,
        acquired_date: updated.acquired_date,
        purchase_price: updated.purchase_price,
        set_code: updated.set_code,
        set_number: updated.set_number,
    })
    .then(() => {
        console.log('PUT success')
        if (setChanged) {
            apiScry.refresh_card_image(updated.id)
                .then(() => {
                    console.log('refresh-scryfall success')
                    apiCards.cardById(updated.id)
                        .then(card => {
                            console.log('re-fetch success', card)
                            setCurrentCard(card)
                            onUpdate?.(card)
                            seteditmode(false)
                        })
                })
        } else {
            console.log('no set change, updating locally')
            console.log('updated:', updated)
            setCurrentCard(updated)
            onUpdate?.(updated)
            seteditmode(false)
        }
    })
    .catch(err => console.error(err))
}
    //

    useEffect(() => {
        setCurrentCard(card)
    }, [card])

    return (
        <>
        <div className="p-2">
            {!editmode && <CardDetails card={currentCard} />}
            {editmode && <CardEdit card={currentCard} onUndo={() => handleEditCard(currentCard.id)} onSave={handleSave} />}
        </div>
        {!editmode && 
            <div className="flex justify-between gap-2">
                <DeleteButton onConfirm={()=> handleDeleteCard(card.id)}/>
                <EditButton onConfirm={()=>handleEditCard(card.id)}/>
            </div>    
        }
        </>
    )
}

export default CardPanel