"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financeRouter = void 0;
const express_1 = require("express");
const index_1 = require("../index");
const router = (0, express_1.Router)();
exports.financeRouter = router;
// 获取财务统计
router.get('/stats', async (req, res) => {
    try {
        const projects = await index_1.prisma.project.findMany({
            include: { payments: true }
        });
        const totalContract = projects.reduce((sum, p) => sum + (p.contractAmount || 0), 0);
        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const received = projects.reduce((sum, p) => sum + p.payments.filter(pay => pay.status === 'RECEIVED').reduce((s, pay) => s + pay.amount, 0), 0);
        res.json({
            totalContract,
            totalBudget,
            totalReceived: received,
            pendingAmount: totalContract - received
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch finance stats' });
    }
});
// 获取项目付款
router.get('/project/:projectId', async (req, res) => {
    try {
        const payments = await index_1.prisma.payment.findMany({
            where: { projectId: req.params.projectId },
            orderBy: { plannedDate: 'asc' }
        });
        res.json(payments);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});
//# sourceMappingURL=finance.js.map