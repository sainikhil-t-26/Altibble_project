import React, { useState, useEffect, createContext, useContext } from 'react'

interface User {
  id: string
  name: string
  email: string
  company?: string
  role: 'USER' | 'ADMIN' | 'COMPANY'
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  company?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo mode - set to true to work without backend
const DEMO_MODE = true

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token && !DEMO_MODE) {
        // Real API call would go here
        // const response = await api.get('/auth/profile')
        // if (response.success && response.data?.user) {
        //   setUser(response.data.user)
        // }
      } else if (token && DEMO_MODE) {
        // Demo mode - restore user from localStorage
        const demoUser = localStorage.getItem('demoUser')
        if (demoUser) {
          setUser(JSON.parse(demoUser))
        }
      }
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('demoUser')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    if (DEMO_MODE) {
      // Demo mode - simulate login
      const demoUser: User = {
        id: '1',
        name: 'Demo User',
        email: email,
        role: 'USER',
        createdAt: new Date().toISOString()
      }
      localStorage.setItem('token', 'demo-token')
      localStorage.setItem('demoUser', JSON.stringify(demoUser))
      setUser(demoUser)
      return
    }

    // Real API call would go here
    // const response = await api.post('/auth/login', { email, password })
    // if (response.success && response.data) {
    //   const { token, user } = response.data
    //   localStorage.setItem('token', token)
    //   setUser(user)
    // } else {
    //   throw new Error(response.message || 'Login failed')
    // }
  }

  const register = async (userData: RegisterData) => {
    if (DEMO_MODE) {
      // Demo mode - simulate registration
      const demoUser: User = {
        id: '1',
        name: userData.name,
        email: userData.email,
        company: userData.company,
        role: 'USER',
        createdAt: new Date().toISOString()
      }
      localStorage.setItem('token', 'demo-token')
      localStorage.setItem('demoUser', JSON.stringify(demoUser))
      setUser(demoUser)
      return
    }

    // Real API call would go here
    // const response = await api.post('/auth/register', userData)
    // if (response.success && response.data) {
    //   const { token, user } = response.data
    //   localStorage.setItem('token', token)
    //   setUser(user)
    // } else {
    //   throw new Error(response.message || 'Registration failed')
    // }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('demoUser')
    setUser(null)
  }

  const updateProfile = async (data: Partial<User>) => {
    if (DEMO_MODE) {
      // Demo mode - simulate profile update
      if (user) {
        const updatedUser = { ...user, ...data }
        localStorage.setItem('demoUser', JSON.stringify(updatedUser))
        setUser(updatedUser)
      }
      return
    }

    // Real API call would go here
    // const response = await api.put('/auth/profile', data)
    // if (response.success && response.data?.user) {
    //   setUser(response.data.user)
    // } else {
    //   throw new Error(response.message || 'Profile update failed')
    // }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile
    }}>
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