// 简化版协作网络组件
import { useState, useEffect } from 'react'
import { Html } from '@react-three/drei'

export function SimpleCollaborationNetwork({ organizationId }: { organizationId?: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `http://localhost:3000/api/metaverse/3d/collaboration/network/v2?organizationId=${organizationId || 'org-001'}&timeRange=30`
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
          加载协作网...
        </div>
      </Html>
    )
  }

  if (error) {
    return (
      <Html center>
        <div style={{ background: 'red', color: 'white', padding: 20, borderRadius: 8 }}>
          错误: {error}
        </div>
      </Html>
    )
  }

  return (
    <Html center position={[0, 10, 0]}>
      <div style={{ 
        background: 'rgba(255,255,255,0.95)', 
        padding: 20, 
        borderRadius: 12,
        minWidth: 300,
        maxHeight: 400,
        overflow: 'auto'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🕸️ 协作网络</h3>
        <div style={{ marginBottom: 15 }}>
          <div>总人数: {data?.stats?.totalAgents || 0}</div>
          <div>连接数: {data?.stats?.totalConnections || 0}</div>
          <div>孤立节点: {data?.stats?.isolatedAgents || 0}</div>
        </div>
        <div>
          <h4 style={{ margin: '10px 0', color: '#666' }}>Agent列表:</h4>
          {data?.nodes?.map((node: any) => (
            <div key={node.id} style={{ 
              padding: 8, 
              margin: '5px 0', 
              background: '#f5f5f5', 
              borderRadius: 4 
            }}>
              {node.data?.avatar} {node.label}
            </div>
          ))}
        </div>
      </div>
    </Html>
  )
}
