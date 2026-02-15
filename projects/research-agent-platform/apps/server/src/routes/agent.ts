import { Router } from 'express';
import { agentManager } from '../agents/manager';
import { logger } from '../utils/logger';

const router = Router();

// Get all agents
router.get('/', (req, res) => {
  const agents = agentManager.getAllAgents().map(agent => ({
    id: agent.id,
    name: agent.name,
    role: agent.role,
    status: agent.status,
    capabilities: agent.capabilities
  }));
  
  res.json(agents);
});

// Get agent by ID
router.get('/:id', (req, res) => {
  const agent = agentManager.getAgent(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  res.json({
    id: agent.id,
    name: agent.name,
    role: agent.role,
    status: agent.status,
    capabilities: agent.capabilities
  });
});

// Trigger agent action
router.post('/:id/action', async (req, res) => {
  const { action, params } = req.body;
  const agent = agentManager.getAgent(req.params.id);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  try {
    // Create event for agent
    const event = {
      type: action,
      data: params || {},
      timestamp: new Date()
    };
    
    await agent.perceive(event);
    
    res.json({
      success: true,
      message: `Agent ${agent.name} processed action: ${action}`
    });
  } catch (error) {
    logger.error(`Agent action failed: ${action}`, error);
    res.status(500).json({ error: 'Agent action failed' });
  }
});

// Broadcast event to all agents
router.post('/broadcast', async (req, res) => {
  const { type, data } = req.body;
  
  try {
    await agentManager.broadcast({
      type,
      data: data || {},
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      message: `Event ${type} broadcasted to all agents`
    });
  } catch (error) {
    logger.error('Broadcast failed:', error);
    res.status(500).json({ error: 'Broadcast failed' });
  }
});

// Test notification (send to Feishu)
router.post('/test-notification', async (req, res) => {
  const { agentId, message, card } = req.body;
  const agent = agentManager.getAgent(agentId);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  try {
    await agent.reportToHuman(message, card);
    
    res.json({
      success: true,
      message: 'Notification sent'
    });
  } catch (error) {
    logger.error('Test notification failed:', error);
    res.status(500).json({ error: 'Notification failed' });
  }
});

// Trigger automation rule manually
router.post('/trigger-rule', async (req, res) => {
  const { ruleType, data } = req.body;
  
  const eventMap: Record<string, any> = {
    'task-overdue': {
      type: 'TASK_OVERDUE',
      data: {
        taskTitle: data?.taskTitle || '示例任务',
        projectName: data?.projectName || '示例项目',
        dueDate: data?.dueDate || new Date().toISOString(),
        assignee: data?.assignee || '张三'
      }
    },
    'customer-follow-up': {
      type: 'CUSTOMER_NO_CONTACT',
      data: {
        name: data?.customerName || '示例客户',
        days: data?.days || 5
      }
    },
    'payment-due': {
      type: 'PAYMENT_DUE',
      data: {
        projectName: data?.projectName || '示例项目',
        phase: data?.phase || '中期款',
        amount: data?.amount || 250000,
        dueDate: data?.dueDate || '2024-03-15'
      }
    },
    'project-delay': {
      type: 'PROJECT_DELAYED',
      data: {
        projectName: data?.projectName || '示例项目',
        delayDays: data?.delayDays || 5,
        reason: data?.reason || '需求变更'
      }
    }
  };

  const event = eventMap[ruleType];
  
  if (!event) {
    return res.status(400).json({ error: 'Unknown rule type' });
  }

  try {
    await agentManager.broadcast({
      ...event,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      message: `Rule ${ruleType} triggered`,
      event
    });
  } catch (error) {
    logger.error('Rule trigger failed:', error);
    res.status(500).json({ error: 'Rule trigger failed' });
  }
});

export { router as agentRouter };