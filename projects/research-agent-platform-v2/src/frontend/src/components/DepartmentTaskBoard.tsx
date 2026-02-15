import { useState, useMemo } from 'react'
import { Html } from '@react-three/drei'
import { DEPARTMENTS_DATA, DepartmentTask } from '../data/agents'

interface DepartmentTaskBoardProps {
  departmentId: string
  position: [number, number, number]
  rotation?: [number, number, number]
  onTaskClick?: (task: DepartmentTask) => void
}

// 任务状态颜色
const STATUS_COLORS = {
  pending: '#9E9E9E',
  in_progress: '#2196F3',
  completed: '#4CAF50',
  blocked: '#F44336'
}

const STATUS_LABELS = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
  blocked: '已阻塞'
}

const PRIORITY_COLORS = {
  high: '#F44336',
  medium: '#FF9800',
  low: '#4CAF50'
}

export function DepartmentTaskBoard({ 
  departmentId, 
  position, 
  rotation = [0, 0, 0],
  onTaskClick 
}: DepartmentTaskBoardProps) {
  const [selectedTask, setSelectedTask] = useState<DepartmentTask | null>(null)
  
  const dept = DEPARTMENTS_DATA[departmentId]
  if (!dept) return null

  const handleTaskClick = (task: DepartmentTask) => {
    setSelectedTask(task)
    onTaskClick?.(task)
  }

  return (
    <group position={position} rotation={rotation}>
      {/* 看板底座 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 0.1, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* 看板主体 */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[4, 5, 0.1]} />
        <meshStandardMaterial color={dept.color} />
      </mesh>
      
      {/* 看板屏幕 */}
      <mesh position={[0, 2.5, 0.06]}>
        <planeGeometry args={[3.8, 4.8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* 看板内容 - HTML UI */}
      <Html
        position={[0, 2.5, 0.1]}
        transform
        style={{
          width: '360px',
          height: '460px',
          pointerEvents: 'auto'
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '12px',
          padding: '16px',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          border: `2px solid ${dept.color}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          {/* 头部 */}
          <div style={{
            borderBottom: `2px solid ${dept.color}`,
            paddingBottom: '12px',
            marginBottom: '12px'
          }}>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              color: dept.color,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📋 {dept.name}任务中心
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
              {dept.stage} · {dept.stats.inProgressTasks}进行中 / {dept.stats.totalTasks}总任务
            </div>
          </div>

          {/* 任务列表 */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {dept.tasks.map(task => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task)}
                style={{
                  background: selectedTask?.id === task.id 
                    ? 'rgba(255,255,255,0.15)' 
                    : 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  padding: '10px',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${STATUS_COLORS[task.status]}`,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = selectedTask?.id === task.id
                    ? 'rgba(255,255,255,0.15)'
                    : 'rgba(255,255,255,0.05)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '4px'
                }}>
                  <span style={{ 
                    fontSize: '13px', 
                    fontWeight: 'bold',
                    flex: 1,
                    marginRight: '8px'
                  }}>
                    {task.title}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: PRIORITY_COLORS[task.priority],
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                  </span>
                </div>
                
                <div style={{
                  fontSize: '11px',
                  color: '#aaa',
                  marginBottom: '6px',
                  lineHeight: '1.4'
                }}>
                  {task.description}
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px'
                }}>
                  <span style={{ color: STATUS_COLORS[task.status] }}>
                    ● {STATUS_LABELS[task.status]}
                  </span>
                  <span style={{ color: '#888' }}>
                    进度: {task.progress}%
                  </span>
                </div>
                
                {/* 进度条 */}
                <div style={{
                  height: '4px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '2px',
                  marginTop: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${task.progress}%`,
                    height: '100%',
                    background: STATUS_COLORS[task.status],
                    borderRadius: '2px',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* 底部统计 */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '12px',
            marginTop: '12px',
            display: 'flex',
            justifyContent: 'space-around',
            fontSize: '12px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                {dept.stats.completedTasks}
              </div>
              <div style={{ color: '#888', fontSize: '10px' }}>已完成</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#2196F3', fontWeight: 'bold' }}>
                {dept.stats.inProgressTasks}
              </div>
              <div style={{ color: '#888', fontSize: '10px' }}>进行中</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#F44336', fontWeight: 'bold' }}>
                {dept.stats.blockedTasks}
              </div>
              <div style={{ color: '#888', fontSize: '10px' }}>已阻塞</div>
            </div>
          </div>
        </div>
      </Html>

      {/* 选中任务详情弹窗 */}
      {selectedTask && (
        <Html position={[0, 2.5, 0.5]} center>
          <div style={{
            background: 'white',
            color: '#333',
            padding: '20px',
            borderRadius: '12px',
            width: '300px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            border: `3px solid ${dept.color}`
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: dept.color }}>
              {selectedTask.title}
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.5' }}>
              {selectedTask.description}
            </p>
            <div style={{ fontSize: '13px', marginBottom: '8px' }}>
              <strong>状态:</strong> 
              <span style={{ color: STATUS_COLORS[selectedTask.status] }}>
                {STATUS_LABELS[selectedTask.status]}
              </span>
            </div>
            <div style={{ fontSize: '13px', marginBottom: '8px' }}>
              <strong>优先级:</strong> {selectedTask.priority}
            </div>
            <div style={{ fontSize: '13px', marginBottom: '8px' }}>
              <strong>进度:</strong> {selectedTask.progress}%
            </div>
            <div style={{ fontSize: '13px', marginBottom: '16px' }}>
              <strong>截止日期:</strong> {selectedTask.dueDate}
            </div>
            <button
              onClick={() => setSelectedTask(null)}
              style={{
                background: dept.color,
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                width: '100%'
              }}
            >
              关闭
            </button>
          </div>
        </Html>
      )}
    </group>
  )
}

// 部门任务看板系统 - 在元宇宙中显示所有部门的任务
export function DepartmentTaskBoards() {
  const departments = useMemo(() => [
    { id: 'market', pos: [-12, 3, 10], rot: [0, Math.PI / 4, 0] },
    { id: 'solution', pos: [-8, 3, 5], rot: [0, Math.PI / 6, 0] },
    { id: 'management', pos: [0, 4, -8], rot: [0, Math.PI, 0] },
    { id: 'delivery', pos: [12, 3, -5], rot: [0, -Math.PI / 4, 0] },
    { id: 'director', pos: [0, 7, -12], rot: [0, Math.PI, 0] },
  ], [])

  return (
    <>
      {departments.map(dept => (
        <DepartmentTaskBoard
          key={dept.id}
          departmentId={dept.id}
          position={dept.pos as [number, number, number]}
          rotation={dept.rot as [number, number, number]}
        />
      ))}
    </>
  )
}