import { useEffect, useState } from 'react'
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
  const [storages, setStorages] = useState<Storage[]>([])
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true) // Loading distraction

  const [showPopup, setShowPopup] = useState(false)
  const [selectedStorage, setSelectedStorage] = useState<number>(-1)

  const refreshStorages = () => {
    apiStorage.storagesByCollectionID(String(collection_id))
    .then(res => {
      setStorages(res)
      setSelectedStorage(-1)
    })
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
    console.log('Request to delete Storage with ID of: ' + String(selectedStorage))
    handlePopOffClick()
  }



  useEffect(() => {
    apiCollection.collectionById(Number(collection_id))
    .then(res => setName(res.name))

    apiStorage.storagesByCollectionID(String(collection_id))
    .then(res => setStorages(res))
    .finally(() => setLoading(false))
  }, [name])


if (loading) return <LoadingSpinner />
  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => navigate('/')} className="mb-2 text-blue-500 hover:underline">
            ← Back
          </button>
          <h1 className="text-2xl font-bold">{name}</h1>
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