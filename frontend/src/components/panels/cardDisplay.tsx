import type Card from "../../interfaces/card"
import LoadingSpinner from "../LoadingSpinner"
import DeleteButton from "../buttons/DeleteButton"
import EditButton from "../buttons/EditButton"
import { func, string } from "prop-types"
import CardDetails from "./cardDetails"
import { useState } from "react"
import CardEdit from "./cardEdit"

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
    //

    return (
        <>
        <div className="p-2">
            {!editmode && <CardDetails card={card} />}
            {editmode && <CardEdit card={card} onUndo={() => handleEditCard(card.id)} />}
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