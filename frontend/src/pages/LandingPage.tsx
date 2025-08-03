import { Link } from 'react-router-dom'
import { 
  ShieldCheckIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

export default function LandingPage() {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Transparency Assessment',
      description: 'AI-powered evaluation of product transparency with detailed scoring and recommendations.',
      color: 'text-primary-600'
    },
    {
      icon: ChartBarIcon,
      title: 'Comprehensive Reports',
      description: 'Generate detailed PDF reports with transparency scores, insights, and improvement suggestions.',
      color: 'text-success-600'
    },
    {
      icon: UserGroupIcon,
      title: 'Consumer Trust',
      description: 'Build consumer confidence through transparent product information and ethical practices.',
      color: 'text-secondary-600'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Standards',
      description: 'Align with international transparency standards and regulatory requirements.',
      color: 'text-warning-600'
    }
  ]

  const benefits = [
    'AI-powered question generation for comprehensive assessment',
    'Real-time transparency scoring and analysis',
    'Professional PDF report generation',
    'Mobile-responsive design for all devices',
    'Secure data handling and privacy protection',
    'Industry-standard compliance and validation'
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager',
      company: 'EcoLife Foods',
      content: 'Altibbe helped us achieve 95% transparency score and build stronger consumer trust.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Sustainability Director',
      company: 'GreenTech Solutions',
      content: 'The AI-generated questions uncovered transparency gaps we never knew existed.',
      rating: 5
    },
    {
      name: 'Emma Rodriguez',
      role: 'CEO',
      company: 'PureBeauty Co.',
      content: 'Our transparency reports have become a key differentiator in the market.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Altibbe</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Product Transparency
              <span className="text-primary-600"> Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Build consumer trust through AI-powered transparency assessments. 
              Generate comprehensive reports that showcase your commitment to ethical, 
              health-first product practices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Start Free Assessment
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <button className="btn-secondary text-lg px-8 py-4 flex items-center justify-center">
                <PlayIcon className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Altibbe?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform helps you build transparency, trust, and competitive advantage.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="mx-auto h-16 w-16 rounded-xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-primary-50 transition-colors">
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to transparency success
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Register Your Product
              </h3>
              <p className="text-gray-600">
                Add your product details and basic information. Our AI will generate relevant transparency questions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Complete Assessment
              </h3>
              <p className="text-gray-600">
                Answer AI-generated questions about ingredients, manufacturing, environmental impact, and more.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Get Your Report
              </h3>
              <p className="text-gray-600">
                Receive a comprehensive transparency report with scores, insights, and improvement recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Everything You Need for Product Transparency
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-success-600 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/register" className="btn-primary">
                  Start Your Assessment
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sample Transparency Score
                </h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">87%</div>
                  <div className="text-sm text-gray-600 mb-4">Transparency Score</div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-primary-600 h-3 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    Excellent transparency practices
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers say about their transparency journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Trust?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of companies already using Altibbe to enhance their product transparency and build consumer confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold transition-colors">
              Start Free Assessment
            </Link>
            <Link to="/login" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-semibold transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="ml-2 text-xl font-bold">Altibbe</span>
              </div>
              <p className="text-gray-400">
                Building transparency and trust in product information through AI-powered assessments.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Altibbe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 