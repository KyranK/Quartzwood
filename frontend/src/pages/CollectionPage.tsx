import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/misc/LoadingSpinner'
import StorageAdd from '../components/misc/StorageAdd'
import * as apiCollection from '../api/collection'
import * as apiStorage from '../api/storage'
import Popup from '../components/popup/popup'
import DeleteConfirm from '../components/popup/deleteConfirm' 

interface Storage {
  id: number
  name: string
  description: string | null
  collection_id: number | null
}

export default function CollectionPage() {
  const { collection_id } = useParams<{ collection_id: string }>()
  const [name, setName] = useState("")
  const [draftName, setDraftName] = useState("")
  const [draftDescription, setDraftDescription] = useState("")
  const [editName, setEditName] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [storages, setStorages] = useState<Storage[]>([])
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true) // Loading distraction
  const [collectionDescr, setCollectionDescr] = useState("")

  const [showPopup, setShowPopup] = useState(false)
  const [selectedStorage, setSelectedStorage] = useState<number>(-1)

  const refreshStorages = () => {
    apiStorage.storagesByCollectionID(String(collection_id))
    .then(res => {
      setStorages(res)
      setSelectedStorage(-1)
    })
  }

  const startEditingName = () => {
    setDraftName(name)
    setDraftDescription(collectionDescr)
    setEditName(true)
  }

  const cancelEditingName = () => {
    setDraftName(name)
    setDraftDescription(collectionDescr)
    setEditName(false)
  }

  const saveCollectionName = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()

    const trimmedName = draftName.trim()
    const trimmedDescription = draftDescription.trim()
    const hasNameChanged = trimmedName !== name
    const hasDescriptionChanged = trimmedDescription !== collectionDescr

    if (!collection_id || (!hasNameChanged && !hasDescriptionChanged)) {
      cancelEditingName()
      return
    }

    setSavingName(true)

    try {
      const updated = await apiCollection.updateCollection(Number(collection_id), trimmedName, trimmedDescription)
      setName(updated.name)
      setDraftName(updated.name)
      setCollectionDescr(updated.description ?? "")
      setDraftDescription(updated.description ?? "")
    } catch (error) {
      console.error('Failed to update collection:', error)
      setDraftName(name)
      setDraftDescription(collectionDescr)
    } finally {
      setEditName(false)
      setSavingName(false)
    }
  }

  const handleDeleteButton = (id: number) => {
    setSelectedStorage(id)
    setShowPopup(true)
  }

  const handlePopOffClick = () => {
    setShowPopup(false)
    setSelectedStorage(-1)
  }

  const handlePopDeleteConfirm = () => {
    apiStorage.deleteStorageById(selectedStorage)
    .then(res => {
      console.log("Storage: " + String(sessionStorage) + " was deleted")
      refreshStorages()
    })
    handlePopOffClick()
    
  }



  useEffect(() => {
    apiCollection.collectionById(Number(collection_id))
    .then(res => {
      setName(res.name)
      setDraftName(res.name)
      setCollectionDescr(res.description ?? "")
      setDraftDescription(res.description ?? "")
    })

    apiStorage.storagesByCollectionID(String(collection_id))
    .then(res => setStorages(res))
    .finally(() => setLoading(false))

    apiCollection.collectionById(Number(collection_id))
    .then(res =>
      {if(res.description){
        setCollectionDescr(String(res.description))
      }else{
        setCollectionDescr("")
      }
      }
    )
  }, [collection_id])


if (loading) return <LoadingSpinner />
  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => navigate('/')} className="mb-2 text-blue-500 hover:underline">
            ← Back
          </button>
          {editName ? (
            <form
              onSubmit={(event) => saveCollectionName(event)}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  cancelEditingName()
                }
              }}
              className="flex flex-col gap-3 rounded-lg border border-stone-300 bg-white p-3 shadow-sm"
            >
              <input
                type="text"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                autoFocus
                className="rounded border border-stone-300 px-2 py-1 text-2xl font-bold"
                placeholder="Collection name"
              />
              <textarea
                value={draftDescription}
                onChange={(event) => setDraftDescription(event.target.value)}
                className="min-h-[90px] rounded border border-stone-300 px-2 py-1 text-sm"
                placeholder="Collection description"
              />
              <div className="flex items-center gap-2">
                <button type="submit" disabled={savingName} className="text-sm text-blue-600 hover:underline disabled:text-blue-300">
                  {savingName ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={cancelEditingName} className="text-sm text-stone-600 hover:underline">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div onClick={startEditingName} className="cursor-pointer">
                <h1 className="text-2xl font-bold">{name}</h1>
              </div>
              {collectionDescr &&
                <>
                  <hr />
                  <p className='p-2 pl-3'>
                    {collectionDescr}
                  </p>
                  <hr />
                </>
              }
            </div>
          )}
        </div>
        <div className="w-[20%] pr-[22%] pt-[1%]">
          <StorageAdd collection_id={collection_id} onUpdate={refreshStorages}/>
        </div>
      </div>

      <Popup
                showpopup={showPopup}
                onClose={() => {handlePopOffClick()}}
                context={<DeleteConfirm onDelete={handlePopDeleteConfirm}/>}
        />

      <div className="grid grid-cols-1 gap-4 p-4 w-[25%]">

        {storages.map(s => (
          <div key={s.id} className="relative">
            <div
              onClick={() => navigate(`/storage/${s.id}`)}
              className="p-4 border rounded cursor-pointer hover:bg-gray-100"
            >
              <h2 className="text-lg font-semibold">{s.name}</h2>
            </div>

            <button
              className="absolute top-1 -right-6 inline-flex items-center justify-center 
              rounded-r-xl bg-red-600 text-white w-6 h-9 shadow-sm hover:bg-red-700 focus:outline-none 
              focus:ring-2 focus:ring-red-400 hover:-right-9 hover:w-9"
              aria-label={`Delete ${s.name}`}
              onClick={(e) => { e.stopPropagation(); handleDeleteButton(s.id) }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-4 h-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}