// 简化版管理中枢组件
import { useState, useEffect } from 'react'
import { Html } from '@react-three/drei'

export function SimpleManagementHub({ organizationId, onClose }: { organizationId?: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `http://localhost:3000/api/metaverse/3d/management-hub?organizationId=${organizationId || 'org-001'}`
        )
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        } else {
          setError('加载失败')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '网络错误')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [organizationId])

  if (loading) {
    return (
      <Html center>
        <div style={{ background: 'white', padding: 20, borderRadius: 8 }}>
          加载管理中枢...
        </div>
      </Html>
    )
  }

  if (error) {
    return (
      <Html center>
        <div style={{ background: 'red', color: 'white', padding: 20, borderRadius: 8 }}>
          错误: {error}
          <br/>
          <button onClick={onClose} style={{ marginTop: 10 }}>关闭</button>
        </div>
      </Html>
    )
  }

  return (
    <Html center position={[0, 5, 0]}>
      <div style={{ 
        background: 'rgba(255,255,255,0.95)', 
        padding: 20, 
        borderRadius: 12,
        minWidth: 350,
        maxHeight: 500,
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <h3 style={{ margin: 0, color: '#333' }}>🏛️ 管理中枢</h3>
          <button onClick={onClose} style={{ padding: '5px 15px' }}>关闭</button>
        </div>
        
        {/* 业务规划 */}
        <div style={{ marginBottom: 15, padding: 10, background: '#f0f8ff', borderRadius: 8 }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#4169E1' }}>📊 业务规划</h4>
          <div>业务线: {data?.businessPlanning?.totalBusinesses || 0}</div>
          {data?.businessPlanning?.businesses?.map((b: any) => (
            <div key={b.id} style={{ margin: '5px 0', padding: 5, background: 'white', borderRadius: 4 }}>
              • {b.name}
            </div>
          ))}
        </div>

        {/* 系统指标 */}
        <div style={{ marginBottom: 15, padding: 10, background: '#f0fff0', borderRadius: 8 }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#228B22' }}>📈 系统指标</h4>
          <div>今日任务: {data?.systemMetrics?.todayTasks || 0}</div>
          <div>已完成: {data?.systemMetrics?.taskStats?.completed || 0}</div>
          <div>进行中: {data?.systemMetrics?.taskStats?.in_progress || 0}</div>
          <div>待处理: {data?.systemMetrics?.taskStats?.pending || 0}</div>
        </div>

        {/* 审批台 */}
        <div style={{ padding: 10, background: '#fff5f0', borderRadius: 8 }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#FF6347' }}>✅ 审批台</h4>
          <div>待审批: {data?.approvalStation?.pendingCount || 0}</div>
        </div>
      </div>
    </Html>
  )
}
