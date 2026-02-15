import { Layout, Menu, Typography } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  DollarOutlined,
  CodeOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Sider } = Layout
const { Title } = Typography

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: '/customers',
    icon: <TeamOutlined />,
    label: '客户管理',
  },
  {
    key: '/projects',
    icon: <ProjectOutlined />,
    label: '项目管理',
  },
  {
    key: '/tasks',
    icon: <CheckSquareOutlined />,
    label: '任务管理',
  },
  {
    key: '/finance',
    icon: <DollarOutlined />,
    label: '财务管理',
  },
]

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Sider
      width={240}
      theme="light"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 16px',
        }}
      >
        <CodeOutlined style={{ fontSize: 28, color: '#1890ff', marginRight: 8 }} />
        <Title level={5} style={{ margin: 0, color: '#1890ff' }}>
          AI Agent协作平台
        </Title>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0, paddingTop: 8 }}
      />
    </Sider>
  )
}

export default Sidebar
