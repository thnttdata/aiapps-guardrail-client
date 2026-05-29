import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AdminConsole from './pages/AdminConsole'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminConsole />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  )
}

export default App

