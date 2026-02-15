import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// 获取任务
router.get('/', async (req, res) => {
  try {
    const { projectId, assigneeId, status } = req.query;
    
    const where: any = {};
    if (projectId) where.projectId = projectId as string;
    if (assigneeId) where.assigneeId = assigneeId as string;
    if (status) where.status = status;
    
    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, agentId: true } },
        project: { select: { id: true, name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// 创建任务
router.post('/', async (req, res) => {
  try {
    const task = await prisma.task.create({
      data: req.body,
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } }
      }
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// 更新任务状态
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updateData: any = { status };
    
    if (status === 'DONE') {
      updateData.completedAt = new Date();
    }
    
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData
    });
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

export { router as taskRouter };