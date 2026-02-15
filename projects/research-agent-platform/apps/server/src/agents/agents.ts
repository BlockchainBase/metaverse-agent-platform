import { BaseAgent, AgentEvent, AgentAction } from './base';
import { logger } from '../utils/logger';

// ==================== 8个具体Agent实现 ====================

// 1. AI市场专员
export class MarketAgent extends BaseAgent {
  constructor() {
    super('market-agent', 'AI市场专员', 'MARKET');
    this.capabilities = ['线索管理', '客户沟通', '商机跟进'];
  }

  async perceive(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case 'CUSTOMER_CREATED':
        await this.reportToHuman(`🤝 新客户录入: ${event.data.name}`);
        break;
      case 'CUSTOMER_NO_CONTACT':
        // 客户3天未跟进，触发提醒
        if (event.data.days > 3) {
          await this.reportToHuman(`⏰ 客户跟进提醒: ${event.data.name} 已 ${event.data.days} 天未联系`, {
            customerName: event.data.name,
            days: event.data.days
          });
        }
        break;
      case 'LEAD_HIGH_VALUE':
        await this.requestHuman(`💎 发现高价值商机: ${event.data.customerName}，建议优先跟进`, event.data);
        break;
    }
  }

  async decide(): Promise<AgentAction | null> {
    // 规则：检查是否有客户超过7天未跟进
    return null;
  }

  async act(action: AgentAction): Promise<void> {
    logger.info(`[市场专员] 执行: ${action.type}`);
  }
}

// 2. AI方案架构师
export class SolutionAgent extends BaseAgent {
  constructor() {
    super('solution-agent', 'AI方案架构师', 'SOLUTION');
    this.capabilities = ['需求分析', '方案设计', '原型制作'];
  }

  async perceive(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case 'PROJECT_STAGE_CHANGED':
        if (event.data.stage === 'STAGE2') {
          await this.reportToHuman(`📐 项目进入方案阶段: ${event.data.projectName}`);
        }
        break;
      case 'REQUIREMENT_UPDATED':
        await this.reportToHuman(`📝 需求变更: ${event.data.projectName} - ${event.data.changes}`);
        break;
      case 'SOLUTION_REVIEW_NEEDED':
        await this.requestHuman(`👀 方案待评审: ${event.data.projectName}，请安排评审会议`, event.data);
        break;
    }
  }

  async decide(): Promise<AgentAction | null> {
    return null;
  }

  async act(action: AgentAction): Promise<void> {
    logger.info(`[方案架构师] 执行: ${action.type}`);
  }
}

// 3. AI项目管家
export class ProjectAgent extends BaseAgent {
  constructor() {
    super('project-agent', 'AI项目管家', 'PROJECT');
    this.capabilities = ['项目统筹', '进度跟踪', '资源协调'];
  }

  async perceive(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case 'TASK_OVERDUE':
        await this.reportToHuman(
          `⚠️ 任务即将逾期: ${event.data.taskTitle}`,
          {
            alertType: 'delay',
            projectName: event.data.projectName,
            data: event.data
          }
        );
        break;
      case 'PROJECT_DELAYED':
        await this.reportToHuman(
          `🔴 项目延期风险: ${event.data.projectName} 预计延期 ${event.data.delayDays} 天`,
          {
            alertType: 'delay',
            projectName: event.data.projectName,
            data: event.data
          }
        );
        break;
      case 'MILESTONE_COMPLETED':
        await this.reportToHuman(
          `🎉 里程碑达成: ${event.data.projectName} - ${event.data.milestoneName}`,
          {
            alertType: 'milestone',
            projectName: event.data.projectName,
            data: event.data
          }
        );
        break;
      case 'RESOURCE_CONFLICT':
        await this.requestHuman(`⚡ 资源冲突: ${event.data.message}，请协调`, event.data);
        break;
    }
  }

  async decide(): Promise<AgentAction | null> {
    // 规则：检查是否有任务即将到期（24小时内）
    return null;
  }

  async act(action: AgentAction): Promise<void> {
    logger.info(`[项目管家] 执行: ${action.type}`);
  }
}

// 4. AI开发工程师
export class DeveloperAgent extends BaseAgent {
  constructor() {
    super('dev-agent', 'AI开发工程师', 'DEVELOPER');
    this.capabilities = ['任务拆解', '代码管理', 'Demo构建'];
  }

  async perceive(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case 'PROJECT_STAGE_CHANGED':
        if (event.data.stage === 'STAGE3') {
          await this.reportToHuman(`💻 项目进入研发阶段: ${event.data.projectName}`);
        }
        break;
      case 'TASK_ASSIGNED':
        await this.reportToHuman(
          `📋 新开发任务: ${event.data.taskTitle} (${event.data.estimatedHours}h)`
        );
        break;
      case 'CODE_REVIEW_NEEDED':
        await this.requestHuman(`👀 代码待审查: ${event.data.taskTitle}，请安排review`, event.data);
        break;
      case 'BUILD_FAILED':
        await this.reportToHuman(`❌ 构建失败: ${event.data.projectName} - ${event.data.error}`);
        break;
    }
  }

  async decide(): Promise<AgentAction | null> {
    return null;
  }

  async act(action: AgentAction): Promise<void> {
    logger.info(`[开发工程师] 执行: ${action.type}`);
  }
}

// 5. AI交付专家
export class DeliveryAgent extends BaseAgent {
  constructor() {
    super('delivery-agent', 'AI交付专家', 'DELIVERY');
    this.capabilities = ['部署上线', '客户培训', '运维交接'];
  }

  async perceive(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case 'PROJECT_STAGE_CHANGED':
        if (event.data.stage === 'STAGE4') {
          await this.reportToHuman(`🚀 项目进入交付阶段: ${event.data.projectName}`);
        }
        break;
      case 'DEPLOYMENT_READY':
        await this.requestHuman(`📦 部署准备完成: ${event.data.projectName}，请确认上线时间`, event.data);
        break;
      case 'DEPLOYMENT_FAILED':
        await this.reportToHuman(`❌ 部署失败: ${event.data.projectName} - ${event.data.error}`);
        break;
      case 'TRAINING_NEEDED':
        await this.reportToHuman(`👥 客户培训待安排: ${event.data.projectName}`);
        break;
    }
  }

  async decide(): Promise<AgentAction | null> {
    return null;
  }

  async act(action: AgentAction): Promise<void> {
    logger.info(`[交付专家] 执行: ${action.type}`);
  }
}

// 6. AI财务助手
export class FinanceAgent extends BaseAgent {
  constructor() {
    super('finance-agent', 'AI财务助手', 'FINANCE');
    this.capabilities = ['预算管理', '成本核算', '收款跟踪'];
  }

  async perceive(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case 'PAYMENT_DUE':
        await this.reportToHuman(
          `💰 收款节点提醒: ${event.data.projectName} - ${event.data.phase}`,
          {
            projectName: event.data.projectName,
            phase: event.data.phase,
            amount: event.data.amount,
            dueDate: event.data.dueDate
          }
        );
        break;
      case 'BUDGET_EXCEEDED':
        await this.reportToHuman(
          `⚠️ 预算超支预警: ${event.data.projectName} 已超支 ${event.data.percentage}%`,
          {
            alertType: 'risk',
            projectName: event.data.projectName,
            data: event.data
          }
        );
        break;
      case 'COST_HIGH':
        if (event.data.percentage > 80) {
          await this.reportToHuman(
            `📊 成本预警: ${event.data.projectName} 成本已达预算的 ${event.data.percentage}%`
          );
        }
        break;
    }
  }

  async decide(): Promise<AgentAction | null> {
    // 规则：检查是否有收款节点临近（7天内）
    return null;
  }

  async act(action: AgentAction): Promise<void> {
    logger.info(`[财务助手] 执行: ${action.type}`);
  }
}

// 7. AI院长助理
export class DirectorAgent extends BaseAgent {
  constructor() {
    super('director-agent', 'AI院长助理', 'DIRECTOR');
    this.capabilities = ['全局监控', '决策支持', '异常预警'];
  }

  async perceive(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case 'DAILY_REPORT_TIME':
        // 每日简报
        await this.reportToHuman(
          `📊 每日项目简报`,
          {
            stats: event.data.stats
          }
        );
        break;
      case 'CRITICAL_ISSUE':
        await this.reportToHuman(
          `🚨 重大事项: ${event.data.title}`,
          {
            alertType: 'delay',
            projectName: event.data.projectName,
            data: event.data
          }
        );
        break;
      case 'PERFORMANCE_ALERT':
        await this.reportToHuman(
          `📈 绩效预警: ${event.data.message}`
        );
        break;
    }
  }

  async decide(): Promise<AgentAction | null> {
    return null;
  }

  async act(action: AgentAction): Promise<void> {
    logger.info(`[院长助理] 执行: ${action.type}`);
  }
}

// 8. AI交互运维工程师
export class DevOpsAgent extends BaseAgent {
  constructor() {
    super('devops-agent', 'AI运维工程师', 'DEVOPS');
    this.capabilities = ['用户体验优化', '系统运维保障'];
  }

  async perceive(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case 'SYSTEM_ERROR':
        await this.reportToHuman(
          `🔧 系统异常: ${event.data.message}`,
          {
            alertType: 'error',
            details: event.data.details
          }
        );
        break;
      case 'SYSTEM_WARNING':
        await this.reportToHuman(
          `⚠️ 系统警告: ${event.data.message}`,
          {
            alertType: 'warning',
            details: event.data.details
          }
        );
        break;
      case 'USER_FEEDBACK':
        if (event.data.rating < 3) {
          await this.reportToHuman(`👤 用户反馈: ${event.data.message} (评分: ${event.data.rating})`);
        }
        break;
    }
  }

  async decide(): Promise<AgentAction | null> {
    return null;
  }

  async act(action: AgentAction): Promise<void> {
    logger.info(`[运维工程师] 执行: ${action.type}`);
  }
}