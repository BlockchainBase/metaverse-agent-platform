import type { Request, Response } from 'express'
import { prisma } from '../utils/db'
import type { ApiResponse } from '../types/index'

export const getProcessTemplates = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.query
    const where: any = {}
    if (businessId) where.businessId = businessId as string

    const templates = await prisma.processTemplate.findMany({
      where,
      include: { business: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ success: true, data: templates } as ApiResponse)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch process templates' } as ApiResponse)
  }
}

export const getProcessTemplate = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const template = await prisma.processTemplate.findUnique({
      where: { id },
      include: { business: { select: { id: true, name: true } } }
    })
    if (!template) {
      return res.status(404).json({ success: false, error: 'Process template not found' } as ApiResponse)
    }
    res.json({ success: true, data: template } as ApiResponse)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch process template' } as ApiResponse)
  }
}

export const createProcessTemplate = async (req: Request, res: Response) => {
  try {
    const { name, description, definition, businessId } = req.body
    if (!name || !definition || !businessId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, definition and businessId are required' 
      } as ApiResponse)
    }
    let defObj: any
    try {
      defObj = typeof definition === 'string' ? JSON.parse(definition) : definition
    } catch {
      return res.status(400).json({ success: false, error: 'Definition must be valid JSON' } as ApiResponse)
    }
    const template = await prisma.processTemplate.create({
      data: {
        name,
        description,
        definition: JSON.stringify(defObj),
        businessId
      }
    })
    res.status(201).json({ success: true, data: template, message: 'Process template created successfully' } as ApiResponse)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create process template' } as ApiResponse)
  }
}

export const updateProcessTemplate = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const data = req.body
    const existingTemplate = await prisma.processTemplate.findUnique({ where: { id } })
    if (!existingTemplate) {
      return res.status(404).json({ success: false, error: 'Process template not found' } as ApiResponse)
    }
    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.definition) {
      try {
        const defObj = typeof data.definition === 'string' ? JSON.parse(data.definition) : data.definition
        updateData.definition = JSON.stringify(defObj)
      } catch {
        return res.status(400).json({ success: false, error: 'Definition must be valid JSON' } as ApiResponse)
      }
    }
    if (data.status) updateData.status = data.status
    
    const template = await prisma.processTemplate.update({ where: { id }, data: updateData })
    res.json({ success: true, data: template, message: 'Process template updated successfully' } as ApiResponse)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update process template' } as ApiResponse)
  }
}

export const deleteProcessTemplate = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const existingTemplate = await prisma.processTemplate.findUnique({ where: { id } })
    if (!existingTemplate) {
      return res.status(404).json({ success: false, error: 'Process template not found' } as ApiResponse)
    }
    await prisma.processTemplate.delete({ where: { id } })
    res.json({ success: true, message: 'Process template deleted successfully' } as ApiResponse)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete process template' } as ApiResponse)
  }
}
