// v3.0 推理链回放组件
import { useState, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text, Html } from '@react-three/drei'
import { CollaborationContract, NegotiationRound, Evidence } from '../services/metaverseData'

interface ReasoningChainPlayerProps {
  contract: CollaborationContract
  agentPositions: Map<string, [number, number, number]>
  onClose?: () => void
}

export function ReasoningChainPlayer({ 
  contract, 
  agentPositions,
  onClose 
}: ReasoningChainPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const groupRef = useRef<THREE.Group>(null)

  // 构建推理链步骤
  const reasoningSteps = useMemo(() => {
    const steps = []
    
    // 第1步：契约发起
    steps.push({
      type: 'initiation',
      title: '契约发起',
      content: contract.proposal.content,
      agentId: contract.proposal.agentId,
      evidence: contract.proposal.evidence,
      timestamp: contract.proposal.timestamp
    })
    
    // 第2-N步：协商过程
    contract.negotiation.forEach((round, index) => {
      steps.push({
        type: 'negotiation',
        title: `第${round.round}轮协商`,
        content: round.content,
        agentId: round.agentId,
        stance: round.stance,
        evidence: round.evidence,
        confidence: round.confidence,
        timestamp: round.timestamp
      })
    })
    
    // 最后一步：共识达成
    if (contract.consensus?.reached) {
      steps.push({
        type: 'consensus',
        title: '达成共识',
        content: contract.consensus.finalAgreement,
        agentIds: contract.consensus.participatingAgents,
        confidence: contract.consensus.confidence,
        timestamp: contract.consensus.consensusAt
      })
    }
    
    return steps
  }, [contract])

  const currentStepData = reasoningSteps[currentStep]

  // 播放控制
  const handlePlay = () => {
    setIsPlaying(true)
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= reasoningSteps.length - 1) {
          clearInterval(interval)
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 3000) // 每3秒一步
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleStep = (direction: 'prev' | 'next') => {
    setCurrentStep(prev => {
      if (direction === 'prev') return Math.max(0, prev - 1)
      return Math.min(reasoningSteps.length - 1, prev + 1)
    })
  }

  // 动画
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {/* 时间轴 */}
      <Timeline 
        steps={reasoningSteps}
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
      />

      {/* 当前步骤详情 */}
      <StepDetail 
        step={currentStepData}
        stepNumber={currentStep + 1}
        totalSteps={reasoningSteps.length}
        agentPositions={agentPositions}
      />

      {/* 控制面板 */}
      <Html center position={[0, -8, 0]}>
        <ReasoningControls
          isPlaying={isPlaying}
          currentStep={currentStep}
          totalSteps={reasoningSteps.length}
          onPlay={handlePlay}
          onPause={handlePause}
          onPrev={() => handleStep('prev')}
          onNext={() => handleStep('next')}
          onClose={onClose}
        />
      </Html>

      {/* 证据展示 */}
      {currentStepData.evidence && currentStepData.evidence.length > 0 && (
        <EvidenceDisplay 
          evidence={currentStepData.evidence}
          position={[8, 0, 0]}
        />
      )}
    </group>
  )
}

// 时间轴
function Timeline({ 
  steps, 
  currentStep, 
  onSelectStep 
}: { 
  steps: any[]
  currentStep: number
  onSelectStep: (index: number) => void
}) {
  const points = useMemo(() => {
    return steps.map((_, index) => {
      const angle = (index / Math.max(steps.length - 1, 1)) * Math.PI - Math.PI / 2
      const radius = 10
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      )
    })
  }, [steps])

  return (
    <group position={[0, 10, 0]}>
      {/* 时间轴线 */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#666" linewidth={2} />
      </line>

      {/* 时间点 */}
      {points.map((point, index) => (
        <TimelineNode
          key={index}
          position={[point.x, point.y, point.z]}
          isActive={index === currentStep}
          isCompleted={index < currentStep}
          stepNumber={index + 1}
          onClick={() => onSelectStep(index)}
        />
      ))}
    </group>
  )
}

// 时间点节点
function TimelineNode({ 
  position, 
  isActive, 
  isCompleted,
  stepNumber,
  onClick
}: { 
  position: [number, number, number]
  isActive: boolean
  isCompleted: boolean
  stepNumber: number
  onClick: () => void
}) {
  const nodeRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (nodeRef.current && isActive) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1
      nodeRef.current.scale.setScalar(scale)
    }
  })

  const color = isActive ? '#2196F3' : isCompleted ? '#4CAF50' : '#9E9E9E'

  return (
    <group position={position}>
      <mesh 
        ref={nodeRef}
        onClick={onClick}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.5 : 0.1}
        />
      </mesh>
      <Text
        position={[0, 1, 0]}
        fontSize={0.3}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {stepNumber}
      </Text>
    </group>
  )
}

// 步骤详情
function StepDetail({ 
  step, 
  stepNumber, 
  totalSteps,
  agentPositions 
}: { 
  step: any
  stepNumber: number
  totalSteps: number
  agentPositions: Map<string, [number, number, number]>
}) {
  const getStepColor = () => {
    switch (step.type) {
      case 'initiation': return '#FF9800'
      case 'negotiation': 
        switch (step.stance) {
          case 'support': return '#4CAF50'
          case 'challenge': return '#F44336'
          case 'amend': return '#FF9800'
          default: return '#2196F3'
        }
      case 'consensus': return '#4CAF50'
      default: return '#9E9E9E'
    }
  }

  return (
    <Html center position={[0, 0, 0]}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '24px',
        borderRadius: '16px',
        minWidth: '400px',
        maxWidth: '500px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        borderLeft: `6px solid ${getStepColor()}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            步骤 {stepNumber} / {totalSteps}
          </span>
          <span style={{ 
            fontSize: '12px', 
            color: getStepColor(),
            background: `${getStepColor()}20`,
            padding: '4px 8px',
            borderRadius: '4px',
            textTransform: 'capitalize'
          }}>
            {step.type}
          </span>
        </div>

        <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '20px' }}>
          {step.title}
        </h3>

        <div style={{ 
          background: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <p style={{ margin: 0, color: '#333', lineHeight: '1.6' }}>
            {step.content}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#666' }}>
          <div>
            <strong>Agent:</strong> {step.agentId || step.agentIds?.join(', ')}
          </div>
          {step.confidence && (
            <div>
              <strong>置信度:</strong> {(step.confidence * 100).toFixed(0)}%
            </div>
          )}
          <div>
            <strong>时间:</strong> {new Date(step.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </Html>
  )
}

// 证据展示
function EvidenceDisplay({ 
  evidence, 
  position 
}: { 
  evidence: Evidence[]
  position: [number, number, number]
}) {
  return (
    <Html center position={position}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '16px',
        borderRadius: '12px',
        minWidth: '250px',
        maxHeight: '300px',
        overflow: 'auto',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>📋 相关证据</h4>
        {evidence.map((item, index) => (
          <div 
            key={index}
            style={{
              padding: '8px 12px',
              marginBottom: '8px',
              background: '#f5f5f5',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          >
            <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
              {item.type === 'document' && '📄 '}
              {item.type === 'data' && '📊 '}
              {item.type === 'expertOpinion' && '👨‍💼 '}
              {item.type === 'historicalCase' && '📚 '}
              {item.source}
            </div>
            <div style={{ color: '#666' }}>{item.content.slice(0, 50)}...</div>
            <div style={{ marginTop: '4px', fontSize: '10px', color: '#999' }}>
              相关性: {(item.relevance * 100).toFixed(0)}%
              {item.verified && ' ✓ 已验证'}
            </div>
          </div>
        ))}
      </div>
    </Html>
  )
}

// 控制面板
function ReasoningControls({
  isPlaying,
  currentStep,
  totalSteps,
  onPlay,
  onPause,
  onPrev,
  onNext,
  onClose
}: {
  isPlaying: boolean
  currentStep: number
  totalSteps: number
  onPlay: () => void
  onPause: () => void
  onPrev: () => void
  onNext: () => void
  onClose?: () => void
}) {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      background: 'rgba(255,255,255,0.9)',
      padding: '12px 24px',
      borderRadius: '50px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
    }}>
      <button 
        onClick={onPrev}
        disabled={currentStep === 0}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '20px',
          background: currentStep === 0 ? '#e0e0e0' : '#2196F3',
          color: currentStep === 0 ? '#999' : 'white',
          cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
        }}
      >
        ⏮ 上一步
      </button>

      <button 
        onClick={isPlaying ? onPause : onPlay}
        style={{
          padding: '8px 24px',
          border: 'none',
          borderRadius: '20px',
          background: isPlaying ? '#FF9800' : '#4CAF50',
          color: 'white',
          fontWeight: 'bold'
        }}
      >
        {isPlaying ? '⏸ 暂停' : '▶ 播放'}
      </button>

      <button 
        onClick={onNext}
        disabled={currentStep === totalSteps - 1}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '20px',
          background: currentStep === totalSteps - 1 ? '#e0e0e0' : '#2196F3',
          color: currentStep === totalSteps - 1 ? '#999' : 'white',
          cursor: currentStep === totalSteps - 1 ? 'not-allowed' : 'pointer'
        }}
      >
        下一步 ⏭
      </button>

      <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 8px' }} />

      <button 
        onClick={onClose}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '20px',
          background: '#f5f5f5',
          color: '#666',
          cursor: 'pointer'
        }}
      >
        ✕ 关闭
      </button>
    </div>
  )
}

export default ReasoningChainPlayer
