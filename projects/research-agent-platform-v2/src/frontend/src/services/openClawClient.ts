// OpenClaw WebSocket客户端
// 用于连接协作网络，与其他Agent通信

export interface AgentIdentity {
  agentId: string;
  agentName: string;
  ownerName: string;
  deviceInfo: {
    deviceId: string;
    hostName: string;
    platform: string;
  };
}

export interface CollaborationMessage {
  id: string;
  type: 'direct' | 'broadcast' | 'task' | 'request' | 'response';
  from: {
    agentId: string;
    agentName: string;
    ownerName: string;
  };
  to?: string;
  content: {
    text?: string;
    action?: string;
    data?: any;
  };
  timestamp: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface TaskMessage {
  id: string;
  title: string;
  description: string;
  assignees: string[];
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

type MessageHandler = (message: CollaborationMessage) => void;
type ConnectionHandler = (connected: boolean) => void;

class OpenClawClient {
  private ws: WebSocket | null = null;
  private identity: AgentIdentity | null = null;
  private serverUrl: string = '';
  private reconnectInterval: number = 5000;
  private heartbeatInterval: number = 30000;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private connectionHandlers: ConnectionHandler[] = [];
  private isConnected: boolean = false;

  // 连接到协作网络
  connect(serverUrl: string, identity: AgentIdentity): void {
    this.serverUrl = serverUrl;
    this.identity = identity;

    console.log(`🔌 正在连接到OpenClaw协作网络: ${serverUrl}`);

    this.ws = new WebSocket(serverUrl);

    this.ws.onopen = () => {
      console.log('✅ 已连接到协作网络');
      this.isConnected = true;
      
      // 发送身份验证
      this.send({
        type: 'auth',
        payload: identity
      });

      // 启动心跳
      this.startHeartbeat();

      // 通知连接状态
      this.notifyConnectionChange(true);
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('❌ 与协作网络断开连接');
      this.isConnected = false;
      this.stopHeartbeat();
      this.notifyConnectionChange(false);
      
      // 自动重连
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  // 断开连接
  disconnect(): void {
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // 发送消息
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent');
    }
  }

  // 发送协作消息
  sendMessage(to: string | null, content: { text?: string; action?: string; data?: any }, options: {
    type?: 'direct' | 'broadcast' | 'task' | 'request';
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    requiresResponse?: boolean;
  } = {}): void {
    this.send({
      type: 'collaboration_message',
      payload: {
        type: options.type || 'direct',
        to,
        content,
        priority: options.priority || 'normal',
        requiresResponse: options.requiresResponse || false
      }
    });
  }

  // 创建任务
  createTask(task: TaskMessage): void {
    this.send({
      type: 'task_create',
      payload: task
    });
  }

  // 更新任务状态
  updateTask(taskId: string, status: string): void {
    this.send({
      type: 'task_update',
      payload: { taskId, status }
    });
  }

  // 广播消息
  broadcast(content: { text?: string; action?: string; data?: any }): void {
    this.send({
      type: 'broadcast',
      payload: content
    });
  }

  // 更新状态
  updateStatus(status: 'online' | 'away' | 'busy'): void {
    this.send({
      type: 'status_update',
      payload: { status }
    });
  }

  // 注册消息处理器
  onMessage(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  // 移除消息处理器
  offMessage(type: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // 注册连接状态处理器
  onConnectionChange(handler: ConnectionHandler): void {
    this.connectionHandlers.push(handler);
  }

  // 获取连接状态
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // 处理收到的消息
  private handleMessage(message: any): void {
    console.log('📨 收到消息:', message.type);

    switch (message.type) {
      case 'system':
        this.handleSystemMessage(message.payload);
        break;
      case 'collaboration_message':
        this.notifyMessageHandlers('collaboration_message', message.payload);
        break;
      case 'task_created':
      case 'task_assigned':
      case 'task_updated':
        this.notifyMessageHandlers('task', message.payload);
        break;
      case 'message_delivered':
        console.log('✅ 消息已送达:', message.payload.messageId);
        break;
      case 'message_failed':
        console.error('❌ 消息发送失败:', message.payload.reason);
        break;
      case 'pong':
        // 心跳响应，无需处理
        break;
      default:
        this.notifyMessageHandlers(message.type, message.payload);
    }
  }

  // 处理系统消息
  private handleSystemMessage(payload: any): void {
    switch (payload.event) {
      case 'connected':
        console.log('🎉 连接成功:', payload.message);
        console.log('👥 在线Agent:', payload.onlineAgents);
        break;
      case 'agent_online':
        console.log(`🟢 Agent上线: ${payload.agentName}`);
        this.notifyMessageHandlers('agent_online', payload);
        break;
      case 'agent_offline':
        console.log(`🔴 Agent离线: ${payload.agentName}`);
        this.notifyMessageHandlers('agent_offline', payload);
        break;
      case 'status_changed':
        console.log(`📝 Agent状态变更: ${payload.agentId} -> ${payload.status}`);
        this.notifyMessageHandlers('status_changed', payload);
        break;
    }
  }

  // 通知消息处理器
  private notifyMessageHandlers(type: string, payload: any): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    }
  }

  // 通知连接状态变更
  private notifyConnectionChange(connected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  // 启动心跳
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'ping' });
    }, this.heartbeatInterval);
  }

  // 停止心跳
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // 计划重连
  private scheduleReconnect(): void {
    console.log(`⏱️ ${this.reconnectInterval / 1000}秒后尝试重连...`);
    
    this.reconnectTimer = setTimeout(() => {
      if (this.identity) {
        this.connect(this.serverUrl, this.identity);
      }
    }, this.reconnectInterval);
  }
}

// 导出单例
export const openClawClient = new OpenClawClient();