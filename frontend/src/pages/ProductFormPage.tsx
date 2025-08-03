import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface ProductData {
  name: string
  category: string
  manufacturer: string
  description: string
  ingredients: string
  barcode: string
}

interface Question {
  id: string
  text: string
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox'
  options?: string[]
  required: boolean
  helpText?: string
}

export default function ProductFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [productData, setProductData] = useState<ProductData>({
    name: '',
    category: '',
    manufacturer: '',
    description: '',
    ingredients: '',
    barcode: ''
  })

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})

  const categories = [
    'Food & Beverages',
    'Cosmetics & Beauty',
    'Clothing & Textiles',
    'Electronics',
    'Home & Garden',
    'Health & Wellness',
    'Automotive',
    'Other'
  ]

  // Mock AI-generated questions based on product category
  const generateQuestions = (category: string): Question[] => {
    const baseQuestions: Question[] = [
      {
        id: 'manufacturing_location',
        text: 'Where is this product manufactured?',
        type: 'text',
        required: true,
        helpText: 'Please specify the country and city of manufacturing'
      },
      {
        id: 'sustainability_practices',
        text: 'What sustainability practices are implemented in production?',
        type: 'textarea',
        required: false,
        helpText: 'Describe any eco-friendly practices, renewable energy use, or waste reduction measures'
      }
    ]

    const categorySpecificQuestions: Record<string, Question[]> = {
      'Food & Beverages': [
        {
          id: 'organic_certification',
          text: 'Is this product certified organic?',
          type: 'radio',
          options: ['Yes', 'No', 'Partially'],
          required: true
        },
        {
          id: 'allergens',
          text: 'What allergens are present in this product?',
          type: 'checkbox',
          options: ['Gluten', 'Dairy', 'Nuts', 'Soy', 'Eggs', 'None'],
          required: true
        }
      ],
      'Cosmetics & Beauty': [
        {
          id: 'cruelty_free',
          text: 'Is this product cruelty-free?',
          type: 'radio',
          options: ['Yes', 'No', 'Not tested on animals'],
          required: true
        },
        {
          id: 'paraben_free',
          text: 'Is this product paraben-free?',
          type: 'radio',
          options: ['Yes', 'No'],
          required: true
        }
      ],
      'Clothing & Textiles': [
        {
          id: 'fabric_composition',
          text: 'What is the primary fabric composition?',
          type: 'select',
          options: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Other'],
          required: true
        },
        {
          id: 'fair_trade',
          text: 'Is this product fair trade certified?',
          type: 'radio',
          options: ['Yes', 'No'],
          required: true
        }
      ]
    }

    return [...baseQuestions, ...(categorySpecificQuestions[category] || [])]
  }

  const questions = generateQuestions(productData.category)

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProductData({
      ...productData,
      [e.target.name]: e.target.value
    })
  }

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers({
      ...answers,
      [questionId]: value
    })
  }

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!productData.name.trim()) {
        toast.error('Product name is required')
        return false
      }
      if (!productData.category) {
        toast.error('Category is required')
        return false
      }
      if (!productData.manufacturer.trim()) {
        toast.error('Manufacturer is required')
        return false
      }
    } else if (step === 2) {
      const requiredQuestions = questions.filter(q => q.required)
      for (const question of requiredQuestions) {
        const answer = answers[question.id]
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          toast.error(`Please answer: ${question.text}`)
          return false
        }
      }
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(currentStep)) {
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(isEditing ? 'Product updated successfully!' : 'Product created successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const renderQuestion = (question: Question) => {
    const value = answers[question.id] || ''

    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="input-field"
            placeholder="Enter your answer"
          />
        )
      
      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={4}
            className="input-field"
            placeholder="Enter your detailed answer"
          />
        )
      
      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="input-field"
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      
      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="mr-3"
                />
                {option}
              </label>
            ))}
          </div>
        )
      
      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={(value as string[]).includes(option)}
                  onChange={(e) => {
                    const currentValues = (value as string[]) || []
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option)
                    handleAnswerChange(question.id, newValues)
                  }}
                  className="mr-3"
                />
                {option}
              </label>
            ))}
          </div>
        )
      
      default:
        return null
    }
  }

  const steps = [
    { number: 1, title: 'Product Information', description: 'Basic product details' },
    { number: 2, title: 'Transparency Assessment', description: 'Answer AI-generated questions' },
    { number: 3, title: 'Review & Submit', description: 'Review and submit your product' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update your product information' : 'Register a new product for transparency assessment'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number 
                  ? 'bg-primary-600 border-primary-600 text-white' 
                  : 'border-gray-300 text-gray-500'
              }`}>
                {currentStep > step.number ? (
                  <CheckIcon className="w-6 h-6" />
                ) : (
                  <span className="font-semibold">{step.number}</span>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-primary-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="form-label">
                    Product Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={productData.name}
                    onChange={handleProductChange}
                    className="input-field"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="form-label">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={productData.category}
                    onChange={handleProductChange}
                    className="input-field"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="manufacturer" className="form-label">
                  Manufacturer *
                </label>
                <input
                  id="manufacturer"
                  name="manufacturer"
                  type="text"
                  required
                  value={productData.manufacturer}
                  onChange={handleProductChange}
                  className="input-field"
                  placeholder="Enter manufacturer name"
                />
              </div>

              <div>
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={productData.description}
                  onChange={handleProductChange}
                  className="input-field"
                  placeholder="Enter product description"
                />
              </div>

              <div>
                <label htmlFor="ingredients" className="form-label">
                  Ingredients
                </label>
                <textarea
                  id="ingredients"
                  name="ingredients"
                  rows={3}
                  value={productData.ingredients}
                  onChange={handleProductChange}
                  className="input-field"
                  placeholder="Enter ingredients list (separated by commas)"
                />
                <p className="form-help">List all ingredients, separated by commas</p>
              </div>

              <div>
                <label htmlFor="barcode" className="form-label">
                  Barcode (Optional)
                </label>
                <input
                  id="barcode"
                  name="barcode"
                  type="text"
                  value={productData.barcode}
                  onChange={handleProductChange}
                  className="input-field"
                  placeholder="Enter product barcode"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Transparency Assessment</h2>
              <p className="text-gray-600 mb-6">
                Our AI has generated specific questions based on your product category. 
                Please answer these questions to help us assess your product's transparency.
              </p>
              
              <div className="space-y-8">
                {questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {index + 1}. {question.text}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                        {question.helpText && (
                          <div className="flex items-start">
                            <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-sm text-gray-600">{question.helpText}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {renderQuestion(question)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Review & Submit</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Product Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Name:</span>
                      <p className="text-gray-900">{productData.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Category:</span>
                      <p className="text-gray-900">{productData.category}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Manufacturer:</span>
                      <p className="text-gray-900">{productData.manufacturer}</p>
                    </div>
                    {productData.description && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Description:</span>
                        <p className="text-gray-900">{productData.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Assessment Answers</h3>
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <div key={question.id}>
                        <span className="text-sm font-medium text-gray-600">
                          {index + 1}. {question.text}:
                        </span>
                        <p className="text-gray-900">
                          {Array.isArray(answers[question.id]) 
                            ? (answers[question.id] as string[]).join(', ')
                            : answers[question.id] || 'Not answered'
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your product will be registered in our transparency database</li>
                  <li>• AI will analyze your answers and generate a transparency score</li>
                  <li>• You'll receive a comprehensive PDF report with recommendations</li>
                  <li>• The report can be shared with consumers and stakeholders</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-secondary flex items-center"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Previous
            </button>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary flex items-center"
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner mr-2"></div>
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {isEditing ? 'Update Product' : 'Create Product'}
                      <CheckIcon className="h-4 w-4 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 