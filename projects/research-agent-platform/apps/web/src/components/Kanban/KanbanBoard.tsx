import { Card, Space, Avatar, Progress, Dropdown } from 'antd'
import {
  ClockCircleOutlined,
  UserOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import { Project, ProjectStatus } from '@/stores/project'

interface KanbanBoardProps {
  projects: Project[]
  onStatusChange: (projectId: string, newStatus: ProjectStatus) => void
}

const statusConfig: { key: ProjectStatus; title: string; color: string }[] = [
  { key: 'planning', title: '规划中', color: '#d9d9d9' },
  { key: 'in_progress', title: '进行中', color: '#1890ff' },
  { key: 'review', title: '审核中', color: '#faad14' },
  { key: 'completed', title: '已完成', color: '#52c41a' },
]

const KanbanBoard = ({ projects, onStatusChange }: KanbanBoardProps) => {
  const getColumnProjects = (status: ProjectStatus) => {
    return projects.filter((p) => p.status === status)
  }

  return (
    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
      {statusConfig.map((column) => (
        <div
          key={column.key}
          style={{
            minWidth: 300,
            maxWidth: 300,
            background: '#f5f5f5',
            borderRadius: 8,
            padding: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              padding: '0 4px',
            }}
          >
            <Space>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: column.color,
                }}
              />
              <span style={{ fontWeight: 500 }}>{column.title}</span>
              <span style={{ color: '#999', fontSize: 12 }}>
                ({getColumnProjects(column.key).length})
              </span>
            </Space>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {getColumnProjects(column.key).map((project) => (
              <Card
                key={project.id}
                size="small"
                hoverable
                style={{ cursor: 'pointer' }}
                bodyStyle={{ padding: 12 }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 500 }}>{project.name}</span>
                    <Dropdown
                      menu={{
                        items: statusConfig
                          .filter((s) => s.key !== project.status)
                          .map((s) => ({
                            key: s.key,
                            label: `移动到: ${s.title}`,
                          })),
                        onClick: ({ key }) =>
                          onStatusChange(project.id, key as ProjectStatus),
                      }}
                      trigger={['click']}
                    >
                      <MoreOutlined style={{ cursor: 'pointer', color: '#999' }} />
                    </Dropdown>
                  </Space>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <Progress percent={project.progress} size="small" showInfo={false} />
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    进度 {project.progress}%
                  </div>
                </div>

                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space size={4}>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <span style={{ fontSize: 12, color: '#666' }}>
                      {project.managerName}
                    </span>
                  </Space>
                  <Space size={4}>
                    <ClockCircleOutlined style={{ fontSize: 12, color: '#999' }} />
                    <span style={{ fontSize: 12, color: '#999' }}>
                      {project.endDate.slice(5)}
                    </span>
                  </Space>
                </Space>

                <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                  客户: {project.customerName}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default KanbanBoard
