/**
 * 模拟系统入口
 * 启动11 Agent持续运行模拟
 */

import { ContinuousSimulationEngine } from './engine/ContinuousSimulationEngine.js'

// 创建引擎实例
const engine = new ContinuousSimulationEngine()

// 处理进程信号
process.on('SIGINT', async () => {
  console.log('\n\n🛑 接收到停止信号...')
  engine.stop(true)
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 接收到终止信号...')
  engine.stop(true)
  process.exit(0)
})

// 主函数
async function main() {
  try {
    // 初始化
    await engine.initialize()
    
    // 启动模拟
    engine.start()
    
    // 保持进程运行
    console.log('💡 按 Ctrl+C 停止模拟系统')
    
  } catch (error) {
    console.error('❌ 启动失败:', error)
    process.exit(1)
  }
}

// 启动
main()
