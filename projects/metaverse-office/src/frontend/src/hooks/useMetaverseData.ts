// Phase 4: React Hooks for 3D Metaverse Data
import { useState, useEffect, useCallback, useRef } from 'react'
import { metaverseDataService, AgentState, TaskFlowData, CollaborationNetwork, ManagementHubData, Scene3DConfig } from '../services/metaverseData'

// 组织ID（实际应用中应该从上下文或配置中获取）
const DEFAULT_ORGANIZATION_ID = 'org-001'

// ==================== useAgents Hook ====================
export function useAgents(organizationId: string = DEFAULT_ORGANIZATION_ID) {
  const [agents, setAgents] = useState<AgentState[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 连接WebSocket
    metaverseDataService.connect(organizationId)

    // 加载初始数据
    const loadAgents = async () => {
      try {
        setIsLoading(true)
        const data = await metaverseDataService.getAgentStatusBatch()
        setAgents(data)
        setIsConnected(metaverseDataService.isConnected())
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        setIsLoading(false)
      }
    }

    loadAgents()

    // 监听Agent状态更新
    const handleAgentUpdate = (data: any) => {
      setAgents(prev => {
        const index = prev.findIndex(a => a.id === data.agentId)
        if (index >= 0) {
          const updated = [...prev]
          updated[index] = { ...updated[index], ...data, lastUpdate: new Date().toISOString() }
          return updated
        }
        return prev
      })
    }

    // 监听连接状态
    const handleConnectionStatus = (data: any) => {
      setIsConnected(data.connected)
    }

    metaverseDataService.on('agent:status:update', handleAgentUpdate)
    metaverseDataService.on('connection:status', handleConnectionStatus)

    return () => {
      metaverseDataService.off('agent:status:update', handleAgentUpdate)
      metaverseDataService.off('connection:status', handleConnectionStatus)
    }
  }, [organizationId])

  const refreshAgents = useCallback(async () => {
    setIsLoading(true)
    const data = await metaverseDataService.getAgentStatusBatch()
    setAgents(data)
    setIsLoading(false)
  }, [])

  return { agents, isLoading, isConnected, error, refreshAgents }
}

// ==================== useTaskFlow Hook ====================
export function useTaskFlow(organizationId: string = DEFAULT_ORGANIZATION_ID, processInstanceId?: string) {
  const [taskFlow, setTaskFlow] = useState<TaskFlowData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    metaverseDataService.connect(organizationId)

    const loadTaskFlow = async () => {
      setIsLoading(true)
      const data = await metaverseDataService.getTaskFlow(processInstanceId)
      setTaskFlow(data)
      setIsLoading(false)
    }

    loadTaskFlow()

    // 订阅任务流更新
    metaverseDataService.subscribeTaskFlow(processInstanceId)

    const handleTaskFlowUpdate = (data: TaskFlowData) => {
      setTaskFlow(data)
    }

    metaverseDataService.on('task:flow:update', handleTaskFlowUpdate)

    return () => {
      metaverseDataService.off('task:flow:update', handleTaskFlowUpdate)
    }
  }, [organizationId, processInstanceId])

  return { taskFlow, isLoading }
}

// ==================== useCollaborationNetwork Hook ====================
export function useCollaborationNetwork(organizationId: string = DEFAULT_ORGANIZATION_ID) {
  const [network, setNetwork] = useState<CollaborationNetwork | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    metaverseDataService.connect(organizationId)

    const loadNetwork = async () => {
      setIsLoading(true)
      const data = await metaverseDataService.getCollaborationNetwork(30, organizationId)
      setNetwork(data)
      setIsLoading(false)
    }

    loadNetwork()

    // 订阅网络更新
    metaverseDataService.subscribeCollaborationNetwork()

    const handleNetworkUpdate = (data: CollaborationNetwork) => {
      setNetwork(data)
    }

    metaverseDataService.on('network:collaboration:update', handleNetworkUpdate)

    return () => {
      metaverseDataService.off('network:collaboration:update', handleNetworkUpdate)
    }
  }, [organizationId])

  return { network, isLoading }
}

// ==================== useSceneConfig Hook ====================
export function useSceneConfig(organizationId: string = DEFAULT_ORGANIZATION_ID, sceneType: string = 'office') {
  const [config, setConfig] = useState<Scene3DConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true)
      const data = await metaverseDataService.getSceneConfig(sceneType)
      setConfig(data)
      setIsLoading(false)
    }

    loadConfig()
  }, [organizationId, sceneType])

  return { config, isLoading }
}

// ==================== useManagementHub Hook ====================
export function useManagementHub(organizationId: string = DEFAULT_ORGANIZATION_ID) {
  const [hubData, setHubData] = useState<ManagementHubData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadHubData = async () => {
      setIsLoading(true)
      const data = await metaverseDataService.getManagementHubData(organizationId)
      setHubData(data)
      setIsLoading(false)
    }

    loadHubData()

    // 每30秒刷新一次
    const interval = setInterval(loadHubData, 30000)

    return () => clearInterval(interval)
  }, [organizationId])

  const refreshHubData = useCallback(async () => {
    setIsLoading(true)
    const data = await metaverseDataService.getManagementHubData(organizationId)
    setHubData(data)
    setIsLoading(false)
  }, [organizationId])

  return { hubData, isLoading, refreshHubData }
}

// ==================== usePipelineAnimation Hook ====================
export function usePipelineAnimation(organizationId: string = DEFAULT_ORGANIZATION_ID) {
  const [events, setEvents] = useState<any[]>([])
  const eventsRef = useRef<any[]>([])

  useEffect(() => {
    metaverseDataService.connect(organizationId)

    const handlePipelineEvent = (data: any) => {
      const event = { ...data, receivedAt: Date.now() }
      eventsRef.current = [event, ...eventsRef.current].slice(0, 50) // 保留最近50个事件
      setEvents([...eventsRef.current])
    }

    metaverseDataService.on('pipeline:event', handlePipelineEvent)

    return () => {
      metaverseDataService.off('pipeline:event', handlePipelineEvent)
    }
  }, [organizationId])

  const clearEvents = useCallback(() => {
    eventsRef.current = []
    setEvents([])
  }, [])

  return { events, clearEvents }
}

// ==================== useConnectionStatus Hook ====================
export function useConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [socketId, setSocketId] = useState<string | null>(null)

  useEffect(() => {
    const handleConnectionStatus = (data: any) => {
      setIsConnected(data.connected)
      if (data.socketId) {
        setSocketId(data.socketId)
      }
    }

    metaverseDataService.on('connection:status', handleConnectionStatus)

    // 初始状态
    setIsConnected(metaverseDataService.isConnected())

    return () => {
      metaverseDataService.off('connection:status', handleConnectionStatus)
    }
  }, [])

  return { isConnected, socketId }
}
