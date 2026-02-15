import { Request, Response } from 'express';
import { AgentStatus } from '@prisma/client';
import { agentService } from '@/services';
import { 
  createSuccessResponse, 
  createErrorResponse,
  asyncHandler,
  AppError,
} from '@/middleware';
import { IAgentCreate, IAgentUpdate, IAgentFilter } from '@/types';

export class AgentController {
  // 创建 Agent
  create = asyncHandler(async (req: Request, res: Response) => {
    const data: IAgentCreate = req.body;
    const agent = await agentService.createAgent(data);
    res.status(201).json(createSuccessResponse(agent));
  });

  // 获取 Agent 列表
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as AgentStatus;
    const search = req.query.search as string;

    const filter: IAgentFilter = {};
    if (status) filter.status = status;
    if (search) filter.search = search;

    const { agents, total } = await agentService.getAgents(filter, { page, limit });

    res.json(
      createSuccessResponse(agents, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      })
    );
  });

  // 获取单个 Agent
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const agent = await agentService.getAgentById(id);

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    res.json(createSuccessResponse(agent));
  });

  // 根据 agentId 获取 Agent
  getByAgentId = asyncHandler(async (req: Request, res: Response) => {
    const { agentId } = req.params;
    const agent = await agentService.getAgentByAgentId(agentId);

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    res.json(createSuccessResponse(agent));
  });

  // 更新 Agent
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: IAgentUpdate = req.body;
    const agent = await agentService.updateAgent(id, data);
    res.json(createSuccessResponse(agent));
  });

  // 删除 Agent
  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await agentService.deleteAgent(id);
    res.status(204).send();
  });

  // 登录
  login = asyncHandler(async (req: Request, res: Response) => {
    const { agentId, password, certFingerprint } = req.body;
    
    const result = await agentService.login(
      { agentId, password, certFingerprint },
      req.ip,
      req.get('user-agent')
    );

    res.json(createSuccessResponse(result));
  });

  // 登出
  logout = asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await agentService.logout(token);
    }
    res.json(createSuccessResponse({ message: 'Logged out successfully' }));
  });

  // 刷新令牌
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
    }

    const tokens = await agentService.refreshToken(refreshToken);
    res.json(createSuccessResponse(tokens));
  });

  // 获取当前 Agent 信息
  getMe = asyncHandler(async (req: Request, res: Response) => {
    const agentId = req.agent?.agentId;
    
    if (!agentId) {
      throw new AppError('Not authenticated', 401, 'UNAUTHENTICATED');
    }

    const agent = await agentService.getAgentByAgentId(agentId);
    
    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    res.json(createSuccessResponse(agent));
  });

  // 更新当前 Agent 状态
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const agentId = req.agent?.agentId;
    
    if (!agentId) {
      throw new AppError('Not authenticated', 401, 'UNAUTHENTICATED');
    }

    const { status } = req.body;
    await agentService.updateAgentStatus(agentId, status);
    
    res.json(createSuccessResponse({ message: 'Status updated successfully' }));
  });
}

export const agentController = new AgentController();