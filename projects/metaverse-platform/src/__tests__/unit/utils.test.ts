import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyAccessToken,
  generateUUID,
  generateTaskId,
  isValidEmail,
  isValidAgentId,
  sanitizeString,
} from '@/utils';

describe('Utils', () => {
  describe('Password Utils', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);
    });

    it('should verify password correctly', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hashed);
      expect(isValid).toBe(true);
      
      const isInvalid = await verifyPassword('wrongPassword', hashed);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Utils', () => {
    it('should generate tokens', () => {
      const agentId = 'agent_123';
      const id = 'uuid-123';
      
      const tokens = generateTokens(agentId, id);
      
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.expiresIn).toBeGreaterThan(0);
    });

    it('should verify access token', () => {
      const agentId = 'agent_123';
      const id = 'uuid-123';
      
      const tokens = generateTokens(agentId, id);
      const decoded = verifyAccessToken(tokens.accessToken);
      
      expect(decoded.agentId).toBe(agentId);
      expect(decoded.id).toBe(id);
      expect(decoded.type).toBe('access');
    });

    it('should throw on invalid token', () => {
      expect(() => verifyAccessToken('invalid.token.here')).toThrow();
    });
  });

  describe('UUID Utils', () => {
    it('should generate valid UUID', () => {
      const uuid = generateUUID();
      
      expect(uuid).toBeDefined();
      expect(uuid.length).toBe(36);
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('should generate unique task IDs', () => {
      const taskId1 = generateTaskId();
      const taskId2 = generateTaskId();
      
      expect(taskId1).toBeDefined();
      expect(taskId2).toBeDefined();
      expect(taskId1).not.toBe(taskId2);
      expect(taskId1).toMatch(/^task_\d+_[a-z0-9]+$/);
    });
  });

  describe('Validation Utils', () => {
    describe('isValidEmail', () => {
      it('should validate correct emails', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      });

      it('should reject invalid emails', () => {
        expect(isValidEmail('invalid')).toBe(false);
        expect(isValidEmail('test@')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
        expect(isValidEmail('')).toBe(false);
      });
    });

    describe('isValidAgentId', () => {
      it('should validate correct agent IDs', () => {
        expect(isValidAgentId('agent123')).toBe(true);
        expect(isValidAgentId('user_name')).toBe(true);
        expect(isValidAgentId('test-agent')).toBe(true);
        expect(isValidAgentId('abc')).toBe(true); // 最小长度3
      });

      it('should reject invalid agent IDs', () => {
        expect(isValidAgentId('ab')).toBe(false); // 太短
        expect(isValidAgentId('a'.repeat(51))).toBe(false); // 太长
        expect(isValidAgentId('test@agent')).toBe(false); // 包含@符号
        expect(isValidAgentId('test agent')).toBe(false); // 包含空格
      });
    });
  });

  describe('String Utils', () => {
    it('should sanitize strings', () => {
      const dirtyString = '<script>alert("xss")</script>hello';
      const clean = sanitizeString(dirtyString);
      
      expect(clean).not.toContain('<');
      expect(clean).not.toContain('>');
      expect(clean).toContain('script');
    });

    it('should trim and limit strings', () => {
      const longString = 'a'.repeat(2000);
      const sanitized = sanitizeString(longString);
      
      expect(sanitized.length).toBeLessThanOrEqual(1000);
    });
  });
});