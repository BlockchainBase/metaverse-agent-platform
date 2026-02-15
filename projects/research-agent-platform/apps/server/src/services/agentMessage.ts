import { feishuService } from './feishu';
import { logger } from '../utils/logger';

// Agent消息服务 - 管理Agent与飞书的交互
class AgentMessageService {
  private defaultChatId: string;

  constructor() {
    // Default project chat ID from env
    this.defaultChatId = process.env.FEISHU_PROJECT_CHAT_ID || '';
  }

  // Project Agent sends progress update
  async sendProjectAlert(projectName: string, alertType: 'delay' | 'risk' | 'milestone', message: string, data?: any): Promise<void> {
    const card = {
      title: alertType === 'delay' ? '⚠️ 项目延期预警' : alertType === 'risk' ? '🔴 项目风险提醒' : '🎯 里程碑达成',
      content: `**${projectName}**\n\n${message}`,
      color: alertType === 'delay' ? 'red' : alertType === 'risk' ? 'orange' : 'green' as const,
      buttons: [
        { text: '查看详情', url: `http://localhost:5173/projects/${data?.projectId}` },
        { text: '处理', action: 'handle' }
      ]
    };

    try {
      await feishuService.sendCardMessage(this.defaultChatId, card);
      logger.info(`Project alert sent: ${projectName} - ${alertType}`);
    } catch (error) {
      logger.error('Failed to send project alert:', error);
    }
  }

  // Finance Agent sends payment reminder
  async sendPaymentReminder(projectName: string, phase: string, amount: number, dueDate: string): Promise<void> {
    const card = {
      title: '💰 收款节点提醒',
      content: `**${projectName}**\n\n• 阶段：${phase}\n• 金额：¥${amount.toLocaleString()}\n• 计划收款日：${dueDate}`,
      color: 'orange' as const,
      buttons: [
        { text: '确认收款', action: 'confirm_payment' },
        { text: '查看项目', url: `http://localhost:5173/projects` }
      ]
    };

    try {
      await feishuService.sendCardMessage(this.defaultChatId, card);
      logger.info(`Payment reminder sent: ${projectName} - ${phase}`);
    } catch (error) {
      logger.error('Failed to send payment reminder:', error);
    }
  }

  // Market Agent sends customer follow-up reminder
  async sendCustomerFollowUp(customerName: string, daysSinceLastContact: number): Promise<void> {
    const card = {
      title: '🤝 客户跟进提醒',
      content: `**${customerName}**\n\n距离上次联系已 **${daysSinceLastContact}** 天，建议及时跟进。`,
      color: 'blue' as const,
      buttons: [
        { text: '查看客户', url: `http://localhost:5173/customers` },
        { text: '记录沟通', action: 'log_communication' }
      ]
    };

    try {
      await feishuService.sendCardMessage(this.defaultChatId, card);
      logger.info(`Customer follow-up sent: ${customerName}`);
    } catch (error) {
      logger.error('Failed to send customer follow-up:', error);
    }
  }

  // Director Agent sends daily report
  async sendDailyReport(stats: {
    totalProjects: number;
    activeProjects: number;
    delayedProjects: number;
    todayRevenue: number;
  }): Promise<void> {
    const card = {
      title: '📊 每日项目简报',
      content: `
**项目概况**
• 项目总数：${stats.totalProjects}
• 进行中：${stats.activeProjects}
• 延期预警：${stats.delayedProjects}

**财务概况**
• 今日收款：¥${stats.todayRevenue.toLocaleString()}
      `.trim(),
      color: 'blue' as const,
      buttons: [
        { text: '查看仪表盘', url: 'http://localhost:5173/dashboard' }
      ]
    };

    try {
      await feishuService.sendCardMessage(this.defaultChatId, card);
      logger.info('Daily report sent');
    } catch (error) {
      logger.error('Failed to send daily report:', error);
    }
  }

  // DevOps Agent sends system alert
  async sendSystemAlert(alertType: 'error' | 'warning', message: string, details?: string): Promise<void> {
    const card = {
      title: alertType === 'error' ? '🔧 系统异常' : '⚠️ 系统警告',
      content: `**${message}**\n\n${details || ''}`,
      color: alertType === 'error' ? 'red' : 'orange' as const,
      buttons: [
        { text: '查看详情', action: 'view_details' }
      ]
    };

    try {
      await feishuService.sendCardMessage(this.defaultChatId, card);
      logger.info(`System alert sent: ${alertType}`);
    } catch (error) {
      logger.error('Failed to send system alert:', error);
    }
  }

  // Solution Agent sends task assignment notification
  async sendTaskAssigned(taskTitle: string, assigneeName: string, projectName: string, dueDate: string): Promise<void> {
    const card = {
      title: '📋 新任务分配',
      content: `
**${taskTitle}**

• 负责人：${assigneeName}
• 所属项目：${projectName}
• 截止日期：${dueDate}
      `.trim(),
      color: 'blue' as const,
      buttons: [
        { text: '查看任务', url: 'http://localhost:5173/tasks' },
        { text: '开始处理', action: 'start_task' }
      ]
    };

    try {
      await feishuService.sendCardMessage(this.defaultChatId, card);
      logger.info(`Task assignment sent: ${taskTitle}`);
    } catch (error) {
      logger.error('Failed to send task assignment:', error);
    }
  }

  // Send to specific user (for personal notifications)
  async sendToUser(userId: string, message: string): Promise<void> {
    try {
      await feishuService.sendMessageToUser(userId, message);
      logger.info(`Message sent to user ${userId}`);
    } catch (error) {
      logger.error('Failed to send message to user:', error);
    }
  }
}

export const agentMessageService = new AgentMessageService();