import { AgentState, Project, ScheduleEvent, MetaverseState, RealtimeData } from '../models/types';
declare class DataService {
    private openclaw;
    private cache;
    private lastSync;
    constructor();
    getMetaverseState(): Promise<MetaverseState>;
    getRealtimeData(): Promise<RealtimeData>;
    getAgentStates(): Promise<AgentState[]>;
    getProjects(): Promise<Project[]>;
    getTodaySchedule(): Promise<ScheduleEvent[]>;
    getStatistics(): Promise<any>;
    sendMessage(agentId: string, message: string): Promise<boolean>;
    clearCache(): void;
    private isCacheValid;
    private mapProjectStatus;
}
export default DataService;
