import { AgentStatus } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { IHeartbeat, IHeartbeatData, IPaginationParams } from '@/types';
import { config } from '@/config';
import { EventEmitter } from 'events';

// 心跳事件
export const heartbeatEvents = new EventEmitter();

export class HeartbeatService {
  private checkInterval: NodeJS.Timeout | null = null;
  private agentStatusCache: Map<string, { status: AgentStatus; timestamp: Date }> = new Map();

  // 记录心跳
  async recordHeartbeat(
    agentId: string, 
    data: IHeartbeatData
  ): Promise<IHeartbeat> {
    const agent = await prisma.agent.findUnique({
      where: { agentId },
    });

    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // 更新缓存
    this.agentStatusCache.set(agentId, {
      status: data.status,
      timestamp: new Date(),
    });

    // 如果状态改变，更新 Agent 状态
    if (agent.status !== data.status) {
      await prisma.agent.update({
        where: { agentId },
        data: { status: data.status },
      });
    }

    // 创建心跳记录
    const heartbeat = await prisma.heartbeat.create({
      data: {
        agentId: agent.id,
        status: data.status,
        cpuUsage: data.cpuUsage,
        memoryUsage: data.memoryUsage,
        networkLatency: data.networkLatency,
        positionX: data.position?.x,
        positionY: data.position?.y,
        positionZ: data.position?.z,
        metadata: data.metadata || {},
      },
    });

    // 触发事件
    heartbeatEvents.emit('heartbeat', {
      agentId,
      data,
      timestamp: heartbeat.timestamp,
    });

    return heartbeat as IHeartbeat;
  }

  // 获取心跳历史
  async getHeartbeats(
    agentId: string,
    pagination: IPaginationParams = { page: 1, limit: 50 }
  ): Promise<{ heartbeats: IHeartbeat[]; total: number }> {
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;

    const agent = await prisma.agent.findUnique({
      where: { agentId },
    });

    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const [heartbeats, total] = await Promise.all([
      prisma.heartbeat.findMany({
        where: { agentId: agent.id },
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.heartbeat.count({
        where: { agentId: agent.id },
      }),
    ]);

    return { heartbeats: heartbeats as IHeartbeat[], total };
  }

  // 获取最新心跳
  async getLatestHeartbeat(agentId: string): Promise<IHeartbeat | null> {
    const agent = await prisma.agent.findUnique({
      where: { agentId },
    });

    if (!agent) {
      return null;
    }

    const heartbeat = await prisma.heartbeat.findFirst({
      where: { agentId: agent.id },
      orderBy: { timestamp: 'desc' },
    });

    return heartbeat as IHeartbeat | null;
  }

  // 获取所有在线 Agent
  async getOnlineAgents(): Promise<{ agentId: string; status: AgentStatus; lastHeartbeat: Date }[]> {
    const agents = await prisma.agent.findMany({
      where: {
        status: {
          in: ['ONLINE', 'BUSY'],
        },
      },
      select: {
        agentId: true,
        status: true,
      },
    });

    const result = await Promise.all(
      agents.map(async (agent) => {
        const latestHeartbeat = await this.getLatestHeartbeat(agent.agentId);
        return {
          agentId: agent.agentId,
          status: agent.status,
          lastHeartbeat: latestHeartbeat?.timestamp || new Date(0),
        };
      })
    );

    return result;
  }

  // 检查超时 Agent
  async checkTimeoutAgents(): Promise<string[]> {
    const timeoutThreshold = new Date(
      Date.now() - config.heartbeat.timeoutMs
    );

    // 查找最近有心跳但现在可能超时的 Agent
    const recentHeartbeats = await prisma.heartbeat.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - config.heartbeat.timeoutMs * 2),
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      distinct: ['agentId'],
      include: {
        agent: {
          select: {
            agentId: true,
            status: true,
          },
        },
      },
    });

    const timedOutAgents: string[] = [];

    for (const heartbeat of recentHeartbeats) {
      if (heartbeat.timestamp < timeoutThreshold) {
        // Agent 已超时
        if (heartbeat.agent.status !== 'OFFLINE') {
          await prisma.agent.update({
            where: { id: heartbeat.agentId },
            data: { status: 'OFFLINE' as AgentStatus },
          });

          timedOutAgents.push(heartbeat.agent.agentId);

          // 触发离线事件
          heartbeatEvents.emit('agent:offline', {
            agentId: heartbeat.agent.agentId,
            lastHeartbeat: heartbeat.timestamp,
          });
        }
      }
    }

    return timedOutAgents;
  }

  // 启动心跳监控
  startMonitoring(intervalMs: number = config.heartbeat.intervalMs): void {
    if (this.checkInterval) {
      console.log('Heartbeat monitoring already running');
      return;
    }

    console.log(`Starting heartbeat monitoring with ${intervalMs}ms interval`);

    this.checkInterval = setInterval(() => {
      this.checkTimeoutAgents().catch(error => {
        console.error('Error checking timeout agents:', error);
      });
    }, intervalMs);
  }

  // 停止心跳监控
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('Heartbeat monitoring stopped');
    }
  }

  // 获取系统健康状态
  async getSystemHealth(): Promise<{
    totalAgents: number;
    onlineAgents: number;
    offlineAgents: number;
    busyAgents: number;
    awayAgents: number;
    errorAgents: number;
    averageCpuUsage: number | null;
    averageMemoryUsage: number | null;
  }> {
    const [
      agentStats,
      recentHeartbeats,
    ] = await Promise.all([
      prisma.agent.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
      prisma.heartbeat.findMany({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // 最近5分钟
          },
        },
        select: {
          cpuUsage: true,
          memoryUsage: true,
        },
      }),
    ]);

    const result = {
      totalAgents: 0,
      onlineAgents: 0,
      offlineAgents: 0,
      busyAgents: 0,
      awayAgents: 0,
      errorAgents: 0,
      averageCpuUsage: null as number | null,
      averageMemoryUsage: null as number | null,
    };

    for (const stat of agentStats) {
      const count = stat._count.status;
      result.totalAgents += count;

      switch (stat.status) {
        case 'ONLINE':
          result.onlineAgents += count;
          break;
        case 'OFFLINE':
          result.offlineAgents += count;
          break;
        case 'BUSY':
          result.busyAgents += count;
          break;
        case 'AWAY':
          result.awayAgents += count;
          break;
        case 'ERROR':
          result.errorAgents += count;
          break;
      }
    }

    // 计算平均资源使用
    if (recentHeartbeats.length > 0) {
      const cpuReadings = recentHeartbeats
        .filter(h => h.cpuUsage !== null)
        .map(h => h.cpuUsage as number);
      
      const memoryReadings = recentHeartbeats
        .filter(h => h.memoryUsage !== null)
        .map(h => h.memoryUsage as number);

      if (cpuReadings.length > 0) {
        result.averageCpuUsage = cpuReadings.reduce((a, b) => a + b, 0) / cpuReadings.length;
      }

      if (memoryReadings.length > 0) {
        result.averageMemoryUsage = memoryReadings.reduce((a, b) => a + b, 0) / memoryReadings.length;
      }
    }

    return result;
  }

  // 清理旧的心跳记录
  async cleanupOldRecords(keepDays: number = 7): Promise<number> {
    const cutoffDate = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000);

    const result = await prisma.heartbeat.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Cleaned up ${result.count} old heartbeat records`);
    return result.count;
  }
}

export const heartbeatService = new HeartbeatService();