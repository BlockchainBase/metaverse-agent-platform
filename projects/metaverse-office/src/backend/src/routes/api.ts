// API路由
import { Router } from 'express'
import DataService from '../services/dataService'

const router = Router()
const dataService = new DataService()

// 获取完整的元宇宙状态
router.get('/state', async (req, res) => {
  try {
    const state = await dataService.getMetaverseState()
    res.json({
      success: true,
      data: state,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取状态失败'
    })
  }
})

// 获取Agent状态
router.get('/agents', async (req, res) => {
  try {
    const agents = await dataService.getAgentStates()
    res.json({
      success: true,
      data: agents,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取Agent状态失败'
    })
  }
})

// 获取项目列表
router.get('/projects', async (req, res) => {
  try {
    const projects = await dataService.getProjects()
    res.json({
      success: true,
      data: projects,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取项目列表失败'
    })
  }
})

// 获取今日日程
router.get('/schedule', async (req, res) => {
  try {
    const schedule = await dataService.getTodaySchedule()
    res.json({
      success: true,
      data: schedule,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取日程失败'
    })
  }
})

// 获取统计数据
router.get('/statistics', async (req, res) => {
  try {
    const stats = await dataService.getStatistics()
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取统计数据失败'
    })
  }
})

// 向Agent发送消息
router.post('/agents/:id/message', async (req, res) => {
  try {
    const { id } = req.params
    const { message } = req.body
    
    const success = await dataService.sendMessage(id, message)
    
    res.json({
      success,
      message: success ? '消息发送成功' : '消息发送失败',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '发送消息失败'
    })
  }
})

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'metaverse-office-backend',
    timestamp: new Date().toISOString()
  })
})

export default router
