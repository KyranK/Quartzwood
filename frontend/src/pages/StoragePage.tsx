import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as apiCards from "../api/cards"
import * as apiStorage from "../api/storage"
import LoadingSpinner from '../components/misc/LoadingSpinner'
import Panel from '../components/panels/panel'
import CardPanel from '../components/panels/CardPanel'
import CardSelection from '../components/panels/cardSelection'
import CardAdd from '../components/misc/CardAdd'

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
    const { storage_id } = useParams<{ storage_id: string }>()
    const [storageName, setStorageName] = useState<string>('')
    const [cards, setCards] = useState<Card[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const [panelCard, setPanelCard] = useState<Card | null>(null)
    const [panelInstances, setPanelInstances] = useState<Card[] | null>(null)
    const [showPanel, setShowPanel] = useState(false)
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
    const [editName, setEditName] = useState(false)
    const [draftName, setDraftName] = useState('')
    const [draftDescription, setDraftDescription] = useState('')
    const [storageDescription, setStorageDescription] = useState('')
    const [savingName, setSavingName] = useState(false)
    const refreshCards = () => {
        apiCards.cardsByStorage(String(storage_id))
            .then(res => setCards(res))
    }

    const startEditingName = () => {
        setDraftName(storageName)
        setDraftDescription(storageDescription)
        setEditName(true)
    }

    const cancelEditingName = () => {
        setDraftName(storageName)
        setDraftDescription(storageDescription)
        setEditName(false)
    }

    const saveStorageName = async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault()

        const trimmedName = draftName.trim()
        const trimmedDescription = draftDescription.trim()
        const hasNameChanged = trimmedName !== storageName
        const hasDescriptionChanged = trimmedDescription !== storageDescription

        if (!storage_id || (!hasNameChanged && !hasDescriptionChanged)) {
            cancelEditingName()
            return
        }

        setSavingName(true)

        try {
            const updated = await apiStorage.updateStorage(storage_id, trimmedName, trimmedDescription)
            setStorageName(updated.name)
            setStorageDescription(updated.description ?? '')
            setDraftName(updated.name)
            setDraftDescription(updated.description ?? '')
        } catch (error) {
            console.error('Failed to update storage:', error)
            setDraftName(storageName)
            setDraftDescription(storageDescription)
        } finally {
            setEditName(false)
            setSavingName(false)
        }
    }


    const handleCardClick = (c: Card) => {
        setPanelCard(null)
        setPanelInstances(null)

        if (c.id) {
            // This is an individual card instance, so show its details.
            apiCards.cardById(c.id)
                .then(res => {
                    setPanelCard(res)
                })
        } else {
            // This is a grouped card, so show the matching instances.
            //apiCards.cardsByStorage(String(storage_id))
            apiCards.cardsByStorageSetNumber(String(storage_id),String(c.set_code), String(c.set_number))
                .then(res => {
                    setPanelInstances(res)
                })
        }
        setShowPanel(true)
    }

    useEffect(() => {
        apiStorage.storageById(String(storage_id))
            .then(res => {
                setStorageName(res.name)
                setStorageDescription(res.description ?? '')
                setDraftName(res.name)
                setDraftDescription(res.description ?? '')
            })
        apiCards.cardsByStorage(String(storage_id))
            .then(res => setCards(res))
            .finally(() => setLoading(false))
    }, [storage_id])

    if (loading) return <LoadingSpinner />

    return (
        <div className="p-8">
            <Panel
                showPanel={showPanel}
                onClose={() => setShowPanel(false)}
                context={
                    panelCard 
                        ? <CardPanel card={panelCard}  onUpdate={(updated) => { setPanelCard(updated); refreshCards();}} onDelete={() => {refreshCards();} } />
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
                    {editName ? (
                        <form
                            onSubmit={(event) => saveStorageName(event)}
                            onClick={(event) => event.stopPropagation()}
                            onKeyDown={(event) => {
                                if (event.key === 'Escape') {
                                    event.preventDefault()
                                    cancelEditingName()
                                }
                            }}
                            className="flex flex-col gap-3 rounded-lg border border-stone-300 bg-white p-3 shadow-sm"
                        >
                            <input
                                type="text"
                                value={draftName}
                                onChange={(event) => setDraftName(event.target.value)}
                                autoFocus
                                className="rounded border border-stone-300 px-2 py-1 text-2xl font-bold text-stone-900"
                                placeholder="Storage name"
                            />
                            <textarea
                                value={draftDescription}
                                onChange={(event) => setDraftDescription(event.target.value)}
                                className="min-h-[90px] rounded border border-stone-300 px-2 py-1 text-sm"
                                placeholder="Storage description"
                            />
                            <div className="flex items-center gap-2">
                                <button
                                    type="submit"
                                    disabled={savingName}
                                    className="text-sm text-blue-600 hover:underline disabled:text-blue-300"
                                >
                                    {savingName ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelEditingName}
                                    className="text-sm text-stone-600 hover:underline"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <div onClick={startEditingName} className="cursor-pointer">
                                <h1 className="text-2xl font-bold text-stone-900">{storageName}</h1>
                            </div>
                            {storageDescription && (
                                <>
                                    <hr className="my-2" />
                                    <p className="pl-3 text-sm text-stone-600">{storageDescription}</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
                {/* AddCard */}
                {storage_id ? 
                    <CardAdd onUpdate={refreshCards} storage={storage_id}/>
                :   <CardAdd onUpdate={refreshCards}/>
                }
            </div>

            {cards.length === 0 && (
                <p className="text-gray-500">No cards in this storage.</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-75/100">
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