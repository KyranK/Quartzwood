//Imports
import { useState } from "react"
import Card from "../interfaces/card"

// Interface
interface CardAddProps {
    storage?: string
    onUpdate?: () => void
}

export default function CardAdd({ storage = "Unsorted", onUpdate }: CardAddProps){
    // Conts
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

    // Internal functions
    function OnSubmit(e?: any){
        if(e?.preventDefault) e.preventDefault()
        const c_id = (document.getElementById('c_id') as HTMLInputElement)?.value || ''
        onUpdate?.()
        console.log(`Request to add card: ${c_id} to ${storage}`)
    }


    return(
        <>

        <div className="mt-4 lg:mt-0 lg:absolute lg:right-0 lg:top-0 lg:w-[25rem]">
            <div className="rounded-2xl border border-amber-200 bg-white/90 p-4 shadow-sm shadow-amber-100 w-full">
                <form className="flex flex-col gap-3" onSubmit={OnSubmit}>
                    <div className="flex-1 min-w-0">
                        <label htmlFor="c_id" className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                        Card Set Code / Number
                        </label>
                        <input
                            id="c_id"
                            name="c_id"
                            placeholder="iko-201"
                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => setShowAdvancedOptions(prev => !prev)}
                            className="inline-flex items-center justify-center  bg-white px-4 py-2 text-sm font-bold text-amber-700"
                        >
                        {showAdvancedOptions ? 'Hide advanced ︾' : 'Advanced options 》'}
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
        </>
    )
}