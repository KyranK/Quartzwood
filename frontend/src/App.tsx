import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import CollectionPage from './pages/CollectionPage.tsx'
import StoragePage from './pages/StoragePage.tsx'


function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/collection/:name" element={<CollectionPage />} />
      <Route path='/storage/:name' element={<StoragePage />} />
    </Routes>
  )
}

export default App


