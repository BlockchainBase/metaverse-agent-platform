import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { config } from '@/config';
import { verifyAccessToken } from '@/utils';
import { heartbeatService } from '@/services';
import { taskEvents, taskService } from '@/services/task.service';
import { heartbeatEvents } from '@/services/heartbeat.service';
import { IWebSocketMessage, IHeartbeatData } from '@/types';

// Socket.io 实例
let io: SocketIOServer | null = null;

// 存储已认证的连接
const authenticatedSockets: Map<string, Socket> = new Map();

// 初始化 WebSocket 服务器
export const initializeWebSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingInterval: config.websocket.pingInterval,
    pingTimeout: config.websocket.pingTimeout,
  });

  // 中间件：验证 JWT
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verifyAccessToken(token as string);
      (socket as any).agentId = decoded.agentId;
      (socket as any).agentDbId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // 连接处理
  io.on('connection', (socket: Socket) => {
    const agentId = (socket as any).agentId as string;
    const agentDbId = (socket as any).agentDbId as string;

    console.log(`Agent ${agentId} connected via WebSocket`);
    
    // 存储连接
    authenticatedSockets.set(agentId, socket);

    // 发送欢迎消息
    socket.emit('connected', {
      type: 'connected',
      payload: {
        agentId,
        timestamp: Date.now(),
        message: 'Connected to metaverse platform',
      },
    });

    // 广播用户上线
    socket.broadcast.emit('agent:online', {
      type: 'agent:online',
      payload: {
        agentId,
        timestamp: Date.now(),
      },
    });

    // 处理心跳
    socket.on('heartbeat', async (data: IHeartbeatData) => {
      try {
        await heartbeatService.recordHeartbeat(agentId, data);
        
        // 确认收到
        socket.emit('heartbeat:ack', {
          type: 'heartbeat:ack',
          payload: {
            receivedAt: Date.now(),
          },
        });
      } catch (error) {
        socket.emit('error', {
          type: 'error',
          payload: {
            message: 'Failed to record heartbeat',
            error: (error as Error).message,
          },
        });
      }
    });

    // 处理任务更新
    socket.on('task:update', async (data: { taskId: string; status: string; result?: any }) => {
      try {
        // 更新任务状态
        await taskService.updateTask(data.taskId, {
          status: data.status as any,
          result: data.result,
        });

        socket.emit('task:update:ack', {
          type: 'task:update:ack',
          payload: {
            taskId: data.taskId,
            status: data.status,
          },
        });
      } catch (error) {
        socket.emit('error', {
          type: 'error',
          payload: {
            message: 'Failed to update task',
            error: (error as Error).message,
          },
        });
      }
    });

    // 处理任务认领
    socket.on('task:claim', async (data: { taskId: string }) => {
      try {
        const task = await taskService.assignTask(data.taskId, agentDbId);
        
        socket.emit('task:claim:success', {
          type: 'task:claim:success',
          payload: task,
        });
      } catch (error) {
        socket.emit('task:claim:error', {
          type: 'task:claim:error',
          payload: {
            message: 'Failed to claim task',
            error: (error as Error).message,
          },
        });
      }
    });

    // 处理断开连接
    socket.on('disconnect', async (reason) => {
      console.log(`Agent ${agentId} disconnected: ${reason}`);
      
      authenticatedSockets.delete(agentId);

      // 广播用户离线
      socket.broadcast.emit('agent:offline', {
        type: 'agent:offline',
        payload: {
          agentId,
          timestamp: Date.now(),
          reason,
        },
      });
    });

    // 错误处理
    socket.on('error', (error) => {
      console.error(`Socket error for agent ${agentId}:`, error);
    });
  });

  // 设置事件转发
  setupEventForwarding();

  return io;
};

// 设置事件转发
const setupEventForwarding = () => {
  // 任务创建事件
  taskEvents.on('task:created', (task) => {
    broadcastToAll({
      type: 'task:created',
      payload: task,
      timestamp: Date.now(),
    });
  });

  // 任务分配事件
  taskEvents.on('task:assigned', ({ task, agentId }) => {
    // 发送给被分配的 Agent
    const targetSocket = authenticatedSockets.get(agentId);
    if (targetSocket) {
      targetSocket.emit('task:assigned', {
        type: 'task:assigned',
        payload: task,
        timestamp: Date.now(),
      });
    }

    // 广播给所有人
    broadcastToAll({
      type: 'task:assigned:broadcast',
      payload: { taskId: task.id, agentId },
      timestamp: Date.now(),
    });
  });

  // 任务更新事件
  taskEvents.on('task:updated', (task) => {
    broadcastToAll({
      type: 'task:updated',
      payload: task,
      timestamp: Date.now(),
    });
  });

  // 任务删除事件
  taskEvents.on('task:deleted', ({ id }) => {
    broadcastToAll({
      type: 'task:deleted',
      payload: { id },
      timestamp: Date.now(),
    });
  });

  // Agent 离线事件
  heartbeatEvents.on('agent:offline', ({ agentId, lastHeartbeat }) => {
    broadcastToAll({
      type: 'agent:offline',
      payload: { agentId, lastHeartbeat },
      timestamp: Date.now(),
    });
  });

  // 心跳事件
  heartbeatEvents.on('heartbeat', ({ agentId, data, timestamp }) => {
    // 可选：广播心跳数据用于实时监控
    // 注意：大量 Agent 时可能会有性能问题
    broadcastToAll({
      type: 'heartbeat:broadcast',
      payload: { agentId, data, timestamp },
      timestamp: Date.now(),
    }, { excludeAgent: agentId });
  });
};

// 广播消息给所有连接的客户端
export const broadcastToAll = (
  message: IWebSocketMessage,
  options?: { excludeAgent?: string }
): void => {
  if (!io) return;

  authenticatedSockets.forEach((socket, agentId) => {
    if (options?.excludeAgent && agentId === options.excludeAgent) {
      return;
    }
    socket.emit(message.type, message);
  });
};

// 发送消息给特定 Agent
export const sendToAgent = (agentId: string, message: IWebSocketMessage): boolean => {
  const socket = authenticatedSockets.get(agentId);
  if (socket) {
    socket.emit(message.type, message);
    return true;
  }
  return false;
};

// 获取在线 Agents
export const getOnlineAgents = (): string[] => {
  return Array.from(authenticatedSockets.keys());
};

// 获取 Socket.io 实例
export const getIO = (): SocketIOServer | null => {
  return io;
};

export default {
  initializeWebSocket,
  broadcastToAll,
  sendToAgent,
  getOnlineAgents,
  getIO,
};