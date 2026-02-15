import { Prisma, AgentStatus } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { 
  IAgent, 
  IAgentCreate, 
  IAgentUpdate, 
  IAgentLogin, 
  IAuthTokens,
  IPaginationParams,
  IAgentFilter,
} from '@/types';
import { 
  hashPassword, 
  verifyPassword, 
  generateTokens, 
  generateUUID,
  AppError,
} from '@/utils';

export class AgentService {
  // 创建 Agent
  async createAgent(data: IAgentCreate): Promise<IAgent> {
    try {
      const passwordHash = data.password 
        ? await hashPassword(data.password) 
        : undefined;

      const agent = await prisma.agent.create({
        data: {
          agentId: data.agentId,
          name: data.name,
          description: data.description,
          avatarUrl: data.avatarUrl,
          passwordHash,
          certFingerprint: data.certFingerprint,
          metadata: data.metadata || {},
          status: 'OFFLINE' as AgentStatus,
        },
      });

      return agent as IAgent;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AppError('Agent ID already exists', 409, 'DUPLICATE_AGENT_ID');
        }
      }
      throw error;
    }
  }

  // 获取 Agent 列表
  async getAgents(
    filter: IAgentFilter = {},
    pagination: IPaginationParams = { page: 1, limit: 10 }
  ): Promise<{ agents: IAgent[]; total: number }> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.AgentWhereInput = {};

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.search) {
      where.OR = [
        { agentId: { contains: filter.search, mode: 'insensitive' } },
        { name: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.agent.count({ where }),
    ]);

    return { agents: agents as IAgent[], total };
  }

  // 根据 ID 获取 Agent
  async getAgentById(id: string): Promise<IAgent | null> {
    const agent = await prisma.agent.findUnique({
      where: { id },
    });
    return agent as IAgent | null;
  }

  // 根据 agentId 获取 Agent
  async getAgentByAgentId(agentId: string): Promise<IAgent | null> {
    const agent = await prisma.agent.findUnique({
      where: { agentId },
    });
    return agent as IAgent | null;
  }

  // 更新 Agent
  async updateAgent(id: string, data: IAgentUpdate): Promise<IAgent> {
    try {
      const agent = await prisma.agent.update({
        where: { id },
        data: {
          ...data,
          metadata: data.metadata ? { ...data.metadata } : undefined,
        },
      });
      return agent as IAgent;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
        }
      }
      throw error;
    }
  }

  // 删除 Agent
  async deleteAgent(id: string): Promise<void> {
    try {
      await prisma.agent.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
        }
      }
      throw error;
    }
  }

  // Agent 登录
  async login(data: IAgentLogin, ipAddress?: string, userAgent?: string): Promise<{ agent: IAgent; tokens: IAuthTokens }> {
    const agent = await prisma.agent.findUnique({
      where: { agentId: data.agentId },
    });

    if (!agent) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // 检查账户是否被锁定
    if (agent.lockedUntil && agent.lockedUntil > new Date()) {
      throw new AppError('Account is locked. Please try again later.', 403, 'ACCOUNT_LOCKED');
    }

    // 验证密码或证书
    let isAuthenticated = false;

    if (data.password && agent.passwordHash) {
      isAuthenticated = await verifyPassword(data.password, agent.passwordHash);
    }

    if (data.certFingerprint && agent.certFingerprint) {
      isAuthenticated = data.certFingerprint === agent.certFingerprint;
    }

    if (!isAuthenticated) {
      // 增加登录失败次数
      const loginAttempts = agent.loginAttempts + 1;
      const lockedUntil = loginAttempts >= 5 
        ? new Date(Date.now() + 30 * 60 * 1000) // 锁定30分钟
        : null;

      await prisma.agent.update({
        where: { id: agent.id },
        data: { loginAttempts, lockedUntil },
      });

      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // 重置登录失败次数
    await prisma.agent.update({
      where: { id: agent.id },
      data: { 
        loginAttempts: 0, 
        lockedUntil: null,
        lastLoginAt: new Date(),
        status: 'ONLINE' as AgentStatus,
      },
    });

    // 生成令牌
    const tokens = generateTokens(agent.agentId, agent.id);

    // 创建会话
    await prisma.agentSession.create({
      data: {
        agentId: agent.id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天
      },
    });

    return { agent: agent as IAgent, tokens };
  }

  // 登出
  async logout(token: string): Promise<void> {
    await prisma.agentSession.updateMany({
      where: { token },
      data: { isValid: false },
    });
  }

  // 刷新令牌
  async refreshToken(refreshToken: string): Promise<IAuthTokens> {
    const session = await prisma.agentSession.findFirst({
      where: { 
        refreshToken,
        isValid: true,
        expiresAt: { gt: new Date() },
      },
      include: { agent: true },
    });

    if (!session) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // 生成新令牌
    const tokens = generateTokens(session.agent.agentId, session.agent.id);

    // 更新会话
    await prisma.agentSession.update({
      where: { id: session.id },
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  // 更新 Agent 状态
  async updateAgentStatus(agentId: string, status: AgentStatus): Promise<void> {
    await prisma.agent.update({
      where: { agentId },
      data: { status },
    });
  }
}

export const agentService = new AgentService();