import type Card from "../../interfaces/card"
import LoadingSpinner from "../LoadingSpinner"
import DeleteButton from "../buttons/DeleteButton"
import EditButton from "../buttons/EditButton"
import { func, string } from "prop-types"

interface CardDetailsProps {
    card: Card
}

function handleDeleteCard(c_id: number | null){
    console.log("Request to delete card: " + ({c_id}) )
}

function CardDetails({ card }: CardDetailsProps) {
    return (
        <div className="p-2">
            <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 shadow-[0_2px_8px_rgba(120,53,15,0.12)]">
                <div className="mb-3 border-b border-amber-200 pb-3">
                    <p className="text-lg font-bold uppercase tracking-wide text-stone-800">{card.name}</p>
                    <p className="text-sm text-stone-600">{card.set_number}-{card.set_code}</p>
                </div>

                <dl className="space-y-2 text-sm text-stone-700">
                    <div className="flex justify-between gap-4 border-b border-amber-100 pb-1">
                        <dt className="font-semibold text-stone-600">Condition</dt>
                        <dd className="text-right">{card.condition}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-amber-100 pb-1">
                        <dt className="font-semibold text-stone-600">Foil</dt>
                        <dd className="text-right">{card.foil_type}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-amber-100 pb-1">
                        <dt className="font-semibold text-stone-600">Stamp</dt>
                        <dd className="text-right">{card.stamp_type}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-amber-100 pb-1">
                        <dt className="font-semibold text-stone-600">Language</dt>
                        <dd className="text-right">{card.language ?? "N/A"}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-amber-100 pb-1">
                        <dt className="font-semibold text-stone-600">Acquired Date</dt>
                        <dd className="text-right">{card.acquired_date ? card.acquired_date : "N/A"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                        <dt className="font-semibold text-stone-600">Purchase Price</dt>
                        <dd className="text-right">{card.purchase_price ? `$${card.purchase_price}` : "N/A"}</dd>
                    </div>
                </dl>
            </div>
            
        </div>
    )
}

export default CardDetails