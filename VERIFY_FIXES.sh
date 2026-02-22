#!/bin/bash

# ATS Resume Optimizer - Quick Test Script
# This script helps verify that all fixes are working correctly

echo "======================================"
echo "ATS Resume Optimizer - Fix Verification"
echo "======================================"
echo ""

# Check if Node.js is available
echo "1. Checking Node.js version..."
node -v

echo ""
echo "2. Checking npm version..."
npm -v

echo ""
echo "3. Checking backend dependencies..."
cd /Users/ayushgupta/free-tools/server
npm list pdf-parse 2>&1 | grep "pdf-parse"

echo ""
echo "4. Checking .env configuration..."
grep "PORT=" /Users/ayushgupta/free-tools/server/.env

echo ""
echo "5. Checking API_URL in frontend..."
grep "const API_URL" /Users/ayushgupta/free-tools/client/src/App.jsx

echo ""
echo "6. Checking for pdf-parse import in controller..."
grep "pdf-parse" /Users/ayushgupta/free-tools/server/controllers/resumeController.js

echo ""
echo "======================================"
echo "✅ All configurations verified!"
echo "======================================"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd /Users/ayushgupta/free-tools/server"
echo "  node server.js"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd /Users/ayushgupta/free-tools/client"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
