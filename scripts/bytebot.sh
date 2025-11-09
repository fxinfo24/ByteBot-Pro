#!/bin/bash

# Bytebot - Simple Deployment Script
# Usage: ./bytebot.sh [start|stop|restart|logs|status]

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[BYTEBOT]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        print_warning "Please edit .env file with your API keys before starting!"
        return 1
    fi
    return 0
}

# Start Bytebot
start_bytebot() {
    print_status "Starting Bytebot..."
    
    if ! check_env; then
        print_error "Please configure .env file first!"
        exit 1
    fi
    
    docker compose up -d
    
    print_success "Bytebot is starting up!"
    print_status "Services will be available at:"
    echo "  🌐 Web UI:      http://localhost:9992"
    echo "  🤖 API:        http://localhost:9991" 
    echo "  🖥️  Desktop:    http://localhost:9990"
    echo "  🧠 LLM Proxy:  http://localhost:4000"
    echo ""
    print_status "Use './bytebot.sh logs' to monitor startup progress"
    print_status "Use './bytebot.sh status' to check service health"
}

# Stop Bytebot
stop_bytebot() {
    print_status "Stopping Bytebot..."
    docker compose down
    print_success "Bytebot stopped!"
}

# Restart Bytebot
restart_bytebot() {
    print_status "Restarting Bytebot..."
    docker compose down
    docker compose up -d
    print_success "Bytebot restarted!"
}

# Show logs
show_logs() {
    if [ -z "$2" ]; then
        print_status "Showing all service logs (press Ctrl+C to exit)..."
        docker compose logs -f
    else
        print_status "Showing logs for service: $2"
        docker compose logs -f "$2"
    fi
}

# Show status
show_status() {
    print_status "Bytebot Service Status:"
    docker compose ps
    
    echo ""
    print_status "Service Health Checks:"
    
    # Check web UI
    if curl -s -f http://localhost:9992 >/dev/null 2>&1; then
        print_success "✅ Web UI (http://localhost:9992) - HEALTHY"
    else
        print_error "❌ Web UI (http://localhost:9992) - UNHEALTHY"
    fi
    
    # Check API
    if curl -s -f http://localhost:9991/tasks/models >/dev/null 2>&1; then
        print_success "✅ API (http://localhost:9991) - HEALTHY"
    else
        print_error "❌ API (http://localhost:9991) - UNHEALTHY"
    fi
    
    # Check LLM Proxy
    if curl -s -f http://localhost:4000/model/info >/dev/null 2>&1; then
        print_success "✅ LLM Proxy (http://localhost:4000) - HEALTHY"
    else
        print_error "❌ LLM Proxy (http://localhost:4000) - UNHEALTHY"
    fi
    
    # Show model count
    MODEL_COUNT=$(curl -s http://localhost:9991/tasks/models 2>/dev/null | jq length 2>/dev/null || echo "0")
    if [ "$MODEL_COUNT" -gt 0 ]; then
        print_success "🤖 Available Models: $MODEL_COUNT"
    else
        print_warning "🤖 Models: Not available yet (still starting up)"
    fi
}

# Update Bytebot
update_bytebot() {
    print_status "Updating Bytebot..."
    git pull
    docker compose down
    docker compose build --no-cache
    docker compose up -d
    print_success "Bytebot updated and restarted!"
}

# Main script logic
case "${1:-start}" in
    start)
        start_bytebot
        ;;
    stop)
        stop_bytebot
        ;;
    restart)
        restart_bytebot
        ;;
    logs)
        show_logs "$@"
        ;;
    status)
        show_status
        ;;
    update)
        update_bytebot
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|status|update}"
        echo ""
        echo "Commands:"
        echo "  start    - Start Bytebot (default)"
        echo "  stop     - Stop Bytebot"
        echo "  restart  - Restart Bytebot"
        echo "  logs     - Show logs (optionally specify service name)"
        echo "  status   - Show service status and health"
        echo "  update   - Update and rebuild Bytebot"
        echo ""
        echo "Examples:"
        echo "  $0 start"
        echo "  $0 logs bytebot-agent"
        echo "  $0 status"
        exit 1
        ;;
esac