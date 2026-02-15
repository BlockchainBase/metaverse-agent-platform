interface AgentStatus {
    id: string;
    name: string;
    status: 'working' | 'idle' | 'meeting' | 'busy' | 'offline';
    currentTask: string;
    taskProgress: number;
    lastActive: string;
    metrics: {
        tasksCompleted: number;
        tasksPending: number;
        efficiency: number;
    };
}
interface ProjectData {
    id: string;
    name: string;
    progress: number;
    status: string;
    assignee: string;
    deadline: string;
}
interface SystemStatus {
    gateway: 'online' | 'offline';
    feishu: 'online' | 'offline';
    email: 'online' | 'offline';
    lastSync: string;
}
interface GatewaySession {
    key: string;
    kind: string;
    channel: string;
    displayName: string;
    model: string;
    contextTokens: number;
    totalTokens: number;
    updatedAt: number;
}
interface GatewayStatus {
    status: string;
    version: string;
    timestamp: string;
    sessions?: GatewaySession[];
}
declare class OpenClawAdapter {
    private config;
    private baseURL;
    private token;
    private realGatewayURL;
    constructor();
    private loadConfig;
    getGatewaySessions(): Promise<GatewaySession[]>;
    private getSessionsFromWorkspace;
    private generateSessionsFromRealState;
    getGatewayStatus(): Promise<GatewayStatus | null>;
    getAllAgentStatuses(): Promise<AgentStatus[]>;
    private determineStatus;
    private determineTask;
    private calculateProgress;
    private calculateEfficiency;
    getProjectData(): Promise<ProjectData[]>;
    private formatProjectName;
    private getProjectProgress;
    private getProjectStatus;
    private getProjectDeadline;
    getSystemStatus(): Promise<SystemStatus>;
    private checkGatewayConnection;
    private checkFeishuConnection;
    getTodaySchedule(): Promise<any[]>;
    getStatistics(): Promise<any>;
    sendMessageToAgent(agentId: string, message: string): Promise<boolean>;
    private getRandomStatus;
    private getRandomTask;
}
export default OpenClawAdapter;
export { AgentStatus, ProjectData, SystemStatus, GatewaySession, GatewayStatus };
//# sourceMappingURL=openclaw.d.ts.map