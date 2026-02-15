import { agentMessageService } from '../services/agentMessage';
import { logger } from '../utils/logger';

// Agent基类
export abstract class BaseAgent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  capabilities: string[];

  constructor(id: string, name: string, role: AgentRole) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.status = 'IDLE';
    this.capabilities = [];
  }

  // 感知环境变化
  abstract perceive(event: AgentEvent): Promise<void>;

  // 做出决策
  abstract decide(): Promise<AgentAction | null>;

  // 执行行动
  abstract act(action: AgentAction): Promise<void>;

  // 发送飞书通知
  protected async notifyFeishu(message: string, card?: any): Promise<void> {
    try {
      if (card) {
        // Use agent-specific notification methods
        switch (this.role) {
          case 'PROJECT':
            await agentMessageService.sendProjectAlert(
              card.projectName || '项目',
              card.alertType || 'risk',
              message,
              card.data
            );
            break;
          case 'FINANCE':
            await agentMessageService.sendPaymentReminder(
              card.projectName || '项目',
              card.phase || '付款',
              card.amount || 0,
              card.dueDate || ''
            );
            break;
          case 'MARKET':
            await agentMessageService.sendCustomerFollowUp(
              card.customerName || '客户',
              card.days || 0
            );
            break;
          case 'DIRECTOR':
            await agentMessageService.sendDailyReport(card.stats || {});
            break;
          case 'DEVOPS':
            await agentMessageService.sendSystemAlert(
              card.alertType || 'warning',
              message,
              card.details
            );
            break;
          default:
            logger.info(`[${this.name}] ${message}`);
        }
      } else {
        logger.info(`[${this.name}] ${message}`);
      }
    } catch (error) {
      logger.error(`[${this.name}] Failed to send notification:`, error);
    }
  }

  // 向真人报告
  async reportToHuman(message: string, card?: any): Promise<void> {
    logger.info(`[${this.name}] 报告: ${message}`);
    await this.notifyFeishu(message, card);
  }

  // 请求真人决策
  async requestHuman(reason: string, context?: any): Promise<void> {
    this.status = 'WAITING';
    logger.info(`[${this.name}] 请求真人决策: ${reason}`);
    
    await this.notifyFeishu(reason, {
      alertType: 'risk',
      projectName: context?.projectName,
      data: context
    });
  }

  // 更新Agent状态
  async updateStatus(status: AgentStatus): Promise<void> {
    this.status = status;
    logger.info(`[${this.name}] 状态更新: ${status}`);
  }
}

// Agent类型定义
export type AgentRole = 
  | 'MARKET'      // 市场专员
  | 'SOLUTION'    // 方案架构师
  | 'PROJECT'     // 项目管家
  | 'DEVELOPER'   // 开发工程师
  | 'DELIVERY'    // 交付专家
  | 'FINANCE'     // 财务助手
  | 'DIRECTOR'    // 院长助理
  | 'DEVOPS';     // 运维工程师

export type AgentStatus = 'IDLE' | 'WORKING' | 'WAITING' | 'ERROR';

// Agent事件定义
export interface AgentEvent {
  type: string;
  data: any;
  timestamp: Date;
  source?: string;
}

// Agent行动定义
export interface AgentAction {
  type: string;
  payload: any;
  priority: 'low' | 'medium' | 'high';
  notify?: boolean;
}