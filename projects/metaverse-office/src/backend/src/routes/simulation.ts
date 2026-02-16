/**
 * 模拟系统控制API
 * OpenClaw控制接口
 */

import { Router } from 'express'
import { exec } from 'child_process'
import { promisify } from 'util'

const router = Router()
const execAsync = promisify(exec)

const SIMULATION_DIR = '/Users/tomscomputer/.openclaw/workspace/projects/metaverse-office'
const PID_FILE = `${SIMULATION_DIR}/simulation.pid`

// 检查模拟系统是否运行
async function isSimulationRunning(): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`cat ${PID_FILE} 2>/dev/null && ps -p $(cat ${PID_FILE}) > /dev/null 2>&1 && echo "running" || echo "stopped"`)
    return stdout.trim() === 'running'
  } catch {
    return false
  }
}

// 获取状态
router.get('/status', async (req, res) => {
  try {
    const isRunning = await isSimulationRunning()
    
    const status: any = {
      running: isRunning,
      timestamp: new Date().toISOString()
    }
    
    if (isRunning) {
      // 尝试获取更详细的状态
      try {
        const { stdout } = await execAsync(`cat ${PID_FILE}`)
        status.pid = parseInt(stdout.trim())
      } catch {}
    }
    
    res.json({
      success: true,
      data: status
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取状态失败'
    })
  }
})

// 启动模拟
router.post('/start', async (req, res) => {
  try {
    const isRunning = await isSimulationRunning()
    
    if (isRunning) {
      return res.json({
        success: false,
        message: '模拟系统已在运行中'
      })
    }
    
    // 启动模拟系统
    exec(`cd ${SIMULATION_DIR} && ./simulation.sh start`, (error) => {
      if (error) {
        console.error('启动模拟系统失败:', error)
      }
    })
    
    // 等待启动
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const nowRunning = await isSimulationRunning()
    
    res.json({
      success: nowRunning,
      message: nowRunning ? '模拟系统已启动' : '启动可能失败，请检查日志'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '启动失败'
    })
  }
})

// 停止模拟
router.post('/stop', async (req, res) => {
  try {
    const isRunning = await isSimulationRunning()
    
    if (!isRunning) {
      return res.json({
        success: false,
        message: '模拟系统未在运行'
      })
    }
    
    // 停止模拟系统
    await execAsync(`cd ${SIMULATION_DIR} && ./simulation.sh stop`)
    
    res.json({
      success: true,
      message: '模拟系统已停止'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '停止失败'
    })
  }
})

// 重启模拟
router.post('/restart', async (req, res) => {
  try {
    await execAsync(`cd ${SIMULATION_DIR} && ./simulation.sh restart`)
    
    res.json({
      success: true,
      message: '模拟系统已重启'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '重启失败'
    })
  }
})

// 获取日志
router.get('/logs', async (req, res) => {
  try {
    const lines = parseInt(req.query.lines as string) || 50
    const { stdout } = await execAsync(`tail -n ${lines} ${SIMULATION_DIR}/simulation.log 2>/dev/null || echo "日志文件不存在"`)
    
    res.json({
      success: true,
      data: stdout.split('\n').filter(line => line.trim())
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取日志失败'
    })
  }
})

// WebSocket状态检查
router.get('/websocket', async (req, res) => {
  res.json({
    success: true,
    data: {
      url: 'ws://localhost:3002',
      status: '模拟系统WebSocket端口'
    }
  })
})

export default router
