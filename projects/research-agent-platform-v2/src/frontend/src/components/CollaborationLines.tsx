import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { AGENTS_DATA, AgentRole } from '../data/agents'

// 消息流
interface MessageFlow {
  id: string;
  from: AgentRole;
  to: AgentRole;
  color: string;
  progress: number;
  speed: number;
  content: string;
}

export function CollaborationLines() {
  const [flows, setFlows] = useState<MessageFlow[]>([]);
  const groupRef = useRef<THREE.Group>(null);

  // 模拟消息流
  useEffect(() => {
    // 这里应该从WebSocket接收真实消息
    // 现在用模拟数据演示效果
    const simulateMessage = () => {
      const agents = Object.keys(AGENTS_DATA) as AgentRole[];
      const from = agents[Math.floor(Math.random() * agents.length)];
      let to = agents[Math.floor(Math.random() * agents.length)];
      
      // 确保不是自己发给自己
      while (to === from) {
        to = agents[Math.floor(Math.random() * agents.length)];
      }

      const newFlow: MessageFlow = {
        id: Math.random().toString(36).substr(2, 9),
        from,
        to,
        color: AGENTS_DATA[from].color,
        progress: 0,
        speed: 0.01 + Math.random() * 0.01,
        content: '协作消息'
      };

      setFlows(prev => [...prev, newFlow]);
    };

    // 每3-8秒模拟一条消息
    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        simulateMessage();
      }
    }, 3000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, []);

  // 更新消息流进度
  useFrame(() => {
    setFlows(prev => {
      return prev
        .map(flow => ({
          ...flow,
          progress: flow.progress + flow.speed
        }))
        .filter(flow => flow.progress < 1);
    });
  });

  return (
    <group ref={groupRef}>
      {/* 静态连接线 */}
      <StaticConnections />
      
      {/* 动态消息流 */}
      {flows.map(flow => (
        <MessageParticle key={flow.id} flow={flow} />
      ))}
    </group>
  );
}

// 静态连接线（显示协作关系）
function StaticConnections() {
  const connections: Array<[AgentRole, AgentRole]> = [
    // 项目管家与所有人连接
    ['project', 'market'],
    ['project', 'solution'],
    ['project', 'developer'],
    ['project', 'delivery'],
    ['project', 'finance'],
    ['project', 'director'],
    // 院长助理与所有人连接
    ['director', 'market'],
    ['director', 'solution'],
    ['director', 'developer'],
    ['director', 'delivery'],
    ['director', 'finance'],
    // 业务流程连接
    ['market', 'solution'],
    ['solution', 'developer'],
    ['developer', 'delivery'],
    // 财务与项目相关
    ['finance', 'project'],
    ['finance', 'delivery'],
    // 交付与技术支持（运维已合并到交付）
    ['delivery', 'developer']
  ];

  return (
    <group>
      {connections.map(([from, to], index) => {
        const fromPos = AGENTS_DATA[from].position;
        const toPos = AGENTS_DATA[to].position;
        
        return (
          <ConnectionLine
            key={`${from}-${to}-${index}`}
            from={new THREE.Vector3(...fromPos)}
            to={new THREE.Vector3(...toPos)}
            color="#6366f1"
            opacity={0.15}
          />
        );
      })}
    </group>
  );
}

// 连接线
interface ConnectionLineProps {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  opacity: number;
}

function ConnectionLine({ from, to, color, opacity }: ConnectionLineProps) {
  const points = useMemo(() => {
    return [from, to];
  }, [from, to]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}

// 消息粒子
interface MessageParticleProps {
  flow: MessageFlow;
}

function MessageParticle({ flow }: MessageParticleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const fromPos = useMemo(() => new THREE.Vector3(...AGENTS_DATA[flow.from].position), [flow.from]);
  const toPos = useMemo(() => new THREE.Vector3(...AGENTS_DATA[flow.to].position), [flow.to]);
  
  useFrame(() => {
    if (meshRef.current) {
      // 在起点和终点之间插值
      const position = new THREE.Vector3().lerpVectors(fromPos, toPos, flow.progress);
      // 添加一点弧线高度
      const arcHeight = Math.sin(flow.progress * Math.PI) * 2;
      position.y += arcHeight;
      
      meshRef.current.position.copy(position);
    }
  });

  return (
    <group>
      {/* 消息球 */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial 
          color={flow.color} 
          transparent 
          opacity={0.8 + Math.sin(flow.progress * Math.PI) * 0.2}
        />
      </mesh>
      
      {/* 光晕效果 */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial 
          color={flow.color} 
          transparent 
          opacity={0.2}
        />
      </mesh>
    </group>
  );
}

// 协作活动中心（显示当前活跃的协作）
export function CollaborationHub() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // 旋转动画
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      
      // 上下浮动
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 8, 0]}>
      {/* 中心球体 */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial 
          color="#8B5CF6" 
          transparent 
          opacity={0.3}
        />
      </mesh>
      
      {/* 外环 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.05, 16, 100]} />
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.5} />
      </mesh>
      
      {/* 垂直环 */}
      <mesh>
        <torusGeometry args={[2, 0.05, 16, 100]} />
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.5} />
      </mesh>
      
      {/* 文字标签 */}
      {/* 这里可以添加CanvasTexture显示"协作中心" */}
    </group>
  );
}
