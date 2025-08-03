#!/bin/bash

echo "🚀 Setting up Altibbe Product Transparency Platform"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL 13+ for the database."
    echo "   You can continue with the setup, but you'll need to configure the database later."
fi

echo "✅ Prerequisites check completed"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/uploads
mkdir -p frontend/dist

# Backend setup
echo "🔧 Setting up backend..."
cd backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please configure your .env file with your database and API settings"
fi

cd ..

# AI Service setup
echo "🤖 Setting up AI service..."
cd ai-service

# Create virtual environment
echo "🐍 Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment and install dependencies
echo "📦 Installing AI service dependencies..."
source venv/bin/activate
pip install -r requirements.txt

cd ..

# Frontend setup
echo "🎨 Setting up frontend..."
cd frontend

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

cd ..

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your database in backend/.env"
echo "2. Start the backend: cd backend && npm run dev"
echo "3. Start the AI service: cd ai-service && source venv/bin/activate && python app.py"
echo "4. Start the frontend: cd frontend && npm run dev"
echo ""
echo "🌐 The application will be available at:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000"
echo "   - AI Service: http://localhost:5001"
echo ""
echo "📚 For more information, see the README.md file" 