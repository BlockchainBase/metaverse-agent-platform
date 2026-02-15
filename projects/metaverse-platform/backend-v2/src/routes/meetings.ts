import { Router } from 'express'
import * as meetingController from '../controllers/meetingController'

const router = Router()

// ==================== Meeting CRUD ====================
router.get('/', meetingController.getMeetings)
router.post('/', meetingController.createMeeting)
router.get('/:id', meetingController.getMeeting)
router.put('/:id', meetingController.updateMeeting)
router.delete('/:id', meetingController.deleteMeeting)

// ==================== Meeting Status ====================
router.post('/:id/start', meetingController.startMeeting)
router.post('/:id/end', meetingController.endMeeting)

// ==================== Participants ====================
router.post('/:id/join', meetingController.joinMeeting)
router.post('/:id/leave', meetingController.leaveMeeting)
router.post('/:id/invite', meetingController.inviteParticipants)

// ==================== Agenda ====================
router.post('/:id/agenda', meetingController.addAgendaItem)
router.put('/:id/agenda/:agendaId', meetingController.updateAgendaItem)
router.delete('/:id/agenda/:agendaId', meetingController.deleteAgendaItem)
router.post('/:id/agenda/reorder', meetingController.reorderAgenda)

// ==================== Resolutions ====================
router.post('/:id/resolutions', meetingController.createResolution)
router.post('/:id/resolutions/:resolutionId/generate-task', meetingController.generateTaskFromResolution)

// ==================== Stats ====================
router.get('/:id/stats', meetingController.getMeetingStats)

export default router
