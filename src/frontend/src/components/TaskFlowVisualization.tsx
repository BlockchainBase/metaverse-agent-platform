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
    
    // 初始加载数据 - 使用缓存策略
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
        const response = await fetch(`${apiBase}/api/metaverse/3d/tasks/flow/stream?organizationId=${organizationId || 'org-001'}&limit=30`)
        const result = await response.json()
        if (result.success) {
          setTaskFlow(result.data)
          setCachedData(result.data)
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
      if (data && data.nodes) {
        setTaskFlow(data)
        setCachedData(data)
        setLastFetchTime(Date.now())
      } else if (data && data.data) {
        setTaskFlow(data.data)
        setCachedData(data.data)
        setLastFetchTime(Date.now())
      }
    }
    
    metaverseDataService.on('task:flow:update', handleTaskFlowUpdate)
    
    // 备用：每60秒轮询一次（降低频率）
    const interval = setInterval(() => fetchData(true), 60000)
    
    return () => {
      metaverseDataService.off('task:flow:update', handleTaskFlowUpdate)
      clearInterval(interval)
    }
  }, [organizationId, processInstanceId, cachedData, lastFetchTime])

  // 响应式样式
  // 部门配置（常量，不需要重新创建）
const DEPARTMENTS = {
  marketing: { name: '🎯 市场部', color: '#E91E63', agents: ['M1', 'M2', 'marketing'] },
  solution: { name: '💡 方案部', color: '#9C27B0', agents: ['S1', 'S2', 'solution'] },
  delivery: { name: '💻 交付部', color: '#2196F3', agents: ['D1', 'D2', 'O1', 'O2', 'developer', 'devops'] },
  management: { name: '📊 管理中心', color: '#FF9800', agents: ['P1', 'F1', 'A1', 'project', 'finance', 'assistant'] }
}

const containerStyle: React.CSSProperties = isMobile ? {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(20, 20, 40, 0.98)',
    color: '#fff',
    padding: '16px',
    paddingTop: '50px',
    zIndex: 1000,
    overflow: 'auto',
    touchAction: 'pan-y'
  } : {
    position: 'fixed',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(20, 20, 40, 0.98)',
    color: '#fff',
    padding: '24px',
    borderRadius: '16px',
    minWidth: '400px',
    maxWidth: '90vw',
    maxHeight: '85vh',
    overflow: 'auto',
    border: '2px solid #00E5FF',
    boxShadow: '0 0 40px rgba(0, 229, 255, 0.4)',
    zIndex: 1000
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

      {!isLoading && (!taskFlow || taskFlow.nodes.length === 0) && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '32px', marginBottom: '15px' }}>📋</div>
          <div style={{ color: '#00E5FF', fontSize: '18px', marginBottom: '10px' }}>暂无任务数据</div>
          <div style={{ color: '#888', fontSize: '14px' }}>系统运行正常，等待新任务生成...</div>
        </div>
      )}

      {!isLoading && taskFlow && taskFlow.nodes.length > 0 && (
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
          {taskFlow.nodes.length > displayLimit && (
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '16px',
              padding: '12px',
              background: 'rgba(0, 229, 255, 0.1)',
              borderRadius: '8px',
              border: '1px dashed rgba(0, 229, 255, 0.5)'
            }}>
              <div style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>
                当前显示 {displayLimit} / {taskFlow.nodes.length} 个任务
              </div>
              <button
                onClick={() => setDisplayLimit(prev => Math.min(prev + 20, taskFlow.nodes.length))}
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

          {/* 按部门分类的任务列表 */}
          {(() => {
            // 计算部门分组（简化版，避免hooks问题）
            const tasks = taskFlow.nodes
              .filter((n: any) => n.type === 'task')
              .slice(0, displayLimit)
            
            const deptTasks: Record<string, any[]> = {
              marketing: [],
              solution: [],
              delivery: [],
              management: [],
              other: []
            }
            
            tasks.forEach((task: any) => {
              const assignee = task.data?.assignee || ''
              const role = task.data?.role || ''
              let assigned = false
              
              for (const [deptKey, dept] of Object.entries(DEPARTMENTS)) {
                if (dept.agents.some(a => assignee.includes(a) || role.includes(a))) {
                  deptTasks[deptKey].push(task)
                  assigned = true
                  break
                }
              }
              if (!assigned) deptTasks.other.push(task)
            })
            
            const totalDisplayed = tasks.length
            
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 显示任务统计 */}
                <div style={{
                  fontSize: '13px',
                  color: '#888',
                  textAlign: 'center',
                  padding: '8px',
                  background: 'rgba(0, 229, 255, 0.05)',
                  borderRadius: '6px'
                }}>
                  显示 {totalDisplayed} / {taskFlow.nodes.filter((n: any) => n.type === 'task').length} 个任务
                </div>
                {Object.entries(DEPARTMENTS).map(([deptKey, dept]) => {
                  const deptTaskList = deptTasks[deptKey]
                  if (deptTaskList.length === 0) return null
                  
                  return (
                    <div key={deptKey} style={{
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '10px',
                      padding: isMobile ? '12px' : '16px',
                      borderLeft: `4px solid ${dept.color}`
                    }}>
                      <h4 style={{ 
                        margin: '0 0 12px 0', 
                        color: dept.color, 
                        fontSize: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {dept.name}
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#888',
                          background: 'rgba(255,255,255,0.1)',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          {deptTaskList.length}个任务
                        </span>
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {deptTaskList.slice(0, isMobile ? 3 : 5).map((node: any) => {
                          const statusInfo = STATUS_COLORS[node.data?.status] || STATUS_COLORS.pending
                          const priorityInfo = PRIORITY_LABELS[node.data?.priority] || PRIORITY_LABELS.medium
                          return (
                            <div key={node.id} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: isMobile ? '8px' : '10px',
                              background: statusInfo.bg,
                              borderRadius: '8px',
                              border: `1px solid ${statusInfo.color}`
                            }}>
                              <div style={{
                                width: '10px', height: '10px',
                                borderRadius: '50%',
                                background: statusInfo.color,
                                flexShrink: 0
                              }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ 
                                  fontWeight: 'bold', color: '#fff',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  fontSize: isMobile ? '12px' : '13px'
                                }}>
                                  {node.data?.title || '未命名任务'}
                                </div>
                              </div>
                              <span style={{
                                fontSize: '10px',
                                padding: '3px 6px',
                                background: priorityInfo.color,
                                color: '#fff',
                                borderRadius: '4px',
                                flexShrink: 0
                              }}>
                                {priorityInfo.label}
                              </span>
                            </div>
                          )
                        })}
                        
                        {deptTaskList.length > (isMobile ? 3 : 5) && displayLimit < taskFlow.nodes.length && (
                          <div style={{ 
                            textAlign: 'center', 
                            padding: '8px', 
                            color: '#666', 
                            fontSize: '11px' 
                          }}>
                            还有 {deptTaskList.length - (isMobile ? 3 : 5)} 个任务 (点击上方"加载更多"查看)
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                
                {/* 未分类任务 */}
                {deptTasks.other.length > 0 && (
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    padding: isMobile ? '12px' : '16px',
                    borderLeft: '4px solid #9E9E9E'
                  }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#9E9E9E', fontSize: '15px' }}>
                      📋 其他任务 ({deptTasks.other.length})
                    </h4>
                    {deptTasks.other.slice(0, 3).map((node: any) => {
                      const statusInfo = STATUS_COLORS[node.data?.status] || STATUS_COLORS.pending
                      return (
                        <div key={node.id} style={{
                          padding: isMobile ? '8px' : '10px',
                          margin: '6px 0',
                          background: statusInfo.bg,
                          borderRadius: '8px',
                          border: `1px solid ${statusInfo.color}`,
                          fontSize: isMobile ? '12px' : '13px',
                          color: '#fff'
                        }}>
                          {node.data?.title || '未命名任务'}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}
