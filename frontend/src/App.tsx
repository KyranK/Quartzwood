import { Routes, Route } from 'react-router-dom'
import EntityPage from './pages/EntityPage'
import GroupPage from './pages/GroupPage'
import BoxPage from './pages/BoxPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<EntityPage />} />
      <Route path="/entity/:id" element={<GroupPage />} />
      <Route path="/group/:id" element={<BoxPage />} />
      <Route path="/box/:id" element={<BoxPage />} />
    </Routes>
  )
}

export default App