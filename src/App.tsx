import { Routes, Route, Navigate } from 'react-router-dom'
import FormPage from './pages/FormPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<FormPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App 