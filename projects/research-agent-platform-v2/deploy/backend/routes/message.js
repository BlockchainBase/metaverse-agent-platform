"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRouter = void 0;
const express_1 = require("express");
const index_1 = require("../index");
const router = (0, express_1.Router)();
exports.messageRouter = router;
// 获取消息历史
router.get('/history', async (req, res) => {
    try {
        const { agentId, limit = 100 } = req.query;
        const where = {};
        if (agentId) {
            where.OR = [
                { fromAgentId: agentId },
                { toAgentId: agentId }
            ];
        }
        const messages = await index_1.prisma.message.findMany({
            where,
            include: {
                fromAgent: { select: { id: true, name: true, agentId: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit)
        });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
//# sourceMappingURL=message.js.map