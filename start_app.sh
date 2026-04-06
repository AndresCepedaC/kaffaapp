#!/bin/bash
set -euo pipefail

# ══════════════════════════════════════════════════════════════
# KaffaApp - Start Script (Backend + Frontend)
# ══════════════════════════════════════════════════════════════

BACKEND_PID=""
FRONTEND_PID=""
BOT_PID=""

# ─── Cleanup on exit ─────────────────────────────────────────
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null
        wait "$BACKEND_PID" 2>/dev/null || true
        echo "   ✓ Backend stopped"
    fi
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null
        wait "$FRONTEND_PID" 2>/dev/null || true
        echo "   ✓ Frontend stopped"
    fi
    if [ -n "$BOT_PID" ] && kill -0 "$BOT_PID" 2>/dev/null; then
        kill "$BOT_PID" 2>/dev/null
        wait "$BOT_PID" 2>/dev/null || true
        echo "   ✓ WhatsApp Bot stopped"
    fi
    echo "👋 KaffaApp shut down gracefully."
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# ─── Configuration ───────────────────────────────────────────
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="${KAFFA_BACKEND_DIR:-$ROOT_DIR/kaffaadvance/kaffa-server/kaffa-server}"
FRONTEND_DIR="${KAFFA_FRONTEND_DIR:-$ROOT_DIR/kaffa-client}"
BOT_DIR="${KAFFA_BOT_DIR:-$ROOT_DIR/whatsapp-bot}"
BACKEND_PORT="${PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
BOT_PORT="${BOT_PORT:-3000}"
MAX_WAIT="${BACKEND_WAIT:-60}"

# ─── Detect local IP (cross-platform) ───────────────────────
get_local_ip() {
    if command -v ip &>/dev/null; then
        ip route get 1 2>/dev/null | awk '{print $7; exit}'
    elif command -v ipconfig &>/dev/null; then
        ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost"
    else
        hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost"
    fi
}

LOCAL_IP=$(get_local_ip)

# ─── Clear port if occupied ─────────────────────────────────
clear_port() {
    local port=$1
    if command -v lsof &>/dev/null; then
        lsof -ti:"$port" 2>/dev/null | xargs kill -9 2>/dev/null || true
    elif command -v fuser &>/dev/null; then
        fuser -k "$port/tcp" 2>/dev/null || true
    fi
}

echo "🔄 Clearing port $BACKEND_PORT..."
clear_port "$BACKEND_PORT"
echo "🔄 Clearing port $BOT_PORT..."
clear_port "$BOT_PORT"
sleep 1

# ─── Start WhatsApp Bot ──────────────────────────────────────
echo "🤖 Starting WhatsApp Bot..."

if [ ! -f "$BOT_DIR/package.json" ]; then
    echo "❌ Error: package.json not found in $BOT_DIR"
    exit 1
fi

cd "$BOT_DIR"
# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "📦 Installing whatsapp-bot dependencies..."
    npm install
fi

npm start &
BOT_PID=$!

# ─── Start Backend ───────────────────────────────────────────
echo "☕ Starting Kaffa Backend..."

if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Error: Backend directory not found: $BACKEND_DIR"
    echo "   Set KAFFA_BACKEND_DIR environment variable to override."
    exit 1
fi

cd "$BACKEND_DIR"

if [ ! -f "./mvnw" ]; then
    echo "❌ Error: mvnw not found in $BACKEND_DIR"
    exit 1
fi

chmod +x ./mvnw
./mvnw spring-boot:run -q &
BACKEND_PID=$!

# ─── Wait for backend with health check ─────────────────────
echo "⏳ Waiting for backend to be ready (max ${MAX_WAIT}s)..."
ELAPSED=0
while [ "$ELAPSED" -lt "$MAX_WAIT" ]; do
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
        echo "❌ Backend process terminated unexpectedly."
        exit 1
    fi
    if curl -sf "http://localhost:${BACKEND_PORT}/api/health" >/dev/null 2>&1; then
        echo "✅ Backend ready! (took ${ELAPSED}s)"
        break
    fi
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

if [ "$ELAPSED" -ge "$MAX_WAIT" ]; then
    echo "⚠️  Warning: Backend may not be fully ready after ${MAX_WAIT}s."
    echo "   Continuing anyway..."
fi

# ─── Start Frontend ──────────────────────────────────────────
echo "🎨 Starting Kaffa Frontend..."

if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    echo "❌ Error: package.json not found in $FRONTEND_DIR"
    exit 1
fi

cd "$FRONTEND_DIR"

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

npm run dev -- --host &
FRONTEND_PID=$!

sleep 3

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  ☕ KaffaApp is running!                   ║"
echo "╠════════════════════════════════════════════╣"
echo "║                                            ║"
echo "║  📱 Local:   http://localhost:$FRONTEND_PORT        ║"
echo "║  📱 Network: http://${LOCAL_IP}:$FRONTEND_PORT  ║"
echo "║  🔧 API:     http://localhost:$BACKEND_PORT         ║"
echo "║  🤖 Bot:     http://localhost:$BOT_PORT         ║"
echo "║                                            ║"
echo "║  Backend PID:  $BACKEND_PID                ║"
echo "║  Frontend PID: $FRONTEND_PID               ║"
echo "║  Bot PID:      $BOT_PID                    ║"
echo "║                                            ║"
echo "║  Press Ctrl+C to stop all servers.         ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Wait for any child to exit
wait
