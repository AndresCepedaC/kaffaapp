#!/bin/bash

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C)
trap cleanup SIGINT

# Save the current directory (project root)
ROOT_DIR=$(pwd)

# Get local IP address for LAN access
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")

# Kill any existing server on port 8080
echo "🔄 Clearing port 8080..."
lsof -ti:8080 | xargs kill -9 2>/dev/null
sleep 1

echo "☕ Starting Kaffa App Backend..."
cd "$HOME/Desktop/kaffa-server"

if [ ! -f "./mvnw" ]; then
    echo "❌ Error: mvnw not found in $(pwd)"
    exit 1
fi

./mvnw spring-boot:run &
BACKEND_PID=$!

echo "⏳ Waiting 15 seconds for backend to initialize..."
sleep 15

echo "🎨 Starting Kaffa App Frontend..."
cd "$ROOT_DIR/kaffa-client"

if [ ! -f "package.json" ]; then
   echo "❌ Error: package.json not found in $(pwd)"
   exit 1
fi

npm run dev -- --host &
FRONTEND_PID=$!

sleep 3

echo ""
echo "============================================"
echo "  ☕ KaffaApp is running!"
echo "============================================"
echo ""
echo "  📱 From THIS computer:"
echo "     http://localhost:5173"
echo ""
echo "  📱 From OTHER devices (same WiFi):"
echo "     http://${LOCAL_IP}:5173"
echo ""
echo "  Backend PID: $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo "============================================"
echo ""

wait
