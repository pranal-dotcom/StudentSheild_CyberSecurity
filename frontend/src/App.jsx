import { useState, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import ScanHistory from './components/ScanHistory'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (userToken) => {
    localStorage.setItem('token', userToken)
    setToken(userToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  const LoadingFallback = () => (
    <div className="card">
      <div className="icon-container">
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#3b82f6', animation: 'pulse 2s infinite' }}></div>
      </div>
      <h1>Loading StudentShield</h1>
      <p>Please wait while we prepare your security dashboard...</p>
    </div>
  )

  if (isLoading) {
    return <LoadingFallback />
  }

  return (
    <Router>
      <div className="app-container">
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route 
                path="/" 
                element={<Login onLogin={handleLogin} />} 
              />
              <Route 
                path="/login" 
                element={token ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
              />
              <Route 
                path="/register" 
                element={token ? <Navigate to="/dashboard" /> : <Register />} 
              />
              <Route 
                path="/dashboard" 
                element={token ? <Dashboard token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/history" 
                element={token ? <ScanHistory token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} 
              />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </Router>
  )
}

export default App
