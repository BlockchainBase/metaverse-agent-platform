import { useState } from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined, CodeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
// import { authApi } from '@/services/api'

const { Title, Text } = Typography

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      // 模拟登录，实际项目中调用API
      // const response = await authApi.login(values.username, values.password)
      
      // 模拟数据
      const mockUser = {
        id: '1',
        username: values.username,
        name: '管理员',
        email: 'admin@example.com',
        role: 'admin' as const,
        avatar: '',
      }
      const mockToken = 'mock-jwt-token'
      
      login(mockUser, mockToken)
      message.success('登录成功')
      navigate('/dashboard')
    } catch (error) {
      message.error('登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <CodeOutlined style={{ fontSize: 56, color: '#1890ff' }} />
          <Title level={3} style={{ marginTop: 16, marginBottom: 8 }}>
            AI Agent协作平台
          </Title>
          <Text type="secondary">研究院项目管理后台</Text>
        </div>

        <Form
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 44, fontSize: 16 }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            默认账号: admin / 密码: admin
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default Login
