import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.tsx'
import { 
  PlusIcon, 
  DocumentTextIcon, 
  UserIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user } = useAuth()

  const quickActions = [
    {
      name: 'Add New Product',
      description: 'Register a new product for transparency assessment',
      href: '/products/new',
      icon: PlusIcon,
      color: 'bg-primary-500'
    },
    {
      name: 'View Reports',
      description: 'Access your product transparency reports',
      href: '/reports',
      icon: DocumentTextIcon,
      color: 'bg-success-500'
    },
    {
      name: 'Update Profile',
      description: 'Manage your account information',
      href: '/profile',
      icon: UserIcon,
      color: 'bg-secondary-500'
    }
  ]

  const stats = [
    {
      name: 'Total Products',
      value: '0',
      description: 'Products registered',
      icon: DocumentTextIcon,
      color: 'text-primary-600'
    },
    {
      name: 'Reports Generated',
      value: '0',
      description: 'Transparency reports',
      icon: ChartBarIcon,
      color: 'text-success-600'
    },
    {
      name: 'Recent Activity',
      value: '0',
      description: 'Last 30 days',
      icon: ClockIcon,
      color: 'text-warning-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your product transparency assessments and reports
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-medium text-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="group relative rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${action.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                  <action.icon className={`h-6 w-6 ${action.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    {action.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by adding your first product for transparency assessment.
          </p>
          <div className="mt-6">
            <Link
              to="/products/new"
              className="btn-primary inline-flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Product
            </Link>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white text-xs font-medium">1</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Register a Product</h3>
              <p className="text-sm text-gray-600">
                Add your first product with basic information like name, category, and manufacturer.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white text-xs font-medium">2</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Answer Transparency Questions</h3>
              <p className="text-sm text-gray-600">
                Complete the AI-generated transparency assessment with detailed answers.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white text-xs font-medium">3</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Generate Report</h3>
              <p className="text-sm text-gray-600">
                Get a comprehensive transparency report with scores and recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 