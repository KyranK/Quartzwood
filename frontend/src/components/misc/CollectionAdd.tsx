//File: CollectionAdd.tsx
//Component: Widget
//Use: To add a new Collection(s)
//TODO: Connect collections to Users/Entiies

import { useState } from "react"
import { object } from "prop-types"
import * as apiCollection from "../../api/collection"

interface CollectionAddProps {
    onUpdate?: () => void
}

export default function CollectionAdd({onUpdate }: CollectionAddProps) {
    const [collectionName, setCollectionName] = useState("")
    const [collectionDesc, setCollectionDesc] = useState("")

    function onSubmit(e: any) {
        e?.preventDefault()
        if (!collectionName.trim()) return
        // TODO: call API to create the storage
        console.log("Create collection:", { name: collectionName, description: collectionDesc})
        const payload: object = {
            name: collectionName,
            description: collectionDesc
        }

        apiCollection.addCollection(payload)
        .then(() => {
            console.log("Collection: " + collectionName)
        })
        
        setCollectionName("")
        setCollectionDesc("")
        onUpdate?.()
    }

    return (        
    <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-4 shadow-sm absolute">

            <h3 className="text-sm font-semibold text-stone-700 mb-2">Add New collection</h3>

            <form onSubmit={onSubmit} className="flex flex-col gap-2" autoComplete="off">
                <label className="sr-only">Collection name</label>
                <input
                    className="rounded-lg border border-stone-200 px-3 py-2 text-sm placeholder:italic focus:outline-none focus:ring-2 focus:ring-amber-100"
                    placeholder="Collection name"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                />

                <label className="sr-only">Description</label>
                <textarea
                    className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100 resize-none h-20"
                    placeholder="Optional description"
                    value={collectionDesc}
                    onChange={(e) => setCollectionDesc(e.target.value)}
                />

                <div className="flex items-center justify-end">
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 shadow-sm"
                    >
                        Add
                    </button>
                </div>
            </form>
        </div>
    )
}