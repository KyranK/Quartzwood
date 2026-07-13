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
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
    const refreshCards = () => {
        client.get<Card[]>(`/storage/${name}/cards`)
            .then(res => setCards(res.data))
    }


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



    return (
        <div className="p-8">
            <Panel
                showPanel={showPanel}
                onClose={() => setShowPanel(false)}
                context={
                    panelCard 
                        ? <CardDisplay card={panelCard}  onUpdate={(updated) => { setPanelCard(updated); refreshCards(); }} />
                        : panelInstances !== null && panelInstances[0]
                            ? <CardSelection cards={panelInstances} onSelectCard={handleCardClick} />
                            : <LoadingSpinner />
                }
            />
            <button
                onClick={() => navigate(-1)}
                className="mb-4 text-blue-500 hover:underline"
            >
                ← Back
            </button>
            <div className="mb-6 relative">
                <div className="max-w-2xl">
                    <h1 className="text-2xl font-bold text-stone-900">{name}</h1>
                </div>
                <div className="mt-4 lg:mt-0 lg:absolute lg:right-0 lg:top-0 lg:w-[25rem]">
                    <div className="rounded-2xl border border-amber-200 bg-white/90 p-4 shadow-sm shadow-amber-100 w-full">
                        <form className="flex flex-col gap-3">
                            <div className="flex-1 min-w-0">
                                <label htmlFor="c_id" className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                                    Card Set Code / Number
                                </label>
                                <input
                                    id="c_id"
                                    name="c_id"
                                    defaultValue="iko-152"
                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                />
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvancedOptions(prev => !prev)}
                                    className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-100"
                                >
                                    {showAdvancedOptions ? 'Hide advanced' : 'Advanced options'}
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-amber-300 transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                >
                                    Add Card
                                </button>
                            </div>

                            {showAdvancedOptions && (
                                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 shadow-inner shadow-stone-100">
                                    <div className="grid gap-3">
                                        <label className="grid gap-1 text-sm text-stone-700">
                                            <span className="font-semibold text-stone-600">Condition</span>
                                            <select defaultValue="Near Mint" className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                                                <option value="Near Mint">Near Mint</option>
                                                <option value="Lightly Played">Lightly Played</option>
                                                <option value="Moderately Played">Moderately Played</option>
                                                <option value="Heavily Played">Heavily Played</option>
                                            </select>
                                        </label>

                                        <label className="grid gap-1 text-sm text-stone-700">
                                            <span className="font-semibold text-stone-600">Foil</span>
                                            <select defaultValue="None" className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                                                <option value="None">None</option>
                                                <option value="Nonfoil">Nonfoil</option>
                                                <option value="Foil">Foil</option>
                                                <option value="Etched Foil">Etched Foil</option>
                                            </select>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>

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