import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import type { ApiResponse } from '../types/index'
import { AppError, asyncHandler } from '../utils/error'
import { io } from '../index'

// ==================== Meeting CRUD ====================

export const getMeetings = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId, status, type, agentId } = req.query as any
  
  const where: any = {}
  if (organizationId) where.organizationId = organizationId
  if (status) where.status = status
  if (type) where.type = type
  
  if (agentId) {
    where.participants = {
      some: { agentId }
    }
  }

  const meetings = await prisma.meeting.findMany({
    where,
    include: {
      participants: {
        include: {
          agent: { select: { id: true, name: true, avatar: true, status: true } }
        }
      },
      agendaItems: { orderBy: { order: 'asc' } },
    },
    orderBy: { scheduledAt: 'desc' }
  })

  res.json({ success: true, data: meetings } as ApiResponse)
})

export const getMeeting = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      participants: {
        include: { agent: { select: { id: true, name: true, avatar: true, status: true, type: true } } }
      },
      agendaItems: { orderBy: { order: 'asc' } },
      resolutions: { orderBy: { createdAt: 'desc' } }
    }
  })

  if (!meeting) throw new AppError('Meeting not found', 404)
  res.json({ success: true, data: meeting } as ApiResponse)
})

export const createMeeting = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body

  if (!data.title || !data.scheduledAt || !data.organizationId || !data.hostId) {
    throw new AppError('Title, scheduledAt, organizationId and hostId are required', 400)
  }

  const meeting = await prisma.meeting.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type || 'discussion',
      scheduledAt: new Date(data.scheduledAt),
      duration: data.duration || 60,
      organizationId: data.organizationId,
      hostId: data.hostId,
      roomId: data.roomId,
      roomPosition: data.roomPosition ? JSON.stringify(data.roomPosition) : null,
      participants: {
        create: [
          { agentId: data.hostId, role: 'host', status: 'invited' },
          ...(data.participantIds || [])
            .filter((id: string) => id !== data.hostId)
            .map((agentId: string) => ({ agentId, role: 'participant', status: 'invited' }))
        ]
      }
    },
    include: {
      participants: { include: { agent: { select: { id: true, name: true, avatar: true } } } }
    }
  })

  meeting.participants.forEach((p: any) => {
    io.to(`agent:${p.agentId}`).emit('meeting:invited', {
      meetingId: meeting.id, title: meeting.title, scheduledAt: meeting.scheduledAt
    })
  })

  res.status(201).json({ success: true, data: meeting, message: 'Meeting created' } as ApiResponse)
})

export const updateMeeting = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const data = req.body

  const existing = await prisma.meeting.findUnique({ where: { id } })
  if (!existing) throw new AppError('Meeting not found', 404)
  if (existing.status === 'completed' || existing.status === 'cancelled') {
    throw new AppError('Cannot update completed or cancelled meeting', 400)
  }

  const updateData: any = {}
  if (data.title) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.type) updateData.type = data.type
  if (data.scheduledAt) updateData.scheduledAt = new Date(data.scheduledAt)
  if (data.duration) updateData.duration = data.duration
  if (data.status) updateData.status = data.status
  if (data.roomId) updateData.roomId = data.roomId
  if (data.roomPosition) updateData.roomPosition = JSON.stringify(data.roomPosition)

  const meeting = await prisma.meeting.update({
    where: { id },
    data: updateData,
    include: { participants: { include: { agent: { select: { id: true, name: true } } } } }
  })

  io.to(`meeting:${id}`).emit('meeting:updated', meeting)
  res.json({ success: true, data: meeting, message: 'Meeting updated' } as ApiResponse)
})

export const deleteMeeting = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string

  const existing = await prisma.meeting.findUnique({ where: { id } })
  if (!existing) throw new AppError('Meeting not found', 404)
  if (existing.status === 'ongoing') throw new AppError('Cannot delete ongoing meeting', 400)

  await prisma.meeting.delete({ where: { id } })
  io.to(`meeting:${id}`).emit('meeting:deleted', { meetingId: id })
  res.json({ success: true, message: 'Meeting deleted' } as ApiResponse)
})

// ==================== Meeting Status ====================

export const startMeeting = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string

  const meeting = await prisma.meeting.findUnique({ where: { id } })
  if (!meeting) throw new AppError('Meeting not found', 404)
  if (meeting.status !== 'scheduled') throw new AppError('Only scheduled meetings can be started', 400)

  const updated = await prisma.meeting.update({
    where: { id },
    data: { status: 'ongoing', startedAt: new Date() },
    include: { participants: { include: { agent: { select: { id: true, name: true } } } } }
  })

  io.to(`meeting:${id}`).emit('meeting:started', updated)
  io.emit('meetings:update', { meetingId: id, status: 'ongoing' })
  res.json({ success: true, data: updated, message: 'Meeting started' } as ApiResponse)
})

export const endMeeting = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string

  const meeting = await prisma.meeting.findUnique({ where: { id } })
  if (!meeting) throw new AppError('Meeting not found', 404)
  if (meeting.status !== 'ongoing') throw new AppError('Only ongoing meetings can be ended', 400)

  const updated = await prisma.meeting.update({
    where: { id },
    data: { status: 'completed', endedAt: new Date() },
    include: { participants: { include: { agent: { select: { id: true, name: true } } } } }
  })

  await prisma.meetingParticipant.updateMany({
    where: { meetingId: id, status: 'joined' },
    data: { status: 'left', leftAt: new Date() }
  })

  io.to(`meeting:${id}`).emit('meeting:ended', updated)
  io.emit('meetings:update', { meetingId: id, status: 'completed' })
  res.json({ success: true, data: updated, message: 'Meeting ended' } as ApiResponse)
})

// ==================== Participants ====================

export const joinMeeting = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { agentId } = req.body

  if (!agentId) throw new AppError('agentId is required', 400)

  const meeting = await prisma.meeting.findUnique({ where: { id } })
  if (!meeting) throw new AppError('Meeting not found', 404)
  if (meeting.status === 'completed' || meeting.status === 'cancelled') {
    throw new AppError('Cannot join completed or cancelled meeting', 400)
  }

  const existing = await prisma.meetingParticipant.findUnique({
    where: { meetingId_agentId: { meetingId: id, agentId } }
  })

  let participant
  if (existing) {
    participant = await prisma.meetingParticipant.update({
      where: { id: existing.id },
      data: { status: 'joined', joinedAt: new Date() },
      include: { agent: { select: { id: true, name: true, avatar: true, status: true } } }
    })
  } else {
    participant = await prisma.meetingParticipant.create({
      data: { meetingId: id, agentId, role: 'observer', status: 'joined', joinedAt: new Date() },
      include: { agent: { select: { id: true, name: true, avatar: true, status: true } } }
    })
  }

  io.to(`meeting:${id}`).emit('meeting:participant:joined', participant)
  res.json({ success: true, data: participant, message: 'Joined meeting' } as ApiResponse)
})

export const leaveMeeting = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { agentId } = req.body

  if (!agentId) throw new AppError('agentId is required', 400)

  const participant = await prisma.meetingParticipant.findUnique({
    where: { meetingId_agentId: { meetingId: id, agentId } }
  })

  if (!participant) throw new AppError('Not a participant', 404)

  const updated = await prisma.meetingParticipant.update({
    where: { id: participant.id },
    data: { status: 'left', leftAt: new Date() },
    include: { agent: { select: { id: true, name: true, avatar: true } } }
  })

  io.to(`meeting:${id}`).emit('meeting:participant:left', updated)
  res.json({ success: true, data: updated, message: 'Left meeting' } as ApiResponse)
})

export const inviteParticipants = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { agentIds } = req.body

  if (!Array.isArray(agentIds) || agentIds.length === 0) {
    throw new AppError('agentIds array required', 400)
  }

  const meeting = await prisma.meeting.findUnique({ where: { id } })
  if (!meeting) throw new AppError('Meeting not found', 404)

  const participants = await Promise.all(
    agentIds.map(agentId =>
      prisma.meetingParticipant.upsert({
        where: { meetingId_agentId: { meetingId: id, agentId } },
        update: {},
        create: { meetingId: id, agentId, role: 'participant', status: 'invited' },
        include: { agent: { select: { id: true, name: true, avatar: true } } }
      })
    )
  )

  participants.forEach((p: any) => {
    io.to(`agent:${p.agentId}`).emit('meeting:invited', {
      meetingId: id, title: meeting.title, scheduledAt: meeting.scheduledAt
    })
  })

  res.json({ success: true, data: participants, message: 'Participants invited' } as ApiResponse)
})

// ==================== Agenda ====================

export const addAgendaItem = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const data = req.body

  const meeting = await prisma.meeting.findUnique({ where: { id } })
  if (!meeting) throw new AppError('Meeting not found', 404)

  const maxOrder = await prisma.meetingAgenda.aggregate({
    where: { meetingId: id },
    _max: { order: true }
  })

  const agendaItem = await prisma.meetingAgenda.create({
    data: {
      title: data.title,
      description: data.description,
      duration: data.duration || 10,
      order: data.order ?? ((maxOrder._max.order || 0) + 1),
      ownerId: data.ownerId,
      meetingId: id
    }
  })

  io.to(`meeting:${id}`).emit('meeting:agenda:added', agendaItem)
  res.status(201).json({ success: true, data: agendaItem, message: 'Agenda added' } as ApiResponse)
})

export const updateAgendaItem = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const agendaId = req.params.agendaId as string
  const data = req.body

  const existing = await prisma.meetingAgenda.findFirst({ where: { id: agendaId, meetingId: id } })
  if (!existing) throw new AppError('Agenda item not found', 404)

  const updateData: any = {}
  if (data.title) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.duration) updateData.duration = data.duration
  if (data.order !== undefined) updateData.order = data.order
  if (data.status) updateData.status = data.status
  if (data.ownerId !== undefined) updateData.ownerId = data.ownerId
  if (data.notes !== undefined) updateData.notes = data.notes

  const agendaItem = await prisma.meetingAgenda.update({ where: { id: agendaId }, data: updateData })
  io.to(`meeting:${id}`).emit('meeting:agenda:updated', agendaItem)
  res.json({ success: true, data: agendaItem, message: 'Agenda updated' } as ApiResponse)
})

export const deleteAgendaItem = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const agendaId = req.params.agendaId as string

  const existing = await prisma.meetingAgenda.findFirst({ where: { id: agendaId, meetingId: id } })
  if (!existing) throw new AppError('Agenda item not found', 404)

  await prisma.meetingAgenda.delete({ where: { id: agendaId } })
  io.to(`meeting:${id}`).emit('meeting:agenda:deleted', { agendaId })
  res.json({ success: true, message: 'Agenda deleted' } as ApiResponse)
})

export const reorderAgenda = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { agendaIds } = req.body

  if (!Array.isArray(agendaIds)) throw new AppError('agendaIds array required', 400)

  await Promise.all(
    agendaIds.map((agendaId: string, index: number) =>
      prisma.meetingAgenda.updateMany({ where: { id: agendaId, meetingId: id }, data: { order: index + 1 } })
    )
  )

  const agendaItems = await prisma.meetingAgenda.findMany({
    where: { meetingId: id },
    orderBy: { order: 'asc' }
  })

  io.to(`meeting:${id}`).emit('meeting:agenda:reordered', agendaItems)
  res.json({ success: true, data: agendaItems, message: 'Agenda reordered' } as ApiResponse)
})

// ==================== Resolutions ====================

export const createResolution = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const data = req.body
  const createdBy = req.body.createdBy || 'system'

  if (!data.title || !data.content) throw new AppError('Title and content required', 400)

  const meeting = await prisma.meeting.findUnique({ where: { id } })
  if (!meeting) throw new AppError('Meeting not found', 404)

  const resolution = await prisma.meetingResolution.create({
    data: {
      title: data.title,
      content: data.content,
      type: data.type || 'decision',
      meetingId: id,
      agendaItemId: data.agendaItemId,
      assigneeId: data.assigneeId,
      createdBy
    }
  })

  io.to(`meeting:${id}`).emit('meeting:resolution:created', resolution)
  res.status(201).json({ success: true, data: resolution, message: 'Resolution created' } as ApiResponse)
})

export const generateTaskFromResolution = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const resolutionId = req.params.resolutionId as string
  const { title, description, priority, dueDate, assigneeId } = req.body

  const resolution = await prisma.meetingResolution.findFirst({
    where: { id: resolutionId, meetingId: id }
  })
  if (!resolution) throw new AppError('Resolution not found', 404)

  const task = await prisma.task.create({
    data: {
      title: title || resolution.title,
      description: description || resolution.content,
      priority: priority || 'medium',
      status: 'pending',
      type: 'meeting_action',
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: assigneeId || resolution.assigneeId,
      data: JSON.stringify({ source: 'meeting_resolution', meetingId: id, resolutionId })
    },
    include: { assignee: { select: { id: true, name: true, avatar: true } } }
  })

  await prisma.meetingResolution.update({ where: { id: resolutionId }, data: { generatedTaskId: task.id } })

  io.to(`meeting:${id}`).emit('meeting:task:generated', task)
  if (task.assigneeId) io.to(`agent:${task.assigneeId}`).emit('task:assigned', task)

  res.status(201).json({ success: true, data: task, message: 'Task generated' } as ApiResponse)
})

// ==================== Stats ====================

export const getMeetingStats = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      participants: true,
      agendaItems: true,
      resolutions: true
    }
  })

  if (!meeting) throw new AppError('Meeting not found', 404)

  const stats = {
    totalParticipants: meeting.participants.length,
    joinedParticipants: meeting.participants.filter((p: any) => p.status === 'joined' || p.leftAt).length,
    declinedParticipants: meeting.participants.filter((p: any) => p.status === 'declined').length,
    totalAgendaItems: meeting.agendaItems.length,
    completedAgendaItems: meeting.agendaItems.filter((a: any) => a.status === 'completed').length,
    totalResolutions: meeting.resolutions.length,
    actionItems: meeting.resolutions.filter((r: any) => r.type === 'action_item').length,
    totalSpeakCount: meeting.participants.reduce((sum: number, p: any) => sum + p.speakCount, 0),
    totalSpeakDuration: meeting.participants.reduce((sum: number, p: any) => sum + p.speakDuration, 0),
    duration: meeting.endedAt && meeting.startedAt
      ? Math.round((meeting.endedAt.getTime() - meeting.startedAt.getTime()) / 60000)
      : null
  }

  res.json({ success: true, data: stats } as ApiResponse)
})
