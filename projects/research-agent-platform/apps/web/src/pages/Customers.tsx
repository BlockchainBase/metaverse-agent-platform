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
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'
import { Customer } from '@/services/api'
import dayjs from 'dayjs'

const { Option } = Select

const Customers = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [keyword, setKeyword] = useState('')
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
      const mockData: Customer[] = [
        {
          id: '1',
          name: '科技创新有限公司',
          contact: '张经理',
          email: 'zhang@example.com',
          phone: '13800138000',
          address: '北京市朝阳区科技园区',
          industry: '互联网',
          status: 'active',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-02-01T10:00:00Z',
        },
        {
          id: '2',
          name: '智慧教育科技',
          contact: '李总',
          email: 'li@example.com',
          phone: '13900139000',
          address: '上海市浦东新区软件园',
          industry: '教育科技',
          status: 'active',
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-02-05T10:00:00Z',
        },
        {
          id: '3',
          name: '金融服务集团',
          contact: '王总监',
          email: 'wang@example.com',
          phone: '13700137000',
          address: '深圳市福田区金融中心',
          industry: '金融科技',
          status: 'inactive',
          createdAt: '2024-02-01T10:00:00Z',
          updatedAt: '2024-02-10T10:00:00Z',
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
  }, [pagination.current, pagination.pageSize, keyword])

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 })
    fetchData()
  }

  const handleAdd = () => {
    setModalTitle('新增客户')
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: Customer) => {
    setModalTitle('编辑客户')
    setEditingId(record.id)
    form.setFieldsValue({
      ...record,
      createdAt: record.createdAt ? dayjs(record.createdAt) : undefined,
    })
    setModalVisible(true)
  }

  const handleDelete = (_id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个客户吗？此操作不可恢复。',
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
      title: '客户名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '活跃' : '停用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: Customer) => (
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

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Input.Search
              placeholder="搜索客户名称、联系人"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
              enterButton={<><SearchOutlined /> 搜索</>}
              style={{ maxWidth: 400 }}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增客户
            </Button>
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

      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="客户名称"
                rules={[{ required: true, message: '请输入客户名称' }]}
              >
                <Input placeholder="请输入客户名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contact"
                label="联系人"
                rules={[{ required: true, message: '请输入联系人' }]}
              >
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱' },
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="电话"
                rules={[{ required: true, message: '请输入电话' }]}
              >
                <Input placeholder="请输入电话" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="industry"
                label="行业"
                rules={[{ required: true, message: '请选择行业' }]}
              >
                <Select placeholder="请选择行业">
                  <Option value="互联网">互联网</Option>
                  <Option value="金融科技">金融科技</Option>
                  <Option value="教育科技">教育科技</Option>
                  <Option value="医疗健康">医疗健康</Option>
                  <Option value="制造业">制造业</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">活跃</Option>
                  <Option value="inactive">停用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="address"
            label="地址"
          >
            <Input.TextArea rows={2} placeholder="请输入地址" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Customers
