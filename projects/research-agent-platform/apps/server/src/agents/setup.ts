import { agentManager } from './manager';
import { logger } from '../utils/logger';

export function setupAgents(): void {
  logger.info('🤖 初始化AI Agent系统...');
  
  agentManager.initialize();
  
  logger.info('✅ AI Agent系统已就绪');
  logger.info('📱 Agent飞书通知已启用（需配置环境变量）');
}