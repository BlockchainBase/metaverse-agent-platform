import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// 获取财务统计
router.get('/stats', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { payments: true }
    });
    
    const totalContract = projects.reduce((sum, p) => sum + (p.contractAmount || 0), 0);
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const received = projects.reduce((sum, p) => 
      sum + p.payments.filter(pay => pay.status === 'RECEIVED').reduce((s, pay) => s + pay.amount, 0), 0
    );
    
    res.json({
      totalContract,
      totalBudget,
      totalReceived: received,
      pendingAmount: totalContract - received
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch finance stats' });
  }
});

// 获取项目付款
router.get('/project/:projectId', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { plannedDate: 'asc' }
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

export { router as financeRouter };