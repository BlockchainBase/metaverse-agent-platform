import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import {
  NLCommandService,
  WorkflowService,
  AgentVersionService
} from '../services/autonomousService.js'

const prisma = new PrismaClient()
const nlCommandService = new NLCommandService(prisma)
const workflowService = new WorkflowService(prisma, nlCommandService)
const agentVersionService = new AgentVersionService(prisma)

// ============================================
// 自然语言命令
// ============================================

export const parseCommand = async (req: Request, res: Response) => {
  try {
    const { command } = req.body
    const { agentId, organizationId } = req.query
    
    if (!command) {
      return res.status(400).json({ success: false, error: 'Command is required' })
    }
    
    const parsed = await nlCommandService.parseCommand(command, {
      agentId: agentId as string,
      organizationId: organizationId as string
    })
    
    res.json({ success: true, data: parsed })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const executeCommand = async (req: Request, res: Response) => {
  try {
    const { command } = req.body
    const { agentId, organizationId } = req.body
    
    if (!command) {
      return res.status(400).json({ success: false, error: 'Command is required' })
    }
    
    // 解析并执行
    const parsed = await nlCommandService.parseCommand(command, {
      agentId,
      organizationId
    })
    
    const result = await nlCommandService.executeCommand(parsed, {
      agentId,
      organizationId
    })
    
    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const getCommandHistory = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.query
    const { limit } = req.query
    
    const history = await nlCommandService.getCommandHistory(
      agentId as string,
      parseInt(limit as string) || 50
    )
    
    res.json({ success: true, data: history })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

// ============================================
// 工作流触发器
// ============================================

export const createWorkflowTrigger = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      triggerType,
      condition,
      actionType,
      actionConfig,
      createdBy
    } = req.body
    
    const trigger = await workflowService.createTrigger({
      name,
      description,
      triggerType,
      condition,
      actionType,
      actionConfig,
      createdBy
    })
    
    res.json({ success: true, data: trigger })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const listWorkflowTriggers = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query
    
    const triggers = await workflowService.listTriggers(
      isActive !== undefined ? isActive === 'true' : undefined
    )
    
    res.json({ success: true, data: triggers })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const updateWorkflowTriggerStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { isActive } = req.body
    
    const trigger = await workflowService.updateTriggerStatus(id as string, isActive)
    
    res.json({ success: true, data: trigger })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const deleteWorkflowTrigger = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    await workflowService.deleteTrigger(id as string)
    
    res.json({ success: true, message: 'Trigger deleted' })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

// ============================================
// 工作流执行
// ============================================

export const executeWorkflow = async (req: Request, res: Response) => {
  try {
    const { triggerId } = req.params
    const { input } = req.body
    
    const execution = await workflowService.executeWorkflow(triggerId as string, input)
    
    res.json({ success: true, data: execution })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const triggerFromNL = async (req: Request, res: Response) => {
  try {
    const { command } = req.body
    const { agentId, organizationId } = req.body
    
    const result = await workflowService.triggerFromNL(command, {
      agentId,
      organizationId
    })
    
    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const getWorkflowExecutionHistory = async (req: Request, res: Response) => {
  try {
    const { triggerId } = req.query
    const { limit } = req.query
    
    const history = await workflowService.getExecutionHistory(
      triggerId as string,
      parseInt(limit as string) || 50
    )
    
    res.json({ success: true, data: history })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

// ============================================
// Agent版本管理
// ============================================

export const createAgentVersion = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params
    const { name, description, createdBy } = req.body
    
    const version = await agentVersionService.createVersion(agentId as string, {
      name,
      description,
      createdBy
    })
    
    res.json({ success: true, data: version })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const listAgentVersions = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params
    
    const versions = await agentVersionService.listVersions(agentId as string)
    
    res.json({ success: true, data: versions })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const rollbackToVersion = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params
    const { versionId } = req.body
    
    const agent = await agentVersionService.rollbackToVersion(agentId as string, versionId as string)
    
    res.json({ success: true, data: agent })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const compareVersions = async (req: Request, res: Response) => {
  try {
    const { versionId1, versionId2 } = req.body
    
    const comparison = await agentVersionService.compareVersions(versionId1 as string, versionId2 as string)
    
    res.json({ success: true, data: comparison })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}