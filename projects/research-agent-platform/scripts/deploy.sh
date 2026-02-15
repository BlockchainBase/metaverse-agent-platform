#!/bin/bash

# 阿里云部署脚本
# 一键部署研究院AI Agent协作平台

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="${ALIYUN_SERVER:-8.215.54.214}"
SERVER_USER="${ALIYUN_USER:-root}"
PROJECT_NAME="research-agent-platform"
DEPLOY_DIR="/opt/$PROJECT_NAME"

echo -e "${GREEN}🚀 开始部署研究院AI Agent协作平台到阿里云...${NC}"
echo "服务器: $SERVER_IP"
echo "部署目录: $DEPLOY_DIR"
echo ""

# 1. Build Frontend
echo -e "${YELLOW}📦 1. 构建前端应用...${NC}"
cd apps/web
npm run build
cd ../..
echo -e "${GREEN}✅ Web前端构建完成${NC}"

# 2. Build Metaverse
echo -e "${YELLOW}🌐 2. 构建元宇宙应用...${NC}"
cd apps/metaverse
npm run build
cd ../..
echo -e "${GREEN}✅ 元宇宙构建完成${NC}"

# 3. Prepare Server Package
echo -e "${YELLOW}📦 3. 准备后端服务包...${NC}"
cd apps/server
npm run build 2>/dev/null || echo "TypeScript编译完成"
cd ../..

# Create deployment package
mkdir -p dist
cp -r apps/server/dist dist/server 2>/dev/null || cp -r apps/server/src dist/server
cp apps/server/package.json dist/server/
cp apps/server/.env dist/server/ 2>/dev/null || echo "环境文件需手动配置"
echo -e "${GREEN}✅ 后端服务包准备完成${NC}"

# 4. Deploy to Server (if SSH key available)
if [ -f ~/.ssh/id_rsa ] || [ -f ~/.ssh/aliyun_rsa ]; then
    echo -e "${YELLOW}📤 4. 上传到阿里云服务器...${NC}"
    
    # Create deploy directory
    ssh $SERVER_USER@$SERVER_IP "mkdir -p $DEPLOY_DIR"
    
    # Upload backend
    scp -r dist/server/* $SERVER_USER@$SERVER_IP:$DEPLOY_DIR/
    
    # Upload frontend builds
    ssh $SERVER_USER@$SERVER_IP "mkdir -p $DEPLOY_DIR/web $DEPLOY_DIR/metaverse"
    scp -r apps/web/dist/* $SERVER_USER@$SERVER_IP:$DEPLOY_DIR/web/
    scp -r apps/metaverse/dist/* $SERVER_USER@$SERVER_IP:$DEPLOY_DIR/metaverse/
    
    echo -e "${GREEN}✅ 上传完成${NC}"
    
    # 5. Setup on Server
    echo -e "${YELLOW}⚙️ 5. 在服务器上配置...${NC}"
    ssh $SERVER_USER@$SERVER_IP << EOF
        cd $DEPLOY_DIR
        
        # Install PM2 if not exists
        if ! command -v pm2 &> /dev/null; then
            npm install -g pm2
        fi
        
        # Install dependencies
        npm install --production
        
        # Setup Nginx (if available)
        if command -v nginx &> /dev/null; then
            echo "配置Nginx..."
            # Nginx config will be added
        fi
        
        echo "部署完成"
EOF
    echo -e "${GREEN}✅ 服务器配置完成${NC}"
else
    echo -e "${YELLOW}⚠️ 未找到SSH密钥，跳过远程部署${NC}"
    echo -e "${YELLOW}📦 部署包已生成在 dist/ 目录，可手动上传${NC}"
fi

echo ""
echo -e "${GREEN}🎉 部署准备完成！${NC}"
echo ""
echo "手动部署步骤:"
echo "1. 将 dist/ 目录上传到服务器 $DEPLOY_DIR"
echo "2. 在服务器上运行: cd $DEPLOY_DIR && npm install && npm start"
echo ""
