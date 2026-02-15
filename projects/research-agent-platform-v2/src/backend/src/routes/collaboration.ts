import { Router } from 'express';
import { openClawNetwork } from '../websocket/network';

const router = Router();

// 获取在线Agent列表
router.get('/agents/online', (req, res) => {
  const agents = openClawNetwork.getOnlineAgents();
  res.json({
    count: agents.length,
    agents
  });
});

// 获取消息历史
router.get('/messages/history', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const messages = openClawNetwork.getMessageHistory(limit);
  res.json({
    count: messages.length,
    messages
  });
});

// 获取任务列表
router.get('/tasks', (req, res) => {
  const agentId = req.query.agentId as string;
  const tasks = openClawNetwork.getTasks(agentId);
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

  const sent = openClawNetwork.sendToAgent(agentId, {
    type: 'api_message',
    payload: message,
    timestamp: new Date()
  });

  if (sent) {
    res.json({ success: true, message: 'Message sent' });
  } else {
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
  const wss = (global as any).wss;
  
  if (wss) {
    wss.clients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'api_broadcast',
          payload: message,
          timestamp: new Date()
        }));
      }
    });
    
    res.json({ success: true, message: 'Broadcast sent' });
  } else {
    res.status(500).json({ error: 'WebSocket server not initialized' });
  }
});

// 获取系统状态
router.get('/status', (req, res) => {
  res.json({
    status: 'running',
    onlineAgents: openClawNetwork.getOnlineAgents().length,
    timestamp: new Date().toISOString()
  });
});

export { router as collaborationRouter };