import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import LoadingSpinner from '../components/misc/LoadingSpinner'
import CollectionAdd from '../components/misc/CollectionAdd'

interface Collection {
  id: number
  name: string
  description: string | null
  location: string | null
  owner_id: number | null
}

export default function HomePage() {
  const [collections, setCollections] = useState<Collection[]>([]) // DB 
  const navigate = useNavigate() // Routes
  const [loading, setLoading] = useState(true) // Loading distraction

useEffect(() => {
    client.get<Collection[]>('/collections/')
    .then(res => {
        console.log('data:', res.data)
        setCollections(res.data)
    })
    .finally(() => setLoading(false))
}, [])

if (loading) return <LoadingSpinner />

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold mb-6">Collections</h1>
        <div className="w-[20%] pr-[22%] pt-[1%]">
          <CollectionAdd />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 w-[30%]">
        {collections.map(c => (
          <div
            key={c.id}
            onClick={() => navigate(`/collection/${c.id}`)}
            className="p-4 border rounded cursor-pointer hover:bg-gray-100"
          >
            <h2 className="text-lg font-semibold">{c.name}</h2>
            {c.description && <p className="text-gray-500">{c.description}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}