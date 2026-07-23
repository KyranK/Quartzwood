import type Card from "../../interfaces/card"
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import * as Enums from "../../interfaces/enums"
import * as APICards from "../../api/cards"

interface CardEditProps {
    card: Card
    onUndo: () => void
    onSave: (updated: Card) => void
}

interface CardFormState {
    name: string
    set_code: string
    set_number: string
    condition: string
    foil_type: string
    stamp_type: string
    language: string
    acquired_date: string
    purchase_price: string
}

function CardEdit({ card, onUndo, onSave}: CardEditProps) {
    // Conts

    // Form RAM
    const [formState, setFormState] = useState<CardFormState>({
        name: card.name,
        set_code: card.set_code,
        set_number: card.set_number,
        condition: card.condition,
        foil_type: card.foil_type,
        stamp_type: card.stamp_type ?? "",
        language: card.language ?? "",
        acquired_date: card.acquired_date ?? "",
        purchase_price: card.purchase_price?.toString() ?? "",
    })

    // Form Display Controls
    const isSimpleFoil = formState.foil_type === "none" || formState.foil_type === "traditional"
    const [advancedFoil, setAdvancedFoil] = useState(!isSimpleFoil)

    // Enum Keys
    const conditionKeys = Object.keys(Enums.Condition) as Array<keyof typeof Enums.Condition>
    const foilKeys = Object.keys(Enums.FoilType) as Array<keyof typeof Enums.FoilType>
    const stampKeys = Object.keys(Enums.StampType) as Array<keyof typeof Enums.StampType>

    // Helper Funcs
    function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = event.target
        setFormState(prev => ({ ...prev, [name]: value }))
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const savedCard: Card = {
            ...card,                    // keep id, scryfall_id, name etc
            condition: formState.condition,
            foil_type: formState.foil_type,
            stamp_type: formState.stamp_type,
            language: formState.language,
            acquired_date: formState.acquired_date || null,
            purchase_price: formState.purchase_price ? parseFloat(formState.purchase_price) : null,
            set_code: formState.set_code,
            set_number: formState.set_number,
        }
        onSave(savedCard)
    }

    return (
        <div className="p-2">
            <form onSubmit={handleSubmit} className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 shadow-[0_2px_8px_rgba(120,53,15,0.12)]">
                <div className="mb-3 border-b border-amber-200 pb-3">
                    <p className="text-lg font-bold uppercase tracking-wide text-stone-800">Edit card</p>
                    <p className="text-sm text-stone-600">{formState.set_number}-{formState.set_code}</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-sm text-stone-700">
                        <tbody>
                            <tr className="border-b border-amber-200">
                                <th className="py-3 pr-6 text-left align-top font-semibold text-stone-600">Name</th>
                                <td className="py-3">
                                    <input
                                        name="name"
                                        type="text"
                                        value={formState.name}
                                        disabled
                                        className="w-full rounded border border-amber-200 bg-stone-100 px-3 py-2 text-sm text-stone-700 disabled:cursor-not-allowed disabled:opacity-70"
                                    />
                                </td>
                            </tr>
                            <tr className="border-b border-amber-200">
                                <th className="py-3 pr-6 text-left align-top font-semibold text-stone-600">Set Code</th>
                                <td className="py-3">
                                    <input
                                        name="set_code"
                                        type="text"
                                        value={formState.set_code}
                                        onChange={handleInputChange}
                                        className="w-full rounded border border-amber-200 bg-white px-3 py-2 text-sm text-stone-700"
                                    />
                                </td>
                            </tr>
                            <tr className="border-b border-amber-200">
                                <th className="py-3 pr-6 text-left align-top font-semibold text-stone-600">Set Number</th>
                                <td className="py-3">
                                    <input
                                        name="set_number"
                                        type="text"
                                        value={formState.set_number}
                                        onChange={handleInputChange}
                                        className="w-full rounded border border-amber-200 bg-white px-3 py-2 text-sm text-stone-700"
                                    />
                                </td>
                            </tr>
                            <tr className="border-b border-amber-200">
                                <th className="py-3 pr-6 text-left align-top font-semibold text-stone-600">Condition</th>
                                <td className="py-3">
                                    <select
                                        name="condition"
                                        value={formState.condition}
                                        onChange={e => setFormState(prev => ({...prev, condition: e.target.value}))}
                                        className="w-full rounded border border-amber-200 bg-white px-3 py-2 text-sm text-stone-700"
                                    >
                                        {conditionKeys.map((key) => (
                                            <option key={key} value={key}>
                                                {Enums.Condition[key] ?? key}
                                            </option>

                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr className="border-b border-amber-200">    
                                <th className="py-3 pr-6 text-left align-top font-semibold text-stone-600">Foil</th>
                                <td className="py-3">
                                    {!advancedFoil ? (
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={formState.foil_type == Enums.FoilType.traditional}
                                                onChange={e => setFormState(prev => ({
                                                    ...prev,
                                                    foil_type: e.target.checked ? Enums.FoilType.traditional : Enums.FoilType.none
                                                }))}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setAdvancedFoil(true)}
                                                className="text-xs text-orange-400 font-bold hover:text-stone-600 underline"
                                            >
                                                advanced
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            {/* full select here */}
                                            <select
                                                name="foil_type"
                                                value={formState.foil_type}
                                                onChange={handleInputChange}
                                                className="w-full rounded border border-amber-200 bg-white px-3 py-2 text-sm text-stone-700"
                                            >
                                            {foilKeys.map((key) => (
                                                <option key={key} value={key}>
                                                    {Enums.FoilType[key] ?? key}
                                                </option>
                                            ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => setAdvancedFoil(false)}
                                                className="text-xs text-orange-400 font-bold hover:text-stone-600 underline self-end"
                                            >
                                                simple
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                            <tr className="border-b border-amber-200">
                                <th className="py-3 pr-6 text-left align-top font-semibold text-stone-600">Stamp</th>
                                <td className="py-3">
                                    <select
                                        name="stamp_type"
                                        value={formState.stamp_type}
                                        onChange={e => setFormState(prev => ({...prev, stamp_type: e.target.value}))}
                                        className="w-full rounded border border-amber-200 bg-white px-3 py-2 text-sm text-stone-700"
                                    >
                                       {stampKeys.map((key) => (
                                        <option key={key} value={key}>
                                            {Enums.StampType[key] ?? key}
                                        </option>
                                       ))}
                                    </select>
                                </td>
                            </tr>
                            <tr className="border-b border-amber-200">
                                <th className="py-3 pr-6 text-left align-top font-semibold text-stone-600">Language</th>
                                <td className="py-3">
                                    <input
                                        name="language"
                                        type="text"
                                        value={formState.language}
                                        onChange={handleInputChange}
                                        className="w-full rounded border border-amber-200 bg-white px-3 py-2 text-sm text-stone-700"
                                    />
                                </td>
                            </tr>
                            <tr className="border-b border-amber-200">
                                <th className="py-3 pr-6 text-left align-top font-semibold text-stone-600">Acquired Date</th>
                                <td className="py-3">
                                    <input
                                        name="acquired_date"
                                        type="date"
                                        value={formState.acquired_date}
                                        onChange={handleInputChange}
                                        className="w-full rounded border border-amber-200 bg-white px-3 py-2 text-sm text-stone-700"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th className="py-3 pr-6 text-left align-top font-semibold text-stone-600">Purchase Price</th>
                                <td className="py-3">
                                    <input
                                        name="purchase_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formState.purchase_price}
                                        onChange={handleInputChange}
                                        className="w-full rounded border border-amber-200 bg-white px-3 py-2 text-sm text-stone-700"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex flex-wrap justify-between gap-2">
                    <button 
                        type="submit"
                        className="rounded bg-amber-600 px-4 py-2 text-white shadow-sm shadow-red-200 transition hover:bg-gray-700"
                    >
                        Save changes
                    </button>
                    <button onClick={() => onUndo()}
                    type="button"
                    className="rounded bg-orange-100 px-4 py-2 text-black shadow-sm shadow-red-200 transition hover:bg-amber-500">
                        Undo
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CardEdit