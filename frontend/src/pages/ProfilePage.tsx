import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth.tsx'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    company: user?.company || ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile(formData)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Profile update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-field bg-gray-50 cursor-not-allowed"
                    placeholder="Email address"
                  />
                  <p className="form-help">Email address cannot be changed</p>
                </div>
              </div>

              <div>
                <label htmlFor="company" className="form-label">
                  Company
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label className="form-label">
                  Account Type
                </label>
                <div className="mt-1">
                  <span className="badge badge-primary">
                    {user?.role === 'ADMIN' ? 'Administrator' : 
                     user?.role === 'COMPANY' ? 'Company' : 'User'}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="loading-spinner mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="space-y-6">
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <span className="text-primary-700 font-bold text-2xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
              {user?.company && (
                <p className="text-sm text-gray-500 mt-1">{user.company}</p>
              )}
            </div>
          </div>

          {/* Account Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Member since</span>
                <span className="text-sm font-medium text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Account type</span>
                <span className="text-sm font-medium text-gray-900">
                  {user?.role === 'ADMIN' ? 'Administrator' : 
                   user?.role === 'COMPANY' ? 'Company' : 'User'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Products registered</span>
                <span className="text-sm font-medium text-gray-900">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reports generated</span>
                <span className="text-sm font-medium text-gray-900">0</span>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Password</span>
                <span className="text-sm text-gray-900">••••••••</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Two-factor auth</span>
                <span className="text-sm text-gray-500">Not enabled</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="text-sm text-primary-600 hover:text-primary-500">
                Change password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 