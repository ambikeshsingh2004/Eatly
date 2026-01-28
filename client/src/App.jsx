import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import GroceryPlanner from './pages/GroceryPlanner'
import IngredientScanner from './pages/IngredientScanner'
import RecipeFinder from './pages/RecipeFinder'
import Streaks from './pages/Streaks'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    )
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function App() {
  return (
    <div className="app">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute><Signup /></PublicRoute>
        } />

        {/* Protected Routes */}
        <Route path="/onboarding" element={
          <ProtectedRoute><Onboarding /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/grocery-planner" element={
          <ProtectedRoute><GroceryPlanner /></ProtectedRoute>
        } />
        <Route path="/ingredient-scanner" element={
          <ProtectedRoute><IngredientScanner /></ProtectedRoute>
        } />
        <Route path="/recipe-finder" element={
          <ProtectedRoute><RecipeFinder /></ProtectedRoute>
        } />
        <Route path="/streaks" element={
          <ProtectedRoute><Streaks /></ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
