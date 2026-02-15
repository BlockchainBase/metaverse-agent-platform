"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const http_1 = require("http");
const ws_1 = require("ws");
const routes_1 = require("./routes");
const websocket_1 = require("./websocket");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Research Agent Platform Backend',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});
// API Routes
(0, routes_1.setupRoutes)(app);
// WebSocket
const wss = new ws_1.WebSocketServer({ server });
(0, websocket_1.setupWebSocket)(wss, prisma);
const PORT = process.env.PORT || 9876;
server.listen(PORT, () => {
    logger_1.logger.info(`🚀 完整后端服务启动`);
    logger_1.logger.info(`📡 HTTP API: http://localhost:${PORT}`);
    logger_1.logger.info(`🌐 WebSocket: ws://localhost:${PORT}`);
    logger_1.logger.info(`💾 Database: PostgreSQL`);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    await prisma.$disconnect();
    server.close(() => {
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map