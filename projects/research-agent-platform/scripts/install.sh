#!/bin/bash

# 阿里云服务器安装脚本
# 在服务器上运行此脚本完成部署

set -e

echo "🚀 研究院AI Agent协作平台 - 安装脚本"
echo "========================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ 请使用 root 权限运行此脚本"
    exit 1
fi

# Install Docker if not exists
if ! command -v docker &> /dev/null; then
    echo "📦 安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "✅ Docker 安装完成"
else
    echo "✅ Docker 已安装"
fi

# Install Docker Compose if not exists
if ! command -v docker-compose &> /dev/null; then
    echo "📦 安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose 安装完成"
else
    echo "✅ Docker Compose 已安装"
fi

# Create deployment directory
DEPLOY_DIR="/opt/research-agent-platform"
echo "📁 创建部署目录: $DEPLOY_DIR"
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# Create environment file
echo "⚙️ 创建环境配置文件..."
cat > .env << EOF
# Database
DB_USER=postgres
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-16)
DB_NAME=research_agent_platform

# JWT
JWT_SECRET=$(openssl rand -base64 64)

# Feishu (optional)
FEISHU_APP_ID=
FEISHU_APP_SECRET=
FEISHU_PROJECT_CHAT_ID=

# URLs
WEB_URL=http://localhost
API_URL=http://localhost/api
EOF

echo "✅ 环境配置文件创建完成"
echo "⚠️ 请编辑 .env 文件配置飞书集成"

# Create data directories
echo "📁 创建数据目录..."
mkdir -p data/postgres data/redis logs ssl

# Pull and start services
echo "🚀 启动服务..."
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "✅ 部署完成！"
echo ""
echo "服务地址:"
echo "  - 管理后台: http://$(curl -s ifconfig.me)"
echo "  - 后端API: http://$(curl -s ifconfig.me)/api"
echo "  - 元宇宙: http://$(curl -s ifconfig.me)/metaverse"
echo ""
echo "查看日志: docker-compose -f docker-compose.prod.yml logs -f"
echo "停止服务: docker-compose -f docker-compose.prod.yml down"
echo ""
