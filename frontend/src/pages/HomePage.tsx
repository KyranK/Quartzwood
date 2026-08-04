import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import LoadingSpinner from '../components/misc/LoadingSpinner'
import CollectionAdd from '../components/misc/CollectionAdd'
import * as apiCollection from "../api/collection"
import Collection from '../interfaces/collection'
import Popup from '../components/popup/popup'
import DeleteConfirm from '../components/popup/deleteConfirm'
import { string } from 'prop-types'

export default function HomePage() {
  const [collections, setCollections] = useState<Collection[]>([]) // DB 
  const navigate = useNavigate() // Routes
  const [loading, setLoading] = useState(true) // Loading distraction
  const [editingCollectionId, setEditingCollectionId] = useState<number | null>(null)
  const [draftName, setDraftName] = useState("")
  const [savingName, setSavingName] = useState(false)

 const [showPopup, setShowPopup] = useState(false)
  const [selectedStorage, setSelectedStorage] = useState<number>(-1)

  const handleDeleteButton = (id: number) => {
    setSelectedStorage(id)
    setShowPopup(true)
  }

  const handlePopOffClick = () => {
    setShowPopup(false)
    setSelectedStorage(-1)
  }

  const handlePopDeleteConfirm = () => {
    handlePopOffClick()
    apiCollection.deleteCollectionById(selectedStorage)
    .then(res => {
      console.log("Delete Collection " + String(selectedStorage))
      refreshCollections()
    })
    
  }

  const refreshCollections = () => {
    apiCollection.allCollections()
    .then(res => {
        setCollections(res)
    })
  }

  const startEditingName = (collection: Collection) => {
    setDraftName(collection.name)
    setEditingCollectionId(collection.id)
  }

  const cancelEditingName = () => {
    setDraftName("")
    setEditingCollectionId(null)
  }

  const saveCollectionName = async (event?: FormEvent<HTMLFormElement>, collectionId?: number | null) => {
    event?.preventDefault()

    const trimmedName = draftName.trim()
    if (!collectionId || !trimmedName) {
      cancelEditingName()
      return
    }

    setSavingName(true)

    try {
      await apiCollection.updateCollection(collectionId, trimmedName)
      await refreshCollections()
      setDraftName(trimmedName)
    } catch (error) {
      console.error('Failed to update collection name:', error)
    } finally {
      setEditingCollectionId(null)
      setSavingName(false)
    }
  }

useEffect(() => {
    apiCollection.allCollections()
    .then(res => {
        console.log('data:', res)
        setCollections(res)
    })
    .finally(() => setLoading(false))
}, [])

if (loading) return <LoadingSpinner />

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold mb-6">Collections</h1>
        <div className="w-[20%] pr-[22%] pt-[1%]">
          <CollectionAdd onUpdate={refreshCollections } />
        </div>
        <Popup
                        showpopup={showPopup}
                        onClose={() => {handlePopOffClick()}}
                        context={<DeleteConfirm onDelete={handlePopDeleteConfirm}/>}
                />
      </div>
      <div className="grid grid-cols-1 gap-4 w-[30%]">
        {collections.map(c => (
          <div
            key={c.id}
            className="p-4 border rounded hover:bg-gray-100 relative"
          >
            <div onClick={() => navigate(`/collection/${c.id}`)} className="cursor-pointer">
              {editingCollectionId === c.id ? (
                <form
                  onSubmit={(event) => saveCollectionName(event, c.id)}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.preventDefault()
                      cancelEditingName()
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    autoFocus
                    className="rounded border border-stone-300 px-2 py-1 text-lg font-semibold"
                  />
                  <button type="submit" disabled={savingName} className="text-sm text-blue-600 hover:underline disabled:text-blue-300">
                    {savingName ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={cancelEditingName} className="text-sm text-stone-600 hover:underline">
                    Cancel
                  </button>
                </form>
              ) : (
                <div onClick={() => startEditingName(c)} className="cursor-pointer">
                  <h2 className="text-lg font-semibold">{c.name}</h2>
                  {c.description && <p className="text-gray-500">{c.description}</p>}
                </div>
              )}
            </div>

            <button
              className="absolute top-1 -right-6 inline-flex items-center justify-center 
              rounded-r-xl bg-red-600 text-white w-6 h-9 shadow-sm hover:bg-red-700 focus:outline-none 
              focus:ring-2 focus:ring-red-400 hover:-right-9 hover:w-9"
              aria-label={`Delete ${c.name}`}
              onClick={(e) => { e.stopPropagation(); handleDeleteButton(Number(c.id)) }}
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