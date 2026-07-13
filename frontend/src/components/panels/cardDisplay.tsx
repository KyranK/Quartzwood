import type Card from "../../interfaces/card"
import LoadingSpinner from "../LoadingSpinner"
import DeleteButton from "../buttons/DeleteButton"
import EditButton from "../buttons/EditButton"
import { func, string } from "prop-types"
import CardDetails from "./cardDetails"
import { useState } from "react"
import CardEdit from "./cardEdit"
import client from '../../api/client'

interface CardDisplayProps {
    card: Card
}

function CardDisplay({ card }: CardDisplayProps) {

    //
    const [editmode, seteditmode] = useState(false)

    function handleDeleteCard(c_id: number | null){
    console.log("Request to delete card: " + ({c_id}) )
    }
    function handleEditCard(c_id: number | null){
        console.log("Request to Edit card: " + ({c_id}) )
        seteditmode(!editmode)
    }
    function handleSave(updated: Card) {   
    const setChanged = updated.set_code !== card.set_code || updated.set_number !== card.set_number
    console.log('setChanged:', setChanged, updated.set_code, card.set_number)

    client.put(`/card/${updated.id}`, {
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
        if (setChanged) {
            // re-fetch Scryfall data via backend
            client.post(`/card/${updated.id}/refresh-scryfall`)
                .then(() => seteditmode(false))
                .catch(err => console.error(err))
        } else {
            seteditmode(false)
        }
    })
    .catch(err => console.error(err))
}
    //

    return (
        <>
        <div className="p-2">
            {!editmode && <CardDetails card={card} />}
            {editmode && <CardEdit card={card} onUndo={() => handleEditCard(card.id)} onSave={handleSave} />}
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

export default CardDisplay