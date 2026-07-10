import type Card from "../../interfaces/card"
import LoadingSpinner from "../LoadingSpinner"

interface CardSelectionProps {
    cards: Card[]
}

function CardSelection({ cards }: CardSelectionProps) {
    return (
        <>
            <div>{cards.map(c =>
                <p> {c.name} </p>
                )}
            </div>
            <LoadingSpinner />
        </>
    )
}

export default CardSelection