import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'

interface Card {
    name: string
    set_code: string
    set_number: string
    condition: string
    foil_type: string
    count: number
    scryfall_id: string
}

export default function StoragePage() {
    const { name } = useParams<{ name: string }>()
    const [cards, setCards] = useState<Card[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        client.get<Card[]>(`/storage/${name}/cards`)
            .then(res => setCards(res.data))
            .finally(() => setLoading(false))
    }, [name])

    if (loading) return <LoadingSpinner />

    return (
        <div className="p-8">
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