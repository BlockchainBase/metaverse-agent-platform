import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler, AppError } from '../utils/error';
import { AgentCreateInput, AgentUpdateInput } from '../types/index';
const router = Router();
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { organizationId, status, type } = req.query;
  const agents = await prisma.agent.findMany({ where: { ...(organizationId && { organizationId: organizationId as string }), ...(status && { status: status as string }), ...(type && { type: type as string }) }, include: { organization: { select: { id: true, name: true } }, role: { select: { id: true, name: true } }, assignedTasks: { where: { status: { not: 'completed' } }, select: { id: true, title: true, status: true } } } });
  res.json({ success: true, data: agents });
}));
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const agent = await prisma.agent.findUnique({ where: { id: req.params.id as string }, include: { organization: { select: { id: true, name: true } }, role: { select: { id: true, name: true } }, assignedTasks: true } });
  if (!agent) throw new AppError('Agent not found', 404);
  res.json({ success: true, data: agent });
}));
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const data: AgentCreateInput = req.body;
  if (!data.name || !data.organizationId) throw new AppError('Name and organizationId required', 400);
  const agent = await prisma.agent.create({ data: { name: data.name, avatar: data.avatar, type: data.type || 'ai', config: data.config ? JSON.stringify(data.config) : null, capabilities: data.capabilities ? JSON.stringify(data.capabilities) : null, organizationId: data.organizationId, roleId: data.roleId }, include: { organization: { select: { id: true, name: true } }, role: { select: { id: true, name: true } } } });
  res.status(201).json({ success: true, data: agent });
}));
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const data: AgentUpdateInput = req.body;
  const existing = await prisma.agent.findUnique({ where: { id: req.params.id as string } });
  if (!existing) throw new AppError('Agent not found', 404);
  const agent = await prisma.agent.update({ where: { id: req.params.id as string }, data: { ...(data.name && { name: data.name }), ...(data.avatar && { avatar: data.avatar }), ...(data.status && { status: data.status }), ...(data.type && { type: data.type }), ...(data.config && { config: JSON.stringify(data.config) }), ...(data.capabilities && { capabilities: JSON.stringify(data.capabilities) }), ...(data.roleId !== undefined && { roleId: data.roleId }) }, include: { organization: { select: { id: true, name: true } }, role: { select: { id: true, name: true } } } });
  res.json({ success: true, data: agent });
}));
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => { const existing = await prisma.agent.findUnique({ where: { id: req.params.id as string } }); if (!existing) throw new AppError('Agent not found', 404); await prisma.agent.delete({ where: { id: req.params.id as string } }); res.json({ success: true, message: 'Agent deleted' }); }));
router.patch('/:id/status', asyncHandler(async (req: Request, res: Response) => { const { status } = req.body; if (!status) throw new AppError('Status required', 400); const agent = await prisma.agent.update({ where: { id: req.params.id as string }, data: { status } }); res.json({ success: true, data: agent }); }));
export default router;
