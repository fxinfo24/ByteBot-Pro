# 🚀 ByteBot-Pro Installation Guide

## **📥 Quick Installation**

### **Step 1: Clone Repository**
```bash
git clone https://github.com/fxinfo24/ByteBot-Pro.git
cd ByteBot-Pro
```

### **Step 2: Configure Environment**
```bash
# Copy environment template
cp .env.example .env

# Edit with your API keys
nano .env  # or your preferred editor
```

### **Step 3: Deploy**
```bash
# One command deployment
./bytebot.sh start

# Check status
./bytebot.sh status
```

---

## **🔑 Required API Keys**

### **OpenRouter (Primary - 7 Models)**
1. Go to https://openrouter.ai/
2. Sign up and get API key
3. Add to .env: `OPENROUTER_API_KEY=your-key-here`

### **Google Gemini (Optional - 2 Models)**
1. Go to https://makersuite.google.com/
2. Get API key
3. Add to .env: `GEMINI_API_KEY=your-key-here`

### **Atlassian (Optional - Enterprise Features)**
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Create API token
3. Add your site URL, email, and token to .env

---

## **🌐 Access Your Platform**

After deployment:
- **Web UI**: http://localhost:9992
- **API**: http://localhost:9991
- **Desktop**: http://localhost:9990

---

## **📋 System Requirements**

- Docker & Docker Compose
- 4GB+ RAM
- 10GB+ disk space
- Internet connection for AI models

---

## **🆘 Troubleshooting**

### **Common Issues:**
- **Port conflicts**: Change ports in docker-compose.yml
- **API errors**: Verify API keys in .env
- **Build failures**: Check internet connection

### **Get Help:**
- Check logs: `./bytebot.sh logs`
- View documentation: [README.md](README.md)
- Report issues: https://github.com/fxinfo24/ByteBot-Pro/issues

---

**🎉 Welcome to ByteBot-Pro - Your 100% operational AI automation platform!**