import { AgentService } from '@/services/agent.service';
import { prisma } from '@/config/prisma';
import { AppError } from '@/middleware';

// Mock Prisma
jest.mock('@/config/prisma', () => ({
  prisma: {
    agent: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    agentSession: {
      create: jest.fn(),
      updateMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('AgentService', () => {
  let agentService: AgentService;

  beforeEach(() => {
    agentService = new AgentService();
    jest.clearAllMocks();
  });

  describe('createAgent', () => {
    it('should create an agent successfully', async () => {
      const mockAgent = {
        id: 'uuid-1',
        agentId: 'test_agent',
        name: 'Test Agent',
        description: 'A test agent',
        status: 'OFFLINE',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.agent.create as jest.Mock).mockResolvedValue(mockAgent);

      const result = await agentService.createAgent({
        agentId: 'test_agent',
        name: 'Test Agent',
        description: 'A test agent',
      });

      expect(result).toBeDefined();
      expect(result.agentId).toBe('test_agent');
      expect(prisma.agent.create).toHaveBeenCalled();
    });

    it('should throw error for duplicate agentId', async () => {
      const prismaError = new Error('Unique constraint');
      (prismaError as any).code = 'P2002';
      
      (prisma.agent.create as jest.Mock).mockRejectedValue(prismaError);

      await expect(
        agentService.createAgent({
          agentId: 'existing_agent',
          name: 'Existing Agent',
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe('getAgents', () => {
    it('should return paginated agents', async () => {
      const mockAgents = [
        { id: '1', agentId: 'agent1', name: 'Agent 1' },
        { id: '2', agentId: 'agent2', name: 'Agent 2' },
      ];

      (prisma.agent.findMany as jest.Mock).mockResolvedValue(mockAgents);
      (prisma.agent.count as jest.Mock).mockResolvedValue(2);

      const result = await agentService.getAgents({}, { page: 1, limit: 10 });

      expect(result.agents).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by status', async () => {
      (prisma.agent.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.agent.count as jest.Mock).mockResolvedValue(0);

      await agentService.getAgents({ status: 'ONLINE' }, { page: 1, limit: 10 });

      expect(prisma.agent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'ONLINE' }),
        })
      );
    });
  });

  describe('getAgentById', () => {
    it('should return agent by id', async () => {
      const mockAgent = {
        id: 'uuid-1',
        agentId: 'test_agent',
        name: 'Test Agent',
      };

      (prisma.agent.findUnique as jest.Mock).mockResolvedValue(mockAgent);

      const result = await agentService.getAgentById('uuid-1');

      expect(result).toBeDefined();
      expect(result?.agentId).toBe('test_agent');
    });

    it('should return null for non-existent agent', async () => {
      (prisma.agent.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await agentService.getAgentById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateAgent', () => {
    it('should update agent successfully', async () => {
      const mockAgent = {
        id: 'uuid-1',
        agentId: 'test_agent',
        name: 'Updated Name',
      };

      (prisma.agent.update as jest.Mock).mockResolvedValue(mockAgent);

      const result = await agentService.updateAgent('uuid-1', {
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw error for non-existent agent', async () => {
      const prismaError = new Error('Record not found');
      (prismaError as any).code = 'P2025';

      (prisma.agent.update as jest.Mock).mockRejectedValue(prismaError);

      await expect(
        agentService.updateAgent('non-existent', { name: 'New Name' })
      ).rejects.toThrow(AppError);
    });
  });

  describe('deleteAgent', () => {
    it('should delete agent successfully', async () => {
      (prisma.agent.delete as jest.Mock).mockResolvedValue({});

      await expect(agentService.deleteAgent('uuid-1')).resolves.not.toThrow();
    });

    it('should throw error for non-existent agent', async () => {
      const prismaError = new Error('Record not found');
      (prismaError as any).code = 'P2025';

      (prisma.agent.delete as jest.Mock).mockRejectedValue(prismaError);

      await expect(agentService.deleteAgent('non-existent')).rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    it('should login with password successfully', async () => {
      const mockAgent = {
        id: 'uuid-1',
        agentId: 'test_agent',
        name: 'Test Agent',
        passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/IrK', // hash of 'password123'
        certFingerprint: null,
        loginAttempts: 0,
        lockedUntil: null,
        status: 'OFFLINE',
      };

      (prisma.agent.findUnique as jest.Mock).mockResolvedValue(mockAgent);
      (prisma.agent.update as jest.Mock).mockResolvedValue({ ...mockAgent, status: 'ONLINE' });
      (prisma.agentSession.create as jest.Mock).mockResolvedValue({});

      const result = await agentService.login({
        agentId: 'test_agent',
        password: 'password123',
      });

      expect(result).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
    });

    it('should throw error for invalid credentials', async () => {
      (prisma.agent.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        agentService.login({
          agentId: 'non_existent',
          password: 'password',
        })
      ).rejects.toThrow(AppError);
    });

    it('should throw error for locked account', async () => {
      const mockAgent = {
        id: 'uuid-1',
        agentId: 'test_agent',
        lockedUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      };

      (prisma.agent.findUnique as jest.Mock).mockResolvedValue(mockAgent);

      await expect(
        agentService.login({
          agentId: 'test_agent',
          password: 'password',
        })
      ).rejects.toThrow(AppError);
    });
  });
});