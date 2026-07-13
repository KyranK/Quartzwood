import { useEffect, useState } from 'react'

interface EditButtonProps {
    onConfirm: () => void    // function passed in from parent
    OnReset: () => void      // function passed in from parent
    label?: string           // optional, defaults to "Delete"
}

export default function EditButton({ onConfirm, OnReset, label = "Edit" }: EditButtonProps) {
    const [editmode, set_editmode] = useState(false)

    return (
        <>
            {!editmode ?
                <button className="rounded bg-blue-600 px-4 py-2 text-white shadow-sm shadow-red-200 transition hover:bg-gray-700" onClick={() => set_editmode(true)}>{label}</button>
                :
                <div className="flex gap-1 ">
                    <button className="rounded bg-gray-600 px-2 py-1 text-white shadow-sm shadow-red-200 transition hover:bg-blue-700" onClick={() => OnReset()}>{"Revert"}</button>
                    <button className="rounded bg-gray-600 px-2 py-1 text-white shadow-sm shadow-red-200 transition hover:bg-blue-700" onClick={() => {onConfirm(); set_editmode(false)} }>{"Submit"}</button>
                </div>
            }
        </>
    )
}