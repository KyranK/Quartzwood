//File: cardSelection.tsx
//Componet: Panel-insert
//Use: Lists card-Array and returns selected card
import type Card from "../../interfaces/card"


interface CardSelectionProps {
    cards: Card[]
    onSelectCard?: (card: Card) => void
}

function CardSelection({ cards, onSelectCard }: CardSelectionProps) {
    return (
        <>
            <div>{cards.map(c =>
                <button
                    key={`${c.id ?? c.set_code}-${c.set_number}-${c.condition}-${c.foil_type}`}
                    type="button"
                    className="border-2 border-solid m-2 p-1 flex gap-2 w-full text-left"
                    onClick={() => onSelectCard?.(c)}
                >
                    {/*Card Img*/}
                    <img
                            src={`https://api.scryfall.com/cards/${c.scryfall_id}?format=image&version=normal`}
                            alt={c.name}
                            className="w-full rounded-lg shadow inline-30 flex-auto"
                        />
                    {/*Card Description*/}
                    <div className="flex-auto ">
                        <p> {c.name} </p>
                        <p> {c.set_number}-{c.set_code} </p>
                        {/* AI list/filter + join("|") */}
                        <p className="flex flex-wrap items-center gap-2">
                        {[
                            c.condition,
                            c.foil_type !== "none" && c.foil_type,
                            c.stamp_type !== "none" && c.stamp_type,
                            c.language && c.language.toUpperCase(),
                        ]
                            .filter(Boolean)
                            .map((value, index, arr) => (
                            <span key={index} className="flex items-center gap-2">
                                {value}
                                {index < arr.length - 1 && <span className="text-gray-400">|</span>}
                            </span>
                            ))}
                        </p>
                        {c.acquired_date && <p>{c.acquired_date}</p>}
                        {c.purchase_price && <p>${c.purchase_price}</p>}
                        {c.notes && <p> Notes:<br/>{c.stamp_type}</p>}
                    </div>
                </button>
                )}
            </div>
        </>
    )
}

export default CardSelection