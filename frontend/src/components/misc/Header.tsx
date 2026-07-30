//File: Header.tsx
//Component: Cross-site Banner
//Use: Cross-site Banner
import { useState } from 'react'
import { useEffect} from 'react'
import { useLocation, Link } from 'react-router-dom'
import * as apiStorage from '../../api/storage'
import * as apiCollection from '../../api/collection'

export default function Header() {
    const location = useLocation() // URL path
    const parts = location.pathname.split('/').filter(Boolean)
    const [storageInfo, setStorageInfo] = useState<{name: string, collection: string | null} | null>(null)
    const [collectionName, SetCollectionName] = useState("")

    useEffect(() => {
        if (parts[0] === 'storage') {
            apiStorage.storageRouteInfo(parts[1])
                .then(res => setStorageInfo(res))
        } else {
            setStorageInfo(null)
        }
        if(parts[0] === 'collection') {
            apiCollection.collectionById(Number(parts[1]))
                .then(res => SetCollectionName(res.name))
        }
    }, [location.pathname])
    
    return (
        <header className="bg-gray-800 text-white p-4 flex items-center gap-4">
        {/* fetch storage → check collection_id → if exists, fetch collection name */}
        {/* build breadcrumb from that data, not from URL parts */}
            {/* Entry Name */}
            <Link to="/" className="font-bold text-lg">Quartzwood</Link>
            <nav className="flex items-center gap-2 text-gray-300 text-sm">
                {/* Add collection link ONLY if is collection */}
                {parts[0] === 'collection' && (
                    <>
                    <span>›</span>
                    <Link to={`/collection/${parts[1]}`} className="hover:text-white">
                        {collectionName}
                    </Link>
                    </>
                )}

                {/* IF storage - generate Nav for both Storage and ?collection */}
                {parts[0] === 'storage' && storageInfo && (
                    <>
                    {storageInfo.collection && (
                        <>
                        <span>›</span>
                        <Link to={`/collection/${storageInfo.collection}`} className="hover:text-white">
                            {storageInfo.collection}
                        </Link>
                        </>
                    )}
                    <span>›</span>
                    <span className="text-white">{storageInfo.name}</span>
                    </>
                )}
            </nav>
        </header>
    )
}