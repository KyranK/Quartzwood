import { useEffect, useState } from 'react'
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
            onClick={() => navigate(`/collection/${c.id}`)}
            className="p-4 border rounded cursor-pointer hover:bg-gray-100 relative"
          >
            <div>
              <h2 className="text-lg font-semibold">{c.name}</h2>
              {c.description && <p className="text-gray-500">{c.description}</p>}
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