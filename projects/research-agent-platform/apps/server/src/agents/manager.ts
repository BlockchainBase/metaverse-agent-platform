import { BaseAgent, AgentEvent } from './base';
import { 
  MarketAgent, SolutionAgent, ProjectAgent, DeveloperAgent,
  DeliveryAgent, FinanceAgent, DirectorAgent, DevOpsAgent 
} from './agents';
import { logger } from '../utils/logger';

// Agent工厂
export function createAgents(): BaseAgent[] {
  return [
    new MarketAgent(),
    new SolutionAgent(),
    new ProjectAgent(),
    new DeveloperAgent(),
    new DeliveryAgent(),
    new FinanceAgent(),
    new DirectorAgent(),
    new DevOpsAgent()
  ];
}

// Agent管理器
export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();
  private rules: AutomationRule[] = [];

  initialize(): void {
    const agents = createAgents();
    agents.forEach(agent => {
      this.agents.set(agent.id, agent);
      logger.info(`✅ Agent初始化: ${agent.name}`);
    });

    // 注册自动化规则
    this.registerRules();
    
    // 启动规则检查循环
    this.startRuleChecker();
    
    logger.info('✅ Agent系统已启动');
  }

  getAgent(id: string): BaseAgent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  // 广播事件给所有Agent
  async broadcast(event: AgentEvent): Promise<void> {
    logger.info(`📢 广播事件: ${event.type}`);
    
    for (const agent of this.agents.values()) {
      try {
        await agent.perceive(event);
      } catch (error) {
        logger.error(`Agent ${agent.name} 处理事件失败:`, error);
      }
    }
  }

  // 发送事件给特定Agent
  async sendToAgent(agentId: string, event: AgentEvent): Promise<void> {
    const agent = this.agents.get(agentId);
    if (agent) {
      await agent.perceive(event);
    }
  }

  // 注册自动化规则
  private registerRules(): void {
    this.rules = [
      {
        id: 'task-overdue-check',
        name: '任务逾期检查',
        interval: 60 * 60 * 1000, // 每小时检查一次
        check: async () => {
          // 检查即将逾期（24小时内）的任务
          return {
            type: 'CHECK_OVERDUE_TASKS',
            data: {}
          };
        }
      },
      {
        id: 'customer-follow-up',
        name: '客户跟进提醒',
        interval: 24 * 60 * 60 * 1000, // 每天检查一次
        check: async () => {
          // 检查超过3天未联系的客户
          return {
            type: 'CHECK_CUSTOMER_CONTACT',
            data: {}
          };
        }
      },
      {
        id: 'payment-reminder',
        name: '收款提醒',
        interval: 12 * 60 * 60 * 1000, // 每12小时检查一次
        check: async () => {
          // 检查7天内的收款节点
          return {
            type: 'CHECK_PAYMENT_DUE',
            data: {}
          };
        }
      },
      {
        id: 'daily-report',
        name: '每日简报',
        interval: 24 * 60 * 60 * 1000, // 每天一次
        check: async () => {
          // 早上9点发送每日简报
          const now = new Date();
          if (now.getHours() === 9) {
            return {
              type: 'DAILY_REPORT_TIME',
              data: {
                stats: {
                  totalProjects: 12,
                  activeProjects: 8,
                  delayedProjects: 1,
                  todayRevenue: 150000
                }
              }
            };
          }
          return null;
        }
      }
    ];
  }

  // 启动规则检查循环
  private startRuleChecker(): void {
    // 每分钟检查一次规则
    setInterval(async () => {
      await this.checkRules();
    }, 60 * 1000);

    logger.info('✅ Agent规则检查器已启动');
  }

  // 检查所有规则
  private async checkRules(): Promise<void> {
    const now = Date.now();
    
    for (const rule of this.rules) {
      try {
        const result = await rule.check();
        
        if (result) {
          await this.broadcast({
            type: result.type,
            data: result.data,
            timestamp: new Date()
          });
        }
      } catch (error) {
        logger.error(`规则检查失败: ${rule.name}`, error);
      }
    }
  }
}

// 自动化规则接口
interface AutomationRule {
  id: string;
  name: string;
  interval: number;
  check: () => Promise<{ type: string; data: any } | null>;
}

// 导出单例
export const agentManager = new AgentManager();