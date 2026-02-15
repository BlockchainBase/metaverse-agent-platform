import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { TaskMatchingService } from '../services/taskMatchingService.js'

const prisma = new PrismaClient()
const taskMatchingService = new TaskMatchingService(prisma)

// ============================================
// Agent能力画像
// ============================================

export const getAgentCapabilityProfile = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params
    
    const profile = await taskMatchingService.buildCapabilityProfile(agentId as string)
    
    res.json({ success: true, data: profile })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const updateAgentSkills = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params
    const { skills } = req.body
    
    await taskMatchingService.updateAgentSkills(agentId as string, skills)
    
    res.json({ success: true, message: 'Agent skills updated' })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

// ============================================
// 任务匹配
// ============================================

export const findBestAgents = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params
    const { topK, minOverallScore, strategy, considerWorkload, considerHistory } = req.body
    
    const task = await prisma.task.findUnique({
      where: { id: taskId as string }
    })
    
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }
    
    const matches = await taskMatchingService.findBestAgents(task, {
      topK: topK || 5,
      minOverallScore: minOverallScore || 0.3,
      strategy: strategy || 'best_fit',
      considerWorkload: considerWorkload !== false,
      considerHistory: considerHistory !== false
    })
    
    res.json({ success: true, data: matches })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const autoAssignTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params
    
    const task = await prisma.task.findUnique({
      where: { id: taskId as string }
    })
    
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }
    
    const matches = await taskMatchingService.findBestAgents(task, {
      topK: 1,
      strategy: 'load_balanced'
    })
    
    if (matches.length === 0) {
      return res.status(400).json({ success: false, error: 'No suitable agent found' })
    }
    
    const bestMatch = matches[0]
    
    // 分配任务
    await prisma.task.update({
      where: { id: taskId as string },
      data: {
        assigneeId: bestMatch.agentId,
        status: 'assigned'
      }
    })
    
    // 更新Agent负载
    await prisma.agent.update({
      where: { id: bestMatch.agentId },
      data: {
        workload: { increment: 1 }
      }
    })
    
    // 更新匹配历史
    await prisma.taskMatchHistory.updateMany({
      where: {
        taskId: taskId as string,
        agentId: bestMatch.agentId
      },
      data: {
        wasAssigned: true
      }
    })
    
    res.json({
      success: true,
      data: {
        assignedTo: bestMatch,
        taskId
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

// ============================================
// 负载均衡
// ============================================

export const performLoadBalancing = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params
    
    const result = await taskMatchingService.performLoadBalancing(organizationId as string)
    
    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const getLoadDistribution = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params
    
    const distribution = await taskMatchingService.getLoadDistribution(organizationId as string)
    
    res.json({ success: true, data: distribution })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

// ============================================
// 任务推荐
// ============================================

export const recommendTasks = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params
    const { limit } = req.query
    
    const tasks = await taskMatchingService.recommendSimilarTasks(
      agentId as string,
      parseInt(limit as string) || 5
    )
    
    res.json({ success: true, data: tasks })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

// ============================================
// 匹配历史
// ============================================

export const getTaskMatchHistory = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params
    
    const history = await prisma.taskMatchHistory.findMany({
      where: { taskId: taskId as string },
      orderBy: { matchedAt: 'desc' }
    })
    
    res.json({ success: true, data: history })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}