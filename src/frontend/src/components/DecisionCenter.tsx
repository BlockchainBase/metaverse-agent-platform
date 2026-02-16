// v3.0 决策中心组件（北房）
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text, Html } from '@react-three/drei'
import { CollaborationContract, HumanInterventionRequest } from '../services/metaverseData'

interface DecisionCenterProps {
  pendingInterventions: HumanInterventionRequest[]
  contracts: CollaborationContract[]
  agentPositions: Map<string, [number, number, number]>
  onSelectIntervention?: (request: HumanInterventionRequest) => void
  onResolveIntervention?: (requestId: string, decision: any) => void
}

export function DecisionCenter({ 
  pendingInterventions,
  contracts,
  agentPositions,
  onSelectIntervention,
  onResolveIntervention
}: DecisionCenterProps) {
  const [selectedRequest, setSelectedRequest] = useState<HumanInterventionRequest | null>(null)
  const groupRef = useRef<THREE.Group>(null)

  // 旋转动画
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.03) * 0.02
    }
  })

  // 需要人类介入的契约
  const interventionContracts = contracts.filter(c => 
    c.humanIntervention?.required && !c.humanIntervention?.resolvedAt
  )

  return (
    <group ref={groupRef} position={[0, 0, -10]}>
      {/* 决策大屏 */}
      <DecisionDashboard 
        pendingCount={pendingInterventions.length}
        activeContracts={contracts.filter(c => !c.execution?.completedAt).length}
        completedContracts={contracts.filter(c => c.execution?.completedAt).length}
      />

      {/* 待办决策卡片 */}
      {interventionContracts.map((contract, index) => (
        <InterventionCard
          key={contract.contractId}
          contract={contract}
          index={index}
          onClick={() => {
            // 找到对应的intervention request
            const request = pendingInterventions.find(
              r => r.contractId === contract.contractId
            )
            if (request) {
              setSelectedRequest(request)
              onSelectIntervention?.(request)
            }
          }}
        />
      ))}

      {/* 选中的决策详情 */}
      {selectedRequest && (
        <DecisionDetailPanel
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onDecision={(decision) => {
            onResolveIntervention?.(selectedRequest.requestId, decision)
            setSelectedRequest(null)
          }}
        />
      )}

      {/* 三位Agent位置标记 */}
      <AgentPositionMarker position={[-4, 0, 0]} role="assistant" label="院长助理" />
      <AgentPositionMarker position={[0, 0, 0]} role="project" label="项目管家" />
      <AgentPositionMarker position={[4, 0, 0]} role="finance" label="财务专家" />
    </group>
  )
}

// 决策大屏
function DecisionDashboard({ 
  pendingCount, 
  activeContracts,
  completedContracts
}: { 
  pendingCount: number
  activeContracts: number
  completedContracts: number
}) {
  const dashboardRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (dashboardRef.current) {
      // 如果有待办决策，闪烁提醒
      if (pendingCount > 0) {
        const intensity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2
        // 更新材质亮度
      }
    }
  })

  return (
    <group ref={dashboardRef} position={[0, 4, 5]}>
      {/* 大屏背景 */}
      <mesh>
        <boxGeometry args={[10, 5, 0.2]} />
        <meshStandardMaterial 
          color="#1a1a2e"
          emissive={pendingCount > 0 ? '#F44336' : '#000000'}
          emissiveIntensity={pendingCount > 0 ? 0.2 : 0}
        />
      </mesh>

      {/* 标题 */}
      <Text
        position={[0, 1.8, 0.15]}
        fontSize={0.4}
        color="#00E5FF"
        anchorX="center"
        anchorY="middle"
      >
        决策中心
      </Text>

      {/* 统计数字 */}
      <Text
        position={[-3, 0.5, 0.15]}
        fontSize={0.6}
        color={pendingCount > 0 ? '#F44336' : '#4CAF50'}
        anchorX="center"
        anchorY="middle"
      >
        {pendingCount}
      </Text>
      <Text
        position={[-3, -0.3, 0.15]}
        fontSize={0.2}
        color="#666"
        anchorX="center"
        anchorY="middle"
      >
        待决策
      </Text>

      <Text
        position={[0, 0.5, 0.15]}
        fontSize={0.6}
        color="#2196F3"
        anchorX="center"
        anchorY="middle"
      >
        {activeContracts}
      </Text>
      <Text
        position={[0, -0.3, 0.15]}
        fontSize={0.2}
        color="#666"
        anchorX="center"
        anchorY="middle"
      >
        进行中
      </Text>

      <Text
        position={[3, 0.5, 0.15]}
        fontSize={0.6}
        color="#4CAF50"
        anchorX="center"
        anchorY="middle"
      >
        {completedContracts}
      </Text>
      <Text
        position={[3, -0.3, 0.15]}
        fontSize={0.2}
        color="#666"
        anchorX="center"
        anchorY="middle"
      >
        已完成
      </Text>

      {/* 警示灯 */}
      {pendingCount > 0 && (
        <AlertLight position={[4.5, 1.8, 0]} />
      )}
    </group>
  )
}

// 警示灯
function AlertLight({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (lightRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.3
      lightRef.current.scale.setScalar(scale)
    }
  })

  return (
    <mesh ref={lightRef} position={position}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial 
        color="#F44336"
        emissive="#F44336"
        emissiveIntensity={1}
      />
    </mesh>
  )
}

// 待办决策卡片
function InterventionCard({ 
  contract, 
  index,
  onClick
}: { 
  contract: CollaborationContract
  index: number
  onClick: () => void
}) {
  const cardRef = useRef<THREE.Group>(null)

  // 浮动动画
  useFrame((state) => {
    if (cardRef.current) {
      cardRef.current.position.y = 2 + index * 0.3 + Math.sin(state.clock.elapsedTime + index) * 0.1
    }
  })

  const position: [number, number, number] = [-8 + index * 4, 2, 2]

  return (
    <group 
      ref={cardRef} 
      position={position}
      onClick={onClick}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      {/* 卡片背景 */}
      <mesh castShadow>
        <boxGeometry args={[2.5, 1.5, 0.1]} />
        <meshStandardMaterial 
          color="#F44336"
          transparent
          opacity={0.9}
          emissive="#F44336"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* 警示图标 */}
      <Text
        position={[0, 0.3, 0.06]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        ⚠️
      </Text>

      {/* 问题摘要 */}
      <Text
        position={[0, -0.2, 0.06]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.2}
      >
        {contract.context.description.slice(0, 20)}...
      </Text>

      {/* 点击提示 */}
      <Html distanceFactor={10}>
        <div style={{
          background: 'rgba(244,67,54,0.9)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          whiteSpace: 'nowrap'
        }}>
          点击查看并决策
        </div>
      </Html>
    </group>
  )
}

// 决策详情面板
function DecisionDetailPanel({ 
  request,
  onClose,
  onDecision
}: { 
  request: HumanInterventionRequest
  onClose: () => void
  onDecision: (decision: any) => void
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [rationale, setRationale] = useState('')

  const handleSubmit = () => {
    if (!selectedOption) return
    onDecision({
      chosenOptionId: selectedOption,
      rationale,
      decidedAt: new Date().toISOString()
    })
  }

  return (
    <Html center position={[0, 0, 8]}>
      <div style={{
        background: 'rgba(255,255,255,0.98)',
        padding: '32px',
        borderRadius: '20px',
        minWidth: '500px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 12px 48px rgba(0,0,0,0.3)',
        border: '2px solid #F44336'
      }}>
        {/* 标题 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: '#F44336', fontSize: '24px' }}>
            ⚠️ 需要您的决策
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999'
            }}
          >
            ✕
          </button>
        </div>

        {/* 问题描述 */}
        <div style={{ 
          background: '#FFF3E0', 
          padding: '16px', 
          borderRadius: '8px',
          marginBottom: '24px',
          borderLeft: '4px solid #FF9800'
        }}>
          <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
            问题：
          </div>
          <div style={{ color: '#666', lineHeight: '1.6' }}>
            {request.decisionInterface?.question}
          </div>
        </div>

        {/* Agent分析 */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>🤖 Agent分析</h4>
          <div style={{ 
            background: '#E3F2FD', 
            padding: '12px', 
            borderRadius: '8px',
            fontSize: '14px',
            color: '#333'
          }}>
            <p><strong>建议：</strong>{request.agentAnalysis?.recommendation}</p>
            <p><strong>置信度：</strong>{(request.agentAnalysis?.confidence || 0) * 100}%</p>
            {request.agentAnalysis?.keyUncertainties && (
              <p><strong>不确定因素：</strong>{request.agentAnalysis.keyUncertainties.join(', ')}</p>
            )}
          </div>
        </div>

        {/* 决策选项 */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>📋 决策选项</h4>
          {request.options?.map((option, index) => (
            <div 
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              style={{
                padding: '16px',
                marginBottom: '12px',
                borderRadius: '8px',
                border: selectedOption === option.id ? '2px solid #2196F3' : '1px solid #e0e0e0',
                background: selectedOption === option.id ? '#E3F2FD' : 'white',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <input 
                  type="radio" 
                  checked={selectedOption === option.id}
                  onChange={() => setSelectedOption(option.id)}
                  style={{ marginRight: '12px' }}
                />
                <span style={{ fontWeight: 'bold', color: '#333' }}>
                  选项 {index + 1}: {option.description}
                </span>
              </div>
              
              <div style={{ fontSize: '12px', color: '#666', marginLeft: '24px' }}>
                <div>支持：{option.supportingAgents?.length || 0} 位Agent</div>
                <div>反对：{option.opposingAgents?.length || 0} 位Agent</div>
                <div style={{ marginTop: '4px' }}>风险：{option.risks?.join(', ')}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 决策理由 */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>📝 决策理由（可选）</h4>
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="请说明您的决策理由..."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              minHeight: '80px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '12px 24px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              background: 'white',
              color: '#666',
              cursor: 'pointer'
            }}
          >
            稍后处理
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedOption}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: selectedOption ? '#2196F3' : '#e0e0e0',
              color: selectedOption ? 'white' : '#999',
              cursor: selectedOption ? 'pointer' : 'not-allowed',
              fontWeight: 'bold'
            }}
          >
            提交决策
          </button>
        </div>
      </div>
    </Html>
  )
}

// Agent位置标记
function AgentPositionMarker({ 
  position, 
  role, 
  label 
}: { 
  position: [number, number, number]
  role: string
  label: string
}) {
  const colors: Record<string, string> = {
    assistant: '#F44336',
    project: '#FF9800',
    finance: '#4CAF50'
  }

  return (
    <group position={position}>
      {/* 位置圆圈 */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial color={colors[role]} transparent opacity={0.5} />
      </mesh>

      {/* 标签 */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.25}
        color={colors[role]}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}

export default DecisionCenter
