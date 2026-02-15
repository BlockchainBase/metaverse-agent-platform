import { Request, Response } from 'express';
import { heartbeatService } from '@/services';
import { 
  createSuccessResponse, 
  asyncHandler,
} from '@/middleware';
import { IHeartbeatData } from '@/types';

export class SystemController {
  // 健康检查
  healthCheck = asyncHandler(async (_req: Request, res: Response) => {
    const health = await heartbeatService.getSystemHealth();
    
    const isHealthy = health.errorAgents === 0;
    const status = isHealthy ? 'healthy' : 'degraded';
    
    res.json(
      createSuccessResponse({
        status,
        timestamp: new Date().toISOString(),
        ...health,
      })
    );
  });

  // 获取系统状态
  getSystemStatus = asyncHandler(async (_req: Request, res: Response) => {
    const health = await heartbeatService.getSystemHealth();
    
    res.json(
      createSuccessResponse({
        timestamp: new Date().toISOString(),
        ...health,
      })
    );
  });

  // 记录心跳
  heartbeat = asyncHandler(async (req: Request, res: Response) => {
    const agentId = req.agent?.agentId;
    
    if (!agentId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Not authenticated',
        },
      });
      return;
    }

    const data: IHeartbeatData = req.body;
    const heartbeat = await heartbeatService.recordHeartbeat(agentId, data);
    
    res.json(createSuccessResponse(heartbeat));
  });

  // 获取 Agent 心跳历史
  getAgentHeartbeats = asyncHandler(async (req: Request, res: Response) => {
    const { agentId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const { heartbeats, total } = await heartbeatService.getHeartbeats(
      agentId,
      { page, limit }
    );

    res.json(
      createSuccessResponse(heartbeats, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      })
    );
  });

  // 获取最新心跳
  getLatestHeartbeat = asyncHandler(async (req: Request, res: Response) => {
    const { agentId } = req.params;
    const heartbeat = await heartbeatService.getLatestHeartbeat(agentId);
    
    if (!heartbeat) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'No heartbeat found for this agent',
        },
      });
      return;
    }

    res.json(createSuccessResponse(heartbeat));
  });

  // 获取在线 Agents
  getOnlineAgents = asyncHandler(async (_req: Request, res: Response) => {
    const agents = await heartbeatService.getOnlineAgents();
    res.json(createSuccessResponse(agents));
  });

  // 获取当前 Agent 的心跳历史
  getMyHeartbeats = asyncHandler(async (req: Request, res: Response) => {
    const agentId = req.agent?.agentId;
    
    if (!agentId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Not authenticated',
        },
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const { heartbeats, total } = await heartbeatService.getHeartbeats(
      agentId,
      { page, limit }
    );

    res.json(
      createSuccessResponse(heartbeats, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      })
    );
  });
}

export const systemController = new SystemController();