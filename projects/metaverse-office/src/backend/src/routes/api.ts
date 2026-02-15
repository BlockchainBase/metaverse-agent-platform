// API路由
import { Router } from 'express'
import DataService from '../services/dataService'
import matchingService from '../services/matchingService'
import contractService from '../services/contractService'

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
    version: '3.0',
    timestamp: new Date().toISOString()
  })
})

// ============================================
// v3.0 API - 能力档案
// ============================================

// 获取Agent能力档案
router.get('/v3/agents/:id/capabilities', async (req, res) => {
  try {
    const { id } = req.params
    // TODO: 从数据库查询
    res.json({
      success: true,
      message: 'v3.0 能力档案API - 待实现',
      agentId: id
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取能力档案失败' })
  }
})

// 更新Agent能力档案
router.put('/v3/agents/:id/capabilities', async (req, res) => {
  try {
    const { id } = req.params
    const capabilities = req.body
    // TODO: 更新数据库
    res.json({
      success: true,
      message: 'v3.0 更新能力档案API - 待实现',
      agentId: id,
      capabilities
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '更新能力档案失败' })
  }
})

// ============================================
// v3.0 API - 任务匹配
// ============================================

// 匹配任务到Agent
router.post('/v3/tasks/match', async (req, res) => {
  try {
    const taskRequirements = req.body
    // TODO: 获取可用Agent列表
    const availableAgents: any[] = []
    
    const matchResult = await matchingService.matchAgentsToTask(
      taskRequirements,
      availableAgents
    )
    
    res.json({
      success: true,
      data: matchResult,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '任务匹配失败' })
  }
})

// ============================================
// v3.0 API - 协作契约
// ============================================

// 创建协作契约
router.post('/v3/contracts', async (req, res) => {
  try {
    const { projectId, type, initiatorId, context, proposal } = req.body
    
    const contract = await contractService.createContract(
      projectId,
      type,
      initiatorId,
      context,
      proposal
    )
    
    res.json({
      success: true,
      data: contract,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '创建契约失败' })
  }
})

// 获取契约详情
router.get('/v3/contracts/:id', async (req, res) => {
  try {
    const { id } = req.params
    const contract = await contractService.getContract(id)
    
    if (!contract) {
      return res.status(404).json({ success: false, error: '契约不存在' })
    }
    
    res.json({
      success: true,
      data: contract,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取契约失败' })
  }
})

// 提交协商意见
router.put('/v3/contracts/:id/negotiate', async (req, res) => {
  try {
    const { id } = req.params
    const { agentId, stance, content, evidence, confidence } = req.body
    
    const contract = await contractService.submitNegotiation(
      id,
      agentId,
      stance,
      content,
      evidence,
      confidence
    )
    
    res.json({
      success: true,
      data: contract,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '提交协商意见失败' })
  }
})

// 获取项目的所有契约
router.get('/v3/projects/:projectId/contracts', async (req, res) => {
  try {
    const { projectId } = req.params
    const contracts = await contractService.getContractsByProject(projectId)
    
    res.json({
      success: true,
      data: contracts,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取契约列表失败' })
  }
})

// 获取活跃契约
router.get('/v3/contracts/active', async (req, res) => {
  try {
    const contracts = await contractService.getActiveContracts()
    
    res.json({
      success: true,
      data: contracts,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取活跃契约失败' })
  }
})

// ============================================
// v3.0 API - 人类介入
// ============================================

// 获取待处理的人类介入请求
router.get('/v3/interventions/pending', async (req, res) => {
  try {
    const contracts = await contractService.getPendingHumanIntervention()
    
    res.json({
      success: true,
      data: contracts,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取介入请求失败' })
  }
})

// 提交人类决策
router.post('/v3/interventions/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params
    const { decision, rationale } = req.body
    
    // TODO: 处理人类决策
    res.json({
      success: true,
      message: 'v3.0 人类决策API - 待实现',
      interventionId: id,
      decision,
      rationale
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '提交决策失败' })
  }
})

export default router
