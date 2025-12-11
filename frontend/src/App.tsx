import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import OnboardingPage from './pages/OnboardingPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<OnboardingPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

