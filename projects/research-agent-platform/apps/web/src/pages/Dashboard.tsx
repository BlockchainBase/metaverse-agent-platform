import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, theme } from 'antd'
import {
  ProjectOutlined,
  TeamOutlined,
  CheckSquareOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
// import { dashboardApi } from '@/services/api'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCustomers: 0,
    totalTasks: 0,
    totalRevenue: 0,
  })
  const [projectStatus, setProjectStatus] = useState<{ name: string; value: number }[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number; cost: number }[]>([])

  const {
    token: { colorPrimary },
  } = theme.useToken()

  useEffect(() => {
    // 模拟获取数据
    setStats({
      totalProjects: 24,
      totalCustomers: 18,
      totalTasks: 156,
      totalRevenue: 2850000,
    })

    setProjectStatus([
      { name: '进行中', value: 12 },
      { name: '已完成', value: 8 },
      { name: '规划中', value: 3 },
      { name: '已取消', value: 1 },
    ])

    setMonthlyRevenue([
      { month: '1月', revenue: 250000, cost: 180000 },
      { month: '2月', revenue: 280000, cost: 200000 },
      { month: '3月', revenue: 320000, cost: 220000 },
      { month: '4月', revenue: 290000, cost: 210000 },
      { month: '5月', revenue: 350000, cost: 240000 },
      { month: '6月', revenue: 380000, cost: 260000 },
    ])
  }, [])

  const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d']

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="总项目数"
              value={stats.totalProjects}
              prefix={<ProjectOutlined style={{ color: colorPrimary }} />}
              valueStyle={{ color: colorPrimary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="客户总数"
              value={stats.totalCustomers}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="任务总数"
              value={stats.totalTasks}
              prefix={<CheckSquareOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="总收入"
              value={stats.totalRevenue}
              prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
              formatter={(value) => `¥${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="月度收支趋势" hoverable>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="收入"
                  stroke="#1890ff"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  name="成本"
                  stroke="#f5222d"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="项目状态分布" hoverable>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {projectStatus.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="最近活动" hoverable>
            <div style={{ padding: '12px 0' }}>
              <p style={{ color: '#666', marginBottom: 12 }}>• 项目 "智能客服系统" 状态更新为：进行中</p>
              <p style={{ color: '#666', marginBottom: 12 }}>• 客户 "科技有限公司" 新增了项目需求</p>
              <p style={{ color: '#666', marginBottom: 12 }}>• 任务 "API接口开发" 已完成</p>
              <p style={{ color: '#666', marginBottom: 12 }}>• 收到客户 "创新科技" 的付款 ¥150,000</p>
              <p style={{ color: '#666', marginBottom: 0 }}>• 新项目 "数据分析平台" 已创建</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
