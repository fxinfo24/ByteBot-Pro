#!/bin/bash

# ByteBot-Pro Cloudflare Tunnel Setup Script
# This script sets up Cloudflare Tunnel for secure external access

set -e

echo "🌐 ByteBot-Pro Cloudflare Tunnel Setup"
echo "======================================"

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "📦 Installing cloudflared..."
    
    # Detect OS and install accordingly
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        sudo dpkg -i cloudflared-linux-amd64.deb
        rm cloudflared-linux-amd64.deb
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install cloudflared
        else
            echo "Please install Homebrew first or download cloudflared manually"
            exit 1
        fi
    else
        echo "Please install cloudflared manually for your OS"
        echo "Visit: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
        exit 1
    fi
fi

echo "✅ cloudflared installed successfully"

# Check if already authenticated
if ! cloudflared tunnel list &> /dev/null; then
    echo "🔐 Please authenticate with Cloudflare..."
    echo "This will open a browser window for authentication."
    cloudflared tunnel login
fi

echo "✅ Cloudflare authentication successful"

# Check if tunnel exists
TUNNEL_NAME="bytebot-pro"
if ! cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
    echo "🔧 Creating new tunnel: $TUNNEL_NAME"
    cloudflared tunnel create $TUNNEL_NAME
else
    echo "✅ Tunnel $TUNNEL_NAME already exists"
fi

# Get tunnel ID
TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
echo "📝 Tunnel ID: $TUNNEL_ID"

# Create tunnel configuration
echo "📄 Creating tunnel configuration..."
cat > cloudflare-tunnel.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: ~/.cloudflared/$TUNNEL_ID.json

ingress:
  # ByteBot Web UI (Main Interface)
  - hostname: bytebot.yourdomain.com
    service: http://localhost:9992
    originRequest:
      httpHostHeader: localhost:9992
      
  # ByteBot API  
  - hostname: api.bytebot.yourdomain.com
    service: http://localhost:9991
    originRequest:
      httpHostHeader: localhost:9991
      
  # ByteBot Desktop (VNC)
  - hostname: desktop.bytebot.yourdomain.com
    service: http://localhost:6080
    originRequest:
      httpHostHeader: localhost:6080
      
  # Catch-all rule (required)
  - service: http_status:404
EOF

echo "🌐 Tunnel configuration created!"
echo ""
echo "📋 Next Steps:"
echo "1. Update the hostnames in cloudflare-tunnel.yml with your actual domain"
echo "2. Add DNS records in Cloudflare dashboard for each hostname"
echo "3. Start the tunnel with: cloudflared tunnel run $TUNNEL_NAME"
echo ""
echo "🔗 Your ByteBot-Pro will be accessible at:"
echo "• Main UI: https://bytebot.yourdomain.com"
echo "• API: https://api.bytebot.yourdomain.com" 
echo "• Desktop: https://desktop.bytebot.yourdomain.com"
echo ""
echo "✨ Secure, encrypted access from anywhere in the world!"