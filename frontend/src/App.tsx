import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">Anvago</h1>
              <p className="text-xl text-gray-600">Travel Planning Made Easy</p>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App

