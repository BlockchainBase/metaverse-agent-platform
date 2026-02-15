// Phase 4: 管理中枢3D场景组件
import { useState } from 'react'
import { Text, Box, Plane, Html } from '@react-three/drei'
import { useManagementHub } from '../hooks/useMetaverseData'

interface ManagementHubProps {
  onClose: () => void
  organizationId?: string
}

export function ManagementHub({ onClose, organizationId }: ManagementHubProps) {
  const { hubData, isLoading, refreshHubData } = useManagementHub(organizationId)
  const [activeStation, setActiveStation] = useState<string | null>(null)

  console.log('ManagementHub render:', { organizationId, isLoading, hubData: !!hubData })

  if (isLoading) {
    return (
      <Html center>
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          padding: '20px 40px',
          borderRadius: '12px',
          fontSize: '16px'
        }}>
          加载管理中枢数据...
        </div>
      </Html>
    )
  }

  if (!hubData) {
    return (
      <Html center>
        <div style={{ 
          background: 'rgba(255,0,0,0.9)', 
          padding: '20px 40px',
          borderRadius: '12px',
          fontSize: '16px',
          color: 'white'
        }}>
          加载失败 - 请刷新重试
        </div>
      </Html>
    )
  }

  return (
    <group position={[0, 5, 0]}>
      {/* 管理中枢底座 */}
      <Box args={[30, 1, 20]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#2c3e50" />
      </Box>

      {/* 标题 */}
      <Text
        position={[0, 6, -8]}
        fontSize={2}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
      >
        🏛️ 管理中枢
      </Text>

      {/* 业务规划桌 */}
      <BusinessPlanningDesk 
        data={hubData.businessPlanning}
        position={[-10, 0, 0]}
        isActive={activeStation === 'planning'}
        onClick={() => setActiveStation(activeStation === 'planning' ? null : 'planning')}
      />

      {/* 流程设计台 */}
      <ProcessDesignStation 
        data={hubData.processDesign}
        position={[0, 0, 0]}
        isActive={activeStation === 'design'}
        onClick={() => setActiveStation(activeStation === 'design' ? null : 'design')}
      />

      {/* 审批台 */}
      <ApprovalStation 
        data={hubData.approvalStation}
        position={[10, 0, 0]}
        isActive={activeStation === 'approval'}
        onClick={() => setActiveStation(activeStation === 'approval' ? null : 'approval')}
      />

      {/* 系统指标展示 */}
      <SystemMetricsPanel 
        data={hubData.systemMetrics}
        position={[0, 0, 8]}
      />

      {/* 关闭按钮 */}
      <Html position={[0, 8, 0]}>
        <button
          onClick={onClose}
          style={{
            padding: '10px 24px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}
        >
          关闭管理中枢
        </button>
      </Html>

      {/* 刷新按钮 */}
      <Html position={[12, 8, 0]}>
        <button
          onClick={refreshHubData}
          style={{
            padding: '8px 16px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🔄 刷新数据
        </button>
      </Html>
    </group>
  )
}

// 业务规划桌
function BusinessPlanningDesk({ 
  data, 
  position, 
  isActive, 
  onClick 
}: { 
  data: any
  position: [number, number, number]
  isActive: boolean
  onClick: () => void 
}) {
  return (
    <group position={position}>
      {/* 桌子 */}
      <Box 
        args={[8, 1, 5]} 
        position={[0, 0.5, 0]}
        onClick={onClick}
      >
        <meshStandardMaterial 
          color={isActive ? '#3498db' : '#34495e'}
          emissive={isActive ? '#2980b9' : '#000000'}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </Box>

      {/* 桌腿 */}
      <Box args={[0.3, 2, 0.3]} position={[-3.5, -0.5, -2]}>
        <meshStandardMaterial color="#2c3e50" />
      </Box>
      <Box args={[0.3, 2, 0.3]} position={[3.5, -0.5, -2]}>
        <meshStandardMaterial color="#2c3e50" />
      </Box>
      <Box args={[0.3, 2, 0.3]} position={[-3.5, -0.5, 2]}>
        <meshStandardMaterial color="#2c3e50" />
      </Box>
      <Box args={[0.3, 2, 0.3]} position={[3.5, -0.5, 2]}>
        <meshStandardMaterial color="#2c3e50" />
      </Box>

      {/* 标签 */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.6}
        color={isActive ? '#FFD700' : 'white'}
        anchorX="center"
      >
        📊 业务规划
      </Text>

      {/* 业务卡片 */}
      {data.businesses.slice(0, 3).map((business: any, idx: number) => (
        <group key={business.id} position={[(idx - 1) * 2.5, 1.2, 0]}>
          <Box args={[2, 0.1, 1.5]}>
            <meshStandardMaterial 
              color={business.status === 'active' ? '#27ae60' : '#95a5a6'}
            />
          </Box>
          <Text
            position={[0, 0.1, 0.5]}
            fontSize={0.25}
            color="white"
            anchorX="center"
            maxWidth={1.8}
          >
            {business.name.slice(0, 8)}
          </Text>
        </group>
      ))}

      {/* 详情面板 */}
      {isActive && (
        <Html position={[0, 4, 0]} distanceFactor={8}>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            minWidth: '280px',
            fontSize: '13px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#2c3e50' }}>📊 业务规划</h3>
            <div style={{ marginBottom: '8px' }}>
              <strong>总业务数:</strong> {data.totalBusinesses}
            </div>
            {data.businesses.map((business: any) => (
              <div 
                key={business.id}
                style={{
                  padding: '8px',
                  marginBottom: '8px',
                  background: '#f8f9fa',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${business.status === 'active' ? '#27ae60' : '#95a5a6'}`
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{business.name}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  流程模板: {business.processTemplateCount}个
                </div>
              </div>
            ))}
          </div>
        </Html>
      )}
    </group>
  )
}

// 流程设计台
function ProcessDesignStation({ 
  data, 
  position, 
  isActive, 
  onClick 
}: { 
  data: any
  position: [number, number, number]
  isActive: boolean
  onClick: () => void 
}) {
  const stats = data.stats || {}
  
  return (
    <group position={position}>
      {/* 设计台 */}
      <Box 
        args={[8, 1, 5]} 
        position={[0, 0.5, 0]}
        onClick={onClick}
      >
        <meshStandardMaterial 
          color={isActive ? '#9b59b6' : '#34495e'}
          emissive={isActive ? '#8e44ad' : '#000000'}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </Box>

      {/* 桌腿 */}
      <Box args={[0.3, 2, 0.3]} position={[-3.5, -0.5, -2]}>
        <meshStandardMaterial color="#2c3e50" />
      </Box>
      <Box args={[0.3, 2, 0.3]} position={[3.5, -0.5, -2]}>
        <meshStandardMaterial color="#2c3e50" />
      </Box>
      <Box args={[0.3, 2, 0.3]} position={[-3.5, -0.5, 2]}>
        <meshStandardMaterial color="#2c3e50" />
      </Box>
      <Box args={[0.3, 2, 0.3]} position={[3.5, -0.5, 2]}>
        <meshStandardMaterial color="#2c3e50" />
      </Box>

      {/* 标签 */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.6}
        color={isActive ? '#FFD700' : 'white'}
        anchorX="center"
      >
        🔄 流程设计
      </Text>

      {/* 流程状态指示器 */}
      <group position={[-2, 1.2, 0]}>
        <Box args={[1.5, 0.2, 1]}>
          <meshStandardMaterial color="#27ae60" />
        </Box>
        <Text position={[0, 0.3, 0]} fontSize={0.25} color="white" anchorX="center">
          运行中: {stats.running || 0}
        </Text>
      </group>

      <group position={[0, 1.2, 0]}>
        <Box args={[1.5, 0.2, 1]}>
          <meshStandardMaterial color="#3498db" />
        </Box>
        <Text position={[0, 0.3, 0]} fontSize={0.25} color="white" anchorX="center">
          已完成: {stats.completed || 0}
        </Text>
      </group>

      <group position={[2, 1.2, 0]}>
        <Box args={[1.5, 0.2, 1]}>
          <meshStandardMaterial color="#f39c12" />
        </Box>
        <Text position={[0, 0.3, 0]} fontSize={0.25} color="white" anchorX="center">
          暂停: {stats.paused || 0}
        </Text>
      </group>

      {/* 详情面板 */}
      {isActive && (
        <Html position={[0, 4, 0]} distanceFactor={8}>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            minWidth: '280px',
            fontSize: '13px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#2c3e50' }}>🔄 流程实例统计</h3>
            {Object.entries(stats).map(([status, count]) => (
              <div 
                key={status}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px',
                  marginBottom: '6px',
                  background: '#f8f9fa',
                  borderRadius: '6px'
                }}
              >
                <span style={{ textTransform: 'capitalize' }}>{status}</span>
                <strong>{count as number}</strong>
              </div>
            ))}
          </div>
        </Html>
      )}
    </group>
  )
}

// 审批台
function ApprovalStation({ 
  data, 
  position, 
  isActive, 
  onClick 
}: { 
  data: any
  position: [number, number, number]
  isActive: boolean
  onClick: () => void 
}) {
  return (
    <group position={position}>
      {/* 审批台 */}
      <Box 
        args={[8, 1, 5]} 
        position={[0, 0.5, 0]}
        onClick={onClick}
      >
        <meshStandardMaterial 
          color={isActive ? '#e74c3c' : '#34495e'}
          emissive={isActive ? '#c0392b' : '#000000'}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </Box>

      {/* 桌腿 */}
      <Box args={[0.3, 2, 0.3]} position={[-3.5, -0.5, -2]}>
        <meshStandardMaterial color="#2c3e50" />
      </Box>
      <Box args={[0.3, 2, 0.3]} position={[3.5, -0.5, -2]}>
        <meshStandardMaterial color="#2c3e50" />
      </Box>
      <Box args={[0.3, 2, 0.3]} position={[-3.5, -0.5, 2]}>
        <meshStandardMaterial color="#2c3e50" />
      </Box>
      <Box args={[0.3, 2, 0.3]} position={[3.5, -0.5, 2]}>
        <meshStandardMaterial color="#2c3e50" />
      </Box>

      {/* 标签 */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.6}
        color={isActive ? '#FFD700' : 'white'}
        anchorX="center"
      >
        ✓ 审批台
      </Text>

      {/* 待审批文件堆 */}
      {data.pendingCount > 0 && (
        <group>
          {Array.from({ length: Math.min(data.pendingCount, 5) }).map((_, idx) => (
            <Box
              key={idx}
              args={[1.5, 0.1, 1]}
              position={[(idx - 2) * 1.2, 1.1 + idx * 0.05, 0]}
            >
              <meshStandardMaterial color="#ecf0f1" />
            </Box>
          ))}
        </group>
      )}

      {/* 待审批数量徽章 */}
      {data.pendingCount > 0 && (
        <group position={[3, 2.5, -1.5]}>
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
          <Text
            position={[0, 0, 0.3]}
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {data.pendingCount}
          </Text>
        </group>
      )}

      {/* 详情面板 */}
      {isActive && (
        <Html position={[0, 4, 0]} distanceFactor={8}>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            minWidth: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            fontSize: '13px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#2c3e50' }}>
              ✓ 待审批事项 ({data.pendingCount})
            </h3>
            {data.pendingApprovals.length === 0 ? (
              <div style={{ color: '#27ae60', textAlign: 'center', padding: '20px' }}>
                🎉 暂无待审批事项
              </div>
            ) : (
              data.pendingApprovals.map((approval: any) => (
                <div 
                  key={approval.id}
                  style={{
                    padding: '12px',
                    marginBottom: '10px',
                    background: '#fff3e0',
                    borderRadius: '8px',
                    borderLeft: '4px solid #ff9800'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {approval.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    <div>申请人: {approval.requester?.name || 'Unknown'}</div>
                    <div>处理人: {approval.assignee?.name || 'Unassigned'}</div>
                    <div>提交时间: {new Date(approval.createdAt).toLocaleString()}</div>
                    <div style={{ 
                      display: 'inline-block',
                      marginTop: '4px',
                      padding: '2px 8px',
                      background: approval.priority === 'high' ? '#ffebee' : '#e8f5e9',
                      color: approval.priority === 'high' ? '#c62828' : '#2e7d32',
                      borderRadius: '10px',
                      fontSize: '10px'
                    }}>
                      优先级: {approval.priority}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Html>
      )}
    </group>
  )
}

// 系统指标面板
function SystemMetricsPanel({ data, position }: { data: any; position: [number, number, number] }) {
  const taskStats = data.taskStats || {}
  
  return (
    <group position={position}>
      {/* 面板背景 */}
      <Plane args={[20, 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#2c3e50" transparent opacity={0.8} />
      </Plane>

      {/* 系统指标标题 */}
      <Text
        position={[-8, 0.2, -1]}
        fontSize={0.5}
        color="#FFD700"
        anchorX="left"
      >
        📈 系统指标
      </Text>

      {/* 效率指标 */}
      <group position={[-6, 0.3, 0.5]}>
        <Text fontSize={0.35} color="white" anchorX="center">
          效率: {data.efficiency}%
        </Text>
        <Box 
          args={[3, 0.1, 0.2]} 
          position={[0, -0.3, 0]}
        >
          <meshStandardMaterial color="#34495e" />
        </Box>
        <Box 
          args={[3 * (data.efficiency / 100), 0.1, 0.25]} 
          position={[-1.5 + 1.5 * (data.efficiency / 100), -0.3, 0]}
        >
          <meshStandardMaterial 
            color={data.efficiency > 80 ? '#27ae60' : data.efficiency > 50 ? '#f39c12' : '#e74c3c'} 
          />
        </Box>
      </group>

      {/* 今日任务 */}
      <group position={[-1, 0.3, 0.5]}>
        <Text fontSize={0.35} color="white" anchorX="center">
          今日任务: {data.todayTasks}
        </Text>
        <Text position={[0, -0.5, 0]} fontSize={0.3} color="#27ae60" anchorX="center">
          已完成: {data.completedToday}
        </Text>
      </group>

      {/* 任务状态分布 */}
      <group position={[4, 0.3, 0]}>
        <Text fontSize={0.3} color="#bdc3c7" anchorX="center">
          任务分布
        </Text>
        {Object.entries(taskStats).slice(0, 4).map(([status, count], idx) => (
          <Text
            key={status}
            position={[(idx - 1.5) * 2, -0.4, 0]}
            fontSize={0.25}
            color="white"
            anchorX="center"
          >
            {status}: {count as number}
          </Text>
        ))}
      </group>
    </group>
  )
}

export default ManagementHub
