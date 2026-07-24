import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import CollectionPage from './pages/CollectionPage.tsx'
import StoragePage from './pages/StoragePage.tsx'
import Header from './components/misc/Header.tsx'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/collection/:name" element={<CollectionPage />} />
        <Route path="/storage/:storage_id" element={<StoragePage />} />
      </Routes>
    </>
  )
}

export default App


