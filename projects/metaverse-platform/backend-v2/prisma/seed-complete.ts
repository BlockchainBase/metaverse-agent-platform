import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始创建完整测试数据...\n')

  // 1. 创建组织
  console.log('📋 步骤1: 创建组织')
  const org = await prisma.organization.upsert({
    where: { id: 'org-swju-001' },
    update: {},
    create: {
      id: 'org-swju-001',
      name: '成都高新研究院',
      type: 'research_institute',
      description: '专注于AI技术研究与产业孵化'
    }
  })
  console.log(`✅ 组织创建: ${org.name}\n`)

  // 2. 创建角色
  console.log('👔 步骤2: 创建角色')
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { id: 'role-president' },
      update: {},
      create: {
        id: 'role-president',
        name: 'AI院长',
        level: 'executive',
        permissions: ['all', 'admin', 'approve_all', 'view_all'],
        skills: ['战略决策', '资源调配', '风险管理'],
        orgId: org.id
      }
    }),
    prisma.role.upsert({
      where: { id: 'role-vp' },
      update: {},
      create: {
        id: 'role-vp',
        name: 'AI副院长',
        level: 'executive',
        permissions: ['manage_dept', 'approve_budget', 'coordinate'],
        skills: ['跨部门协调', '项目管理', '决策支持'],
        orgId: org.id
      }
    }),
    prisma.role.upsert({
      where: { id: 'role-cto' },
      update: {},
      create: {
        id: 'role-cto',
        name: 'AI总工',
        level: 'department_head',
        permissions: ['tech_approve', 'arch_design', 'code_review'],
        skills: ['系统架构', '技术选型', '性能优化', 'AI算法'],
        orgId: org.id
      }
    }),
    prisma.role.upsert({
      where: { id: 'role-product' },
      update: {},
      create: {
        id: 'role-product',
        name: 'AI产品经理',
        level: 'department_head',
        permissions: ['product_plan', 'requirement_review', 'user_research'],
        skills: ['需求分析', '用户体验', '产品设计', '市场分析'],
        orgId: org.id
      }
    }),
    prisma.role.upsert({
      where: { id: 'role-marketing' },
      update: {},
      create: {
        id: 'role-marketing',
        name: 'AI市场经理',
        level: 'department_head',
        permissions: ['market_plan', 'brand_manage', 'channel_develop'],
        skills: ['市场分析', '品牌推广', '渠道管理', '商务谈判'],
        orgId: org.id
      }
    }),
    prisma.role.upsert({
      where: { id: 'role-finance' },
      update: {},
      create: {
        id: 'role-finance',
        name: 'AI财务经理',
        level: 'department_head',
        permissions: ['budget_manage', 'financial_audit', 'cost_control'],
        skills: ['财务分析', '成本控制', '预算管理', '风险评估'],
        orgId: org.id
      }
    }),
    prisma.role.upsert({
      where: { id: 'role-operations' },
      update: {},
      create: {
        id: 'role-operations',
        name: 'AI运营经理',
        level: 'department_head',
        permissions: ['operation_manage', 'process_optimize', 'system_config'],
        skills: ['流程优化', '系统管理', '数据分析', '自动化'],
        orgId: org.id
      }
    })
  ])
  console.log(`✅ 创建 ${roles.length} 个角色\n`)

  // 3. 创建Agent实例（带完整能力数据）
  console.log('🤖 步骤3: 创建Agent实例')
  const hashedPassword = await bcrypt.hash('test123', 10)
  
  const agents = await Promise.all([
    // AI院长 - 综合实力最强
    prisma.agent.upsert({
      where: { id: 'ai-president-001' },
      update: {},
      create: {
        id: 'ai-president-001',
        name: 'AI院长-赵明',
        email: 'president@metaverse.ai',
        password: hashedPassword,
        roleId: 'role-president',
        orgId: org.id,
        status: 'online',
        type: 'executive',
        bindHuman: '赵其刚',
        positionX: -8, positionY: 0, positionZ: -8,
        // 能力评估
        efficiency: 95,
        collaboration: 90,
        innovation: 88,
        reliability: 96,
        currentTasks: 3,
        completedTasks: 156,
        skills: JSON.stringify(['战略决策', '资源调配', '风险管理', '领导力']),
        metrics: JSON.stringify({
          availabilityScore: 0.95,
          workloadPercentage: 65,
          avgResponseTime: 2.1,
          satisfactionScore: 4.9
        })
      }
    }),
    // AI副院长
    prisma.agent.upsert({
      where: { id: 'ai-vp-001' },
      update: {},
      create: {
        id: 'ai-vp-001',
        name: 'AI副院长-钱红',
        email: 'vp@metaverse.ai',
        password: hashedPassword,
        roleId: 'role-vp',
        orgId: org.id,
        status: 'online',
        type: 'executive',
        bindHuman: '钱院长',
        positionX: 8, positionY: 0, positionZ: -8,
        efficiency: 92,
        collaboration: 95,
        innovation: 85,
        reliability: 94,
        currentTasks: 4,
        completedTasks: 142,
        skills: JSON.stringify(['跨部门协调', '项目管理', '决策支持', '沟通']),
        metrics: JSON.stringify({
          availabilityScore: 0.92,
          workloadPercentage: 72,
          avgResponseTime: 2.5,
          satisfactionScore: 4.8
        })
      }
    }),
    // AI总工 - 技术最强
    prisma.agent.upsert({
      where: { id: 'ai-cto-001' },
      update: {},
      create: {
        id: 'ai-cto-001',
        name: 'AI总工-孙强',
        email: 'cto@metaverse.ai',
        password: hashedPassword,
        roleId: 'role-cto',
        orgId: org.id,
        status: 'busy',
        type: 'technical',
        bindHuman: '赵其刚',
        positionX: -8, positionY: 0, positionZ: 8,
        efficiency: 94,
        collaboration: 87,
        innovation: 98,
        reliability: 93,
        currentTasks: 5,
        completedTasks: 189,
        skills: JSON.stringify(['系统架构', 'AI算法', '深度学习', '技术选型', '性能优化']),
        metrics: JSON.stringify({
          availabilityScore: 0.88,
          workloadPercentage: 85,
          avgResponseTime: 2.3,
          satisfactionScore: 4.9
        })
      }
    }),
    // AI产品经理
    prisma.agent.upsert({
      where: { id: 'ai-product-001' },
      update: {},
      create: {
        id: 'ai-product-001',
        name: 'AI产品经理-王五',
        email: 'product@metaverse.ai',
        password: hashedPassword,
        roleId: 'role-product',
        orgId: org.id,
        status: 'online',
        type: 'business',
        bindHuman: '王经理',
        positionX: 8, positionY: 0, positionZ: 8,
        efficiency: 91,
        collaboration: 93,
        innovation: 89,
        reliability: 92,
        currentTasks: 3,
        completedTasks: 128,
        skills: JSON.stringify(['需求分析', '用户体验', '产品设计', '数据分析']),
        metrics: JSON.stringify({
          availabilityScore: 0.94,
          workloadPercentage: 58,
          avgResponseTime: 2.8,
          satisfactionScore: 4.7
        })
      }
    }),
    // AI市场经理
    prisma.agent.upsert({
      where: { id: 'ai-marketing-001' },
      update: {},
      create: {
        id: 'ai-marketing-001',
        name: 'AI市场经理-赵六',
        email: 'marketing@metaverse.ai',
        password: hashedPassword,
        roleId: 'role-marketing',
        orgId: org.id,
        status: 'meeting',
        type: 'business',
        bindHuman: '赵经理',
        positionX: -5, positionY: 0, positionZ: 0,
        efficiency: 89,
        collaboration: 91,
        innovation: 87,
        reliability: 90,
        currentTasks: 4,
        completedTasks: 115,
        skills: JSON.stringify(['市场分析', '品牌推广', '渠道管理', '商务谈判']),
        metrics: JSON.stringify({
          availabilityScore: 0.75,
          workloadPercentage: 68,
          avgResponseTime: 3.2,
          satisfactionScore: 4.6
        })
      }
    }),
    // AI财务经理
    prisma.agent.upsert({
      where: { id: 'ai-finance-001' },
      update: {},
      create: {
        id: 'ai-finance-001',
        name: 'AI财务经理-孙七',
        email: 'finance@metaverse.ai',
        password: hashedPassword,
        roleId: 'role-finance',
        orgId: org.id,
        status: 'busy',
        type: 'support',
        bindHuman: '孙经理',
        positionX: 5, positionY: 0, positionZ: 0,
        efficiency: 93,
        collaboration: 85,
        innovation: 82,
        reliability: 97,
        currentTasks: 6,
        completedTasks: 201,
        skills: JSON.stringify(['财务分析', '成本控制', '预算管理', '风险评估', '审计']),
        metrics: JSON.stringify({
          availabilityScore: 0.82,
          workloadPercentage: 88,
          avgResponseTime: 2.0,
          satisfactionScore: 4.8
        })
      }
    }),
    // AI运营经理
    prisma.agent.upsert({
      where: { id: 'ai-operations-001' },
      update: {},
      create: {
        id: 'ai-operations-001',
        name: 'AI运营经理-周八',
        email: 'operations@metaverse.ai',
        password: hashedPassword,
        roleId: 'role-operations',
        orgId: org.id,
        status: 'online',
        type: 'support',
        bindHuman: '周经理',
        positionX: 0, positionY: 0, positionZ: 5,
        efficiency: 90,
        collaboration: 94,
        innovation: 86,
        reliability: 95,
        currentTasks: 4,
        completedTasks: 167,
        skills: JSON.stringify(['流程优化', '系统管理', '数据分析', '自动化', '监控']),
        metrics: JSON.stringify({
          availabilityScore: 0.96,
          workloadPercentage: 62,
          avgResponseTime: 1.8,
          satisfactionScore: 4.9
        })
      }
    })
  ])
  console.log(`✅ 创建 ${agents.length} 个Agent实例\n`)

  // 4. 创建业务线
  console.log('📊 步骤4: 创建业务线')
  const businesses = await Promise.all([
    prisma.business.upsert({
      where: { id: 'biz-research' },
      update: {},
      create: {
        id: 'biz-research',
        name: '科研项目管理',
        description: 'AI技术研究、论文发表、专利申请',
        orgId: org.id,
        status: 'active'
      }
    }),
    prisma.business.upsert({
      where: { id: 'biz-teaching' },
      update: {},
      create: {
        id: 'biz-teaching',
        name: '教学管理',
        description: '课程开发、在线教学、学员管理',
        orgId: org.id,
        status: 'active'
      }
    }),
    prisma.business.upsert({
      where: { id: 'biz-incubation' },
      update: {},
      create: {
        id: 'biz-incubation',
        name: '产业孵化',
        description: '企业孵化、成果转化、技术服务',
        orgId: org.id,
        status: 'active'
      }
    })
  ])
  console.log(`✅ 创建 ${businesses.length} 个业务线\n`)

  // 5. 创建流程模板
  console.log('📋 步骤5: 创建流程模板')
  const processes = await Promise.all([
    prisma.processTemplate.upsert({
      where: { id: 'proc-project-start' },
      update: {},
      create: {
        id: 'proc-project-start',
        name: '项目立项流程',
        description: '科研项目从申请到启动的完整流程',
        bizId: 'biz-research',
        version: 'v2.0',
        status: 'published',
        flowDef: JSON.stringify({
          nodes: [
            { id: 'start', type: 'start', name: '开始' },
            { id: 'apply', type: 'task', roleId: 'role-researcher', name: '提交申请' },
            { id: 'review', type: 'approval', roleId: 'role-cto', name: '技术评审' },
            { id: 'budget', type: 'approval', roleId: 'role-finance', name: '预算审批' },
            { id: 'approve', type: 'approval', roleId: 'role-president', name: '院长审批' },
            { id: 'start_project', type: 'task', roleId: 'role-operations', name: '项目启动' },
            { id: 'end', type: 'end', name: '结束' }
          ],
          edges: [
            { from: 'start', to: 'apply' },
            { from: 'apply', to: 'review' },
            { from: 'review', to: 'budget', condition: 'approved' },
            { from: 'review', to: 'apply', condition: 'rejected' },
            { from: 'budget', to: 'approve', condition: 'approved' },
            { from: 'budget', to: 'apply', condition: 'rejected' },
            { from: 'approve', to: 'start_project', condition: 'approved' },
            { from: 'approve', to: 'apply', condition: 'rejected' },
            { from: 'start_project', to: 'end' }
          ]
        })
      }
    }),
    prisma.processTemplate.upsert({
      where: { id: 'proc-course-dev' },
      update: {},
      create: {
        id: 'proc-course-dev',
        name: '课程开发流程',
        description: '新课程从设计到上线的流程',
        bizId: 'biz-teaching',
        version: 'v1.0',
        status: 'published',
        flowDef: JSON.stringify({
          nodes: [
            { id: 'start', type: 'start', name: '开始' },
            { id: 'design', type: 'task', roleId: 'role-product', name: '课程设计' },
            { id: 'content', type: 'task', roleId: 'role-cto', name: '内容开发' },
            { id: 'review', type: 'approval', roleId: 'role-vp', name: '质量审核' },
            { id: 'publish', type: 'task', roleId: 'role-operations', name: '课程发布' },
            { id: 'end', type: 'end', name: '结束' }
          ]
        })
      }
    })
  ])
  console.log(`✅ 创建 ${processes.length} 个流程模板\n`)

  // 6. 创建任务
  console.log('📝 步骤6: 创建任务')
  const tasks = await Promise.all([
    // 进行中的任务
    prisma.task.create({
      data: {
        title: 'AI医疗研究技术方案',
        description: '设计基于深度学习的医疗影像诊断系统',
        status: 'in_progress',
        priority: 'high',
        type: 'delegation',
        creatorId: 'ai-president-001',
        assigneeId: 'ai-cto-001',
        progress: 65,
        estimatedHours: 40,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        requiredSkills: JSON.stringify([{ skill: '深度学习', level: 'expert', weight: 0.4 }]),
        data: JSON.stringify({ category: '技术方案', deliverable: 'PDF文档' })
      }
    }),
    prisma.task.create({
      data: {
        title: 'Q2预算编制',
        description: '编制第二季度各部门预算',
        status: 'in_progress',
        priority: 'urgent',
        type: 'delegation',
        creatorId: 'ai-president-001',
        assigneeId: 'ai-finance-001',
        progress: 80,
        estimatedHours: 20,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        data: JSON.stringify({ category: '财务', amount: 500000 })
      }
    }),
    prisma.task.create({
      data: {
        title: '市场推广方案',
        description: '制定AI产品市场推广策略',
        status: 'in_progress',
        priority: 'medium',
        type: 'collaboration',
        creatorId: 'ai-vp-001',
        assigneeId: 'ai-marketing-001',
        progress: 45,
        estimatedHours: 30,
        collaborators: JSON.stringify(['ai-product-001']),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        data: JSON.stringify({ category: '市场', channels: ['线上', '线下'] })
      }
    }),
    // 待处理任务
    prisma.task.create({
      data: {
        title: '系统架构优化',
        description: '优化元宇宙平台后端架构',
        status: 'pending',
        priority: 'high',
        type: 'delegation',
        creatorId: 'ai-cto-001',
        assigneeId: null,
        progress: 0,
        estimatedHours: 60,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        data: JSON.stringify({ category: '技术', tags: ['架构', '性能'] })
      }
    }),
    // 已完成任务
    prisma.task.create({
      data: {
        title: '年终财务审计',
        description: '2025年度财务审计报告',
        status: 'completed',
        priority: 'high',
        type: 'delegation',
        creatorId: 'ai-president-001',
        assigneeId: 'ai-finance-001',
        progress: 100,
        estimatedHours: 32,
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        data: JSON.stringify({ category: '财务', year: 2025 })
      }
    })
  ])
  console.log(`✅ 创建 ${tasks.length} 个任务\n`)

  // 7. 创建会议
  console.log('🏢 步骤7: 创建会议')
  const meeting = await prisma.meeting.create({
    data: {
      title: 'AI医疗项目启动会',
      description: '讨论AI医疗研究项目技术方案和实施计划',
      type: 'structured',
      status: 'ongoing',
      convenorId: 'ai-vp-001',
      participantIds: JSON.stringify(['ai-president-001', 'ai-cto-001', 'ai-product-001']),
      agenda: JSON.stringify([
        { id: 1, topic: '技术架构方案讨论', duration: 30, status: 'in_progress' },
        { id: 2, topic: '开发周期评估', duration: 15, status: 'pending' },
        { id: 3, topic: '任务分配', duration: 15, status: 'pending' }
      ]),
      startedAt: new Date()
    }
  })
  console.log(`✅ 创建会议: ${meeting.title}\n`)

  // 8. 创建知识库文档
  console.log('📚 步骤8: 创建知识库')
  const knowledgeDocs = await Promise.all([
    prisma.knowledgeDocument.create({
      data: {
        title: '项目审批权限规则',
        content: '10万以下项目由副院长审批，10-50万由总工+财务双签，50万以上需院长最终审批。',
        type: 'org_rule',
        orgId: org.id,
        accessRoles: JSON.stringify(['role-president', 'role-vp', 'role-finance'])
      }
    }),
    prisma.knowledgeDocument.create({
      data: {
        title: 'AI医疗项目立项会议纪要',
        content: '会议确定了项目目标：开发基于深度学习的医疗影像诊断系统，预期6个月完成MVP版本。',
        type: 'meeting_minutes',
        orgId: org.id,
        accessRoles: JSON.stringify(['role-president', 'role-cto', 'role-product'])
      }
    })
  ])
  console.log(`✅ 创建 ${knowledgeDocs.length} 个知识文档\n`)

  console.log('🎉 测试数据创建完成！')
  console.log('\n📊 数据汇总:')
  console.log(`  • 组织: 1个`)
  console.log(`  • 角色: ${roles.length}个`)
  console.log(`  • Agent: ${agents.length}个`)
  console.log(`  • 业务线: ${businesses.length}个`)
  console.log(`  • 流程模板: ${processes.length}个`)
  console.log(`  • 任务: ${tasks.length}个`)
  console.log(`  • 会议: 1个`)
  console.log(`  • 知识文档: ${knowledgeDocs.length}个`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
