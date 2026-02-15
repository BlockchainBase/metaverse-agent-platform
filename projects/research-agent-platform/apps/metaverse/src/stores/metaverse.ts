import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

interface Project {
  id: string
  name: string
  code: string
  stage: string
  stageStatus: string
  status: string
  priority: string
  customerName: string
  manager: { name: string; avatar?: string }
  position: { x: number; y: number; z: number }
  color: string
  progress: number
}

interface Agent {
  id: string
  name: string
  role: string
  avatar: string
  position: { x: number; y: number; z: number }
}

interface MetaverseState {
  projects: Project[]
  agents: Agent[]
  selectedProject: Project | null
  selectedAgent: Agent | null
  socket: Socket | null
  
  // Actions
  setProjects: (projects: Project[]) => void
  setAgents: (agents: Agent[]) => void
  selectProject: (project: Project | null) => void
  selectAgent: (agent: Agent | null) => void
  initSocket: () => void
}

export const useMetaverseStore = create<MetaverseState>((set, get) => ({
  projects: [],
  agents: [],
  selectedProject: null,
  selectedAgent: null,
  socket: null,

  setProjects: (projects) => set({ projects }),
  setAgents: (agents) => set({ agents }),
  selectProject: (project) => set({ selectedProject: project }),
  selectAgent: (agent) => set({ selectedAgent: agent }),

  initSocket: () => {
    const socket = io('http://localhost:3001')
    
    socket.on('connect', () => {
      console.log('Connected to metaverse server')
      socket.emit('join-metaverse')
    })

    socket.on('project-update', (project) => {
      const { projects } = get()
      const updated = projects.map(p => p.id === project.id ? project : p)
      set({ projects: updated })
    })

    set({ socket })
  }
}))