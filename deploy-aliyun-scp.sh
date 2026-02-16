#!/bin/bash
# 数字员工元宇宙平台 - 阿里云部署脚本 (SCP版本)
# 服务器: 8.215.54.214

set -e

SERVER_IP="8.215.54.214"
SERVER_USER="root"
DEPLOY_DIR="/opt/metaverse-office"
LOCAL_PROJECT="$HOME/.openclaw/workspace/projects/metaverse-office"

echo "🚀 数字员工元宇宙平台 - 阿里云部署"
echo "===================================="
echo ""

# 检查本地构建
echo "📋 检查本地构建..."
if [ ! -d "$LOCAL_PROJECT/src/frontend/dist" ]; then
    echo "❌ 前端构建目录不存在"
    exit 1
fi
if [ ! -d "$LOCAL_PROJECT/src/backend/dist" ]; then
    echo "❌ 后端构建目录不存在"
    exit 1
fi
echo "✅ 本地构建检查通过"
echo ""

# 创建远程目录
echo "📁 创建远程目录结构..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $DEPLOY_DIR/{frontend,backend,config,data} && echo '目录创建完成'"
echo ""

# 部署前端
echo "📦 部署前端应用..."
ssh $SERVER_USER@$SERVER_IP "rm -rf $DEPLOY_DIR/frontend/*"
scp -r "$LOCAL_PROJECT/src/frontend/dist/"* "$SERVER_USER@$SERVER_IP:$DEPLOY_DIR/frontend/" 2>&1 | tail -5
echo "✅ 前端部署完成"
echo ""

# 部署后端
echo "📦 部署后端服务..."
ssh $SERVER_USER@$SERVER_IP "rm -rf $DEPLOY_DIR/backend/*"
scp -r "$LOCAL_PROJECT/src/backend/dist/"* "$SERVER_USER@$SERVER_IP:$DEPLOY_DIR/backend/" 2>&1 | tail -5

# 复制 package.json
scp "$LOCAL_PROJECT/src/backend/package.json" "$SERVER_USER@$SERVER_IP:$DEPLOY_DIR/backend/"

# 复制数据库文件（包含模拟数据）
if [ -f "$LOCAL_PROJECT/simulation.db" ]; then
    echo "📦 复制模拟数据库..."
    scp "$LOCAL_PROJECT/simulation.db" "$SERVER_USER@$SERVER_IP:$DEPLOY_DIR/data/"
fi

echo "✅ 后端文件同步完成"
echo ""

# 安装依赖并启动服务
echo "🔧 服务器端配置..."
ssh $SERVER_USER@$SERVER_IP << 'REMOTECOMMANDS'
# 安装后端依赖
cd /opt/metaverse-office/backend
npm install --production 2>&1 | tail -10

# 创建模拟系统启动脚本
cat > /opt/metaverse-office/start-simulation.sh << 'STARTSCRIPT'
#!/bin/bash
cd /opt/metaverse-office/backend
node simulation/index.js > /var/log/metaverse-simulation.log 2>&1 &
echo $! > /var/run/metaverse-simulation.pid
echo "模拟系统已启动，PID: $!"
STARTSCRIPT
chmod +x /opt/metaverse-office/start-simulation.sh

# 创建后端服务启动脚本
cat > /opt/metaverse-office/start-backend.sh << 'BACKENDSCRIPT'
#!/bin/bash
cd /opt/metaverse-office/backend
node server.js > /var/log/metaverse-backend.log 2>&1 &
echo $! > /var/run/metaverse-backend.pid
echo "后端服务已启动，PID: $!"
BACKENDSCRIPT
chmod +x /opt/metaverse-office/start-backend.sh

# 停止旧服务
pkill -f "node.*metaverse" 2>/dev/null || true
sleep 2

# 启动服务
echo "🚀 启动服务..."
/opt/metaverse-office/start-backend.sh
sleep 3
/opt/metaverse-office/start-simulation.sh

# 配置Nginx
cat > /etc/nginx/conf.d/metaverse-office.conf << 'NGINXCONF'
server {
    listen 80;
    server_name _;
    
    # 前端静态文件
    location / {
        root /opt/metaverse-office/frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
    
    # 后端API代理
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # WebSocket代理
    location /socket.io {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINXCONF

# 测试并重载Nginx
nginx -t && systemctl reload nginx || systemctl restart nginx

echo "✅ 服务配置完成"
REMOTECOMMANDS

echo ""
echo "===================================="
echo "✅ 部署完成！"
echo ""
echo "🌐 访问地址:"
echo "  前端: http://$SERVER_IP"
echo "  API: http://$SERVER_IP/api/state"
echo ""
echo "📊 检查服务状态:"
ssh $SERVER_USER@$SERVER_IP "ps aux | grep node | grep metaverse && echo '✅ 服务运行中' || echo '⚠️ 服务状态检查'"
echo ""
