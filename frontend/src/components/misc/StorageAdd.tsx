//File: StorageAdd.tsx
//Component: Widget
//Use: To add a new storage to a Collection

import { useState } from "react"
import { object } from "prop-types"
import * as apiStorage from "../../api/storage"

interface StorageAddProps {
    collection_id?: string
    onUpdate?: () => void
}

export default function StorageAdd({ collection_id, onUpdate }: StorageAddProps) {
    const [storageName, setStorageName] = useState("")
    const [storageDesc, setStorageDesc] = useState("")

    function onSubmit(e: any) {
        e?.preventDefault()
        if (!storageName.trim()) return
        // TODO: call API to create the storage
        console.log("Create storage:", { name: storageName, description: storageDesc, collection_id })
        const payload: object = {
            name: storageName,
            collection_id: String(collection_id),
            description: storageDesc
        }

        apiStorage.addStorage(payload)
        .then(() => {
            console.log("Storage: " + storageName)
            onUpdate?.()
        })
        
        setStorageName("")
        setStorageDesc("")
        
    }

    return (        
    <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-4 shadow-sm absolute">

            <h3 className="text-sm font-semibold text-stone-700 mb-2">Add New Storage</h3>

            <form onSubmit={onSubmit} className="flex flex-col gap-2" autoComplete="off">
                <label className="sr-only">Storage name</label>
                <input
                    className="rounded-lg border border-stone-200 px-3 py-2 text-sm placeholder:italic focus:outline-none focus:ring-2 focus:ring-amber-100"
                    placeholder="Storage name"
                    value={storageName}
                    onChange={(e) => setStorageName(e.target.value)}
                />

                <label className="sr-only">Description</label>
                <textarea
                    className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100 resize-none h-20"
                    placeholder="Optional description"
                    value={storageDesc}
                    onChange={(e) => setStorageDesc(e.target.value)}
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