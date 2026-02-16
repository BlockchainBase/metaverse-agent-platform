// 任务流可视化组件 - 使用DOM覆盖层（与管理中枢相同风格）
import { useState, useEffect, useMemo } from 'react'
import { useDeviceDetect } from '../hooks/useDeviceDetect'
import { metaverseDataService } from '../services/metaverseData'

// 骨架屏加载状态 - 简化版（避免CSS keyframes问题）
const SkeletonCard = ({ isMobile }: { isMobile: boolean }) => (
  <div style={{
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: isMobile ? '10px' : '12px',
    marginBottom: '8px',
    border: '1px solid rgba(255,255,255,0.15)',
    height: isMobile ? '60px' : '70px'
  }}>
    <div style={{
      background: 'linear-gradient(90deg, rgba(0,229,255,0.1) 0%, rgba(0,229,255,0.2) 50%, rgba(0,229,255,0.1) 100%)',
      borderRadius: '4px',
      height: '100%'
    }}/>
  </div>
)

interface TaskFlowVisualizationProps {
  organizationId?: string
  processInstanceId?: string
  onClose?: () => void
}

const STATUS_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  completed: { color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.2)', label: '已完成' },
  in_progress: { color: '#FF9800', bg: 'rgba(255, 152, 0, 0.2)', label: '进行中' },
  pending: { color: '#9E9E9E', bg: 'rgba(158, 158, 158, 0.2)', label: '待处理' },
  assigned: { color: '#2196F3', bg: 'rgba(33, 150, 243, 0.2)', label: '已分配' },
  delayed: { color: '#F44336', bg: 'rgba(244, 67, 54, 0.2)', label: '已延期' }
}

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  urgent: { label: '紧急', color: '#F44336' },
  high: { label: '高', color: '#FF9800' },
  medium: { label: '中', color: '#2196F3' },
  low: { label: '低', color: '#9E9E9E' }
}

// 部门定义
const DEPARTMENTS: Record<string, { name: string; color: string; agents: string[] }> = {
  marketing: { name: '市场部', color: '#00E5FF', agents: ['李拓', '周展'] },
  solution: { name: '方案部', color: '#9C27B0', agents: ['王谋', '陈策'] },
  delivery: { name: '交付部', color: '#FF9800', agents: ['张码', '刘栈', '陈运', '赵维'] },
  management: { name: '管理部', color: '#4CAF50', agents: ['刘管', '赵财', '孙助'] }
}

export function TaskFlowVisualization({ organizationId, processInstanceId, onClose }: TaskFlowVisualizationProps) {
  const [taskFlow, setTaskFlow] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isMobile } = useDeviceDetect()
  const [touchStart, setTouchStart] = useState<number | null>(null)
  
  // 性能优化：分页显示 - 初始只显示20个
  const [displayLimit, setDisplayLimit] = useState(20)
  const [cachedData, setCachedData] = useState<any>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  // 滑动关闭处理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = e.changedTouches[0].clientY - touchStart
    if (diff > 100) onClose?.()
    setTouchStart(null)
  }

  useEffect(() => {
    // 连接WebSocket
    metaverseDataService.connect(organizationId)
    
    // 初始加载数据 - 从Agent数据生成任务流
    const fetchData = async (force = false) => {
      // 如果缓存数据在30秒内，直接使用缓存
      const now = Date.now()
      if (!force && cachedData && (now - lastFetchTime) < 30000) {
        setTaskFlow(cachedData)
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        const apiBase = import.meta.env.VITE_API_BASE || ''
        
        // 使用 /api/agents 端点获取数据
        const response = await fetch(`${apiBase}/api/agents`)
        const result = await response.json()
        
        if (result.success && result.data) {
          // 从Agent数据生成任务流
          const agents = result.data
          const tasks = agents
            .filter((a: any) => a.currentTask)
            .map((a: any, index: number) => ({
              id: `task-${a.id}`,
              title: a.currentTask,
              agent: a.name,
              agentId: a.id,
              status: a.status === 'working' ? 'in_progress' : 
                      a.status === 'idle' ? 'pending' : 'assigned',
              priority: a.efficiency > 90 ? 'high' : a.efficiency > 80 ? 'medium' : 'low',
              progress: a.taskProgress || 0,
              startTime: new Date(Date.now() - (a.taskProgress || 0) * 1000).toISOString(),
              estimatedEndTime: new Date(Date.now() + (100 - (a.taskProgress || 0)) * 1000).toISOString()
            }))
          
          const taskFlowData = {
            tasks: tasks,
            stats: {
              total: tasks.length,
              completed: tasks.filter((t: any) => t.progress >= 100).length,
              inProgress: tasks.filter((t: any) => t.status === 'in_progress').length,
              pending: tasks.filter((t: any) => t.status === 'pending').length,
              delayed: 0
            }
          }
          
          setTaskFlow(taskFlowData)
          setCachedData(taskFlowData)
          setLastFetchTime(now)
        }
      } catch (e) {
        console.error('Fetch error:', e)
        // 如果请求失败但有缓存，使用缓存
        if (cachedData) {
          setTaskFlow(cachedData)
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    // 首次加载
    fetchData()
    
    // 订阅任务流WebSocket更新
    metaverseDataService.subscribeTaskFlow(processInstanceId)
    
    // 监听实时更新
    const handleTaskFlowUpdate = (data: any) => {
      console.log('📊 收到任务流实时更新:', data)
      if (data && data.tasks) {
        setTaskFlow(data)
        setCachedData(data)
        setLastFetchTime(Date.now())
      } else if (data && data.data) {
        setTaskFlow(data.data)
        setCachedData(data.data)
        setLastFetchTime(Date.now())
      }
    }
    
    window.addEventListener('taskFlowUpdate', handleTaskFlowUpdate as EventListener)
    
    // 定期刷新（30秒）
    const interval = setInterval(() => fetchData(), 30000)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('taskFlowUpdate', handleTaskFlowUpdate as EventListener)
      // metaverseDataService.disconnect()
    }
  }, [organizationId, processInstanceId, cachedData, lastFetchTime])

  // 响应式样式
  const containerStyle: React.CSSProperties = isMobile ? {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(20, 20, 40, 0.98)', color: '#fff',
    padding: '16px', paddingTop: '50px',
    zIndex: 1000, overflow: 'auto', touchAction: 'pan-y'
  } : {
    position: 'fixed', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(20, 20, 40, 0.98)', color: '#fff',
    padding: '24px', borderRadius: '16px',
    minWidth: '400px', maxWidth: '90vw', maxHeight: '85vh',
    overflow: 'auto', border: '2px solid #00E5FF',
    boxShadow: '0 0 40px rgba(0, 229, 255, 0.4)', zIndex: 1000
  }

  return (
    <div style={containerStyle} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* 手机端滑动提示 */}
      {isMobile && (
        <div style={{
          position: 'absolute', top: '10px', left: '50%',
          transform: 'translateX(-50%)',
          width: '40px', height: '4px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '2px'
        }} />
      )}

      {/* 标题栏 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #00E5FF',
        paddingBottom: '15px'
      }}>
        <h3 style={{ margin: 0, color: '#00E5FF', fontSize: isMobile ? '18px' : '20px' }}>
          📊 任务流 {isMobile && <span style={{fontSize:'12px',color:'#888'}}>(↓下滑关闭)</span>}
        </h3>
        {onClose && (
          <button onClick={onClose} style={{
            padding: isMobile ? '10px 16px' : '8px 20px',
            background: '#ff4444', color: 'white',
            border: 'none', borderRadius: '6px',
            cursor: 'pointer', fontSize: '14px'
          }}>关闭</button>
        )}
      </div>

      {isLoading && (
        <>
          {/* 骨架屏统计卡片 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                background: 'rgba(0,229,255,0.1)',
                padding: isMobile ? '12px' : '16px',
                borderRadius: '10px',
                border: '1px solid rgba(0,229,255,0.2)',
                height: '70px'
              }}>
                <div style={{
                  background: 'rgba(0,229,255,0.15)',
                  borderRadius: '4px',
                  height: '100%'
                }}/>
              </div>
            ))}
          </div>
          {/* 骨架屏任务列表 */}
          {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} isMobile={isMobile} />)}
        </>
      )}

      {!isLoading && (!taskFlow || !taskFlow.tasks || taskFlow.tasks.length === 0) && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '32px', marginBottom: '15px' }}>📋</div>
          <div style={{ color: '#00E5FF', fontSize: '18px', marginBottom: '10px' }}>暂无任务数据</div>
          <div style={{ color: '#888', fontSize: '14px' }}>系统运行正常，等待新任务生成...</div>
        </div>
      )}

      {!isLoading && taskFlow && taskFlow.tasks && taskFlow.tasks.length > 0 && (
        <>
          {/* 统计卡片 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'rgba(0, 229, 255, 0.2)',
              padding: isMobile ? '12px' : '16px',
              borderRadius: '10px',
              textAlign: 'center',
              border: '1px solid rgba(0, 229, 255, 0.5)'
            }}>
              <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold', color: '#00E5FF' }}>
                {taskFlow.stats.total}
              </div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>总任务</div>
            </div>
            <div style={{
              background: 'rgba(76, 175, 80, 0.2)',
              padding: isMobile ? '12px' : '16px',
              borderRadius: '10px',
              textAlign: 'center',
              border: '1px solid rgba(76, 175, 80, 0.5)'
            }}>
              <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold', color: '#4CAF50' }}>
                {taskFlow.stats.completed}
              </div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>已完成</div>
            </div>
            <div style={{
              background: 'rgba(255, 152, 0, 0.2)',
              padding: isMobile ? '12px' : '16px',
              borderRadius: '10px',
              textAlign: 'center',
              border: '1px solid rgba(255, 152, 0, 0.5)'
            }}>
              <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold', color: '#FF9800' }}>
                {taskFlow.stats.inProgress}
              </div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>进行中</div>
            </div>
            <div style={{
              background: 'rgba(158, 158, 158, 0.2)',
              padding: isMobile ? '12px' : '16px',
              borderRadius: '10px',
              textAlign: 'center',
              border: '1px solid rgba(158, 158, 158, 0.5)'
            }}>
              <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold', color: '#9E9E9E' }}>
                {taskFlow.stats.pending}
              </div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>待处理</div>
            </div>
          </div>

          {/* 加载更多按钮 */}
          {taskFlow.tasks.length > displayLimit && (
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '16px',
              padding: '12px',
              background: 'rgba(0, 229, 255, 0.1)',
              borderRadius: '8px',
              border: '1px dashed rgba(0, 229, 255, 0.5)'
            }}>
              <div style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>
                当前显示 {Math.min(displayLimit, taskFlow.tasks.length)} / {taskFlow.tasks.length} 个任务
              </div>
              <button
                onClick={() => setDisplayLimit(prev => Math.min(prev + 20, taskFlow.tasks.length))}
                style={{
                  padding: '8px 20px',
                  background: 'rgba(0, 229, 255, 0.2)',
                  color: '#00E5FF',
                  border: '1px solid #00E5FF',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                加载更多 (+20)
              </button>
            </div>
          )}

          {/* 任务列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {taskFlow.tasks.slice(0, displayLimit).map((task: any, index: number) => {
              const statusStyle = STATUS_COLORS[task.status] || STATUS_COLORS.pending
              const priorityInfo = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS.medium
              
              return (
                <div key={task.id || index} style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: isMobile ? '12px' : '14px',
                  border: `1px solid ${statusStyle.color}40`,
                  borderLeft: `4px solid ${statusStyle.color}`
                }}>
                  {/* 任务标题行 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1, marginRight: '10px' }}>
                      <div style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: '500', color: '#fff', marginBottom: '4px' }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        负责人: {task.agent} ({task.agentId})
                      </div>
                    </div>
                    <div style={{
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap'
                    }}>
                      {statusStyle.label}
                    </div>
                  </div>
                  
                  {/* 进度条 */}
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#888' }}>进度</span>
                      <span style={{ fontSize: '11px', color: '#00E5FF' }}>{task.progress}%</span>
                    </div>
                    <div style={{
                      height: '6px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${task.progress}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${statusStyle.color}, ${statusStyle.color}80)`,
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }}/>
                    </div>
                  </div>
                  
                  {/* 优先级标签 */}
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <span style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: priorityInfo.color,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}>
                      {priorityInfo.label}优先级
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* 底部信息 */}
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: 'rgba(0, 229, 255, 0.05)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#888' }}>
              共 {taskFlow.tasks.length} 个任务 | 显示前 {Math.min(displayLimit, taskFlow.tasks.length)} 个
            </div>
          </div>
        </>
      )}
    </div>
  )
}
