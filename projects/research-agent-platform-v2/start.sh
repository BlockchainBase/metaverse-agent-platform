#!/bin/bash

# 数字员工元宇宙办公室启动脚本
# Digital Employee Metaverse Office Launcher

echo "🌐 启动数字员工元宇宙办公室..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_DIR="$HOME/.openclaw/workspace/projects/metaverse-office"

# 启动后端
echo -e "${BLUE}▶ 启动后端服务...${NC}"
cd "$PROJECT_DIR/src/backend"
npx tsx src/server.ts &
BACKEND_PID=$!
echo -e "${GREEN}✓ 后端服务已启动 (PID: $BACKEND_PID)${NC}"
echo "  📡 API: http://localhost:3001/api"
echo "  🔌 WebSocket: ws://localhost:3001"
echo ""

# 等待后端启动
sleep 2

# 启动前端
echo -e "${BLUE}▶ 启动前端应用...${NC}"
cd "$PROJECT_DIR/src/frontend"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ 前端应用已启动 (PID: $FRONTEND_PID)${NC}"
echo "  🌐 http://localhost:5173"
echo ""

echo -e "${YELLOW}🚀 元宇宙办公室已就绪！${NC}"
echo ""
echo "访问地址:"
echo "  • 前端界面: http://localhost:5173"
echo "  • 后端API: http://localhost:3001/api/health"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 捕获Ctrl+C信号
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# 等待
wait
