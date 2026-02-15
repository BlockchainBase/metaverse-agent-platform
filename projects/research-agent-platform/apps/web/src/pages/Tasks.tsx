import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Input,
  Card,
  Tag,
  Form,
  message,
  Row,
  Col,
  Select,
  DatePicker,
  Avatar,
  Badge,
  Tabs,
} from 'antd'
import {
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'
import { Task, TaskStatus, TaskPriority } from '@/stores/project'
import dayjs from 'dayjs'

const { Option } = Select
const { TabPane } = Tabs

const statusColors: Record<TaskStatus, string> = {
  todo: 'default',
  in_progress: 'processing',
  review: 'warning',
  done: 'success',
}

const statusLabels: Record<TaskStatus, string> = {
  todo: '待办',
  in_progress: '进行中',
  review: '审核中',
  done: '已完成',
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'default',
  medium: 'processing',
  high: 'warning',
  urgent: 'error',
}

const priorityLabels: Record<TaskPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
}

const Tasks = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [activeTab, setActiveTab] = useState('all')
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      // 模拟数据
      const mockData: Task[] = [
        {
          id: '1',
          title: '需求分析文档编写',
          description: '完成智能客服系统的需求分析文档',
          projectId: '1',
          projectName: '智能客服系统',
          assigneeId: '1',
          assigneeName: '张三',
          status: 'done',
          priority: 'high',
          dueDate: '2024-02-15',
          estimatedHours: 16,
          actualHours: 14,
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-02-10T10:00:00Z',
        },
        {
          id: '2',
          title: '数据库设计',
          description: '设计系统数据库架构和表结构',
          projectId: '1',
          projectName: '智能客服系统',
          assigneeId: '2',
          assigneeName: '李四',
          status: 'in_progress',
          priority: 'high',
          dueDate: '2024-02-20',
          estimatedHours: 24,
          actualHours: 12,
          createdAt: '2024-01-25T10:00:00Z',
          updatedAt: '2024-02-15T10:00:00Z',
        },
        {
          id: '3',
          title: 'API接口开发',
          description: '开发RESTful API接口',
          projectId: '1',
          projectName: '智能客服系统',
          assigneeId: '3',
          assigneeName: '王五',
          status: 'todo',
          priority: 'medium',
          dueDate: '2024-03-01',
          estimatedHours: 40,
          actualHours: 0,
          createdAt: '2024-02-01T10:00:00Z',
          updatedAt: '2024-02-01T10:00:00Z',
        },
        {
          id: '4',
          title: '前端页面开发',
          description: '开发管理后台前端页面',
          projectId: '2',
          projectName: '数据分析平台',
          assigneeId: '1',
          assigneeName: '张三',
          status: 'in_progress',
          priority: 'urgent',
          dueDate: '2024-02-25',
          estimatedHours: 32,
          actualHours: 8,
          createdAt: '2024-02-10T10:00:00Z',
          updatedAt: '2024-02-18T10:00:00Z',
        },
        {
          id: '5',
          title: '单元测试编写',
          description: '编写核心模块的单元测试',
          projectId: '1',
          projectName: '智能客服系统',
          assigneeId: '2',
          assigneeName: '李四',
          status: 'review',
          priority: 'medium',
          dueDate: '2024-02-22',
          estimatedHours: 16,
          actualHours: 14,
          createdAt: '2024-02-05T10:00:00Z',
          updatedAt: '2024-02-20T10:00:00Z',
        },
      ]
      setData(mockData)
      setTotal(mockData.length)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize, keyword, statusFilter, priorityFilter, activeTab])

  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    message.success(`任务状态已更新为: ${statusLabels[newStatus]}`)
    fetchData()
  }

  const columns = [
    {
      title: '任务标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: '负责人',
      dataIndex: 'assigneeName',
      key: 'assigneeName',
      render: (name: string, record: Task) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} src={record.assigneeAvatar} />
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: TaskStatus) => (
        <Tag color={statusColors[status]} icon={status === 'in_progress' ? <SyncOutlined spin /> : undefined}>
          {statusLabels[status]}
        </Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: TaskPriority) => (
        <Badge
          status={priority === 'urgent' ? 'error' : priority === 'high' ? 'warning' : priority === 'medium' ? 'processing' : 'default'}
          text={priorityLabels[priority]}
        />
      ),
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => (
        <Space size={4}>
          <ClockCircleOutlined style={{ color: dayjs(date).isBefore(dayjs()) ? '#f5222d' : '#999' }} />
          <span style={{ color: dayjs(date).isBefore(dayjs()) ? '#f5222d' : 'inherit' }}>
            {date}
          </span>
        </Space>
      ),
    },
    {
      title: '工时',
      key: 'hours',
      render: (_: unknown, record: Task) => (
        <span>
          {record.actualHours}h / {record.estimatedHours}h
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Task) => (
        <Space size="small">
          {record.status !== 'done' && (
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              size="small"
              onClick={() => handleStatusChange(record.id, 'done')}
            >
              完成
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space size="middle">
              <Input.Search
                placeholder="搜索任务标题"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onSearch={fetchData}
                style={{ width: 250 }}
                allowClear
              />
              <Select
                placeholder="筛选状态"
                value={statusFilter || undefined}
                onChange={(value) => setStatusFilter(value)}
                style={{ width: 140 }}
                allowClear
              >
                <Option value="todo">待办</Option>
                <Option value="in_progress">进行中</Option>
                <Option value="review">审核中</Option>
                <Option value="done">已完成</Option>
              </Select>
              <Select
                placeholder="筛选优先级"
                value={priorityFilter || undefined}
                onChange={(value) => setPriorityFilter(value)}
                style={{ width: 140 }}
                allowClear
              >
                <Option value="low">低</Option>
                <Option value="medium">中</Option>
                <Option value="high">高</Option>
                <Option value="urgent">紧急</Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={setPagination}
        />
      </Card>
    </div>
  )
}

export default Tasks
