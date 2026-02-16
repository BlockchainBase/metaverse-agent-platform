/**
 * 全面功能测试入口
 * 运行所有测试场景
 */

import { ContinuousSimulationEngine } from './engine/ContinuousSimulationEngine.js'
import { ComprehensiveTestSuite } from './test/ComprehensiveTestSuite.js'

async function runComprehensiveTests() {
  console.log('🚀 启动全面功能测试...\n')

  // 创建引擎实例（复用现有实例或创建新实例）
  const engine = new ContinuousSimulationEngine()
  
  try {
    // 初始化
    await engine.initialize()
    
    // 启动引擎（如果不启动，tick不会推进）
    engine.start()
    
    // 等待系统稳定
    console.log('⏳ 等待系统稳定（5秒）...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // 创建测试套件
    const testSuite = new ComprehensiveTestSuite(engine)
    
    // 运行所有测试
    const results = await testSuite.runAllTests()
    
    // 输出最终统计
    const passed = results.filter(r => r.success).length
    const total = results.length
    
    console.log('\n🏁 全面功能测试完成')
    console.log(`✅ 通过: ${passed}/${total} (${(passed/total*100).toFixed(1)}%)`)
    
    // 保持运行一段时间观察
    console.log('\n⏳ 继续观察系统运行（30秒）...')
    await new Promise(resolve => setTimeout(resolve, 30000))
    
    // 停止引擎
    engine.stop(true)
    
    console.log('\n✅ 测试结束')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
    engine.stop(false)
    process.exit(1)
  }
}

// 处理进程信号
process.on('SIGINT', () => {
  console.log('\n\n🛑 接收到停止信号，正在结束测试...')
  process.exit(0)
})

// 运行测试
runComprehensiveTests()
