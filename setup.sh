#!/bin/bash

echo "🚀 AI Video Translator - Setup Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v18 or higher.${NC}"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version is $NODE_VERSION. Please upgrade to v18 or higher.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) installed${NC}"

# Check FFmpeg
echo ""
echo "Checking FFmpeg installation..."
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${YELLOW}⚠️ FFmpeg is not installed. Installing...${NC}"
    
    # Detect OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install -y ffmpeg
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if ! command -v brew &> /dev/null; then
            echo -e "${RED}❌ Homebrew is required. Please install Homebrew first.${NC}"
            exit 1
        fi
        brew install ffmpeg
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        echo -e "${YELLOW}Please install FFmpeg manually from https://ffmpeg.org/download.html${NC}"
        echo "Or use: choco install ffmpeg (if using Chocolatey)"
    else
        echo -e "${YELLOW}Please install FFmpeg manually from https://ffmpeg.org/download.html${NC}"
    fi
else
    echo -e "${GREEN}✓ FFmpeg $(ffmpeg -version 2>&1 | head -n1 | cut -d' ' -f3) installed${NC}"
fi

# Check Python
echo ""
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.8 or higher.${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1)
if [ "$PYTHON_VERSION" -lt 3 ]; then
    echo -e "${RED}❌ Python 3 is required.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python $(python3 --version) installed${NC}"

# Install root dependencies
echo ""
echo "Installing root dependencies..."
npm install

# Install backend dependencies
echo ""
echo "Installing backend dependencies..."
cd backend
npm install

# Install Python dependencies
echo ""
echo "Installing Python dependencies..."
cd src/scripts
pip3 install -r requirements.txt

# Go back to root
cd ../../..

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd frontend
npm install

cd ..

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo "To start the application:"
echo "  1. Backend:  cd backend && npm run dev"
echo "  2. Frontend: cd frontend && npm run dev"
echo ""
echo "Or run both with:"
echo "  npm run dev"
echo ""
echo "Backend will run on:  http://localhost:5000"
echo "Frontend will run on:  http://localhost:5173"
echo ""
echo -e "${YELLOW}Note: Make sure to configure your .env files before running!${NC}"
echo "  - backend/.env"
echo "  - frontend/.env"
echo ""
