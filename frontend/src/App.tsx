import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.tsx'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProductFormPage from './pages/ProductFormPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ReportsPage from './pages/ReportsPage'
import ProfilePage from './pages/ProfilePage'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        user ? (
          <Layout>
            <DashboardPage />
          </Layout>
        ) : (
          <Navigate to="/login" />
        )
      } />
      
      <Route path="/products/new" element={
        user ? (
          <Layout>
            <ProductFormPage />
          </Layout>
        ) : (
          <Navigate to="/login" />
        )
      } />
      
      <Route path="/products/:id" element={
        user ? (
          <Layout>
            <ProductDetailPage />
          </Layout>
        ) : (
          <Navigate to="/login" />
        )
      } />
      
      <Route path="/products/:id/edit" element={
        user ? (
          <Layout>
            <ProductFormPage />
          </Layout>
        ) : (
          <Navigate to="/login" />
        )
      } />
      
      <Route path="/reports" element={
        user ? (
          <Layout>
            <ReportsPage />
          </Layout>
        ) : (
          <Navigate to="/login" />
        )
      } />
      
      <Route path="/profile" element={
        user ? (
          <Layout>
            <ProfilePage />
          </Layout>
        ) : (
          <Navigate to="/login" />
        )
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App 