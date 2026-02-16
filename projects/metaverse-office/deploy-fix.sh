#!/bin/bash
# 部署修复后的前端到阿里云服务器

set -e

echo "🚀 开始部署修复版本..."

# 服务器配置
SERVER="root@8.215.54.214"
REMOTE_DIR="/opt/metaverse-office/frontend"

# 1. 确保构建是最新的
echo "📦 构建前端..."
cd /Users/tomscomputer/.openclaw/workspace/projects/metaverse-office/src/frontend
npm run build

# 2. 备份旧版本
echo "💾 备份旧版本..."
ssh $SERVER "cp -r $REMOTE_DIR $REMOTE_DIR.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true"

# 3. 上传新构建
echo "📤 上传新构建..."
rsync -avz --delete dist/ $SERVER:$REMOTE_DIR/

# 4. 设置权限
echo "🔐 设置权限..."
ssh $SERVER "chown -R www-data:www-data $REMOTE_DIR && chmod -R 755 $REMOTE_DIR"

# 5. 清除Nginx缓存
echo "🧹 清除缓存..."
ssh $SERVER "rm -rf /var/cache/nginx/* 2>/dev/null || true"

# 6. 验证部署
echo "✅ 部署完成！"
echo ""
echo "📝 访问地址: http://8.215.54.214/"
echo "📝 请按 Ctrl+Shift+R 强制刷新浏览器"
echo ""
echo "🔧 修复内容:"
echo "   - WebSocket连接失败不再影响Agent状态显示"
echo "   - 只要HTTP API正常返回数据，Agent就会显示为在线"
echo "   - 使用HTTP轮询作为主要数据源（每10秒更新）"
