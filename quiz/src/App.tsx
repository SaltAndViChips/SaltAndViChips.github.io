import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { QuizProvider } from '@/contexts/QuizContext'
import HostAuth from '@/components/HostAuth'
import HostDashboard from '@/components/HostDashboard'
import PlayerInterface from '@/components/PlayerInterface'
import LandingPage from '@/components/LandingPage'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <AuthProvider>
      <QuizProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/host/auth" element={<HostAuth />} />
              <Route path="/host/dashboard" element={<HostDashboard />} />
              <Route path="/player" element={<PlayerInterface />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1e1b4b',
                  color: '#fff',
                  border: '1px solid #3730a3'
                }
              }}
            />
          </div>
        </Router>
      </QuizProvider>
    </AuthProvider>
  )
}

export default App