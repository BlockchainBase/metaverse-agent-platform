#!/bin/bash
# 数字员工元宇宙办公室 - 阿里云部署脚本
# 服务器: 8.215.54.214

set -e

# 配置
SERVER_IP="8.215.54.214"
SERVER_USER="root"
DEPLOY_DIR="/opt/metaverse-office"
LOCAL_PROJECT="$HOME/.openclaw/workspace/projects/metaverse-office"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查本地构建
check_local_build() {
    log_step "检查本地构建..."
    
    if [ ! -d "$LOCAL_PROJECT/src/frontend/dist" ]; then
        log_error "前端构建目录不存在，请先运行 npm run build"
        exit 1
    fi
    
    if [ ! -d "$LOCAL_PROJECT/src/backend/dist" ]; then
        log_error "后端构建目录不存在，请先运行 npm run build"
        exit 1
    fi
    
    log_info "本地构建检查通过"
}

# 检查服务器连接
check_server_connection() {
    log_step "检查服务器连接..."
    
    if ! ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "echo '连接成功'" > /dev/null 2>&1; then
        log_error "无法连接到服务器 $SERVER_IP"
        log_info "请确保:"
        log_info "1. SSH密钥已配置"
        log_info "2. 服务器已开机"
        log_info "3. 安全组允许SSH(22端口)"
        exit 1
    fi
    
    log_info "服务器连接正常"
}

# 创建远程目录结构
setup_remote_dirs() {
    log_step "创建远程目录结构..."
    
    ssh $SERVER_USER@$SERVER_IP << EOF
        mkdir -p $DEPLOY_DIR/{frontend,backend,config}
        mkdir -p $DEPLOY_DIR/backend/config
        echo "目录创建完成"
EOF
    
    log_info "远程目录准备完成"
}

# 部署前端
deploy_frontend() {
    log_step "部署前端应用..."
    
    log_info "同步前端文件到服务器..."
    rsync -avz --delete \
        "$LOCAL_PROJECT/src/frontend/dist/" \
        "$SERVER_USER@$SERVER_IP:$DEPLOY_DIR/frontend/"
    
    log_info "前端部署完成"
}

# 部署后端
deploy_backend() {
    log_step "部署后端服务..."
    
    log_info "同步后端文件到服务器..."
    rsync -avz --delete \
        "$LOCAL_PROJECT/src/backend/dist/" \
        "$SERVER_USER@$SERVER_IP:$DEPLOY_DIR/backend/"
    
    # 同步 package.json
    rsync -avz \
        "$LOCAL_PROJECT/src/backend/package.json" \
        "$SERVER_USER@$SERVER_IP:$DEPLOY_DIR/backend/"
    
    # 同步 config
    rsync -avz \
        "$LOCAL_PROJECT/src/backend/src/config/" \
        "$SERVER_USER@$SERVER_IP:$DEPLOY_DIR/backend/config/"
    
    log_info "后端文件同步完成"
    
    # 在服务器上安装依赖
    log_info "在服务器上安装后端依赖..."
    ssh $SERVER_USER@$SERVER_IP << EOF
        cd $DEPLOY_DIR/backend
        npm install --production 2>&1 | tail -5
        echo "依赖安装完成"
EOF
    
    log_info "后端部署完成"
}

# 创建系统服务
create_systemd_service() {
    log_step "创建系统服务..."
    
    ssh $SERVER_USER@$SERVER_IP << 'EOF'
        cat > /etc/systemd/system/metaverse-office-backend.service << 'SERVICEFILE'
[Unit]
Description=Metaverse Office Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/metaverse-office/backend
ExecStart=/usr/bin/node /opt/metaverse-office/backend/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
SERVICEFILE

        # 创建前端Nginx配置
        cat > /etc/nginx/conf.d/metaverse-office.conf << 'NGINXCONF'
server {
    listen 80;
    server_name _;
    
    location / {
        root /opt/metaverse-office/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /socket.io {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXCONF

        # 测试Nginx配置
        nginx -t 2>&1 | grep -q "successful" && echo "Nginx配置测试通过" || echo "Nginx配置测试失败"
        
        # 重载systemd
        systemctl daemon-reload
        
        # 启用服务
        systemctl enable metaverse-office-backend.service
        
        echo "系统服务创建完成"
EOF
    
    log_info "系统服务配置完成"
}

# 启动服务
start_services() {
    log_step "启动服务..."
    
    ssh $SERVER_USER@$SERVER_IP << EOF
        # 停止旧服务
        systemctl stop metaverse-office-backend 2>/dev/null || true
        
        # 启动后端服务
        systemctl start metaverse-office-backend
        sleep 2
        
        # 检查服务状态
        if systemctl is-active --quiet metaverse-office-backend; then
            echo "后端服务运行正常"
        else
            echo "后端服务启动失败，查看日志:"
            journalctl -u metaverse-office-backend -n 20 --no-pager
        fi
        
        # 重载Nginx
        systemctl reload nginx 2>/dev/null || systemctl start nginx
        
        echo "服务启动完成"
EOF
    
    log_info "服务启动完成"
}

# 显示部署状态
show_deployment_status() {
    log_step "部署状态检查..."
    
    ssh $SERVER_USER@$SERVER_IP << EOF
        echo "=== 服务状态 ==="
        systemctl is-active metaverse-office-backend && echo "后端服务: 运行中" || echo "后端服务: 未运行"
        
        echo ""
        echo "=== 端口监听 ==="
        ss -tlnp | grep -E "(:80|:3001)" || netstat -tlnp 2>/dev/null | grep -E "(:80|:3001)" || echo "端口检查需要ss或netstat"
        
        echo ""
        echo "=== 访问地址 ==="
        echo "🌐 前端: http://$SERVER_IP"
        echo "📡 API: http://$SERVER_IP/api/health"
EOF
}

# 主部署流程
main() {
    echo "🚀 数字员工元宇宙办公室 - 部署脚本"
    echo "===================================="
    echo ""
    
    check_local_build
    check_server_connection
    setup_remote_dirs
    deploy_frontend
    deploy_backend
    create_systemd_service
    start_services
    
    echo ""
    echo "===================================="
    log_info "✅ 部署完成！"
    echo ""
    show_deployment_status
    echo ""
    echo "访问地址:"
    echo "  🌐 http://$SERVER_IP"
    echo "  📡 http://$SERVER_IP/api/health"
}

# 执行部署
main
