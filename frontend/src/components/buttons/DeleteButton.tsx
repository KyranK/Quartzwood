import { useEffect, useState } from 'react'

interface DeleteButtonProps {
    onConfirm: () => void    // function passed in from parent
    label?: string           // optional, defaults to "Delete"
}

export default function DeleteButton({ onConfirm, label = "Delete" }: DeleteButtonProps) {
    const [confirming, setConfirming] = useState(false)

    return (
        <>
            {!confirming
                ? <button className="rounded bg-red-600 px-4 py-2 text-white shadow-sm shadow-red-200 transition hover:bg-red-700" onClick={() => setConfirming(true)}>{label}</button>
                : <div className="flex w-full max-w-xs flex-col gap-2">
                    <div>Are you sure?</div>
                    <div className="flex gap-2">
                        <button className="rounded bg-red-600 px-3 py-1 text-white" onClick={() => { onConfirm(); setConfirming(false) }}>Yes</button>
                        <button className="rounded bg-slate-200 px-3 py-1" onClick={() => setConfirming(false)}>No</button>
                    </div>
                </div>
            }
        </>
    )
}