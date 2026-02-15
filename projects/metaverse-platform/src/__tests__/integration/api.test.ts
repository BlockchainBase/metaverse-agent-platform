import request from 'supertest';
import { app } from '@/index';

describe('API Integration Tests', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ok');
    });
  });

  describe('Agent Endpoints', () => {
    let authToken: string;
    let agentId: string;

    beforeAll(async () => {
      // 创建测试 Agent
      const createResponse = await request(app)
        .post('/api/v1/agents')
        .send({
          agentId: 'test_integration_agent',
          name: 'Test Integration Agent',
          password: 'testPassword123',
        });

      if (createResponse.status === 201) {
        agentId = createResponse.body.data.id;

        // 登录获取 token
        const loginResponse = await request(app)
          .post('/api/v1/agents/login')
          .send({
            agentId: 'test_integration_agent',
            password: 'testPassword123',
          });

        if (loginResponse.status === 200) {
          authToken = loginResponse.body.data.tokens.accessToken;
        }
      }
    });

    it('should get agent list', async () => {
      const response = await request(app)
        .get('/api/v1/agents')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should require auth for protected routes', async () => {
      await request(app)
        .get('/api/v1/agents/me')
        .expect(401);
    });

    it('should get current agent with auth', async () => {
      if (!authToken) {
        console.log('Skipping test - no auth token');
        return;
      }

      const response = await request(app)
        .get('/api/v1/agents/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.agentId).toBeDefined();
    });
  });

  describe('Task Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      // 登录获取 token
      const loginResponse = await request(app)
        .post('/api/v1/agents/login')
        .send({
          agentId: 'test_integration_agent',
          password: 'testPassword123',
        });

      if (loginResponse.status === 200) {
        authToken = loginResponse.body.data.tokens.accessToken;
      }
    });

    it('should require auth for task routes', async () => {
      await request(app)
        .get('/api/v1/tasks')
        .expect(401);
    });

    it('should create a task with auth', async () => {
      if (!authToken) {
        console.log('Skipping test - no auth token');
        return;
      }

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Task',
          type: 'CUSTOM',
          description: 'A test task',
          priority: 5,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Task');
    });

    it('should validate task input', async () => {
      if (!authToken) {
        console.log('Skipping test - no auth token');
        return;
      }

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '', // Invalid - empty name
          type: 'INVALID_TYPE', // Invalid type
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('System Endpoints', () => {
    it('should return system health', async () => {
      const response = await request(app)
        .get('/api/v1/system/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/v1/agents')
        .send({
          // Missing required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});