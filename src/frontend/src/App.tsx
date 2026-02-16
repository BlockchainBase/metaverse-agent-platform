import { useState, useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { ChineseCourtyard } from './components/Courtyard'
import { MeetingRoomScene } from './components/MeetingRoomScene'
import { WalkingCartoonAgent } from './components/CartoonAgent'
import { Dashboards } from './components/Dashboards'
import { OfficeDecorations } from './components/OfficeDecorations'
import { AgentChatSystem } from './components/ChatBubble'
import { InteractionFeedback } from './components/InteractionFeedback'
import { EnvironmentController, WeatherType } from './components/EnvironmentController'
import { TaskFlowVisualization } from './components/TaskFlowVisualization'
// import { CollaborationNetwork } from './components/CollaborationNetwork'
// import { ManagementHub } from './components/ManagementHub'
import { SimpleCollaborationNetwork } from './components/SimpleCollaborationNetwork'
import { SimpleManagementHub } from './components/SimpleManagementHub'
// v3.0: 新增协作可视化组件
import { SimpleContract } from './components/SimpleContract'
import { SimpleNegotiation } from './components/SimpleNegotiation'
import { SimpleTaskDelegation } from './components/SimpleTaskDelegation'
import { SimpleReasoning } from './components/SimpleReasoning'
import { SimpleDecision } from './components/SimpleDecision'
import { AgentDetailModal } from './components/AgentDetailModal'
import { useAgents, useConnectionStatus } from './hooks/useMetaverseData'
import { useDeviceDetect, useTouchDevice } from './hooks/useDeviceDetect'
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
  // 设备检测
  const { isMobile, isTablet, isPC, isLandscape } = useDeviceDetect()
  const isTouch = useTouchDevice()

  // Phase 4: 使用新的数据hooks
  const { agents, isLoading: isAgentsLoading, isConnected, refreshAgents } = useAgents()
  const { socketId } = useConnectionStatus()

  // 场景类型切换（必须在canvasConfig之前声明）
  const [sceneType, setSceneType] = useState<'office' | 'courtyard'>('courtyard')

  // 根据设备类型和场景类型调整Canvas配置
  const canvasConfig = {
    // 移动端降低像素比以提高性能
    dpr: isMobile ? 1 : ([1, 2] as [number, number]),
    // 移动端简化渲染
    gl: {
      antialias: !isMobile,
      alpha: false,
      powerPreference: isMobile ? 'low-power' as const : 'high-performance' as const
    },
    // 根据场景类型调整相机
    camera: {
      position: (sceneType === 'office' 
        ? (isMobile ? [0, 25, 25] : [0, 20, 20])  // 会议室场景：俯视会议桌
        : (isMobile ? [30, 25, 30] : [25, 20, 25]) // 四合院场景
      ) as [number, number, number],
      fov: isMobile ? 60 : 50,
      target: sceneType === 'office' ? [0, 0, 0] as [number, number, number] : undefined
    }
  }

  // UI状态
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [interaction, setInteraction] = useState<InteractionState | null>(null)
  const [weather, setWeather] = useState<WeatherType>('clear')
  const [autoCycle, setAutoCycle] = useState(true)
  const [showTaskFlow, setShowTaskFlow] = useState(false)
  const [showNetwork, setShowNetwork] = useState(false)
  const [showManagementHub, setShowManagementHub] = useState(false)

  // v3.0: 新增可视化状态
  const [showContracts, setShowContracts] = useState(false)
  const [showNegotiation, setShowNegotiation] = useState(false)
  const [showDelegations, setShowDelegations] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)

  // 移动端侧边栏展开状态
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)
  const touchEndY = useRef<number>(0)
  const [showDecisionCenter, setShowDecisionCenter] = useState(false)
  const [selectedContract, setSelectedContract] = useState<any>(null)
  const [selectedIntervention, setSelectedIntervention] = useState<any>(null)
  const [showInterventionPanel, setShowInterventionPanel] = useState(false)

  // 存储角色位置用于对话系统
  const agentPositionsRef = useRef<Map<string, [number, number, number]>>(new Map())

  // 获取选中的Agent
  const selectedAgent = agents.find(a => a.id === selectedAgentId)
  const selectedRole = selectedAgent ? getRoleFromAgent(selectedAgent) : null

  // v3.0: 获取Agent位置（根据场景类型）
  const getAgentPosition = (agent: AgentState): [number, number, number] => {
    const role = getRoleFromAgent(agent)

    // 如果后端有位置数据且是四合院场景，使用后端数据
    if (agent.position && sceneType === 'courtyard') {
      return [agent.position.x, agent.position.y, agent.position.z]
    }

    // 会议室场景：围坐在会议桌周围
    if (sceneType === 'office') {
      const agentIds = agents.map(a => a.id)
      const index = agentIds.indexOf(agent.id)
      const totalAgents = Math.max(agents.length, 11)
      
      // 椭圆形会议桌周围的座位 - 均匀分布
      const angle = (index / totalAgents) * Math.PI * 2
      const radiusX = 6.5 // 椭圆长轴
      const radiusZ = 4.5 // 椭圆短轴
      
      const x = Math.cos(angle) * radiusX
      const z = Math.sin(angle) * radiusZ
      
      // 返回位置，让角色站在椅子位置（y=0，表示站在地面）
      return [x, 0, z]
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
        <Canvas
          shadows
          camera={{ position: canvasConfig.camera.position, fov: canvasConfig.camera.fov }}
          gl={canvasConfig.gl}
          dpr={canvasConfig.dpr}
        >
          {/* 环境控制系统 */}
          <EnvironmentController weather={weather} autoCycle={autoCycle} />

          {/* 星空背景 */}
          <Stars radius={100} depth={50} count={3000} factor={4} />

          {/* 场景类型切换 */}
          {sceneType === 'courtyard' ? (
            <ChineseCourtyard />
          ) : (
            <MeetingRoomScene />
          )}

          {/* 数据看板 */}
          <Dashboards useRealData={true} />

          {/* 任务流可视化 - 已移至UI层 */}
          
          {/* 协作网络可视化 - 已移至UI层 */}

          {/* v3.0: 协作契约可视化 - 已移至UI层 */}
          
          {/* v3.0: 协商对话气泡 - 已移至UI层 */}
          
          {/* v3.0: 任务委托飞行动画 - 已移至UI层 */}
          
          {/* v3.0: 推理链回放 - 已移至UI层 */}
          
          {/* v3.0: 决策中心 - 已移至UI层 */}

          {/* AI角色 - 从后端数据动态加载 */}
          {agents.map((agent, index) => {
            const pos = getAgentPosition(agent)
            const role = getRoleFromAgent(agent)
            agentPositionsRef.current.set(agent.id, pos)

            // 准备其他Agent的位置信息（用于碰撞检测）
            const otherAgents = agents
              .filter(a => a.id !== agent.id)
              .map(a => ({
                id: a.id,
                position: getAgentPosition(a)
              }))

            // 如果后端离线，显示离线状态
            const displayStatus = !isConnected ? 'offline' : 
                                  sceneType === 'office' ? 'meeting' : agent.status

            return (
              <WalkingCartoonAgent
                key={agent.id}
                agentId={agent.id}
                initialPosition={pos}
                role={role}
                status={displayStatus}
                onClick={() => handleAgentClick(agent.id)}
                isSelected={selectedAgentId === agent.id}
                faceCenter={sceneType === 'office'}
                sceneType={sceneType}
                otherAgents={otherAgents}
                chairIndex={sceneType === 'office' ? index : undefined}
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

          <OrbitControls
            minDistance={15}
            maxDistance={60}
            maxPolarAngle={Math.PI / 2 - 0.1}
          />
        </Canvas>
      </div>

      {/* UI覆盖层 */}
      <div className="ui-overlay">
        {/* 左侧Agent列表面板 - 响应式：移动端底部抽屉，PC端侧边栏 */}
        <div 
          ref={sidebarRef}
          className={`manager-sidebar ${isMobile ? 'mobile-drawer' : ''} ${sidebarOpen ? 'active' : ''}`} 
          data-count={agents.length}
          onTouchStart={(e) => {
            touchStartY.current = e.touches[0].clientY
          }}
          onTouchMove={(e) => {
            touchEndY.current = e.touches[0].clientY
            // 阻止默认滚动行为
            if (isMobile) {
              const deltaY = touchStartY.current - touchEndY.current
              // 向上滑动时展开，向下滑动时收起
              if (deltaY > 30 && !sidebarOpen) {
                setSidebarOpen(true)
              } else if (deltaY < -30 && sidebarOpen) {
                setSidebarOpen(false)
              }
            }
          }}
          onTouchEnd={() => {
            const deltaY = touchStartY.current - touchEndY.current
            // 根据滑动距离决定是否切换状态
            if (Math.abs(deltaY) > 50) {
              if (deltaY > 0 && !sidebarOpen) {
                setSidebarOpen(true)
              } else if (deltaY < 0 && sidebarOpen) {
                setSidebarOpen(false)
              }
            }
            touchStartY.current = 0
            touchEndY.current = 0
          }}
          onClick={(e) => {
            // 只有点击侧边栏本身（非子元素）时才切换状态
            if (isMobile && e.target === e.currentTarget) {
              setSidebarOpen(!sidebarOpen)
            }
          }}
        >
          {/* 移动端滑动提示 */}
          {isMobile && (
            <div 
              className="sidebar-swipe-hint"
              onClick={(e) => {
                e.stopPropagation()
                setSidebarOpen(!sidebarOpen)
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '50px',
                cursor: 'pointer',
                zIndex: 10
              }}
            />
          )}
          <div className="sidebar-header" onClick={(e) => e.stopPropagation()}>
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

          <p className="hint" onClick={(e) => e.stopPropagation()}>
            点击角色查看详情
            {!isConnected && (
              <span style={{ color: '#ff6b6b', display: 'block', marginTop: '8px' }}>
                ⚠️ 后端模拟系统已停止，显示为离线状态
              </span>
            )}
          </p>

          {isAgentsLoading ? (
            <div className="loading" onClick={(e) => e.stopPropagation()}>加载中...</div>
          ) : (
            <div className="agent-list" onClick={(e) => e.stopPropagation()}>
              {agents.map(agent => {
                const role = getRoleFromAgent(agent)
                const config = ROLE_CONFIG[role]
                // 状态映射：后端状态 -> 前端状态
                const statusMap: Record<string, ManagerStatus> = {
                  'online': 'idle',
                  'idle': 'idle',
                  'busy': 'busy',
                  'meeting': 'meeting',
                  'offline': 'offline',
                  'working': 'working'
                }
                const status = statusMap[agent.status || 'offline'] || 'idle'
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
            onClick={() => setShowNegotiation(!showNegotiation)}
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
            onClick={() => setShowReasoning(!showReasoning)}
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

      {/* 角色详情弹窗 - Phase 4: 动态Agent数据 */}
      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          onClose={handleCloseModal}
        />
      )}

      {/* 任务流面板 */}
      {showTaskFlow && (
        <TaskFlowVisualization organizationId="org-001" onClose={() => setShowTaskFlow(false)} />
      )}

      {/* 协作网面板 */}
      {showNetwork && (
        <SimpleCollaborationNetwork organizationId="org-001" onClose={() => setShowNetwork(false)} />
      )}

      {/* 管理中枢面板 */}
      {showManagementHub && (
        <SimpleManagementHub onClose={() => setShowManagementHub(false)} organizationId="org-001" />
      )}

      {/* 任务委托链面板 */}
      {showDelegations && (
        <SimpleTaskDelegation organizationId="org-001" onClose={() => setShowDelegations(false)} />
      )}

      {/* 协商对话面板 */}
      {showNegotiation && (
        <SimpleNegotiation organizationId="org-001" onClose={() => setShowNegotiation(false)} />
      )}

      {/* 推理链回放面板 */}
      {showReasoning && (
        <SimpleReasoning organizationId="org-001" onClose={() => setShowReasoning(false)} />
      )}

      {/* 决策中心面板 */}
      {showDecisionCenter && (
        <SimpleDecision organizationId="org-001" onClose={() => setShowDecisionCenter(false)} />
      )}

      {/* 协作契约面板 */}
      {showContracts && (
        <SimpleContract organizationId="org-001" onClose={() => setShowContracts(false)} />
      )}
    </div>
  )
}

export default App
