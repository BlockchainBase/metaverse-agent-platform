export interface AgentState {
    id: string;
    name: string;
    role: string;
    status: 'working' | 'idle' | 'meeting' | 'busy' | 'offline';
    position: {
        x: number;
        y: number;
        z: number;
    };
    currentTask: string;
    taskProgress: number;
    efficiency: number;
    lastUpdate: string;
}
export interface Project {
    id: string;
    name: string;
    description: string;
    progress: number;
    status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
    assignee: string;
    startDate: string;
    deadline: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}
export interface ScheduleEvent {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    participants: string[];
    location: string;
    type: 'meeting' | 'deadline' | 'reminder' | 'task';
    status: 'upcoming' | 'ongoing' | 'completed';
}
export interface SystemMetrics {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkStatus: number;
    activeConnections: number;
    responseTime: number;
}
export interface Notification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    source: string;
}
export interface RealtimeData {
    timestamp: string;
    agentStates: AgentState[];
    activeProjects: Project[];
    todaySchedule: ScheduleEvent[];
    systemMetrics: SystemMetrics;
    notifications: Notification[];
}
export interface MetaverseState {
    agents: AgentState[];
    projects: Project[];
    schedule: ScheduleEvent[];
    metrics: SystemMetrics;
    systemStatus: {
        gateway: 'online' | 'offline';
        feishu: 'online' | 'offline';
        email: 'online' | 'offline';
        lastSync: string;
    };
}
