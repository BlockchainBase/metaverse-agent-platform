import type { Request, Response } from 'express'
import { prisma } from '../utils/db'
import type { ApiResponse } from '../types/index'

export const getAgents = async (req: Request, res: Response) => {
  try {
    const { organizationId, status, type } = req.query
    const where: any = {}
    if (organizationId) where.organizationId = organizationId as string
    if (status) where.status = status as string
    if (type) where.type = type as string

    const agents = await prisma.agent.findMany({
      where,
      include: {
        organization: { select: { id: true, name: true } },
        role: { select: { id: true, name: true } }
      }
    })
    res.json({ success: true, data: agents } as ApiResponse)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch agents' } as ApiResponse)
  }
}

export const getAgent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        organization: { select: { id: true, name: true } },
        role: { select: { id: true, name: true } }
      }
    })
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' } as ApiResponse)
    }
    res.json({ success: true, data: agent } as ApiResponse)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch agent' } as ApiResponse)
  }
}

export const createAgent = async (req: Request, res: Response) => {
  try {
    const { name, avatar, status, type, config, capabilities, organizationId, roleId } = req.body
    if (!name || !organizationId) {
      return res.status(400).json({ success: false, error: 'Name and organizationId are required' } as ApiResponse)
    }
    const agent = await prisma.agent.create({
      data: {
        name,
        avatar,
        status: status || 'offline',
        type: type || 'ai',
        config: config ? JSON.stringify(config) : null,
        capabilities: capabilities ? JSON.stringify(capabilities) : null,
        organizationId,
        roleId
      }
    })
    res.status(201).json({ success: true, data: agent, message: 'Agent created successfully' } as ApiResponse)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create agent' } as ApiResponse)
  }
}

export const updateAgent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const data = req.body
    const existingAgent = await prisma.agent.findUnique({ where: { id } })
    if (!existingAgent) {
      return res.status(404).json({ success: false, error: 'Agent not found' } as ApiResponse)
    }
    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.avatar !== undefined) updateData.avatar = data.avatar
    if (data.status) updateData.status = data.status
    if (data.type) updateData.type = data.type
    if (data.config) updateData.config = JSON.stringify(data.config)
    if (data.capabilities) updateData.capabilities = JSON.stringify(data.capabilities)
    if (data.roleId !== undefined) updateData.roleId = data.roleId
    
    const agent = await prisma.agent.update({ where: { id }, data: updateData })
    res.json({ success: true, data: agent, message: 'Agent updated successfully' } as ApiResponse)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update agent' } as ApiResponse)
  }
}

export const deleteAgent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const existingAgent = await prisma.agent.findUnique({ where: { id } })
    if (!existingAgent) {
      return res.status(404).json({ success: false, error: 'Agent not found' } as ApiResponse)
    }
    await prisma.agent.delete({ where: { id } })
    res.json({ success: true, message: 'Agent deleted successfully' } as ApiResponse)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete agent' } as ApiResponse)
  }
}
