import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import Panel from '../components/panels/panel'
import CardDetails from '../components/panels/cardDetails'
import CardSelection from '../components/panels/cardSelection'
import CardDisplay from '../components/panels/cardDisplay'

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

export default function StoragePage() {
    const { name } = useParams<{ name: string }>()
    const [cards, setCards] = useState<Card[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const [panelCard, setPanelCard] = useState<Card | null>(null)
    const [panelInstances, setPanelInstances] = useState<Card[] | null>(null)
    const [showPanel, setShowPanel] = useState(false)


    const handleCardClick = (c: Card) => {
        console.log("@ ImgClick")
        setPanelCard(null)
        setPanelInstances(null)

        if (c.id) {
            // This is an individual card instance, so show its details.
            client.get<Card>(`/card/${c.id}`)
                .then(res => {
                    setPanelCard(res.data)
                })
        } else {
            // This is a grouped card, so show the matching instances.
            client.get<Card[]>(`/storage/${name}/cards/${c.set_code}/${c.set_number}`)
                .then(res => {
                    setPanelInstances(res.data)
                })
        }
        setShowPanel(true)
    }

    useEffect(() => {
        client.get<Card[]>(`/storage/${name}/cards`)
            .then(res => setCards(res.data))
            .finally(() => setLoading(false))
    }, [name])

    if (loading) return <LoadingSpinner />

    let panelContent;

    if (panelCard) {
        panelContent = <CardDisplay card={panelCard} />;
    } else if (panelInstances !== null && panelInstances[0]) {
        panelContent = <CardSelection cards={panelInstances} onSelectCard={handleCardClick} />;
    } else {
        panelContent = <LoadingSpinner />;}

    return (
        <div className="p-8">
            <Panel
                showPanel={showPanel}
                onClose={() => setShowPanel(false)}
                context={panelContent}
            />
            <button
                onClick={() => navigate(-1)}
                className="mb-4 text-blue-500 hover:underline"
            >
                ← Back
            </button>
            <h1 className="text-2xl font-bold mb-6">{name}</h1>

            {cards.length === 0 && (
                <p className="text-gray-500">No cards in this storage.</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {cards.map(c => (
                    <div
                        key={`${c.set_code}-${c.set_number}-${c.condition}-${c.foil_type}`}
                        className="relative"
                    >
                        <img
                            src={`https://api.scryfall.com/cards/${c.scryfall_id}?format=image&version=normal`}
                            alt={c.name}
                            className="w-full rounded-lg shadow"
                            onClick={(event) => handleCardClick(c)}
                        />
                        {c.count > 1 && (
                            <span className="absolute top-1 right-1 bg-white/50 text-black text-s font-bold w-7 h-7 rounded-full flex items-center justify-center">
                                {c.count}
                            </span>
                        )}
                        <p className="text-xs text-center mt-1 text-gray-600">
                            {c.name} · {c.condition}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}