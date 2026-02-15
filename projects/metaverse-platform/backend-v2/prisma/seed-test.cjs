const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 创建测试数据...\n')
  
  // 1. 组织
  const org = await prisma.organization.upsert({
    where: { id: 'org-001' },
    update: {},
    create: { 
      id: 'org-001', 
      name: '成都高新研究院', 
      description: 'AI研究与产业孵化' 
    }
  })
  console.log('✅ 组织:', org.name)
  
  // 2. 角色
  const roles = await Promise.all([
    prisma.role.upsert({ 
      where: { id: 'role-president' }, 
      update: {}, 
      create: { 
        id: 'role-president', 
        name: 'AI院长', 
        level: 3,
        permissions: 'all,admin,approve', 
        organizationId: org.id 
      } 
    }),
    prisma.role.upsert({ 
      where: { id: 'role-cto' }, 
      update: {}, 
      create: { 
        id: 'role-cto', 
        name: 'AI总工', 
        level: 2,
        permissions: 'tech,arch,review', 
        organizationId: org.id 
      } 
    }),
    prisma.role.upsert({ 
      where: { id: 'role-product' }, 
      update: {}, 
      create: { 
        id: 'role-product', 
        name: 'AI产品经理', 
        level: 2,
        permissions: 'product,design,research', 
        organizationId: org.id 
      } 
    }),
    prisma.role.upsert({ 
      where: { id: 'role-marketing' }, 
      update: {}, 
      create: { 
        id: 'role-marketing', 
        name: 'AI市场经理', 
        level: 2,
        permissions: 'market,brand,channel', 
        organizationId: org.id 
      } 
    }),
    prisma.role.upsert({ 
      where: { id: 'role-finance' }, 
      update: {}, 
      create: { 
        id: 'role-finance', 
        name: 'AI财务经理', 
        level: 2,
        permissions: 'finance,budget,audit', 
        organizationId: org.id 
      } 
    }),
    prisma.role.upsert({ 
      where: { id: 'role-operations' }, 
      update: {}, 
      create: { 
        id: 'role-operations', 
        name: 'AI运营经理', 
        level: 2,
        permissions: 'operation,process,system', 
        organizationId: org.id 
      } 
    })
  ])
  console.log('✅ 角色:', roles.length, '个')
  
  // 3. Agent（带能力数据）
  const agents = await Promise.all([
    prisma.agent.upsert({ 
      where: { id: 'ai-president-001' }, 
      update: {}, 
      create: { 
        id: 'ai-president-001', 
        name: 'AI院长-赵明', 
        avatar: '👔',
        roleId: 'role-president', 
        organizationId: org.id, 
        status: 'online', 
        type: 'executive',
        position: JSON.stringify({ x: -8, y: 0, z: -8 }),
        capabilities: JSON.stringify(['战略决策', '资源调配', '风险管理']),
        skillProfile: JSON.stringify({ skills: [{ name: '领导力', level: 'expert' }] }),
        performanceStats: JSON.stringify({ completedTasks: 156, avgQuality: 4.9 }),
        workload: 3,
        maxWorkload: 10,
        availabilityScore: 0.95
      } 
    }),
    prisma.agent.upsert({ 
      where: { id: 'ai-cto-001' }, 
      update: {}, 
      create: { 
        id: 'ai-cto-001', 
        name: 'AI总工-孙强', 
        avatar: '🔧',
        roleId: 'role-cto', 
        organizationId: org.id, 
        status: 'busy', 
        type: 'technical',
        position: JSON.stringify({ x: -8, y: 0, z: 8 }),
        capabilities: JSON.stringify(['系统架构', 'AI算法', '性能优化']),
        skillProfile: JSON.stringify({ skills: [{ name: '深度学习', level: 'expert' }] }),
        performanceStats: JSON.stringify({ completedTasks: 189, avgQuality: 4.8 }),
        workload: 5,
        maxWorkload: 10,
        availabilityScore: 0.88
      } 
    }),
    prisma.agent.upsert({ 
      where: { id: 'ai-product-001' }, 
      update: {}, 
      create: { 
        id: 'ai-product-001', 
        name: 'AI产品经理-王五', 
        avatar: '📱',
        roleId: 'role-product', 
        organizationId: org.id, 
        status: 'online', 
        type: 'business',
        position: JSON.stringify({ x: 8, y: 0, z: 8 }),
        capabilities: JSON.stringify(['需求分析', '用户体验', '产品设计']),
        skillProfile: JSON.stringify({ skills: [{ name: '产品设计', level: 'expert' }] }),
        performanceStats: JSON.stringify({ completedTasks: 128, avgQuality: 4.7 }),
        workload: 3,
        maxWorkload: 10,
        availabilityScore: 0.94
      } 
    }),
    prisma.agent.upsert({ 
      where: { id: 'ai-marketing-001' }, 
      update: {}, 
      create: { 
        id: 'ai-marketing-001', 
        name: 'AI市场经理-赵六', 
        avatar: '📢',
        roleId: 'role-marketing', 
        organizationId: org.id, 
        status: 'meeting', 
        type: 'business',
        position: JSON.stringify({ x: -5, y: 0, z: 0 }),
        capabilities: JSON.stringify(['市场分析', '品牌推广', '渠道管理']),
        skillProfile: JSON.stringify({ skills: [{ name: '市场分析', level: 'advanced' }] }),
        performanceStats: JSON.stringify({ completedTasks: 115, avgQuality: 4.6 }),
        workload: 4,
        maxWorkload: 10,
        availabilityScore: 0.75
      } 
    }),
    prisma.agent.upsert({ 
      where: { id: 'ai-finance-001' }, 
      update: {}, 
      create: { 
        id: 'ai-finance-001', 
        name: 'AI财务经理-孙七', 
        avatar: '💰',
        roleId: 'role-finance', 
        organizationId: org.id, 
        status: 'busy', 
        type: 'support',
        position: JSON.stringify({ x: 5, y: 0, z: 0 }),
        capabilities: JSON.stringify(['财务分析', '成本控制', '预算管理']),
        skillProfile: JSON.stringify({ skills: [{ name: '财务分析', level: 'expert' }] }),
        performanceStats: JSON.stringify({ completedTasks: 201, avgQuality: 4.8 }),
        workload: 6,
        maxWorkload: 10,
        availabilityScore: 0.82
      } 
    }),
    prisma.agent.upsert({ 
      where: { id: 'ai-operations-001' }, 
      update: {}, 
      create: { 
        id: 'ai-operations-001', 
        name: 'AI运营经理-周八', 
        avatar: '⚙️',
        roleId: 'role-operations', 
        organizationId: org.id, 
        status: 'online', 
        type: 'support',
        position: JSON.stringify({ x: 0, y: 0, z: 5 }),
        capabilities: JSON.stringify(['流程优化', '系统管理', '自动化']),
        skillProfile: JSON.stringify({ skills: [{ name: '流程优化', level: 'expert' }] }),
        performanceStats: JSON.stringify({ completedTasks: 167, avgQuality: 4.9 }),
        workload: 4,
        maxWorkload: 10,
        availabilityScore: 0.96
      } 
    })
  ])
  console.log('✅ Agent:', agents.length, '个')
  
  // 4. 任务
  const tasks = await Promise.all([
    prisma.task.create({ 
      data: { 
        title: 'AI医疗研究技术方案', 
        description: '设计深度学习医疗影像系统', 
        status: 'in_progress', 
        priority: 'high', 
        creatorId: 'ai-president-001', 
        assigneeId: 'ai-cto-001', 
        progress: 65,
        estimatedHours: 40
      } 
    }),
    prisma.task.create({ 
      data: { 
        title: 'Q2预算编制', 
        description: '编制第二季度预算', 
        status: 'in_progress', 
        priority: 'urgent', 
        creatorId: 'ai-president-001', 
        assigneeId: 'ai-finance-001', 
        progress: 80,
        estimatedHours: 20
      } 
    }),
    prisma.task.create({ 
      data: { 
        title: '市场推广方案', 
        description: '制定推广策略', 
        status: 'in_progress', 
        priority: 'medium', 
        creatorId: 'ai-president-001', 
        assigneeId: 'ai-marketing-001', 
        progress: 45,
        estimatedHours: 30
      } 
    }),
    prisma.task.create({ 
      data: { 
        title: '系统架构优化', 
        description: '优化后端架构', 
        status: 'pending', 
        priority: 'high', 
        creatorId: 'ai-cto-001', 
        progress: 0,
        estimatedHours: 60
      } 
    }),
    prisma.task.create({ 
      data: { 
        title: '年终财务审计', 
        description: '2025年度审计', 
        status: 'completed', 
        priority: 'high', 
        creatorId: 'ai-president-001', 
        assigneeId: 'ai-finance-001', 
        progress: 100,
        completedAt: new Date()
      } 
    })
  ])
  console.log('✅ 任务:', tasks.length, '个')
  
  // 5. 业务线
  const biz = await prisma.business.upsert({
    where: { id: 'biz-research' },
    update: {},
    create: { 
      id: 'biz-research', 
      name: '科研项目管理', 
      description: 'AI技术研究', 
      organizationId: org.id
    }
  })
  console.log('✅ 业务线:', biz.name)
  
  // 6. 流程模板
  const proc = await prisma.processTemplate.upsert({
    where: { id: 'proc-project' },
    update: {},
    create: {
      id: 'proc-project',
      name: '项目立项流程',
      description: '科研项目流程',
      businessId: biz.id,
      version: 'v2.0',
      status: 'published',
      flowDef: JSON.stringify({ 
        nodes: [
          { id: 'start', type: 'start' }, 
          { id: 'apply', type: 'task' }, 
          { id: 'end', type: 'end' }
        ] 
      })
    }
  })
  console.log('✅ 流程:', proc.name)
  
  // 7. 会议
  const meeting = await prisma.meeting.create({
    data: {
      title: 'AI医疗项目启动会',
      description: '讨论技术方案',
      type: 'structured',
      status: 'ongoing',
      convenorId: 'ai-president-001',
      participantIds: JSON.stringify(['ai-cto-001', 'ai-product-001']),
      startedAt: new Date()
    }
  })
  console.log('✅ 会议:', meeting.title)
  
  console.log('\n🎉 测试数据创建完成!')
  console.log(`📊 汇总: 组织1 | 角色${roles.length} | Agent${agents.length} | 任务${tasks.length} | 会议1`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
