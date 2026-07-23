import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'

interface Storage {
  id: number
  name: string
  description: string | null
  collection_id: number | null
}

export default function CollectionPage() {
  const { name } = useParams<{ name: string }>()
  const [storages, setStorages] = useState<Storage[]>([])
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true) // Loading distraction

  useEffect(() => {
    client.get<Storage[]>(`/storage/by-collection/${name}`)
    .then(res => setStorages(res.data))
    .finally(() => setLoading(false))
  }, [name])


if (loading) return <LoadingSpinner />
  return (
    <div className="p-8">
      <button onClick={() => navigate('/')} className="mb-4 text-blue-500 hover:underline">
        ← Back
      </button>
      <h1 className="text-2xl font-bold mb-6">{name}</h1>
      <div className="grid grid-cols-1 gap-4">
        {storages.map(s => (
          <div
            key={s.id}
            onClick={() => navigate(`/storage/${s.id}`)}
            className="p-4 border rounded cursor-pointer hover:bg-gray-100"
          >
            <h2 className="text-lg font-semibold">{s.name}</h2>
          </div>
        ))}
      </div>
    </div>
  )
}