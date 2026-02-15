import { WebSocketServer, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

interface OpenClawConnection {
  id: string;
  ws: WebSocket;
  agentId: string;
  agentName: string;
  ownerName: string;
  connectedAt: Date;
  lastPing: Date;
}

export function setupWebSocket(wss: WebSocketServer, prisma: PrismaClient) {
  const connections: Map<string, OpenClawConnection> = new Map();

  wss.on('connection', async (ws: WebSocket, req) => {
    logger.info(`📱 新WebSocket连接: ${req.socket.remoteAddress}`);

    // 等待身份验证
    ws.once('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          const { agentId, agentName, ownerName } = message.payload;
          
          // 查找或创建Agent
          let agent = await prisma.agent.findUnique({
            where: { agentId }
          });
          
          if (!agent) {
            agent = await prisma.agent.create({
              data: {
                agentId,
                name: agentName,
                role: 'MARKET', // 默认角色，应从前端传入
                ownerName: ownerName || 'Unknown',
                ownerEmail: '',
                status: 'online'
              }
            });
          } else {
            // 更新状态为在线
            await prisma.agent.update({
              where: { id: agent.id },
              data: { status: 'online', lastSeen: new Date() }
            });
          }

          // 保存连接
          const connection: OpenClawConnection = {
            id: agent.id,
            ws,
            agentId,
            agentName,
            ownerName: ownerName || 'Unknown',
            connectedAt: new Date(),
            lastPing: new Date()
          };
          
          connections.set(agent.id, connection);
          
          logger.info(`✅ Agent已连接: ${agentName} (${ownerName})`);

          // 发送连接成功
          ws.send(JSON.stringify({
            type: 'system',
            payload: {
              event: 'connected',
              agentId: agent.id,
              message: 'Welcome to OpenClaw Collaboration Network',
              onlineAgents: Array.from(connections.values()).map(c => ({
                agentId: c.agentId,
                agentName: c.agentName,
                ownerName: c.ownerName
              }))
            }
          }));

          // 广播新Agent上线
          broadcastToOthers(connections, agent.id, {
            type: 'system',
            payload: {
              event: 'agent_online',
              agentId,
              agentName,
              ownerName
            }
          });

          // 设置消息处理器
          setupMessageHandler(ws, connection, connections, prisma);
        } else {
          ws.close(1002, 'Authentication required');
        }
      } catch (error) {
        logger.error('Authentication error:', error);
        ws.close(1002, 'Authentication failed');
      }
    });

    // 处理断开
    ws.on('close', async () => {
      for (const [id, conn] of connections.entries()) {
        if (conn.ws === ws) {
          logger.info(`❌ Agent已断开: ${conn.agentName}`);
          
          // 更新状态为离线
          await prisma.agent.update({
            where: { id },
            data: { status: 'offline' }
          });
          
          connections.delete(id);
          
          // 广播离线
          broadcastToOthers(connections, id, {
            type: 'system',
            payload: {
              event: 'agent_offline',
              agentId: conn.agentId,
              agentName: conn.agentName
            }
          });
          
          break;
        }
      }
    });
  });

  // 心跳检测
  setInterval(() => {
    const now = new Date();
    connections.forEach((conn, id) => {
      if (now.getTime() - conn.lastPing.getTime() > 60000) {
        logger.info(`⏱️ Agent超时: ${conn.agentName}`);
        conn.ws.close();
        connections.delete(id);
      }
    });
  }, 30000);
}

function setupMessageHandler(
  ws: WebSocket,
  connection: OpenClawConnection,
  connections: Map<string, OpenClawConnection>,
  prisma: PrismaClient
) {
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      connection.lastPing = new Date();

      switch (message.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;

        case 'collaboration_message':
          await handleCollaborationMessage(message.payload, connection, connections, prisma);
          break;

        case 'broadcast':
          broadcastToOthers(connections, connection.id, {
            type: 'broadcast',
            from: {
              agentId: connection.agentId,
              agentName: connection.agentName,
              ownerName: connection.ownerName
            },
            payload: message.payload
          });
          break;

        default:
          logger.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      logger.error('Message handling error:', error);
    }
  });
}

async function handleCollaborationMessage(
  payload: any,
  fromConnection: OpenClawConnection,
  connections: Map<string, OpenClawConnection>,
  prisma: PrismaClient
) {
  // 保存消息到数据库
  const message = await prisma.message.create({
    data: {
      fromAgentId: fromConnection.id,
      toAgentId: payload.to || null,
      type: payload.to ? 'DIRECT' : 'BROADCAST',
      content: payload.content?.text || '',
      data: payload.content?.data || {},
      priority: payload.priority || 'NORMAL'
    }
  });

  // 发送给目标
  if (payload.to) {
    // 查找目标Agent
    const targetAgent = await prisma.agent.findUnique({
      where: { agentId: payload.to }
    });
    
    if (targetAgent) {
      const targetConn = connections.get(targetAgent.id);
      if (targetConn) {
        targetConn.ws.send(JSON.stringify({
          type: 'collaboration_message',
          payload: {
            id: message.id,
            from: {
              agentId: fromConnection.agentId,
              agentName: fromConnection.agentName,
              ownerName: fromConnection.ownerName
            },
            content: payload.content,
            timestamp: message.createdAt
          }
        }));
      }
    }
  } else {
    // 广播
    broadcastToOthers(connections, fromConnection.id, {
      type: 'collaboration_message',
      payload: {
        id: message.id,
        from: {
          agentId: fromConnection.agentId,
          agentName: fromConnection.agentName,
          ownerName: fromConnection.ownerName
        },
        content: payload.content,
        timestamp: message.createdAt
      }
    });
  }
}

function broadcastToOthers(
  connections: Map<string, OpenClawConnection>,
  excludeId: string,
  message: any
) {
  connections.forEach((conn, id) => {
    if (id !== excludeId && conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(JSON.stringify(message));
    }
  });
}