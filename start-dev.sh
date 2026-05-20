#!/bin/bash

echo "🚀 Starting AI Video Translator - Development Mode"
echo "====================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Step 1: Checking environment...${NC}"

# Check if .env exists, if not create from example
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend/.env from example...${NC}"
    cp backend/.env.example backend/.env
fi

echo -e "${GREEN}✓ Environment ready${NC}"
echo ""

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

echo -e "${BLUE}Step 2: Starting Backend Server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..
sleep 3

echo -e "${BLUE}Step 3: Starting Frontend Server...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..
sleep 3

echo ""
echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN}✅ Both servers are starting!${NC}"
echo ""
echo -e "📱 Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "🔧 Backend:  ${BLUE}http://localhost:5000${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID
wait $FRONTEND_PID
