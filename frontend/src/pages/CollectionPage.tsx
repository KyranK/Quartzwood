import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'
import LoadingSpinner from '../components/misc/LoadingSpinner'
import StorageAdd from '../components/misc/StorageAdd'
import Collection from '../interfaces/collection'

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

  useEffect(() => {
    client.get<Collection>(`/collection/${collection_id}`)
    .then(res => setName(res.data.name))

    client.get<Storage[]>(`/storage/by-collection/${name}`)
    .then(res => setStorages(res.data))
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
          <StorageAdd />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 ">

        {storages.map(s => (
          <div
            key={s.id}
            onClick={() => navigate(`/storage/${s.id}`)}
            className="p-4 border rounded cursor-pointer hover:bg-gray-100 w-[25%]"
          >
            <h2 className="text-lg font-semibold">{s.name}</h2>
          </div>
        ))}
      </div>
    </div>
  )
}