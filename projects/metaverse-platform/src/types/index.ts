import { AgentStatus, TaskStatus, TaskType } from '@prisma/client';

// Agent 类型
export interface IAgent {
  id: string;
  agentId: string;
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
  status: AgentStatus;
  certFingerprint?: string | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
}

export interface IAgentCreate {
  agentId: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  password?: string;
  certFingerprint?: string;
  metadata?: Record<string, any>;
}

export interface IAgentUpdate {
  name?: string;
  description?: string;
  avatarUrl?: string;
  status?: AgentStatus;
  metadata?: Record<string, any>;
}

export interface IAgentLogin {
  agentId: string;
  password?: string;
  certFingerprint?: string;
}

// 认证类型
export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ITokenPayload {
  agentId: string;
  id: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

// 任务类型
export interface ITask {
  id: string;
  taskId: string;
  name: string;
  description?: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: number;
  agentId?: string | null;
  scheduledAt?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  payload: Record<string, any>;
  result?: Record<string, any> | null;
  error?: string | null;
  maxRetries: number;
  retryCount: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskCreate {
  taskId?: string;
  name: string;
  description?: string;
  type: TaskType;
  priority?: number;
  agentId?: string;
  scheduledAt?: Date;
  payload?: Record<string, any>;
  maxRetries?: number;
  metadata?: Record<string, any>;
}

export interface ITaskUpdate {
  name?: string;
  description?: string;
  status?: TaskStatus;
  priority?: number;
  agentId?: string;
  scheduledAt?: Date;
  payload?: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  retryCount?: number;
}

// 心跳类型
export interface IHeartbeat {
  id: string;
  agentId: string;
  status: AgentStatus;
  timestamp: Date;
  cpuUsage?: number | null;
  memoryUsage?: number | null;
  networkLatency?: number | null;
  positionX?: number | null;
  positionY?: number | null;
  positionZ?: number | null;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface IHeartbeatData {
  status: AgentStatus;
  cpuUsage?: number;
  memoryUsage?: number;
  networkLatency?: number;
  position?: {
    x: number;
    y: number;
    z: number;
  };
  metadata?: Record<string, any>;
}

// API 响应类型
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// WebSocket 消息类型
export interface IWebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  agentId?: string;
}

export interface IWebSocketAuthMessage {
  type: 'auth';
  token: string;
}

export interface IHeartbeatMessage {
  type: 'heartbeat';
  data: IHeartbeatData;
}

// 分页请求
export interface IPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 过滤器
export interface IAgentFilter {
  status?: AgentStatus;
  search?: string;
}

export interface ITaskFilter {
  status?: TaskStatus;
  type?: TaskType;
  agentId?: string;
}

// mTLS 证书信息
export interface ICertificateInfo {
  fingerprint: string;
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
}

// 代理状态更新
export interface IAgentStatusUpdate {
  status: AgentStatus;
  timestamp: Date;
  metadata?: Record<string, any>;
}