import { Routes, Route } from 'react-router-dom'
import EntityPage from './pages/EntityPage.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<EntityPage />} />
    </Routes>
  )
}

export default App