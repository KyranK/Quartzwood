//Imports
import { useState } from "react"
import Card from "../interfaces/card"
import client from "../api/client"
import * as Enums from "../interfaces/enums"
import { object } from "prop-types"

// Interface
interface CardAddProps {
    storage?: string
    onUpdate?: () => void
}

export default function CardAdd({ storage = "Unsorted", onUpdate }: CardAddProps){
    // Conts
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
    const [cId, setCId] = useState("")

    // Enum Keys
    const conditionKeys = Object.keys(Enums.Condition) as Array<keyof typeof Enums.Condition>
    const foilKeys = Object.keys(Enums.FoilType) as Array<keyof typeof Enums.FoilType>
    const stampKeys = Object.keys(Enums.StampType) as Array<keyof typeof Enums.StampType>

    // advanced fields with safe defaults
    const [condition, setCondition] = useState(Enums.Condition.near_mint as string)
    const [foilType, setFoilType] = useState(Enums.FoilType.none as string)
    const [stampType, setStampType] = useState(Enums.StampType.none as string)
    const [language, setLanguage] = useState("en")
    const [notes, setNotes] = useState("")
    const [acquiredDate, setAcquiredDate] = useState("")
    const [purchasePrice, setPurchasePrice] = useState("")
    const [quantity, setQuantity] = useState<number>(1)

    // Form Display Controlo conts
    const isSimpleFoil = foilType == Enums.FoilType.none || foilType == Enums.FoilType.traditional
    const [advancedFoil, setAdvancedFoil] = useState(!isSimpleFoil)


    // Internal functions
    function setFormDefualt(){
        // Helpful not to reset incase going through 2nd-hand vs new booster
        //setCondition(Enums.Condition.near_mint) 
        setFoilType(Enums.FoilType.none)
        setLanguage("en") // TODO: Enum Lang
        setNotes("")
        // Hepful to not reset acquiredDate -> ussally go throug recent cards @ once
        //setAcquiredDate("")
        setPurchasePrice("")
        setQuantity(1)
        setCId("")
    }

    function OnSubmit(event: any){
        if(event?.preventDefault) event.preventDefault()

        const raw = cId.trim()
        if(!raw){
            return
        }

        const parts = raw.split(/[-\s]/).filter(Boolean)
        if(parts.length < 2){
            alert('Invalid format. Use: <set_code>-<set_number> (e.g. iko-152)')
            return
        }
        const set_code = parts[0]
        const set_number = parts[1]

        const payload: any = {
            set_code,
            set_number,
            condition: condition || Enums.Condition.near_mint,
            storage_name: storage,
            foil_type: foilType || Enums.FoilType.none,
            stamp_type: stampType || Enums.StampType.none,
            language: language || 'en',
            notes: notes || undefined,
            quantity: quantity || 1,
        }

        if(acquiredDate) payload.acquired_date = acquiredDate
        if(purchasePrice) payload.purchase_price = parseFloat(purchasePrice)

        client.post('/add-cards', payload)
        .then(() => {
            console.log('Card Addeed: {' + {set_code} + "-" + {set_number} + "}")
            setShowAdvancedOptions(false)
            // optionally reset inputs
            // setCId('')
            setFormDefualt()
            onUpdate?.()
        })
        .catch(err => console.error(err))
    }


    return(
        <>

        <div className="mt-4 lg:mt-0 lg:absolute lg:right-0 lg:top-0 lg:w-[25rem]">
            <div className="rounded-2xl border border-amber-200 bg-white/90 p-4 shadow-sm shadow-amber-100 w-full">
                <form className="flex flex-col gap-3" onSubmit={OnSubmit} autoComplete="off">
                    <div className="flex-1 min-w-0">
                        <label htmlFor="c_id" className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                        Card Set Code / Number
                        </label>
                        <input
                            id="c_id"
                            name="c_id"
                            value={cId}
                            onChange={(e) => setCId(e.target.value)}
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
                                    <span className="font-semibold text-stone-600">Quantity</span>
                                    <input type="number" min={1} value={quantity} onChange={(e)=>setQuantity(Number(e.target.value))} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                                </label>

                                <label className="grid gap-1 text-sm text-stone-700">
                                    <span className="font-semibold text-stone-600">Condition</span>
                                    <select value={condition} onChange={(e)=>setCondition(e.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                                        {conditionKeys.map((key) => (
                                            <option key={key} value={key}>
                                                {Enums.Condition[key] ?? key}
                                            </option>

                                        ))}
                                 </select>
                                </label>

                                <label className="grid gap-1 text-sm text-stone-700">
                                    <span className="font-semibold text-stone-600">Foil</span>
                                    {!advancedFoil && 
                                    <div className="flex justify-between m-2">
                                        <input
                                            type="checkbox"
                                            className="display:block"
                                            checked={foilType == Enums.FoilType.traditional}
                                            onChange={e => setFoilType(
                                                e.target.checked ? Enums.FoilType.traditional : Enums.FoilType.none
                                            )}
                                        />  
                                        <button
                                            type="button"
                                            onClick={() => setAdvancedFoil(true)}
                                            className="display:block text-s text-orange-400 font-bold hover:text-stone-600 underline"
                                        >
                                            advanced
                                        </button> 
                                    </div>                                                   
                                    }
                                    {advancedFoil &&
                                    <>
                                        <select value={foilType} onChange={(e)=>setFoilType(e.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                                            {foilKeys.map((key) => (
                                                <option key={key} value={key}>
                                                    {Enums.FoilType[key] ?? key}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setAdvancedFoil(false)}
                                            className="text-s text-orange-400 font-bold hover:text-stone-600 underline"
                                        >
                                            simple
                                        </button> 
                                    </>
                                    }

                                </label>

                                <label className="grid gap-1 text-sm text-stone-700">
                                    <span className="font-semibold text-stone-600">Stamp</span>
                                    <select value={stampType} onChange={(e)=>setCondition(e.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                                       {stampKeys.map((key) => (
                                        <option key={key} value={key}>
                                            {Enums.StampType[key] ?? key}
                                        </option>
                                       ))}
                                    </select>
                                </label>

                                <label className="grid gap-1 text-sm text-stone-700">
                                    <span className="font-semibold text-stone-600">Language</span>
                                    <input value={language} onChange={(e)=>setLanguage(e.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                                </label>

                                <label className="grid gap-1 text-sm text-stone-700">
                                    <span className="font-semibold text-stone-600">Notes</span>
                                    <input value={notes} onChange={(e)=>setNotes(e.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                                </label>

                                <label className="grid gap-1 text-sm text-stone-700">
                                    <span className="font-semibold text-stone-600">Acquired Date</span>
                                    <input type="date" value={acquiredDate} onChange={(e)=>setAcquiredDate(e.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                                </label>

                                <label className="grid gap-1 text-sm text-stone-700">
                                    <span className="font-semibold text-stone-600">Purchase Price</span>
                                    <input type="number" step="0.01" min="0" value={purchasePrice} onChange={(e)=>setPurchasePrice(e.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
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