import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Input,
  Card,
  Tag,
  message,
  Row,
  Col,
  Select,
  Tabs,
  Statistic,
  Progress,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WalletOutlined,
} from '@ant-design/icons'

const { Option } = Select
const { TabPane } = Tabs

// 预算管理
interface Budget {
  id: string
  projectId: string
  projectName: string
  year: number
  totalBudget: number
  spent: number
  remaining: number
  category: string
}

// 成本记录
interface Cost {
  id: string
  projectId: string
  projectName: string
  type: 'labor' | 'material' | 'equipment' | 'other'
  amount: number
  description: string
  date: string
  createdBy: string
}

// 收款记录
interface Payment {
  id: string
  customerId: string
  customerName: string
  projectId: string
  projectName: string
  amount: number
  type: 'deposit' | 'milestone' | 'final'
  status: 'pending' | 'received' | 'overdue'
  dueDate: string
  receivedDate?: string
}

const Finance = () => {
  const [activeTab, setActiveTab] = useState('budget')
  const [loading, setLoading] = useState(false)

  // Budget states
  const [budgetData, setBudgetData] = useState<Budget[]>([])

  // Cost states
  const [costData, setCostData] = useState<Cost[]>([])

  // Payment states
  const [paymentData, setPaymentData] = useState<Payment[]>([])

  // Statistics
  const [stats, setStats] = useState({
    totalBudget: 0,
    totalSpent: 0,
    totalReceived: 0,
    totalPending: 0,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      // 模拟预算数据
      const mockBudgets: Budget[] = [
        {
          id: '1',
          projectId: '1',
          projectName: '智能客服系统',
          year: 2024,
          totalBudget: 500000,
          spent: 280000,
          remaining: 220000,
          category: '研发',
        },
        {
          id: '2',
          projectId: '2',
          projectName: '数据分析平台',
          year: 2024,
          totalBudget: 800000,
          spent: 50000,
          remaining: 750000,
          category: '研发',
        },
        {
          id: '3',
          projectId: '3',
          projectName: '金融风控系统',
          year: 2023,
          totalBudget: 1200000,
          spent: 1150000,
          remaining: 50000,
          category: '研发',
        },
      ]

      // 模拟成本数据
      const mockCosts: Cost[] = [
        {
          id: '1',
          projectId: '1',
          projectName: '智能客服系统',
          type: 'labor',
          amount: 120000,
          description: '开发人员工资',
          date: '2024-02-01',
          createdBy: '张三',
        },
        {
          id: '2',
          projectId: '1',
          projectName: '智能客服系统',
          type: 'equipment',
          amount: 50000,
          description: '服务器采购',
          date: '2024-02-10',
          createdBy: '李四',
        },
        {
          id: '3',
          projectId: '1',
          projectName: '智能客服系统',
          type: 'material',
          amount: 30000,
          description: '软件授权费',
          date: '2024-02-15',
          createdBy: '王五',
        },
      ]

      // 模拟收款数据
      const mockPayments: Payment[] = [
        {
          id: '1',
          customerId: '1',
          customerName: '科技创新有限公司',
          projectId: '1',
          projectName: '智能客服系统',
          amount: 150000,
          type: 'deposit',
          status: 'received',
          dueDate: '2024-01-20',
          receivedDate: '2024-01-18',
        },
        {
          id: '2',
          customerId: '1',
          customerName: '科技创新有限公司',
          projectId: '1',
          projectName: '智能客服系统',
          amount: 200000,
          type: 'milestone',
          status: 'pending',
          dueDate: '2024-03-01',
        },
        {
          id: '3',
          customerId: '2',
          customerName: '智慧教育科技',
          projectId: '2',
          projectName: '数据分析平台',
          amount: 240000,
          type: 'deposit',
          status: 'received',
          dueDate: '2024-02-20',
          receivedDate: '2024-02-22',
        },
      ]

      setBudgetData(mockBudgets)
      setCostData(mockCosts)
      setPaymentData(mockPayments)

      setStats({
        totalBudget: 2500000,
        totalSpent: 1480000,
        totalReceived: 890000,
        totalPending: 590000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeTab])

  // Budget columns
  const budgetColumns = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: '年度',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: '总预算',
      dataIndex: 'totalBudget',
      key: 'totalBudget',
      render: (value: number) => `¥${value.toLocaleString()}`,
    },
    {
      title: '已支出',
      dataIndex: 'spent',
      key: 'spent',
      render: (value: number) => `¥${value.toLocaleString()}`,
    },
    {
      title: '剩余',
      dataIndex: 'remaining',
      key: 'remaining',
      render: (value: number) => `¥${value.toLocaleString()}`,
    },
    {
      title: '使用率',
      key: 'usage',
      render: (_: unknown, record: Budget) => {
        const percent = Math.round((record.spent / record.totalBudget) * 100)
        return (
          <Progress
            percent={percent}
            size="small"
            status={percent > 90 ? 'exception' : percent > 70 ? 'normal' : 'success'}
          />
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: () => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} size="small" />
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Space>
      ),
    },
  ]

  // Cost columns
  const costColumns = [
    {
      title: '项目',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const labels: Record<string, string> = {
          labor: '人工',
          material: '材料',
          equipment: '设备',
          other: '其他',
        }
        const colors: Record<string, string> = {
          labor: 'blue',
          material: 'green',
          equipment: 'orange',
          other: 'default',
        }
        return <Tag color={colors[type]}>{labels[type]}</Tag>
      },
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (value: number) => `¥${value.toLocaleString()}`,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: () => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} size="small" />
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Space>
      ),
    },
  ]

  // Payment columns
  const paymentColumns = [
    {
      title: '客户',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (value: number) => `¥${value.toLocaleString()}`,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const labels: Record<string, string> = {
          deposit: '定金',
          milestone: '里程碑',
          final: '尾款',
        }
        return <Tag>{labels[type]}</Tag>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const labels: Record<string, string> = {
          pending: '待收款',
          received: '已收款',
          overdue: '已逾期',
        }
        const colors: Record<string, string> = {
          pending: 'warning',
          received: 'success',
          overdue: 'error',
        }
        return <Tag color={colors[status]}>{labels[status]}</Tag>
      },
    },
    {
      title: '应收日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Payment) => (
        <Space size="small">
          {record.status === 'pending' && (
            <Button
              type="text"
              size="small"
              onClick={() => {
                message.success('标记为已收款')
                fetchData()
              }}
            >
              确认收款
            </Button>
          )}
          <Button type="text" icon={<EditOutlined />} size="small" />
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="总预算"
              value={stats.totalBudget}
              prefix={<WalletOutlined />}
              formatter={(value) => `¥${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="已支出"
              value={stats.totalSpent}
              prefix={<ArrowDownOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
              formatter={(value) => `¥${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="已收款"
              value={stats.totalReceived}
              prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => `¥${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="待收款"
              value={stats.totalPending}
              prefix={<DollarOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
              formatter={(value) => `¥${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="预算管理" key="budget">
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />}>
                新增预算
              </Button>
            </div>
            <Table
              columns={budgetColumns}
              dataSource={budgetData}
              loading={loading}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="成本记录" key="cost">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Input.Search
                  placeholder="搜索成本记录"
                  style={{ width: 250 }}
                />
                <Select placeholder="筛选项目" style={{ width: 150 }} allowClear>
                  <Option value="1">智能客服系统</Option>
                  <Option value="2">数据分析平台</Option>
                </Select>
                <Button type="primary" icon={<PlusOutlined />}>
                  新增成本
                </Button>
              </Space>
            </div>
            <Table
              columns={costColumns}
              dataSource={costData}
              loading={loading}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="收款管理" key="payment">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Input.Search
                  placeholder="搜索收款记录"
                  style={{ width: 250 }}
                />
                <Select placeholder="筛选状态" style={{ width: 150 }} allowClear>
                  <Option value="pending">待收款</Option>
                  <Option value="received">已收款</Option>
                  <Option value="overdue">已逾期</Option>
                </Select>
                <Button type="primary" icon={<PlusOutlined />}>
                  新增收款
                </Button>
              </Space>
            </div>
            <Table
              columns={paymentColumns}
              dataSource={paymentData}
              loading={loading}
              rowKey="id"
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default Finance
