import { Layout, Dropdown, Avatar, Space, Badge, theme } from 'antd'
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

const { Header: AntHeader } = Layout

const Header = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ]

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      handleLogout()
    }
  }

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: colorBgContainer,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'sticky',
        top: 0,
        zIndex: 99,
      }}
    >
      <Space size={24}>
        <Badge count={5} size="small">
          <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
        </Badge>
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
          placement="bottomRight"
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              src={user?.avatar}
              icon={!user?.avatar && <UserOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            />
            <span style={{ fontSize: 14 }}>{user?.name || '用户'}</span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  )
}

export default Header
