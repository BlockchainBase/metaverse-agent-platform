import { create } from 'zustand'

export type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed' | 'cancelled'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Project {
  id: string
  name: string
  description: string
  customerId: string
  customerName: string
  status: ProjectStatus
  startDate: string
  endDate: string
  budget: number
  spent: number
  managerId: string
  managerName: string
  progress: number
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  projectId: string
  projectName: string
  assigneeId: string
  assigneeName: string
  assigneeAvatar?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  estimatedHours: number
  actualHours: number
  createdAt: string
  updatedAt: string
}

interface ProjectState {
  projects: Project[]
  tasks: Task[]
  currentProject: Project | null
  loading: boolean
  setProjects: (projects: Project[]) => void
  setTasks: (tasks: Task[]) => void
  setCurrentProject: (project: Project | null) => void
  addProject: (project: Project) => void
  updateProject: (id: string, data: Partial<Project>) => void
  deleteProject: (id: string) => void
  addTask: (task: Task) => void
  updateTask: (id: string, data: Partial<Task>) => void
  deleteTask: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  tasks: [],
  currentProject: null,
  loading: false,
  setProjects: (projects) => set({ projects }),
  setTasks: (tasks) => set({ tasks }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),
  updateProject: (id, data) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    })),
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),
  addTask: (task) =>
    set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, data) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),
  setLoading: (loading) => set({ loading }),
}))
