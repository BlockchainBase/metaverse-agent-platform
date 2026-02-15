import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// 获取所有客户
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count: { select: { projects: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// 获取单个客户
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        contacts: true,
        projects: true
      }
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// 创建客户
router.post('/', async (req, res) => {
  try {
    const customer = await prisma.customer.create({
      data: req.body
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

export { router as customerRouter };