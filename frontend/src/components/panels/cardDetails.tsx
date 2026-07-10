import type Card from "../../interfaces/card"
import LoadingSpinner from "../LoadingSpinner"

interface CardDetailsProps {
    c: Card
}

function CardDetails({ c }: CardDetailsProps) {
    return (
        <>
            <p>{c.name}</p>
        </>
    )
}

export default CardDetails