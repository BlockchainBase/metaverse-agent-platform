"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openClawNetwork = exports.OpenClawNetwork = void 0;
const ws_1 = require("ws");
const uuid_1 = require("uuid");
// OpenClaw协作网络管理器
class OpenClawNetwork {
    constructor() {
        this.wss = null;
        this.connections = new Map();
        this.messageHistory = [];
        this.tasks = new Map();
        this.messageHandlers = new Map();
    }
    // 初始化WebSocket服务器
    initialize(port = 3003) {
        this.wss = new ws_1.WebSocketServer({ port });
        console.log(`🌐 OpenClaw协作网络启动于端口 ${port}`);
        this.wss.on('connection', (socket, req) => {
            console.log(`📱 新设备连接: ${req.socket.remoteAddress}`);
            // 等待身份验证消息
            socket.once('message', (data) => {
                try {
                    const authMessage = JSON.parse(data.toString());
                    if (authMessage.type === 'auth') {
                        this.handleAuthentication(socket, authMessage.payload);
                    }
                    else {
                        socket.close(1002, 'Authentication required');
                    }
                }
                catch (error) {
                    socket.close(1002, 'Invalid message format');
                }
            });
            // 处理断开连接
            socket.on('close', () => {
                this.handleDisconnection(socket);
            });
            // 处理错误
            socket.on('error', (error) => {
                console.error('WebSocket error:', error);
            });
        });
        // 启动心跳检测
        this.startHeartbeat();
    }
    // 处理身份验证
    handleAuthentication(socket, payload) {
        const { agentId, agentName, ownerName, deviceInfo } = payload;
        if (!agentId || !agentName) {
            socket.close(1002, 'Missing required fields');
            return;
        }
        // 创建连接记录
        const connection = {
            id: (0, uuid_1.v4)(),
            socket,
            agentId,
            agentName,
            ownerName: ownerName || 'Unknown',
            deviceInfo: deviceInfo || { deviceId: 'unknown', hostName: 'unknown', platform: 'unknown' },
            connectedAt: new Date(),
            lastPing: new Date(),
            status: 'online'
        };
        this.connections.set(agentId, connection);
        console.log(`✅ Agent已连接: ${agentName} (${ownerName})`);
        // 发送连接成功消息
        this.sendToSocket(socket, {
            type: 'system',
            payload: {
                event: 'connected',
                message: 'Welcome to OpenClaw Collaboration Network',
                onlineAgents: this.getOnlineAgents()
            }
        });
        // 广播新Agent上线
        this.broadcast({
            type: 'system',
            payload: {
                event: 'agent_online',
                agentId,
                agentName,
                ownerName
            }
        }, agentId); // 不发送给自己
        // 设置消息处理器
        socket.on('message', (data) => {
            this.handleMessage(agentId, data);
        });
    }
    // 处理消息
    handleMessage(agentId, data) {
        try {
            const message = JSON.parse(data.toString());
            const connection = this.connections.get(agentId);
            if (!connection)
                return;
            switch (message.type) {
                case 'ping':
                    connection.lastPing = new Date();
                    this.sendToSocket(connection.socket, { type: 'pong' });
                    break;
                case 'status_update':
                    connection.status = message.payload.status;
                    this.broadcast({
                        type: 'system',
                        payload: {
                            event: 'status_changed',
                            agentId,
                            status: message.payload.status
                        }
                    });
                    break;
                case 'collaboration_message':
                    this.handleCollaborationMessage(agentId, message.payload);
                    break;
                case 'task_create':
                    this.handleTaskCreate(agentId, message.payload);
                    break;
                case 'task_update':
                    this.handleTaskUpdate(agentId, message.payload);
                    break;
                case 'broadcast':
                    this.broadcast({
                        type: 'broadcast',
                        from: {
                            agentId: connection.agentId,
                            agentName: connection.agentName,
                            ownerName: connection.ownerName
                        },
                        content: message.payload
                    });
                    break;
                default:
                    console.log(`Unknown message type: ${message.type}`);
            }
        }
        catch (error) {
            console.error('Error handling message:', error);
        }
    }
    // 处理协作消息
    handleCollaborationMessage(fromAgentId, payload) {
        const connection = this.connections.get(fromAgentId);
        if (!connection)
            return;
        const message = {
            id: (0, uuid_1.v4)(),
            type: payload.type || 'direct',
            from: {
                agentId: connection.agentId,
                agentName: connection.agentName,
                ownerName: connection.ownerName
            },
            to: payload.to,
            content: payload.content,
            timestamp: new Date(),
            priority: payload.priority || 'normal',
            requiresResponse: payload.requiresResponse || false,
            responseTimeout: payload.responseTimeout
        };
        // 保存消息历史
        this.messageHistory.push(message);
        if (this.messageHistory.length > 1000) {
            this.messageHistory.shift(); // 限制历史记录数量
        }
        // 发送消息
        if (message.to) {
            // 直接消息
            const targetConnection = this.connections.get(message.to);
            if (targetConnection) {
                this.sendToSocket(targetConnection.socket, {
                    type: 'collaboration_message',
                    payload: message
                });
                // 通知发送者消息已送达
                this.sendToSocket(connection.socket, {
                    type: 'message_delivered',
                    payload: { messageId: message.id, to: message.to }
                });
            }
            else {
                // 目标不在线
                this.sendToSocket(connection.socket, {
                    type: 'message_failed',
                    payload: { messageId: message.id, reason: 'Agent offline' }
                });
            }
        }
        else {
            // 广播消息
            this.broadcast({
                type: 'collaboration_message',
                payload: message
            }, fromAgentId);
        }
        // 触发回调
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
            handler(message);
        }
    }
    // 处理任务创建
    handleTaskCreate(assignerId, payload) {
        const connection = this.connections.get(assignerId);
        if (!connection)
            return;
        const task = {
            id: (0, uuid_1.v4)(),
            title: payload.title,
            description: payload.description,
            assigner: assignerId,
            assignees: payload.assignees || [],
            projectId: payload.projectId,
            status: 'pending',
            priority: payload.priority || 'medium',
            createdAt: new Date(),
            updatedAt: new Date(),
            dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
            messages: []
        };
        this.tasks.set(task.id, task);
        // 通知任务创建者
        this.sendToSocket(connection.socket, {
            type: 'task_created',
            payload: { taskId: task.id, task }
        });
        // 通知被分配者
        task.assignees.forEach(assigneeId => {
            const assigneeConnection = this.connections.get(assigneeId);
            if (assigneeConnection) {
                this.sendToSocket(assigneeConnection.socket, {
                    type: 'task_assigned',
                    payload: { taskId: task.id, task, from: connection.agentName }
                });
            }
        });
    }
    // 处理任务更新
    handleTaskUpdate(agentId, payload) {
        const task = this.tasks.get(payload.taskId);
        if (!task)
            return;
        const connection = this.connections.get(agentId);
        if (!connection)
            return;
        // 更新任务
        if (payload.status)
            task.status = payload.status;
        if (payload.assignees)
            task.assignees = payload.assignees;
        task.updatedAt = new Date();
        // 通知相关人员
        const relatedAgents = new Set([task.assigner, ...task.assignees]);
        relatedAgents.forEach(relatedId => {
            if (relatedId === agentId)
                return; // 不通知自己
            const relatedConnection = this.connections.get(relatedId);
            if (relatedConnection) {
                this.sendToSocket(relatedConnection.socket, {
                    type: 'task_updated',
                    payload: { taskId: task.id, task, updatedBy: connection.agentName }
                });
            }
        });
    }
    // 广播消息
    broadcast(message, excludeAgentId) {
        this.connections.forEach((connection, agentId) => {
            if (excludeAgentId && agentId === excludeAgentId)
                return;
            if (connection.socket.readyState === ws_1.WebSocket.OPEN) {
                this.sendToSocket(connection.socket, message);
            }
        });
    }
    // 发送消息到指定socket
    sendToSocket(socket, message) {
        if (socket.readyState === ws_1.WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    }
    // 处理断开连接
    handleDisconnection(socket) {
        for (const [agentId, connection] of this.connections.entries()) {
            if (connection.socket === socket) {
                console.log(`❌ Agent已断开: ${connection.agentName}`);
                this.connections.delete(agentId);
                // 广播Agent离线
                this.broadcast({
                    type: 'system',
                    payload: {
                        event: 'agent_offline',
                        agentId,
                        agentName: connection.agentName
                    }
                });
                break;
            }
        }
    }
    // 启动心跳检测
    startHeartbeat() {
        setInterval(() => {
            const now = new Date();
            const timeout = 60000; // 60秒超时
            this.connections.forEach((connection, agentId) => {
                if (now.getTime() - connection.lastPing.getTime() > timeout) {
                    console.log(`⏱️ Agent超时: ${connection.agentName}`);
                    connection.socket.close();
                    this.connections.delete(agentId);
                }
            });
        }, 30000); // 每30秒检查一次
    }
    // 获取在线Agent列表
    getOnlineAgents() {
        return Array.from(this.connections.values()).map(conn => ({
            agentId: conn.agentId,
            agentName: conn.agentName,
            ownerName: conn.ownerName,
            status: conn.status
        }));
    }
    // 获取消息历史
    getMessageHistory(limit = 100) {
        return this.messageHistory.slice(-limit);
    }
    // 获取任务列表
    getTasks(agentId) {
        const tasks = Array.from(this.tasks.values());
        if (agentId) {
            return tasks.filter(task => task.assigner === agentId || task.assignees.includes(agentId));
        }
        return tasks;
    }
    // 注册消息处理器
    onMessage(type, handler) {
        this.messageHandlers.set(type, handler);
    }
    // 向特定Agent发送消息
    sendToAgent(agentId, message) {
        const connection = this.connections.get(agentId);
        if (connection && connection.socket.readyState === ws_1.WebSocket.OPEN) {
            this.sendToSocket(connection.socket, message);
            return true;
        }
        return false;
    }
}
exports.OpenClawNetwork = OpenClawNetwork;
// 导出单例
exports.openClawNetwork = new OpenClawNetwork();
//# sourceMappingURL=network.js.map