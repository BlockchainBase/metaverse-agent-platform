"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
// Express服务器入口
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const api_1 = __importDefault(require("./routes/api"));
const dataService_1 = __importDefault(require("./services/dataService"));
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
exports.io = io;
const PORT = process.env.PORT || 3001;
const dataService = new dataService_1.default();
// 中间件
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API路由
app.use('/api', api_1.default);
// WebSocket连接处理
io.on('connection', (socket) => {
    console.log('客户端已连接:', socket.id);
    // 发送初始数据
    sendRealtimeData(socket);
    // 定时推送实时数据（每5秒）
    const interval = setInterval(() => {
        sendRealtimeData(socket);
    }, 5000);
    // 处理断开连接
    socket.on('disconnect', () => {
        console.log('客户端已断开:', socket.id);
        clearInterval(interval);
    });
    // 处理客户端请求
    socket.on('request_update', async () => {
        await sendRealtimeData(socket);
    });
});
// 发送实时数据
async function sendRealtimeData(socket) {
    try {
        const data = await dataService.getRealtimeData();
        socket.emit('realtime_update', data);
    }
    catch (error) {
        console.error('发送实时数据失败:', error);
    }
}
// 启动服务器
httpServer.listen(PORT, () => {
    console.log(`🚀 元宇宙办公室后端服务已启动`);
    console.log(`📡 HTTP API: http://localhost:${PORT}/api`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    console.log(`💚 健康检查: http://localhost:${PORT}/api/health`);
});
//# sourceMappingURL=server.js.map