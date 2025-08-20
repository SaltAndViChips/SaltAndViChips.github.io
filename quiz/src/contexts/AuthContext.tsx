import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface Host {
  id: string
  username: string
  fullName: string
}

interface AuthContextType {
  host: Host | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, fullName: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<Host | null>(null)
  const [loading, setLoading] = useState(false)

  // Load host from localStorage on mount
  useEffect(() => {
    const savedHost = localStorage.getItem('quiz-host')
    if (savedHost) {
      try {
        const hostData = JSON.parse(savedHost)
        setHost(hostData)
      } catch (error) {
        console.error('Error parsing saved host data:', error)
        localStorage.removeItem('quiz-host')
      }
    }
  }, [])

  const login = async (username: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch('https://bkkxqycigwahyoxtpolz.supabase.co/functions/v1/host-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJra3hxeWNpZ3dhaHlveHRwb2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTQxNzcsImV4cCI6MjA3MTIzMDE3N30.GpSt-ZVtBh2EMSE5_D86dkRaWqTo0ootjX8qylVe5e4',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJra3hxeWNpZ3dhaHlveHRwb2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTQxNzcsImV4cCI6MjA3MTIzMDE3N30.GpSt-ZVtBh2EMSE5_D86dkRaWqTo0ootjX8qylVe5e4'
        },
        body: JSON.stringify({
          action: 'login',
          username,
          password
        })
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        throw new Error(result.error?.message || 'Login failed')
      }

      const hostData = result.data.host
      setHost(hostData)
      localStorage.setItem('quiz-host', JSON.stringify(hostData))
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (username: string, password: string, fullName: string) => {
    setLoading(true)
    try {
      const response = await fetch('https://bkkxqycigwahyoxtpolz.supabase.co/functions/v1/host-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJra3hxeWNpZ3dhaHlveHRwb2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTQxNzcsImV4cCI6MjA3MTIzMDE3N30.GpSt-ZVtBh2EMSE5_D86dkRaWqTo0ootjX8qylVe5e4',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJra3hxeWNpZ3dhaHlveHRwb2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTQxNzcsImV4cCI6MjA3MTIzMDE3N30.GpSt-ZVtBh2EMSE5_D86dkRaWqTo0ootjX8qylVe5e4'
        },
        body: JSON.stringify({
          action: 'register',
          username,
          password,
          fullName
        })
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        throw new Error(result.error?.message || 'Registration failed')
      }

      const hostData = result.data.host
      setHost(hostData)
      localStorage.setItem('quiz-host', JSON.stringify(hostData))
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setHost(null)
    localStorage.removeItem('quiz-host')
  }

  return (
    <AuthContext.Provider value={{ host, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}