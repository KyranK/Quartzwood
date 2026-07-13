import { useEffect, useState } from 'react'

interface EditButtonProps {
    onConfirm: () => void    // function passed in from parent
    label?: string           // optional, defaults to "Delete"
}

export default function EditButton({ onConfirm, label = "Edit" }: EditButtonProps) {
    const [editmode, set_editmode] = useState(false)

    return (
        <>
            {!editmode ?
                <button className="rounded bg-blue-600 px-4 py-2 text-white shadow-sm shadow-red-200 transition hover:bg-gray-700" onClick={() => {set_editmode(true); onConfirm()}}>{label}</button>
                :
                <button className="rounded bg-gray-600 px-4 py-2 text-white shadow-sm shadow-red-200 transition hover:bg-blue-700" onClick={() => {set_editmode(false); onConfirm()}}>{"Done"}</button>
            }
        </>
    )
}