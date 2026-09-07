import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import EntityPage from './pages/EntityPage'
import GroupPage from './pages/GroupPage'
import BoxPage from './pages/BoxPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/entity/:id" element={<EntityPage />} />
      <Route path="/group/:id" element={<GroupPage />} />
      <Route path="/box/:id" element={<BoxPage />} />
    </Routes>
  )
}

export default App