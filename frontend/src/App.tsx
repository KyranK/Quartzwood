import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import CollectionPage from './pages/CollectionPage.tsx'


function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/collection/:name" element={<CollectionPage />} />
    </Routes>
  )
}

export default App


