import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// 获取所有项目
router.get('/', async (req, res) => {
  try {
    const { stage, status } = req.query;
    
    const where: any = {};
    if (stage) where.stage = stage;
    if (status) where.status = status;
    
    const projects = await prisma.project.findMany({
      where,
      include: {
        customer: true,
        _count: { select: { tasks: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// 获取单个项目
router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { include: { contacts: true } },
        milestones: true,
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, agentId: true } }
          }
        },
        payments: true
      }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// 创建项目
router.post('/', async (req, res) => {
  try {
    const count = await prisma.project.count();
    const code = `PJ${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;
    
    const project = await prisma.project.create({
      data: {
        ...req.body,
        code
      }
    });
    
    // 创建默认里程碑
    await prisma.milestone.createMany({
      data: [
        { projectId: project.id, name: '完成市场对接', stage: 'STAGE1' },
        { projectId: project.id, name: '完成方案制定', stage: 'STAGE2' },
        { projectId: project.id, name: '完成研发Demo', stage: 'STAGE3' },
        { projectId: project.id, name: '完成实施交付', stage: 'STAGE4' }
      ]
    });
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// 更新项目阶段
router.put('/:id/stage', async (req, res) => {
  try {
    const { stage, stageStatus } = req.body;
    
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { stage, stageStatus }
    });
    
    // 如果阶段完成，更新里程碑
    if (stageStatus === 'COMPLETED') {
      await prisma.milestone.updateMany({
        where: { projectId: req.params.id, stage },
        data: { status: 'COMPLETED', completedAt: new Date() }
      });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project stage' });
  }
});

export { router as projectRouter };