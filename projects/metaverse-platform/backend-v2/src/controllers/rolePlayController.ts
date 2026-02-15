import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { RolePlayService } from '../services/rolePlayService.js'

const prisma = new PrismaClient()
const rolePlayService = new RolePlayService(prisma)

// ============================================
// 角色模板管理
// ============================================

export const createRoleTemplate = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      category,
      personality,
      expertise,
      speakingStyle,
      behaviorRules,
      systemPrompt,
      isDefault,
      isPublic,
      createdBy
    } = req.body
    
    const template = await rolePlayService.createTemplate({
      name,
      description,
      category,
      personality,
      expertise,
      speakingStyle,
      behaviorRules,
      systemPrompt,
      isDefault,
      isPublic,
      createdBy
    })
    
    res.json({ success: true, data: template })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const listRoleTemplates = async (req: Request, res: Response) => {
  try {
    const { category, isPublic, search } = req.query
    
    const templates = await rolePlayService.listTemplates({
      category: category as string,
      isPublic: isPublic !== undefined ? isPublic === 'true' : undefined,
      search: search as string
    })
    
    res.json({ success: true, data: templates })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const getRoleTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const template = await rolePlayService.getTemplate(id as string)
    
    res.json({ success: true, data: template })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const applyRoleTemplate = async (req: Request, res: Response) => {
  try {
    const { agentId, templateId } = req.body
    
    await rolePlayService.applyTemplateToAgent(agentId as string, templateId as string)
    
    res.json({ success: true, message: 'Template applied successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

// ============================================
// Agent角色配置
// ============================================

export const getAgentRoleConfig = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params
    
    const config = await rolePlayService.getAgentRoleConfig(agentId as string)
    
    if (!config) {
      return res.status(404).json({ success: false, error: 'Role config not found' })
    }
    
    res.json({ success: true, data: config })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const updateAgentRoleConfig = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params
    const config = req.body
    
    await rolePlayService.updateAgentRoleConfig(agentId as string, config)
    
    res.json({ success: true, message: 'Role config updated' })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

// ============================================
// 发言生成
// ============================================

export const generateSpeech = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params
    const { context, topic, intent, maxLength } = req.body
    
    const speech = await rolePlayService.generateSpeech(agentId as string, context, {
      topic,
      intent,
      maxLength
    })
    
    res.json({ success: true, data: speech })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

// ============================================
// 角色能力评估
// ============================================

export const assessAgentCapability = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params
    
    const assessment = await rolePlayService.assessAgentCapability(agentId as string)
    
    res.json({ success: true, data: assessment })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

// ============================================
// 预设角色
// ============================================

export const createPresetRoles = async (req: Request, res: Response) => {
  try {
    await rolePlayService.createPresetRoles()
    
    res.json({ success: true, message: 'Preset roles created' })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}