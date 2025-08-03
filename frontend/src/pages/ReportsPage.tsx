import React, { useState } from 'react'
import { 
  DocumentArrowDownIcon,
  EyeIcon,
  ShareIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface Report {
  id: string
  productName: string
  category: string
  manufacturer: string
  createdAt: string
  transparencyScore: number
  status: 'completed' | 'in_progress' | 'pending'
  categories: {
    name: string
    score: number
    maxScore: number
    description: string
  }[]
  recommendations: {
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    impact: string
  }[]
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)

  // Mock data - in real app this would come from API
  const reports: Report[] = [
    {
      id: '1',
      productName: 'Organic Green Tea',
      category: 'Food & Beverages',
      manufacturer: 'EcoLife Foods',
      createdAt: '2024-01-15',
      transparencyScore: 87,
      status: 'completed',
      categories: [
        {
          name: 'Ingredients Transparency',
          score: 95,
          maxScore: 100,
          description: 'Complete ingredient list with sourcing information'
        },
        {
          name: 'Manufacturing Process',
          score: 82,
          maxScore: 100,
          description: 'Good manufacturing practices with room for improvement'
        },
        {
          name: 'Environmental Impact',
          score: 78,
          maxScore: 100,
          description: 'Sustainable practices implemented'
        },
        {
          name: 'Social Responsibility',
          score: 91,
          maxScore: 100,
          description: 'Excellent fair trade and ethical practices'
        }
      ],
      recommendations: [
        {
          priority: 'medium',
          title: 'Improve Manufacturing Transparency',
          description: 'Provide more detailed information about manufacturing facilities and processes',
          impact: 'Could increase score by 8-12 points'
        },
        {
          priority: 'low',
          title: 'Enhance Environmental Reporting',
          description: 'Add carbon footprint data and sustainability certifications',
          impact: 'Could increase score by 3-5 points'
        }
      ]
    },
    {
      id: '2',
      productName: 'Natural Face Cream',
      category: 'Cosmetics & Beauty',
      manufacturer: 'PureBeauty Co.',
      createdAt: '2024-01-10',
      transparencyScore: 92,
      status: 'completed',
      categories: [
        {
          name: 'Ingredients Transparency',
          score: 98,
          maxScore: 100,
          description: 'Excellent ingredient transparency with full disclosure'
        },
        {
          name: 'Manufacturing Process',
          score: 88,
          maxScore: 100,
          description: 'High-quality manufacturing with good practices'
        },
        {
          name: 'Environmental Impact',
          score: 85,
          maxScore: 100,
          description: 'Strong environmental commitment'
        },
        {
          name: 'Social Responsibility',
          score: 97,
          maxScore: 100,
          description: 'Outstanding social responsibility practices'
        }
      ],
      recommendations: [
        {
          priority: 'low',
          title: 'Minor Process Improvements',
          description: 'Consider adding more detailed packaging information',
          impact: 'Could increase score by 2-3 points'
        }
      ]
    }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success-600'
    if (score >= 75) return 'text-warning-600'
    return 'text-error-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 75) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Needs Improvement'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-error-600 bg-error-50'
      case 'medium': return 'text-warning-600 bg-warning-50'
      case 'low': return 'text-success-600 bg-success-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const downloadPDF = async (report: Report) => {
    setLoading(true)
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In real implementation, this would generate and download a PDF
      const link = document.createElement('a')
      link.href = '#'
      link.download = `${report.productName}-Transparency-Report.pdf`
      link.click()
      
      // Show success message
      alert('PDF downloaded successfully!')
    } catch (error) {
      alert('Failed to download PDF')
    } finally {
      setLoading(false)
    }
  }

  const shareReport = (report: Report) => {
    // In real implementation, this would open sharing options
    alert(`Sharing report for ${report.productName}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transparency Reports</h1>
            <p className="text-gray-600 mt-1">
              View and download your product transparency assessment reports
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {reports.length} report{reports.length !== 1 ? 's' : ''} generated
            </span>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{report.productName}</h3>
                <p className="text-sm text-gray-600">{report.manufacturer}</p>
                <p className="text-xs text-gray-500">{report.category}</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(report.transparencyScore)}`}>
                  {report.transparencyScore}%
                </div>
                <div className="text-sm text-gray-600">{getScoreLabel(report.transparencyScore)}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    report.transparencyScore >= 90 ? 'bg-success-600' :
                    report.transparencyScore >= 75 ? 'bg-warning-600' : 'bg-error-600'
                  }`}
                  style={{ width: `${report.transparencyScore}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>Generated: {new Date(report.createdAt).toLocaleDateString()}</span>
              <span className="capitalize">{report.status.replace('_', ' ')}</span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedReport(report)}
                className="btn-secondary flex items-center text-sm"
              >
                <EyeIcon className="h-4 w-4 mr-1" />
                View Details
              </button>
              <button
                onClick={() => downloadPDF(report)}
                disabled={loading}
                className="btn-primary flex items-center text-sm"
              >
                {loading ? (
                  <div className="loading-spinner mr-1"></div>
                ) : (
                  <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                Download PDF
              </button>
              <button
                onClick={() => shareReport(report)}
                className="btn-secondary flex items-center text-sm"
              >
                <ShareIcon className="h-4 w-4 mr-1" />
                Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Transparency Report: {selectedReport.productName}
                </h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Score Overview */}
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(selectedReport.transparencyScore)} mb-2`}>
                    {selectedReport.transparencyScore}%
                  </div>
                  <div className="text-lg text-gray-600 mb-4">
                    {getScoreLabel(selectedReport.transparencyScore)} Transparency Score
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className={`h-3 rounded-full ${
                        selectedReport.transparencyScore >= 90 ? 'bg-success-600' :
                        selectedReport.transparencyScore >= 75 ? 'bg-warning-600' : 'bg-error-600'
                      }`}
                      style={{ width: `${selectedReport.transparencyScore}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Generated on {new Date(selectedReport.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Category Breakdown
                </h3>
                <div className="space-y-4">
                  {selectedReport.categories.map((category, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <div className="text-right">
                          <div className={`font-semibold ${getScoreColor(category.score)}`}>
                            {category.score}/{category.maxScore}
                          </div>
                          <div className="text-sm text-gray-600">
                            {Math.round((category.score / category.maxScore) * 100)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full ${
                            category.score >= 90 ? 'bg-success-600' :
                            category.score >= 75 ? 'bg-warning-600' : 'bg-error-600'
                          }`}
                          style={{ width: `${(category.score / category.maxScore) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <InformationCircleIcon className="h-5 w-5 mr-2" />
                  Recommendations for Improvement
                </h3>
                <div className="space-y-4">
                  {selectedReport.recommendations.map((rec, index) => (
                    <div key={index} className={`border-l-4 rounded-r-lg p-4 ${
                      rec.priority === 'high' ? 'border-error-500 bg-error-50' :
                      rec.priority === 'medium' ? 'border-warning-500 bg-warning-50' :
                      'border-success-500 bg-success-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                          <p className="text-xs text-gray-500">Impact: {rec.impact}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                          {rec.priority} priority
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Report ID: {selectedReport.id}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => downloadPDF(selectedReport)}
                    disabled={loading}
                    className="btn-primary flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner mr-2"></div>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => shareReport(selectedReport)}
                    className="btn-secondary flex items-center"
                  >
                    <ShareIcon className="h-4 w-4 mr-2" />
                    Share Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {reports.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first product assessment to generate transparency reports.
          </p>
          <button className="btn-primary">
            Create First Assessment
          </button>
        </div>
      )}
    </div>
  )
} 