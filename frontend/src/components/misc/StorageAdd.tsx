//File: StorageAdd.tsx
//Component: Widget
//Use: To add a new storage to a Collection

import { useState } from "react"
import Storage from "../../interfaces/storage"
import * as apiCards from"../../api/cards"
import * as Enums from "../../interfaces/enums"
import { object } from "prop-types"


interface storageAddProps {
    collection_id?: string
    onUpdate?: () => void
}

export default function StorageAdd({collection_id, onUpdate}: storageAddProps) {
    const [storage_name, setName] = useState("")
    const [storage_desc, setDesc] = useState("")

    function OnSubmit(event: any){
        if(event?.preventDefault) event.preventDefault()
    }


    return(
        <div>
            <h1 className="font-bold text-xl">
             Add New Storage </h1>
            <form onSubmit={OnSubmit} autoComplete="off">
                <input type="text" placeholder="Storagebox Name">
        
                </input>

            </form>

        </div>
    )
}