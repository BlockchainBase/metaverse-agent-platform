import type { Request, Response } from 'express'
import { prisma } from '../utils/db'
import type { ApiResponse } from '../types/index'

export const getProcessInstances = async (req: Request, res: Response) => {
  try {
    const { templateId, status } = req.query
    const where: any = {}
    if (templateId) where.templateId = templateId as string
    if (status) where.status = status as string

    const instances = await prisma.processInstance.findMany({
      where,
      include: {
        template: { select: { id: true, name: true } },
        tasks: { select: { id: true, title: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ success: true, data: instances } as ApiResponse)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch process instances' } as ApiResponse)
  }
}

export const getProcessInstance = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const instance = await prisma.processInstance.findUnique({
      where: { id },
      include: {
        template: { select: { id: true, name: true, definition: true } },
        tasks: { include: { assignee: { select: { id: true, name: true } } } }
      }
    })
    if (!instance) {
      return res.status(404).json({ success: false, error: 'Process instance not found' } as ApiResponse)
    }
    res.json({ success: true, data: instance } as ApiResponse)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch process instance' } as ApiResponse)
  }
}

export const startProcessInstance = async (req: Request, res: Response) => {
  try {
    const { templateId, data } = req.body
    if (!templateId) {
      return res.status(400).json({ 
        success: false, 
        error: 'TemplateId is required' 
      } as ApiResponse)
    }
    const template = await prisma.processTemplate.findUnique({
      where: { id: templateId }
    })
    if (!template) {
      return res.status(404).json({ success: false, error: 'Process template not found' } as ApiResponse)
    }
    let definition: any
    try {
      definition = JSON.parse(template.definition)
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid process definition' } as ApiResponse)
    }
    const instance = await prisma.processInstance.create({
      data: {
        templateId,
        status: 'running',
        data: data ? JSON.stringify(data) : null,
        startedAt: new Date()
      }
    })
    const tasks = definition.tasks || []
    for (const taskDef of tasks) {
      await prisma.task.create({
        data: {
          title: taskDef.title || 'Untitled Task',
          description: taskDef.description,
          status: 'pending',
          priority: taskDef.priority || 'medium',
          type: taskDef.type || 'default',
          data: taskDef.data ? JSON.stringify(taskDef.data) : null,
          processInstanceId: instance.id,
          assigneeId: taskDef.assigneeId
        }
      })
    }
    const result = await prisma.processInstance.findUnique({
      where: { id: instance.id },
      include: {
        template: { select: { id: true, name: true } },
        tasks: true
      }
    })
    res.status(201).json({ 
      success: true, 
      data: result, 
      message: 'Process instance started successfully' 
    } as ApiResponse)
  } catch (error) {
    console.error('Start process error:', error)
    res.status(500).json({ success: false, error: 'Failed to start process instance' } as ApiResponse)
  }
}

export const updateProcessInstance = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const { status, data } = req.body
    const existingInstance = await prisma.processInstance.findUnique({ where: { id } })
    if (!existingInstance) {
      return res.status(404).json({ success: false, error: 'Process instance not found' } as ApiResponse)
    }
    const updateData: any = {}
    if (status) updateData.status = status
    if (data) updateData.data = JSON.stringify(data)
    if (status === 'completed' || status === 'cancelled') {
      updateData.endedAt = new Date()
    }
    
    const instance = await prisma.processInstance.update({ where: { id }, data: updateData })
    res.json({ success: true, data: instance, message: 'Process instance updated successfully' } as ApiResponse)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update process instance' } as ApiResponse)
  }
}

export const deleteProcessInstance = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const existingInstance = await prisma.processInstance.findUnique({ where: { id } })
    if (!existingInstance) {
      return res.status(404).json({ success: false, error: 'Process instance not found' } as ApiResponse)
    }
    await prisma.processInstance.delete({ where: { id } })
    res.json({ success: true, message: 'Process instance deleted successfully' } as ApiResponse)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete process instance' } as ApiResponse)
  }
}
