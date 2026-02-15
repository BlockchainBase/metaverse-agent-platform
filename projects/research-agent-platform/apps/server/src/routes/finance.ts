import { Router } from 'express';

const router = Router();

// Mock finance data
const mockFinance = {
  stats: {
    totalContract: 2500000,
    totalBudget: 1800000,
    totalCost: 850000,
    paymentStats: [
      { status: 'RECEIVED', _sum: { amount: 1200000 }, _count: { id: 5 } },
      { status: 'PENDING', _sum: { amount: 800000 }, _count: { id: 3 } },
      { status: 'INVOICED', _sum: { amount: 500000 }, _count: { id: 2 } }
    ]
  },
  projectFinances: [
    {
      id: '1',
      projectId: '1',
      projectName: '智慧校园系统',
      customerName: 'XX教育局',
      contractAmount: 500000,
      budget: { totalBudget: 350000, laborBudget: 250000, outsourceBudget: 80000, otherBudget: 20000 },
      costs: [{ type: 'LABOR', amount: 120000 }, { type: 'OUTSOURCE', amount: 40000 }],
      payments: [
        { phase: '首付款', percentage: 30, amount: 150000, status: 'RECEIVED', plannedDate: '2024-01-15', actualDate: '2024-01-15' },
        { phase: '中期款', percentage: 50, amount: 250000, status: 'PENDING', plannedDate: '2024-03-15', actualDate: null },
        { phase: '尾款', percentage: 20, amount: 100000, status: 'PENDING', plannedDate: '2024-05-15', actualDate: null }
      ]
    }
  ]
};

// Get project finance
router.get('/project/:projectId', (req, res) => {
  const finance = mockFinance.projectFinances.find(f => f.projectId === req.params.projectId);
  res.json(finance || mockFinance.projectFinances[0]);
});

// Get finance stats
router.get('/stats/overview', (req, res) => {
  res.json(mockFinance.stats);
});

export { router as financeRouter };