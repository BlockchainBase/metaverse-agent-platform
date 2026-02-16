#!/bin/bash
#
# 11 Agent 模拟系统控制脚本
# 用法: ./simulation.sh [start|stop|status|restart|pause|resume]
#

SIMULATION_DIR="/Users/tomscomputer/.openclaw/workspace/projects/metaverse-office"
PID_FILE="$SIMULATION_DIR/simulation.pid"
LOG_FILE="$SIMULATION_DIR/simulation.log"

cd "$SIMULATION_DIR" || exit 1

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查进程是否在运行
check_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            return 0
        fi
    fi
    return 1
}

# 启动模拟
start() {
    if check_running; then
        echo -e "${YELLOW}⚠️  模拟系统已在运行中 (PID: $(cat $PID_FILE))${NC}"
        return 1
    fi
    
    echo -e "${GREEN}🚀 启动11 Agent模拟系统...${NC}"
    
    # 使用ts-node直接运行TypeScript
    cd src/backend && npx ts-node ../simulation/index.ts > "$LOG_FILE" 2>&1 &
    
    # 保存PID
    echo $! > "$PID_FILE"
    
    sleep 2
    
    if check_running; then
        echo -e "${GREEN}✅ 模拟系统已启动${NC}"
        echo -e "   PID: $(cat $PID_FILE)"
        echo -e "   日志: $LOG_FILE"
        echo -e "   WebSocket: ws://localhost:3002"
    else
        echo -e "${RED}❌ 启动失败，查看日志: $LOG_FILE${NC}"
        return 1
    fi
}

# 停止模拟
stop() {
    if ! check_running; then
        echo -e "${YELLOW}⚠️  模拟系统未在运行${NC}"
        rm -f "$PID_FILE"
        return 0
    fi
    
    PID=$(cat "$PID_FILE")
    echo -e "${YELLOW}🛑 停止模拟系统 (PID: $PID)...${NC}"
    
    # 发送SIGTERM信号
    kill -TERM "$PID" 2>/dev/null
    
    # 等待进程结束
    for i in {1..10}; do
        if ! ps -p "$PID" > /dev/null 2>&1; then
            break
        fi
        sleep 1
    done
    
    # 强制结束
    if ps -p "$PID" > /dev/null 2>&1; then
        kill -KILL "$PID" 2>/dev/null
    fi
    
    rm -f "$PID_FILE"
    echo -e "${GREEN}✅ 模拟系统已停止${NC}"
}

# 查看状态
status() {
    if check_running; then
        PID=$(cat "$PID_FILE")
        echo -e "${GREEN}✅ 模拟系统运行中${NC}"
        echo -e "   PID: $PID"
        echo -e "   WebSocket: ws://localhost:3002"
        
        # 显示最后几行日志
        if [ -f "$LOG_FILE" ]; then
            echo -e "\n${YELLOW}📊 最近日志:${NC}"
            tail -n 5 "$LOG_FILE"
        fi
    else
        echo -e "${RED}⏹️  模拟系统未运行${NC}"
        rm -f "$PID_FILE"
    fi
}

# 暂停
pause() {
    if ! check_running; then
        echo -e "${YELLOW}⚠️  模拟系统未在运行${NC}"
        return 1
    fi
    
    # 通过WebSocket发送暂停指令
    echo -e "${YELLOW}⏸️  暂停模拟系统...${NC}"
    # 实际实现需要通过WebSocket或API调用
    echo -e "${YELLOW}(此功能需要实现控制API)${NC}"
}

# 恢复
resume() {
    if ! check_running; then
        echo -e "${YELLOW}⚠️  模拟系统未在运行${NC}"
        return 1
    fi
    
    echo -e "${GREEN}▶️  恢复模拟系统...${NC}"
    # 实际实现需要通过WebSocket或API调用
    echo -e "${YELLOW}(此功能需要实现控制API)${NC}"
}

# 查看日志
logs() {
    if [ -f "$LOG_FILE" ]; then
        tail -f "$LOG_FILE"
    else
        echo -e "${RED}❌ 日志文件不存在${NC}"
    fi
}

# 主命令处理
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        sleep 2
        start
        ;;
    status)
        status
        ;;
    pause)
        pause
        ;;
    resume)
        resume
        ;;
    logs)
        logs
        ;;
    *)
        echo "用法: $0 [start|stop|restart|status|pause|resume|logs]"
        echo ""
        echo "命令说明:"
        echo "  start    - 启动模拟系统"
        echo "  stop     - 停止模拟系统"
        echo "  restart  - 重启模拟系统"
        echo "  status   - 查看运行状态"
        echo "  pause    - 暂停模拟 (开发中)"
        echo "  resume   - 恢复模拟 (开发中)"
        echo "  logs     - 查看实时日志"
        exit 1
        ;;
esac
