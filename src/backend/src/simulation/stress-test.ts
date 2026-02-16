/**
 * 压力测试入口
 * 执行全面压力测试
 */

import { ContinuousSimulationEngine } from './engine/ContinuousSimulationEngine.js'
import { StressTestFramework } from './test/StressTestFramework.js'

async function runStressTests() {
  console.log('🔥 启动11 Agent模拟系统压力测试')
  console.log('====================================\n')

  const engine = new ContinuousSimulationEngine()
  
  try {
    await engine.initialize()
    engine.start()

    console.log('⏳ 等待系统稳定（10秒）...')
    await new Promise(resolve => setTimeout(resolve, 10000))

    // 创建压力测试框架
    const stressTest = new StressTestFramework(engine)
    
    // 运行全部压力测试
    const results = await stressTest.runAllStressTests()

    // 分析结果
    const passed = results.filter(r => r.passed).length
    const total = results.length
    const passRate = (passed / total * 100).toFixed(1)

    console.log('\n🏁 压力测试完成')
    console.log(`通过率: ${passed}/${total} (${passRate}%)`)

    // 生成压力测试报告
    console.log('\n📊 生成压力测试报告...')
    await generateStressReport(results)

    // 保持运行观察
    console.log('\n⏳ 继续观察系统稳定性（30秒）...')
    await new Promise(resolve => setTimeout(resolve, 30000))

    engine.stop(true)
    console.log('\n✅ 压力测试结束')
    
  } catch (error) {
    console.error('❌ 压力测试失败:', error)
    engine.stop(false)
    process.exit(1)
  }
}

async function generateStressReport(results: any[]) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      passRate: (results.filter(r => r.passed).length / results.length * 100).toFixed(1) + '%'
    },
    details: results.map(r => ({
      scenario: r.scenario,
      passed: r.passed,
      metrics: r.metrics,
      observations: r.observations
    }))
  }

  console.log('\n📄 压力测试报告已生成')
  console.log(JSON.stringify(report, null, 2))
}

// 处理信号
process.on('SIGINT', () => {
  console.log('\n\n🛑 正在结束压力测试...')
  process.exit(0)
})

runStressTests()
