"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 数据服务 - 负责数据聚合和缓存
const openclaw_1 = __importDefault(require("../adapters/openclaw"));
class DataService {
    openclaw;
    cache = new Map();
    lastSync = null;
    constructor() {
        this.openclaw = new openclaw_1.default();
    }
    // 获取完整的元宇宙状态
    async getMetaverseState() {
        const [agentStatuses, projects, systemStatus] = await Promise.all([
            this.openclaw.getAllAgentStatuses(),
            this.openclaw.getProjectData(),
            this.openclaw.getSystemStatus()
        ]);
        const agents = agentStatuses.map(status => ({
            id: status.id,
            name: status.name,
            role: status.id,
            status: status.status,
            position: { x: 0, y: 0, z: 0 }, // 从前端配置中获取
            currentTask: status.currentTask,
            taskProgress: status.taskProgress,
            efficiency: status.metrics.efficiency,
            lastUpdate: status.lastActive
        }));
        const mappedProjects = projects.map(p => ({
            id: p.id,
            name: p.name,
            description: '',
            progress: p.progress,
            status: this.mapProjectStatus(p.status),
            assignee: p.assignee,
            startDate: '',
            deadline: p.deadline,
            priority: 'medium'
        }));
        const metrics = {
            cpuUsage: Math.floor(Math.random() * 30) + 70,
            memoryUsage: Math.floor(Math.random() * 20) + 70,
            diskUsage: Math.floor(Math.random() * 15) + 80,
            networkStatus: 99,
            activeConnections: 42,
            responseTime: Math.floor(Math.random() * 30) + 20
        };
        const schedule = await this.openclaw.getTodaySchedule();
        const mappedSchedule = schedule.map(s => ({
            id: s.id,
            title: s.title,
            startTime: s.time,
            endTime: '',
            participants: s.participants,
            location: '',
            type: 'meeting',
            status: s.status
        }));
        return {
            agents,
            projects: mappedProjects,
            schedule: mappedSchedule,
            metrics,
            systemStatus
        };
    }
    // 获取实时数据（用于WebSocket推送）
    async getRealtimeData() {
        const state = await this.getMetaverseState();
        return {
            timestamp: new Date().toISOString(),
            agentStates: state.agents,
            activeProjects: state.projects,
            todaySchedule: state.schedule,
            systemMetrics: state.metrics,
            notifications: []
        };
    }
    // 获取Agent状态
    async getAgentStates() {
        const cacheKey = 'agentStates';
        const cached = this.cache.get(cacheKey);
        if (cached && this.isCacheValid()) {
            return cached;
        }
        const statuses = await this.openclaw.getAllAgentStatuses();
        const states = statuses.map(status => ({
            id: status.id,
            name: status.name,
            role: status.id,
            status: status.status,
            position: { x: 0, y: 0, z: 0 },
            currentTask: status.currentTask,
            taskProgress: status.taskProgress,
            efficiency: status.metrics.efficiency,
            lastUpdate: status.lastActive
        }));
        this.cache.set(cacheKey, states);
        return states;
    }
    // 获取项目列表
    async getProjects() {
        const cacheKey = 'projects';
        const cached = this.cache.get(cacheKey);
        if (cached && this.isCacheValid()) {
            return cached;
        }
        const projectData = await this.openclaw.getProjectData();
        const projects = projectData.map(p => ({
            id: p.id,
            name: p.name,
            description: '',
            progress: p.progress,
            status: this.mapProjectStatus(p.status),
            assignee: p.assignee,
            startDate: '',
            deadline: p.deadline,
            priority: 'medium'
        }));
        this.cache.set(cacheKey, projects);
        return projects;
    }
    // 获取今日日程
    async getTodaySchedule() {
        const schedule = await this.openclaw.getTodaySchedule();
        return schedule.map(s => ({
            id: s.id,
            title: s.title,
            startTime: s.time,
            endTime: '',
            participants: s.participants,
            location: '',
            type: 'meeting',
            status: s.status
        }));
    }
    // 获取统计数据
    async getStatistics() {
        return await this.openclaw.getStatistics();
    }
    // 向Agent发送消息
    async sendMessage(agentId, message) {
        return await this.openclaw.sendMessageToAgent(agentId, message);
    }
    // 清除缓存
    clearCache() {
        this.cache.clear();
        this.lastSync = null;
    }
    // 检查缓存是否有效
    isCacheValid() {
        if (!this.lastSync)
            return false;
        const now = new Date();
        const diff = now.getTime() - this.lastSync.getTime();
        return diff < 30000; // 30秒缓存
    }
    // 映射项目状态
    mapProjectStatus(status) {
        const statusMap = {
            '已完成': 'completed',
            '进行中': 'in_progress',
            '开发中': 'in_progress',
            '测试中': 'in_progress',
            '未开始': 'not_started',
            '已延期': 'delayed'
        };
        return statusMap[status] || 'in_progress';
    }
}
exports.default = DataService;
//# sourceMappingURL=dataService.js.map