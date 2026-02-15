import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// 获取消息历史
router.get('/history', async (req, res) => {
  try {
    const { agentId, limit = 100 } = req.query;
    
    const where: any = {};
    if (agentId) {
      where.OR = [
        { fromAgentId: agentId },
        { toAgentId: agentId }
      ];
    }
    
    const messages = await prisma.message.findMany({
      where,
      include: {
        fromAgent: { select: { id: true, name: true, agentId: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string)
    });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export { router as messageRouter };