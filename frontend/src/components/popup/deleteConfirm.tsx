//File: deleteConfirm.tsx
//Component: popup-insert
//Use: 

interface DeleteConfirmProps {
    onDelete: () => void
}


export default function DeleteConfirm({onDelete} : DeleteConfirmProps){
    function handleDelete(){
        onDelete?.()
    }


    return(
        <>
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-slate-900/90 p-6 text-center shadow-lg ring-1 ring-slate-700">
                <h1 className="text-xl font-semibold text-white">Confirm delete</h1>
                <p className="max-w-sm text-sm text-slate-300">
                    This action cannot be undone. Are you sure you want to delete this item?
                </p>
                <button onClick={handleDelete}
                className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2">
                    Delete
                </button>
            </div>
        </>
    )
}