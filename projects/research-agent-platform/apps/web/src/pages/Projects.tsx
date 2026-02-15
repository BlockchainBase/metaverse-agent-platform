import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Input,
  Card,
  Tag,
  Modal,
  Form,
  message,
  Row,
  Col,
  Select,
  DatePicker,
  Progress,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ColumnHeightOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'
import { Project, ProjectStatus } from '@/stores/project'
import KanbanBoard from '@/components/Kanban/KanbanBoard'
import dayjs from 'dayjs'

const { Option } = Select
const { RangePicker } = DatePicker

const statusColors: Record<ProjectStatus, string> = {
  planning: 'default',
  in_progress: 'processing',
  review: 'warning',
  completed: 'success',
  cancelled: 'error',
}

const statusLabels: Record<ProjectStatus, string> = {
  planning: '规划中',
  in_progress: '进行中',
  review: '审核中',
  completed: '已完成',
  cancelled: '已取消',
}

const Projects = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Project[]>([])
  const [total, setTotal] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      // 模拟数据
      const mockData: Project[] = [
        {
          id: '1',
          name: '智能客服系统',
          description: '基于AI的智能客服解决方案',
          customerId: '1',
          customerName: '科技创新有限公司',
          status: 'in_progress',
          startDate: '2024-01-15',
          endDate: '2024-06-30',
          budget: 500000,
          spent: 280000,
          managerId: '1',
          managerName: '张三',
          progress: 60,
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-02-01T10:00:00Z',
        },
        {
          id: '2',
          name: '数据分析平台',
          description: '企业级数据可视化分析平台',
          customerId: '2',
          customerName: '智慧教育科技',
          status: 'planning',
          startDate: '2024-03-01',
          endDate: '2024-08-31',
          budget: 800000,
          spent: 50000,
          managerId: '2',
          managerName: '李四',
          progress: 10,
          createdAt: '2024-02-15T10:00:00Z',
          updatedAt: '2024-02-20T10:00:00Z',
        },
        {
          id: '3',
          name: '金融风控系统',
          description: '实时风控决策引擎',
          customerId: '3',
          customerName: '金融服务集团',
          status: 'completed',
          startDate: '2023-06-01',
          endDate: '2023-12-31',
          budget: 1200000,
          spent: 1150000,
          managerId: '1',
          managerName: '张三',
          progress: 100,
          createdAt: '2023-05-20T10:00:00Z',
          updatedAt: '2024-01-05T10:00:00Z',
        },
        {
          id: '4',
          name: '智能推荐引擎',
          description: '个性化内容推荐系统',
          customerId: '1',
          customerName: '科技创新有限公司',
          status: 'review',
          startDate: '2024-02-01',
          endDate: '2024-04-30',
          budget: 300000,
          spent: 290000,
          managerId: '3',
          managerName: '王五',
          progress: 95,
          createdAt: '2024-01-25T10:00:00Z',
          updatedAt: '2024-02-28T10:00:00Z',
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
  }, [pagination.current, pagination.pageSize, keyword, statusFilter])

  const handleAdd = () => {
    setModalTitle('新增项目')
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: Project) => {
    setModalTitle('编辑项目')
    setEditingId(record.id)
    form.setFieldsValue({
      ...record,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
    })
    setModalVisible(true)
  }

  const handleDelete = (_id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个项目吗？此操作不可恢复。',
      onOk: async () => {
        message.success('删除成功')
        fetchData()
      },
    })
  }

  const handleModalOk = async () => {
    try {
      await form.validateFields()
      if (editingId) {
        message.success('更新成功')
      } else {
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchData()
    } catch (error) {
      console.error('Validate failed:', error)
    }
  }

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '项目经理',
      dataIndex: 'managerName',
      key: 'managerName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProjectStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget: number) => `¥${budget.toLocaleString()}`,
    },
    {
      title: '截止日期',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: Project) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} size="small">
            查看
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const renderListView = () => (
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
  )

  const renderKanbanView = () => (
    <KanbanBoard
      projects={data}
      onStatusChange={(_projectId, newStatus) => {
        message.success(`项目状态已更新为: ${statusLabels[newStatus as ProjectStatus]}`)
        fetchData()
      }}
    />
  )

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space size="middle">
              <Input.Search
                placeholder="搜索项目名称"
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
                style={{ width: 150 }}
                allowClear
              >
                <Option value="planning">规划中</Option>
                <Option value="in_progress">进行中</Option>
                <Option value="review">审核中</Option>
                <Option value="completed">已完成</Option>
                <Option value="cancelled">已取消</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button.Group>
                <Button
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  icon={<UnorderedListOutlined />}
                  onClick={() => setViewMode('list')}
                >
                  列表
                </Button>
                <Button
                  type={viewMode === 'kanban' ? 'primary' : 'default'}
                  icon={<ColumnHeightOutlined />}
                  onClick={() => setViewMode('kanban')}
                >
                  看板
                </Button>
              </Button.Group>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增项目
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        {viewMode === 'list' ? renderListView() : renderKanbanView()}
      </Card>

      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="项目名称"
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="planning">规划中</Option>
                  <Option value="in_progress">进行中</Option>
                  <Option value="review">审核中</Option>
                  <Option value="completed">已完成</Option>
                  <Option value="cancelled">已取消</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="客户"
                rules={[{ required: true, message: '请选择客户' }]}
              >
                <Select placeholder="请选择客户">
                  <Option value="1">科技创新有限公司</Option>
                  <Option value="2">智慧教育科技</Option>
                  <Option value="3">金融服务集团</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="managerId"
                label="项目经理"
                rules={[{ required: true, message: '请选择项目经理' }]}
              >
                <Select placeholder="请选择项目经理">
                  <Option value="1">张三</Option>
                  <Option value="2">李四</Option>
                  <Option value="3">王五</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateRange"
                label="项目周期"
                rules={[{ required: true, message: '请选择项目周期' }]}
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="budget"
                label="预算(元)"
                rules={[{ required: true, message: '请输入预算' }]}
              >
                <Input type="number" placeholder="请输入预算" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="项目描述"
          >
            <Input.TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Projects
