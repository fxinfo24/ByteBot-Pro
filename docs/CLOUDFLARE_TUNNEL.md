# 🌐 ByteBot-Pro Cloudflare Tunnel Setup

Access your ByteBot-Pro platform securely from anywhere in the world using Cloudflare Tunnel - no port forwarding or firewall configuration needed!

## ✨ Benefits of Cloudflare Tunnel

- 🔒 **Secure**: End-to-end encrypted connections
- 🌍 **Global Access**: Access from anywhere without exposing ports
- 🚀 **Fast**: Cloudflare's global network for optimal performance  
- 🛡️ **DDoS Protection**: Built-in protection from attacks
- 📜 **Free SSL**: Automatic SSL certificates
- 📊 **Analytics**: Traffic insights and monitoring

## 🚀 Quick Setup

### 1. Prerequisites

- Cloudflare account (free tier works)
- Domain name managed by Cloudflare
- ByteBot-Pro running locally

### 2. Automated Setup

```bash
# Run the automated setup script
./scripts/setup-cloudflare-tunnel.sh
```

### 3. Manual Setup (Alternative)

#### Step 1: Install cloudflared

```bash
# Linux
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# macOS
brew install cloudflared

# Windows
# Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

#### Step 2: Authenticate

```bash
cloudflared tunnel login
```

#### Step 3: Create Tunnel

```bash
cloudflared tunnel create bytebot-pro
```

#### Step 4: Configure DNS Records

In your Cloudflare dashboard, add CNAME records:

| Type  | Name     | Content                | Proxied |
|-------|----------|------------------------|---------|
| CNAME | bytebot  | TUNNEL_ID.cfargotunnel.com | ✅ Yes |
| CNAME | api.bytebot | TUNNEL_ID.cfargotunnel.com | ✅ Yes |
| CNAME | desktop.bytebot | TUNNEL_ID.cfargotunnel.com | ✅ Yes |

#### Step 5: Configure Tunnel

Copy and edit the configuration:

```bash
cp cloudflare-tunnel.example.yml cloudflare-tunnel.yml
# Edit cloudflare-tunnel.yml with your tunnel ID and domain
```

#### Step 6: Start with Docker

```bash
# Start ByteBot-Pro with Cloudflare Tunnel
docker-compose -f docker-compose.yml -f docker-compose.cloudflare.yml up -d
```

## 🔧 Configuration Options

### Standard Setup (Recommended)

```yaml
ingress:
  - hostname: bytebot.yourdomain.com
    service: http://bytebot-ui:3000
  - hostname: api.bytebot.yourdomain.com  
    service: http://bytebot-agent:3000
  - hostname: desktop.bytebot.yourdomain.com
    service: http://bytebot-desktop:6080
  - service: http_status:404
```

### Advanced Setup (All Services)

```yaml
ingress:
  - hostname: bytebot.yourdomain.com
    service: http://bytebot-ui:3000
  - hostname: api.bytebot.yourdomain.com
    service: http://bytebot-agent:3000
  - hostname: desktop.bytebot.yourdomain.com
    service: http://bytebot-desktop:6080
  - hostname: llm.bytebot.yourdomain.com
    service: http://bytebot-llm-proxy:4000
  - hostname: db.bytebot.yourdomain.com
    service: tcp://postgres:5432
  - service: http_status:404
```

## 🎯 Access URLs

After setup, access your ByteBot-Pro platform at:

- **🖥️ Main Interface**: `https://bytebot.yourdomain.com`
- **🔌 API Endpoint**: `https://api.bytebot.yourdomain.com`
- **🖱️ Remote Desktop**: `https://desktop.bytebot.yourdomain.com`
- **🤖 LLM Proxy**: `https://llm.bytebot.yourdomain.com` (optional)

## 🔒 Security Best Practices

### 1. Access Control

```yaml
# Add authentication to tunnel config
ingress:
  - hostname: bytebot.yourdomain.com
    service: http://bytebot-ui:3000
    originRequest:
      access:
        required: true
        teamName: your-team
```

### 2. IP Restrictions

```yaml
# Restrict access to specific IPs/countries
warp-routing:
  enabled: false
access:
  - allow:
      - ip: "203.0.113.0/24"
      - country: "US"
```

### 3. Rate Limiting

Configure rate limiting in Cloudflare dashboard under Security > Rate Limiting.

## 🛠️ Troubleshooting

### Common Issues

#### Tunnel Not Starting

```bash
# Check tunnel status
cloudflared tunnel list

# Check configuration
cloudflared tunnel validate cloudflare-tunnel.yml

# View tunnel logs
docker logs bytebot-cloudflare-tunnel
```

#### DNS Not Resolving

1. Verify DNS records in Cloudflare dashboard
2. Wait for DNS propagation (up to 24 hours)
3. Test with: `dig bytebot.yourdomain.com`

#### 502 Bad Gateway

1. Ensure ByteBot-Pro services are running: `docker-compose ps`
2. Check service health: `./scripts/bytebot.sh status`
3. Verify network connectivity between containers

### Logs and Monitoring

```bash
# View tunnel metrics
curl http://localhost:8080/metrics

# Monitor tunnel logs
docker logs -f bytebot-cloudflare-tunnel

# Check service connectivity
docker exec bytebot-cloudflare-tunnel cloudflared tunnel info
```

## 📊 Management Commands

```bash
# Start with Cloudflare Tunnel
docker-compose -f docker-compose.yml -f docker-compose.cloudflare.yml up -d

# Stop tunnel only
docker-compose -f docker-compose.cloudflare.yml down

# Restart tunnel
docker restart bytebot-cloudflare-tunnel

# Update tunnel configuration
docker-compose -f docker-compose.cloudflare.yml restart cloudflare-tunnel
```

## 💡 Pro Tips

1. **Use subdomains** for different services (api.domain.com, desktop.domain.com)
2. **Enable Cloudflare Analytics** for traffic insights
3. **Set up Access policies** for team collaboration
4. **Use Cloudflare Workers** for custom authentication
5. **Monitor tunnel health** with Cloudflare dashboard

## 🔗 Additional Resources

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [ByteBot-Pro Main Documentation](../README.md)
- [Deployment Guide](DEPLOYMENT.md)

---

**🌟 Your ByteBot-Pro platform is now accessible securely from anywhere in the world!**