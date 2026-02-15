import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// 获取所有Agent
router.get('/', async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// 获取在线Agent
router.get('/online', async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      where: { status: { not: 'offline' } },
      orderBy: { lastSeen: 'desc' }
    });
    res.json({
      count: agents.length,
      agents
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch online agents' });
  }
});

// 获取单个Agent
router.get('/:id', async (req, res) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id },
      include: {
        assignedTasks: true,
        createdTasks: true
      }
    });
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// 创建Agent
router.post('/', async (req, res) => {
  try {
    const agent = await prisma.agent.create({
      data: req.body
    });
    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// 更新Agent状态
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const agent = await prisma.agent.update({
      where: { id: req.params.id },
      data: { 
        status,
        lastSeen: new Date()
      }
    });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update agent status' });
  }
});

export { router as agentRouter };