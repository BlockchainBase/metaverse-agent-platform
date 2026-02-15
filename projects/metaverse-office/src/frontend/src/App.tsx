import { useState, useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { ChineseCourtyard } from './components/Courtyard'
import { WalkingCartoonAgent } from './components/CartoonAgent'
import { Dashboards } from './components/Dashboards'
import { OfficeDecorations } from './components/OfficeDecorations'
import { AgentChatSystem } from './components/ChatBubble'
import { InteractionFeedback } from './components/InteractionFeedback'
import { EnvironmentController, WeatherType } from './components/EnvironmentController'
import { FirstPersonController } from './components/FirstPersonController'
import { VirtualMeetingRoom } from './components/VirtualMeetingRoom'
import { TaskFlowVisualization } from './components/TaskFlowVisualization'
// import { CollaborationNetwork } from './components/CollaborationNetwork'
// import { ManagementHub } from './components/ManagementHub'
import { SimpleCollaborationNetwork } from './components/SimpleCollaborationNetwork'
import { SimpleManagementHub } from './components/SimpleManagementHub'
// v3.0: 新增协作可视化组件
import { ContractVisualization } from './components/ContractVisualization'
import { NegotiationBubbles } from './components/NegotiationBubbles'
import { TaskDelegationManager } from './components/TaskDelegationFlow'
import { ReasoningChainPlayer } from './components/ReasoningChainPlayer'
import { DecisionCenter } from './components/DecisionCenter'
import { useAgents, useConnectionStatus } from './hooks/useMetaverseData'
import { AgentState, ManagerRole } from './services/metaverseData'
import { ROLE_CONFIG, STATUS_CONFIG, ManagerStatus, getAgentPositionV3 } from './data/managers'
import './App.css'

// v3.0: 使用新的四房布局位置配置（定义在 managers.ts 中）
// 南房(前)=市场, 东厢房(右)=方案部, 西厢房(左)=交付部, 北房(后)=管理中心

// Agent角色到ManagerRole的映射 - 新角色
const getRoleFromAgent = (agent: AgentState): ManagerRole => {
  const roleMap: Record<string, ManagerRole> = {
    'marketing': 'marketing',
    'solution': 'solution',
    'developer': 'developer',
    'devops': 'devops',
    'project': 'project',
    'finance': 'finance',
    'assistant': 'assistant'
  }
  return roleMap[agent.role] || 'project'
}

// 交互反馈类型
type InteractionType = 'wave' | 'nod' | 'jump' | 'spin'

interface InteractionState {
  agentId: string
  role: ManagerRole
  type: InteractionType
  position: [number, number, number]
}

function App() {
  // Phase 4: 使用新的数据hooks
  const { agents, isLoading: isAgentsLoading, isConnected, refreshAgents } = useAgents()
  const { socketId } = useConnectionStatus()
  
  // UI状态
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [interaction, setInteraction] = useState<InteractionState | null>(null)
  const [weather, setWeather] = useState<WeatherType>('clear')
  const [autoCycle, setAutoCycle] = useState(true)
  const [firstPersonMode, setFirstPersonMode] = useState(false)
  const [meetingRoomOpen, setMeetingRoomOpen] = useState(false)
  const [showTaskFlow, setShowTaskFlow] = useState(false)
  const [showNetwork, setShowNetwork] = useState(false)
  const [showManagementHub, setShowManagementHub] = useState(false)
  const [sceneType, setSceneType] = useState<'office' | 'courtyard'>('courtyard')
  
  // v3.0: 新增可视化状态
  const [showContracts, setShowContracts] = useState(false)
  const [showNegotiation, setShowNegotiation] = useState(false)
  const [showDelegations, setShowDelegations] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)
  const [showDecisionCenter, setShowDecisionCenter] = useState(false)
  const [selectedContract, setSelectedContract] = useState<any>(null)
  const [selectedIntervention, setSelectedIntervention] = useState<any>(null)
  const [showInterventionPanel, setShowInterventionPanel] = useState(false)

  // 存储角色位置用于对话系统
  const agentPositionsRef = useRef<Map<string, [number, number, number]>>(new Map())

  // 获取选中的Agent
  const selectedAgent = agents.find(a => a.id === selectedAgentId)
  const selectedRole = selectedAgent ? getRoleFromAgent(selectedAgent) : null

  // v3.0: 获取Agent位置（使用四房布局）
  const getAgentPosition = (agent: AgentState): [number, number, number] => {
    const role = getRoleFromAgent(agent)
    
    // 如果后端有位置数据，使用后端数据
    if (agent.position) {
      return [agent.position.x, agent.position.y, agent.position.z]
    }
    
    // v3.0: 使用四房布局位置配置
    // 根据agent.id的hash值决定研发Agent分配到东房还是西房
    let assignment: 'east' | 'west' | undefined
    if (role === 'developer') {
      // 简单的hash分配：偶数id去东房，奇数id去西房
      assignment = parseInt(agent.id.slice(-1), 16) % 2 === 0 ? 'east' : 'west'
    }
    
    return getAgentPositionV3(role, 0, assignment)
  }

  // 处理Agent点击
  const handleAgentClick = useCallback((agentId: string) => {
    setSelectedAgentId(agentId)
    const agent = agents.find(a => a.id === agentId)
    
    if (agent) {
      const role = getRoleFromAgent(agent)
      const position = getAgentPosition(agent)
      
      // 触发交互反馈动画
      const interactions: InteractionType[] = ['wave', 'nod', 'jump', 'spin']
      const randomInteraction = interactions[Math.floor(Math.random() * interactions.length)]
      
      setInteraction({
        agentId,
        role,
        type: randomInteraction,
        position
      })
    }
  }, [agents])

  // 处理关闭详情
  const handleCloseModal = useCallback(() => {
    setSelectedAgentId(null)
  }, [])

  // 更新所有Agent位置引用
  useEffect(() => {
    agents.forEach(agent => {
      const pos = getAgentPosition(agent)
      agentPositionsRef.current.set(agent.id, pos)
    })
  }, [agents])

  return (
    <div className="app">
      {/* 3D场景 */}
      <div className="canvas-container">
        <Canvas shadows camera={{ position: [25, 20, 25], fov: 50 }}>
          {/* 环境控制系统 */}
          <EnvironmentController weather={weather} autoCycle={autoCycle} />
          
          {/* 星空背景 */}
          <Stars radius={100} depth={50} count={3000} factor={4} />
          
          {/* 场景类型切换 */}
          {sceneType === 'courtyard' ? (
            <ChineseCourtyard />
          ) : (
            <OfficeDecorations />
          )}
          
          {/* 办公场景装饰 */}
          <OfficeDecorations />
          
          {/* 数据看板 */}
          <Dashboards />

          {/* 任务流可视化 */}
          {showTaskFlow && <TaskFlowVisualization />}

          {/* 协作网络可视化 - 使用简化版 */}
          {showNetwork && <SimpleCollaborationNetwork organizationId="org-001" />}
          
          {/* v3.0: 协作契约可视化 */}
          {showContracts && (
            <ContractVisualization 
              contracts={mockContracts}
              agentPositions={agentPositionsRef.current}
            />
          )}
          
          {/* v3.0: 协商对话气泡 */}
          {showNegotiation && selectedContract && (
            <NegotiationBubbles 
              negotiation={selectedContract.negotiation}
              agentPositions={agentPositionsRef.current}
            />
          )}
          
          {/* v3.0: 任务委托飞行动画 */}
          {showDelegations && (
            <TaskDelegationManager 
              delegations={mockDelegations}
              agentPositions={agentPositionsRef.current}
            />
          )}
          
          {/* v3.0: 推理链回放 */}
          {showReasoning && selectedContract && (
            <ReasoningChainPlayer 
              contract={selectedContract}
              agentPositions={agentPositionsRef.current}
              onClose={() => setShowReasoning(false)}
            />
          )}
          
          {/* v3.0: 决策中心（北房） */}
          {showDecisionCenter && (
            <DecisionCenter 
              pendingInterventions={mockInterventions}
              contracts={mockContracts}
              agentPositions={agentPositionsRef.current}
              onSelectIntervention={(request) => {
                setSelectedIntervention(request)
                setShowInterventionPanel(true)
              }}
              onResolveIntervention={(requestId, decision) => {
                console.log('决策已提交:', requestId, decision)
                // TODO: 调用API提交决策
              }}
            />
          )}
          
          {/* AI角色 - 从后端数据动态加载 */}
          {agents.map(agent => {
            const pos = getAgentPosition(agent)
            const role = getRoleFromAgent(agent)
            agentPositionsRef.current.set(agent.id, pos)
            
            return (
              <WalkingCartoonAgent
                key={agent.id}
                agentId={agent.id}
                initialPosition={pos}
                role={role}
                status={agent.status}
                onClick={() => handleAgentClick(agent.id)}
                isSelected={selectedAgentId === agent.id}
              />
            )
          })}
          
          {/* 对话气泡系统 */}
          <AgentChatSystem agentPositions={agentPositionsRef.current} />
          
          {/* 交互反馈动画 */}
          {interaction && (
            <InteractionFeedback
              role={interaction.role}
              position={interaction.position}
              type={interaction.type}
              onComplete={() => setInteraction(null)}
            />
          )}

          {/* 第一人称漫游控制器 */}
          <FirstPersonController
            enabled={firstPersonMode}
            onEnterMeetingRoom={() => setMeetingRoomOpen(true)}
          />

          <OrbitControls
            minDistance={15}
            maxDistance={60}
            maxPolarAngle={Math.PI / 2 - 0.1}
            enabled={!firstPersonMode}
          />
        </Canvas>
      </div>
      
      {/* UI覆盖层 */}
      <div className="ui-overlay">
        {/* 左侧Agent列表面板 */}
        <div className="manager-sidebar">
          <div className="sidebar-header">
            <h3>🏢 AI管理团队 ({agents.length}人)</h3>
            <div className="connection-status">
              {isConnected ? (
                <span className="connected">🟢 已连接 {socketId?.slice(0, 8)}</span>
              ) : (
                <span className="disconnected">🔴 离线</span>
              )}
              <button onClick={refreshAgents} className="refresh-btn" disabled={isAgentsLoading}>
                {isAgentsLoading ? '⏳' : '🔄'}
              </button>
            </div>
          </div>
          
          <p className="hint">点击角色查看详情</p>
          
          {isAgentsLoading ? (
            <div className="loading">加载中...</div>
          ) : (
            <div className="agent-list">
              {agents.map(agent => {
                const role = getRoleFromAgent(agent)
                const config = ROLE_CONFIG[role]
                // 状态映射：后端online->前端idle，busy->busy，meeting->meeting
                const statusMap: Record<string, ManagerStatus> = {
                  'online': 'idle',
                  'busy': 'busy', 
                  'meeting': 'meeting',
                  'offline': 'offline',
                  'working': 'working'
                }
                const status = statusMap[agent.status || 'offline'] || 'offline'
                const statusConfig = STATUS_CONFIG[status]
                
                return (
                  <div
                    key={agent.id}
                    className={`manager-card ${selectedAgentId === agent.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAgentId(agent.id)}
                    style={{ borderLeftColor: config.color }}
                  >
                    <span className="card-icon" style={{ backgroundColor: config.color }}>
                      {config.icon}
                    </span>
                    <div className="card-info">
                      <div className="card-name">{agent.name}</div>
                      <div className="card-role">{config.name}</div>
                      {agent.currentTask && (
                        <div className="card-task" title={agent.currentTask.title}>
                          📝 {agent.currentTask.title.slice(0, 15)}...
                        </div>
                      )}
                    </div>
                    <div className="card-status" style={{
                      backgroundColor: statusConfig.bgColor,
                      color: statusConfig.color,
                      border: `1px solid ${statusConfig.color}`
                    }}>
                      <span className="status-icon">{statusConfig.icon}</span>
                      <span className="status-text">{statusConfig.label}</span>
                      <span className="status-dot" style={{ backgroundColor: statusConfig.color }}></span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
        {/* 控制提示 */}
        <div className="controls-hint">
          <p>🖱️ 左键拖拽旋转视角</p>
          <p>🖱️ 右键拖拽平移</p>
          <p>🖱️ 滚轮缩放</p>
          <p>👆 点击角色查看详情</p>
          <p>💬 角色会自动对话互动</p>
          <p>🎭 点击触发交互动画</p>
          <p>🌤️ 昼夜自动循环中</p>
        </div>
        
        {/* 天气控制面板 */}
        <div className="weather-controls">
          <h4>🌤️ 环境控制</h4>
          <div className="weather-buttons">
            <button 
              className={weather === 'clear' ? 'active' : ''} 
              onClick={() => setWeather('clear')}
            >
              ☀️ 晴天
            </button>
            <button 
              className={weather === 'rain' ? 'active' : ''} 
              onClick={() => setWeather('rain')}
            >
              🌧️ 雨天
            </button>
            <button 
              className={weather === 'snow' ? 'active' : ''} 
              onClick={() => setWeather('snow')}
            >
              ❄️ 雪天
            </button>
          </div>
          <label className="cycle-toggle">
            <input 
              type="checkbox" 
              checked={autoCycle} 
              onChange={(e) => setAutoCycle(e.target.checked)}
            />
            🕐 昼夜自动循环
          </label>
        </div>
      </div>
      
      {/* 顶部工具栏 */}
      <div className="top-toolbar">
        <div className="toolbar-group">
          <button 
            className={showTaskFlow ? 'active' : ''}
            onClick={() => setShowTaskFlow(!showTaskFlow)}
          >
            📊 任务流
          </button>
          <button 
            className={showNetwork ? 'active' : ''}
            onClick={() => setShowNetwork(!showNetwork)}
          >
            🕸️ 协作网
          </button>
          <button 
            className={showManagementHub ? 'active' : ''}
            onClick={() => setShowManagementHub(!showManagementHub)}
          >
            🏛️ 管理中枢
          </button>
        </div>
        
        {/* v3.0 新增工具栏 */}
        <div className="toolbar-group">
          <button 
            className={showContracts ? 'active' : ''}
            onClick={() => setShowContracts(!showContracts)}
            title="显示协作契约"
          >
            📜 契约
          </button>
          <button 
            className={showNegotiation ? 'active' : ''}
            onClick={() => {
              setShowNegotiation(!showNegotiation)
              if (!selectedContract) setSelectedContract(mockContracts[0])
            }}
            title="显示协商对话"
          >
            💬 协商
          </button>
          <button 
            className={showDelegations ? 'active' : ''}
            onClick={() => setShowDelegations(!showDelegations)}
            title="显示任务委托"
          >
            📤 委托
          </button>
          <button 
            className={showReasoning ? 'active' : ''}
            onClick={() => {
              setShowReasoning(!showReasoning)
              if (!selectedContract) setSelectedContract(mockContracts[0])
            }}
            title="播放推理链"
          >
            ▶️ 推理
          </button>
          <button 
            className={showDecisionCenter ? 'active' : ''}
            onClick={() => setShowDecisionCenter(!showDecisionCenter)}
            title="显示决策中心"
          >
            👔 决策
          </button>
        </div>
        
        <div className="toolbar-group">
          <button 
            className={sceneType === 'courtyard' ? 'active' : ''}
            onClick={() => setSceneType('courtyard')}
          >
            🏯 四合院
          </button>
          <button 
            className={sceneType === 'office' ? 'active' : ''}
            onClick={() => setSceneType('office')}
          >
            🏢 办公室
          </button>
        </div>
      </div>
      
      {/* 模式切换控制 */}
      <div className="mode-controls">
        <button
          onClick={() => setFirstPersonMode(!firstPersonMode)}
          className={firstPersonMode ? 'danger' : 'primary'}
        >
          {firstPersonMode ? '👁️ 退出漫游' : '🚶 第一人称漫游'}
        </button>
        <button
          onClick={() => setMeetingRoomOpen(true)}
          className="success"
        >
          🏢 进入会议室
        </button>
      </div>

      {/* 第一人称模式提示 */}
      {firstPersonMode && (
        <div className="first-person-hint">
          <div>WASD / 方向键移动 | 鼠标控制视角</div>
          <div className="sub-hint">走到会议室入口按 E 进入</div>
        </div>
      )}

      {/* 角色详情弹窗 - Phase 4: 动态Agent数据 */}
      {selectedAgent && selectedRole && (
        <AgentDetailModal
          agent={selectedAgent}
          role={selectedRole}
          onClose={handleCloseModal}
        />
      )}

      {/* 虚拟会议室 */}
      <VirtualMeetingRoom
        isOpen={meetingRoomOpen}
        onClose={() => setMeetingRoomOpen(false)}
        participants={agents.map(a => a.id) as unknown as ManagerRole[]}
      />

      {/* 管理中枢面板 - 使用简化版 */}
      {showManagementHub && (
        <SimpleManagementHub onClose={() => setShowManagementHub(false)} organizationId="org-001" />
      )}
    </div>
  )
}

// Agent详情弹窗组件 - Phase 4: 绑定真实数据
function AgentDetailModal({ 
  agent, 
  role, 
  onClose 
}: { 
  agent: AgentState
  role: ManagerRole
  onClose: () => void 
}) {
  const config = ROLE_CONFIG[role]
  const statusConfig = STATUS_CONFIG[agent.status || 'offline']

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        {/* 头部 */}
        <div className="modal-header" style={{ backgroundColor: config.color }}>
          <div className="modal-icon">{config.icon}</div>
          <div className="modal-title">
            <h2>{agent.name}</h2>
            <p>{config.name} | ID: {agent.id.slice(0, 8)}</p>
          </div>
          <div className="modal-status" style={{
            backgroundColor: statusConfig.bgColor,
            color: statusConfig.color
          }}>
            {statusConfig.icon} {statusConfig.label}
          </div>
        </div>
        
        {/* 内容 */}
        <div className="modal-body">
          {/* 当前任务 */}
          {agent.currentTasks && agent.currentTasks.length > 0 && (
            <div className="modal-section highlight">
              <h3>🎯 当前任务 ({agent.currentTasks.length})</h3>
              {agent.currentTasks.map(task => (
                <div key={task.id} className="task-item">
                  <span className={`task-status status-${task.status}`}></span>
                  <span className="task-title">{task.title}</span>
                  <span className={`task-priority priority-${task.priority}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 实时指标 */}
          {agent.metrics && (
            <div className="modal-section">
              <h3>📊 实时指标</h3>
              <div className="metrics-grid">
                <div className="metric-item">
                  <div className="metric-value">{agent.metrics.completedTasks}</div>
                  <div className="metric-label">已完成任务</div>
                </div>
                <div className="metric-item">
                  <div className="metric-value">{agent.metrics.inProgressTasks}</div>
                  <div className="metric-label">进行中</div>
                </div>
                <div className="metric-item">
                  <div className="metric-value">{Math.round(agent.metrics.workloadPercentage)}%</div>
                  <div className="metric-label">负载率</div>
                </div>
                <div className="metric-item">
                  <div className="metric-value">{Math.round(agent.metrics.availabilityScore * 100)}%</div>
                  <div className="metric-label">可用性</div>
                </div>
              </div>
              
              {/* 负载进度条 */}
              <div className="workload-bar">
                <div 
                  className="workload-fill" 
                  style={{ 
                    width: `${agent.metrics.workloadPercentage}%`,
                    backgroundColor: agent.metrics.workloadPercentage > 80 ? '#f44336' : 
                                     agent.metrics.workloadPercentage > 50 ? '#ff9800' : '#4caf50'
                  }}
                />
              </div>
            </div>
          )}

          {/* 活跃协作 */}
          {agent.activeCollaborations && agent.activeCollaborations.length > 0 && (
            <div className="modal-section">
              <h3>🤝 活跃协作</h3>
              {agent.activeCollaborations.map(collab => (
                <div key={collab.taskId} className="collab-item">
                  <span className="collab-role">{collab.role}</span>
                  <span className="collab-task">{collab.taskTitle}</span>
                </div>
              ))}
            </div>
          )}

          {/* 最近活动 */}
          {agent.recentActivities && agent.recentActivities.length > 0 && (
            <div className="modal-section">
              <h3>📅 最近活动</h3>
              <div className="activity-list">
                {agent.recentActivities.map((activity, idx) => (
                  <div key={idx} className="activity-item">
                    <span className="activity-type">{activity.type}</span>
                    <span className="activity-time">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 位置信息 */}
          <div className="modal-section">
            <h3>📍 位置信息</h3>
            <p className="position-info">
              X: {agent.position.x.toFixed(2)}, 
              Y: {agent.position.y.toFixed(2)}, 
              Z: {agent.position.z.toFixed(2)}
            </p>
            <p className="last-update">
              最后更新: {new Date(agent.lastUpdate).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// v3.0 Mock Data (TODO: 替换为真实API数据)
// ============================================

const mockContracts = [
  {
    contractId: 'contract-001',
    projectId: 'proj-001',
    type: 'taskDelegation',
    context: {
      description: '智慧校园系统技术方案设计',
      expectedOutcome: '技术方案文档',
      deadline: '2026-02-22'
    },
    proposal: {
      agentId: 'agent-管家-001',
      content: '需要设计智慧校园技术架构',
      evidence: [],
      confidence: 0.85,
      timestamp: '2026-02-15T09:00:00Z'
    },
    negotiation: [
      {
        round: 1,
        agentId: 'agent-方案-001',
        stance: 'support',
        content: '建议采用微服务架构',
        confidence: 0.92,
        timestamp: '2026-02-15T09:15:00Z'
      },
      {
        round: 2,
        agentId: 'agent-研发-001',
        stance: 'amend',
        content: '建议增加容器化部署',
        confidence: 0.88,
        timestamp: '2026-02-15T09:30:00Z'
      },
      {
        round: 3,
        agentId: 'agent-方案-001',
        stance: 'accept',
        content: '同意最终方案',
        timestamp: '2026-02-15T09:45:00Z'
      }
    ],
    consensus: {
      reached: true,
      finalAgreement: '微服务+容器化架构',
      participatingAgents: ['agent-管家-001', 'agent-方案-001', 'agent-研发-001'],
      confidence: 0.91,
      consensusAt: '2026-02-15T09:45:00Z'
    },
    execution: {
      status: 'inProgress',
      assignedAgentId: 'agent-方案-001',
      deliverables: [],
      verificationResult: undefined,
      completedAt: undefined
    },
    auditTrail: {
      createdAt: '2026-02-15T09:00:00Z',
      consensusReachedAt: '2026-02-15T09:45:00Z',
      executionStartedAt: '2026-02-15T10:00:00Z',
      decisionRationale: '基于技术可行性和成本考量'
    },
    humanIntervention: {
      required: false
    }
  }
]

const mockDelegations = [
  {
    id: 'delegation-001',
    fromAgentId: 'agent-管家-001',
    toAgentId: 'agent-方案-001',
    taskTitle: '技术方案设计',
    fromPosition: [0, 0, -10] as [number, number, number],
    toPosition: [10, 0, 0] as [number, number, number],
    status: 'accepted' as const
  },
  {
    id: 'delegation-002',
    fromAgentId: 'agent-方案-001',
    toAgentId: 'agent-研发-001',
    taskTitle: '架构评审',
    fromPosition: [10, 0, 0] as [number, number, number],
    toPosition: [-10, 0, 0] as [number, number, number],
    status: 'flying' as const
  }
]

const mockInterventions = [
  {
    requestId: 'intervention-001',
    contractId: 'contract-002',
    type: 'valueJudgment',
    context: {
      projectId: 'proj-002',
      agentsInvolved: ['agent-研发-001', 'agent-方案-001'],
      negotiationSummary: '关于患者数据使用的伦理争议',
      roundsCompleted: 5,
      whyAutoFailed: '涉及伦理判断'
    },
    options: [
      {
        id: 'option-strict',
        description: '采用最严格的数据脱敏方案',
        supportingAgents: ['agent-方案-001'],
        opposingAgents: ['agent-研发-001'],
        predictedOutcome: '隐私保护最好，模型效果下降20%',
        risks: ['模型精度降低'],
        evidence: []
      },
      {
        id: 'option-balanced',
        description: '采用平衡方案',
        supportingAgents: ['agent-管家-001'],
        opposingAgents: [],
        predictedOutcome: '平衡隐私和效果',
        risks: ['仍有轻微隐私风险'],
        evidence: []
      }
    ],
    agentAnalysis: {
      recommendation: '技术上都可实现，需要人类基于价值观选择',
      confidence: 0.3,
      keyUncertainties: ['公司伦理底线', '客户接受度', '监管要求'],
      whyHumanNeeded: '涉及伦理价值判断'
    },
    urgency: 'today',
    status: 'pending',
    requestedAt: '2026-02-15T10:00:00Z'
  }
]

export default App
