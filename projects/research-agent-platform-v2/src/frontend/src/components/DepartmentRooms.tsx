import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

// 部门配置 - 对应四合院四间真实建筑的屋顶位置
const DEPARTMENTS = {
  market: {
    name: '市场部',
    stage: '阶段1',
    description: '市场对接',
    color: '#3B82F6',
    // 南房（倒座房）屋顶位置 - 前面
    roofPosition: [0, 7, 10] as [number, number, number],
    // 地面可点击区域
    groundPosition: [0, 0, 10] as [number, number, number],
    size: [10, 6, 6] as [number, number, number]
  },
  solution: {
    name: '方案部',
    stage: '阶段2',
    description: '方案制定',
    color: '#F59E0B',
    // 西厢房屋顶位置 - 右边
    roofPosition: [10, 7, 0] as [number, number, number],
    // 地面可点击区域
    groundPosition: [10, 0, 0] as [number, number, number],
    size: [6, 6, 10] as [number, number, number]
  },
  management: {
    name: '综管部',
    stage: '综合职能',
    description: '财务+人事+项目管理',
    color: '#EF4444',
    // 正房（北房）屋顶位置 - 后面
    roofPosition: [0, 7, -10] as [number, number, number],
    // 地面可点击区域
    groundPosition: [0, 0, -10] as [number, number, number],
    size: [12, 6, 6] as [number, number, number]
  },
  delivery: {
    name: '交付部',
    stage: '阶段4',
    description: '实施交付',
    color: '#10B981',
    // 东厢房屋顶位置 - 左边
    roofPosition: [-10, 7, 0] as [number, number, number],
    // 地面可点击区域
    groundPosition: [-10, 0, 0] as [number, number, number],
    size: [6, 6, 10] as [number, number, number]
  }
}

interface DepartmentRoomsProps {
  onDepartmentClick?: (dept: string) => void
}

export function DepartmentRooms({ onDepartmentClick }: DepartmentRoomsProps) {
  const arrowTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    
    // 清空背景
    ctx.clearRect(0, 0, 256, 64)
    
    // 绘制虚线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.lineWidth = 4
    ctx.setLineDash([15, 10])
    ctx.beginPath()
    ctx.moveTo(10, 32)
    ctx.lineTo(180, 32)
    ctx.stroke()
    
    // 绘制箭头头部
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.beginPath()
    ctx.moveTo(180, 32)
    ctx.lineTo(160, 18)
    ctx.lineTo(160, 46)
    ctx.closePath()
    ctx.fill()
    
    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <group>
      {/* 四个部门屋顶标识 */}
      {Object.entries(DEPARTMENTS).map(([key, dept]) => (
        <DepartmentRoofSign
          key={key}
          deptKey={key}
          dept={dept}
          onClick={() => onDepartmentClick?.(key)}
        />
      ))}
      
      {/* 连接箭头 */}
      <ConnectionArrows arrowTexture={arrowTexture} />
    </group>
  )
}

interface DepartmentRoofSignProps {
  deptKey: string
  dept: typeof DEPARTMENTS['market']
  onClick?: () => void
}

function DepartmentRoofSign({ deptKey, dept, onClick }: DepartmentRoofSignProps) {
  // 创建文字纹理
  const textTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    
    // 背景
    ctx.fillStyle = dept.color
    ctx.fillRect(0, 0, 512, 256)
    
    // 边框
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 12
    ctx.strokeRect(6, 6, 500, 244)
    
    // 部门名称
    ctx.fillStyle = 'white'
    ctx.font = 'bold 80px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(dept.name, 256, 100)
    
    // 阶段
    ctx.font = '52px Arial'
    ctx.fillText(dept.stage, 256, 180)
    
    return new THREE.CanvasTexture(canvas)
  }, [dept])

  return (
    <group>
      {/* 地面可点击区域（隐形） */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={dept.groundPosition}
        onClick={onClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <planeGeometry args={[dept.size[0], dept.size[2]]} />
        <meshBasicMaterial transparent opacity={0.01} />
      </mesh>
      
      {/* 地面边框标识 */}
      <group position={dept.groundPosition}>
        <mesh position={[0, 0.02, -dept.size[2]/2]}>
          <boxGeometry args={[dept.size[0], 0.05, 0.1]} />
          <meshBasicMaterial color={dept.color} transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 0.02, dept.size[2]/2]}>
          <boxGeometry args={[dept.size[0], 0.05, 0.1]} />
          <meshBasicMaterial color={dept.color} transparent opacity={0.6} />
        </mesh>
        <mesh position={[-dept.size[0]/2, 0.02, 0]}>
          <boxGeometry args={[0.1, 0.05, dept.size[2]]} />
          <meshBasicMaterial color={dept.color} transparent opacity={0.6} />
        </mesh>
        <mesh position={[dept.size[0]/2, 0.02, 0]}>
          <boxGeometry args={[0.1, 0.05, dept.size[2]]} />
          <meshBasicMaterial color={dept.color} transparent opacity={0.6} />
        </mesh>
      </group>
      
      {/* 房顶部门名称标识 */}
      <mesh 
        position={dept.roofPosition}
        onClick={onClick}
      >
        <planeGeometry args={[4, 2]} />
        <meshBasicMaterial map={textTexture} transparent opacity={1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

interface ConnectionArrowsProps {
  arrowTexture: THREE.CanvasTexture
}

function ConnectionArrows({ arrowTexture }: ConnectionArrowsProps) {
  // 定义虚线箭头位置和旋转（按四合院环形流程）
  const arrows = [
    // 市场部 → 方案部（南 → 西）
    { 
      position: [6, 0.5, 6] as [number, number, number], 
      rotation: [0, -Math.PI / 4, 0] as [number, number, number]
    },
    // 方案部 → 研发部（西 → 北）
    { 
      position: [6, 0.5, -6] as [number, number, number], 
      rotation: [0, -Math.PI * 0.75, 0] as [number, number, number]
    },
    // 研发部 → 交付部（北 → 东）
    { 
      position: [-6, 0.5, -6] as [number, number, number], 
      rotation: [0, Math.PI * 0.75, 0] as [number, number, number]
    },
    // 交付部 → 市场部（东 → 南）
    { 
      position: [-6, 0.5, 6] as [number, number, number], 
      rotation: [0, Math.PI / 4, 0] as [number, number, number]
    }
  ]

  return (
    <group>
      {arrows.map((arrow, index) => (
        <mesh 
          key={index}
          position={arrow.position}
          rotation={arrow.rotation}
        >
          <planeGeometry args={[3, 1.5]} />
          <meshBasicMaterial 
            map={arrowTexture} 
            transparent 
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      
      {/* 流程标签 */}
      <Text
        position={[-8, 1.5, 8]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        业务流程
      </Text>
    </group>
  )
}

// 部门信息弹窗数据
export const DEPARTMENT_INFO: Record<string, {
  name: string
  stage: string
  description: string
  responsibilities: string[]
  keyMetrics: { label: string; value: string }[]
}> = {
  market: {
    name: '市场部',
    stage: '阶段1：市场对接',
    description: '负责客户线索管理、初步沟通、商机跟进',
    responsibilities: [
      '客户线索收集与分级',
      '初步需求沟通',
      '商机评估与跟进',
      '客户关系维护'
    ],
    keyMetrics: [
      { label: '本月线索', value: '12个' },
      { label: '转化率', value: '35%' },
      { label: '跟进中', value: '5个' }
    ]
  },
  solution: {
    name: '方案部',
    stage: '阶段2&3：方案制定+研发Demo',
    description: '负责需求分析、方案设计、原型制作、技术开发、Demo构建',
    responsibilities: [
      '客户需求调研',
      '技术方案设计',
      '原型Demo制作',
      '方案汇报演示',
      '技术任务拆解',
      '代码开发实现',
      'Code Review',
      '系统调试优化'
    ],
    keyMetrics: [
      { label: '方案数', value: '8个' },
      { label: '代码提交', value: '1,240次' },
      { label: '进行中', value: '5个' }
    ]
  },
  management: {
    name: '综管部',
    stage: '综合职能：财务+人事+项目管理',
    description: '负责财务管理、人事管理、项目统筹、资源协调',
    responsibilities: [
      '项目统筹管理',
      '财务预算核算',
      '人力资源协调',
      '资源分配优化'
    ],
    keyMetrics: [
      { label: '管理项目', value: '12个' },
      { label: '预算执行率', value: '95%' },
      { label: '资源利用率', value: '88%' }
    ]
  },
  delivery: {
    name: '交付部',
    stage: '阶段4：实施交付',
    description: '负责部署上线、客户培训、运维交接',
    responsibilities: [
      '生产环境部署',
      '客户培训',
      '交付文档编写',
      '运维交接'
    ],
    keyMetrics: [
      { label: '交付项目', value: '4个' },
      { label: '客户满意度', value: '98%' },
      { label: '待部署', value: '2个' }
    ]
  }
}