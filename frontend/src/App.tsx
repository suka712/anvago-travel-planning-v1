import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Navbar } from './components/Navbar'
import OnboardingPage from './pages/OnboardingPage'
import ItinerariesPage from './pages/ItinerariesPage'
import ItineraryDetailPage from './pages/ItineraryDetailPage'
import TripPlanningPage from './pages/TripPlanningPage'
import TripTrackingPage from './pages/TripTrackingPage'
import MyTripsPage from './pages/MyTripsPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<OnboardingPage />} />
          <Route path="/itineraries" element={<ItinerariesPage />} />
          <Route path="/itinerary-detail" element={<ItineraryDetailPage />} />
          <Route path="/plan/:id" element={<TripPlanningPage />} />
          <Route path="/trip/:id" element={<TripTrackingPage />} />
          <Route path="/my-trips" element={<MyTripsPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

