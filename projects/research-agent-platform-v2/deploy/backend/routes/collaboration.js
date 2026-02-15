"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collaborationRouter = void 0;
const express_1 = require("express");
const network_1 = require("../websocket/network");
const router = (0, express_1.Router)();
exports.collaborationRouter = router;
// 获取在线Agent列表
router.get('/agents/online', (req, res) => {
    const agents = network_1.openClawNetwork.getOnlineAgents();
    res.json({
        count: agents.length,
        agents
    });
});
// 获取消息历史
router.get('/messages/history', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const messages = network_1.openClawNetwork.getMessageHistory(limit);
    res.json({
        count: messages.length,
        messages
    });
});
// 获取任务列表
router.get('/tasks', (req, res) => {
    const agentId = req.query.agentId;
    const tasks = network_1.openClawNetwork.getTasks(agentId);
    res.json({
        count: tasks.length,
        tasks
    });
});
// 发送消息到指定Agent
router.post('/message/send', (req, res) => {
    const { agentId, message } = req.body;
    if (!agentId || !message) {
        return res.status(400).json({ error: 'Missing agentId or message' });
    }
    const sent = network_1.openClawNetwork.sendToAgent(agentId, {
        type: 'api_message',
        payload: message,
        timestamp: new Date()
    });
    if (sent) {
        res.json({ success: true, message: 'Message sent' });
    }
    else {
        res.status(404).json({ error: 'Agent not found or offline' });
    }
});
// 广播消息到所有Agent
router.post('/message/broadcast', (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Missing message' });
    }
    // 使用WebSocket广播
    const WebSocket = require('ws');
    const wss = global.wss;
    if (wss) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'api_broadcast',
                    payload: message,
                    timestamp: new Date()
                }));
            }
        });
        res.json({ success: true, message: 'Broadcast sent' });
    }
    else {
        res.status(500).json({ error: 'WebSocket server not initialized' });
    }
});
// 获取系统状态
router.get('/status', (req, res) => {
    res.json({
        status: 'running',
        onlineAgents: network_1.openClawNetwork.getOnlineAgents().length,
        timestamp: new Date().toISOString()
    });
});
//# sourceMappingURL=collaboration.js.map