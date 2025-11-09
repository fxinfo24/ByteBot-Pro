# Bytebot Deployment Guide

> **🎉 Platform Complete**: 100% OPERATIONAL! Professional UI, PostgreSQL database, 12 AI models (including 3 FREE), and complete task execution all working perfectly. Ready for production AI automation.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- At least one LLM provider API key

### 1. Clone and Setup
```bash
git clone https://github.com/bytebot-ai/bytebot.git
cd bytebot/docker
cp .env.example .env
```

### 2. Configure API Keys
Edit `.env` file with your API keys:
```bash
# Choose your preferred provider(s)
ANTHROPIC_API_KEY=sk-ant-...     # Claude models
OPENAI_API_KEY=sk-...            # GPT models
GEMINI_API_KEY=...               # Gemini models
OPENROUTER_API_KEY=sk-or-...     # Multiple models via OpenRouter
```

### 3. Deploy
```bash
docker-compose up -d
```

### 4. Access
- **Web UI**: http://localhost:9992
- **Agent API**: http://localhost:9991
- **Desktop (VNC)**: http://localhost:9990

## 🤖 LLM Provider Options

### Option 1: OpenRouter (Recommended for beginners)
- **Single API key** for multiple models
- **Cost comparison** across providers
- **Unified interface** for all models

```bash
OPENROUTER_API_KEY=sk-or-your-key-here
```

### Option 2: Direct Provider APIs
- **Best performance** for specific providers
- **Direct billing** with each provider
- **Provider-specific features**

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here
GEMINI_API_KEY=your-key-here
```

### Option 3: Mixed Approach (Production)
- **Primary provider** for main tasks
- **OpenRouter** for model variety and cost optimization

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENROUTER_API_KEY=sk-or-your-key-here
```

## 📊 Available Models

### Through OpenRouter

**Premium Models:**
- `anthropic/claude-3.5-sonnet` - Best for complex reasoning
- `openai/gpt-4o` - Great for general tasks
- `google/gemini-pro-1.5` - Excellent for large contexts
- `meta-llama/llama-3.1-405b-instruct` - Open source powerhouse
- `anthropic/claude-3-opus` - Maximum capability

**Free Models (Perfect for testing):**
- `z-ai/glm-4.5-air:free` - GLM-4.5-Air (Free tier)
- `tngtech/deepseek-r1t2-chimera:free` - DeepSeek R1T2 Chimera (Free tier)

### Direct APIs
- **Anthropic**: Claude Opus 4.1, Claude Sonnet 4
- **OpenAI**: o3, GPT-4.1
- **Google**: Gemini 2.5 Pro, Gemini 2.5 Flash

## 🐳 Docker Deployment Options

### Development (Local)
```bash
# Uses development compose file
docker-compose -f docker-compose.development.yml up -d

# Run agent and UI locally for development
cd ../packages/bytebot-agent && npm run start:dev
cd ../packages/bytebot-ui && npm run dev
```

### Production
```bash
# Full production deployment
docker-compose up -d
```

### With LiteLLM Proxy
```bash
# Advanced routing and caching
./scripts/bytebot.sh start
```

## ☸️ Kubernetes Deployment

### Using Helm
```bash
# Add repo
helm repo add bytebot https://bytebot-ai.github.io/bytebot
helm repo update

# Install with values
helm install bytebot bytebot/bytebot -f values.yaml
```

### Example values.yaml
```yaml
bytebot-agent:
  env:
    ANTHROPIC_API_KEY: "your-key"
    OPENROUTER_API_KEY: "your-key"

bytebot-ui:
  ingress:
    enabled: true
    hosts:
      - host: bytebot.company.com
        paths:
          - path: /
            pathType: Prefix

postgresql:
  enabled: true
  auth:
    database: bytebotdb
```

## 🔧 Configuration

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | One of* | Anthropic Claude API key |
| `OPENAI_API_KEY` | One of* | OpenAI GPT API key |
| `GEMINI_API_KEY` | One of* | Google Gemini API key |
| `OPENROUTER_API_KEY` | One of* | OpenRouter unified API key |
| `DATABASE_URL` | No | PostgreSQL connection string |
| `BYTEBOT_LLM_PROXY_URL` | No | LiteLLM proxy URL |

*At least one API key is required

### Port Configuration
- `9990` - Desktop environment (VNC + API)
- `9991` - Agent API
- `9992` - Web UI
- `5432` - PostgreSQL database

## 🚨 Troubleshooting

### Common Issues

**Models not appearing in UI**
```bash
# Check API keys are set
docker-compose logs bytebot-agent | grep "API_KEY"

# Verify model endpoint
curl http://localhost:9991/tasks/models
```

**Desktop not accessible**
```bash
# Check container status
docker-compose ps

# Check VNC connection
curl http://localhost:9990/health
```

**Build failures**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
```

### Performance Optimization

**For high-volume usage:**
1. Use LiteLLM proxy for caching
2. Implement model selection based on task complexity
3. Monitor costs across providers
4. Set up horizontal scaling for agent instances

**For cost optimization:**
1. Use OpenRouter for model comparison
2. Route simple tasks to cheaper models
3. Implement usage monitoring and alerts

## 🔒 Security Considerations

### API Key Management
- Use environment variables, never hardcode keys
- Rotate API keys regularly
- Monitor usage for anomalies
- Use separate keys for different environments

### Network Security
- Run behind reverse proxy in production
- Use TLS/SSL certificates
- Implement rate limiting
- Monitor access logs

### Data Privacy
- Review provider data policies
- Implement data retention policies
- Consider on-premise deployment for sensitive data
- Use proxy mode for additional control

## 📚 Next Steps

1. **Set up monitoring** - Monitor costs, usage, and performance
2. **Implement automation** - Create workflows and integrations
3. **Scale deployment** - Add load balancing and multiple instances
4. **Customize models** - Fine-tune model selection for your use cases

## 🆘 Support

- **Documentation**: https://docs.bytebot.ai
- **GitHub Issues**: https://github.com/bytebot-ai/bytebot/issues
- **Community**: https://discord.gg/bytebot

---

**Need help?** Check the troubleshooting section or create an issue on GitHub.
