#!/bin/bash

# ATS Resume Optimizer - Quick Start Script
# This script helps you get started quickly

echo "🚀 ATS Resume Optimizer - Quick Start"
echo "====================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ NPM found: $(npm --version)"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install --silent

echo ""
echo "📦 Installing backend dependencies..."
cd server
npm install --silent
cd ..

echo ""
echo "📦 Installing frontend dependencies..."
cd client
npm install --silent
cd ..

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "📝 Next steps:"
echo "1. Configure MongoDB:"
echo "   - Go to https://www.mongodb.com/cloud/atlas"
echo "   - Create a free account and cluster"
echo "   - Copy your connection string"
echo ""
echo "2. Create .env file in server directory:"
echo "   cd server"
echo "   cp .env.example .env"
echo "   # Edit .env with your MongoDB URI"
echo ""
echo "3. Start development servers:"
echo "   npm run dev"
echo "   (from root directory)"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Documentation:"
echo "   - SETUP.md: Setup instructions"
echo "   - README.md: Project details"
echo "   - DEVELOPMENT.md: Developer guide"
echo ""
echo "Happy coding! 🎉"
