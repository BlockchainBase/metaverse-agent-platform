import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = 'http://localhost:3001/api'

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config)
    return response.data
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config)
    return response.data
  }
}

export const api = new ApiService()

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ user: any; token: string }>('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
}

// Dashboard API
export const dashboardApi = {
  getStats: () =>
    api.get<{
      totalProjects: number
      totalCustomers: number
      totalTasks: number
      totalRevenue: number
      projectStatus: { name: string; value: number }[]
      monthlyRevenue: { month: string; revenue: number; cost: number }[]
    }>('/dashboard/stats'),
}

// Customer API
export interface Customer {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  address: string
  industry: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export const customerApi = {
  getList: (params?: { page?: number; pageSize?: number; keyword?: string }) =>
    api.get<{ list: Customer[]; total: number }>('/customers', { params }),
  getById: (id: string) => api.get<Customer>(`/customers/${id}`),
  create: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Customer>('/customers', data),
  update: (id: string, data: Partial<Customer>) =>
    api.put<Customer>(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
}

// Project API
export const projectApi = {
  getList: (params?: { page?: number; pageSize?: number; status?: string }) =>
    api.get<{ list: any[]; total: number }>('/projects', { params }),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
}

// Task API
export const taskApi = {
  getList: (params?: { page?: number; pageSize?: number; projectId?: string; status?: string }) =>
    api.get<{ list: any[]; total: number }>('/tasks', { params }),
  getById: (id: string) => api.get(`/tasks/${id}`),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
}

// Finance API
export const financeApi = {
  getBudgets: (params?: { year?: number }) =>
    api.get<{ list: any[]; total: number }>('/finance/budgets', { params }),
  getCosts: (params?: { projectId?: string; startDate?: string; endDate?: string }) =>
    api.get<{ list: any[]; total: number }>('/finance/costs', { params }),
  getPayments: (params?: { customerId?: string; status?: string }) =>
    api.get<{ list: any[]; total: number }>('/finance/payments', { params }),
  createPayment: (data: any) => api.post('/finance/payments', data),
  updatePayment: (id: string, data: any) => api.put(`/finance/payments/${id}`, data),
}

export default api
