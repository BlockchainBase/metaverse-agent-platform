import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';

// 全局测试设置
beforeAll(async () => {
  // 测试前的全局设置
});

beforeEach(() => {
  // 每个测试前的设置
});

afterEach(() => {
  // 每个测试后的清理
});

afterAll(async () => {
  // 测试后的全局清理
});

// 扩展 Jest 匹配器
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});