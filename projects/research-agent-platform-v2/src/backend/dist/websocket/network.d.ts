interface CollaborationMessage {
    id: string;
    type: 'direct' | 'broadcast' | 'task' | 'request' | 'response';
    from: {
        agentId: string;
        agentName: string;
        ownerName: string;
    };
    to?: string;
    content: {
        text?: string;
        action?: string;
        data?: any;
    };
    timestamp: Date;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    requiresResponse: boolean;
    responseTimeout?: number;
}
interface CollaborationTask {
    id: string;
    title: string;
    description: string;
    assigner: string;
    assignees: string[];
    projectId?: string;
    status: 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    updatedAt: Date;
    dueDate?: Date;
    messages: CollaborationMessage[];
}
export declare class OpenClawNetwork {
    private wss;
    private connections;
    private messageHistory;
    private tasks;
    private messageHandlers;
    initialize(port?: number): void;
    private handleAuthentication;
    private handleMessage;
    private handleCollaborationMessage;
    private handleTaskCreate;
    private handleTaskUpdate;
    private broadcast;
    private sendToSocket;
    private handleDisconnection;
    private startHeartbeat;
    getOnlineAgents(): Array<{
        agentId: string;
        agentName: string;
        ownerName: string;
        status: string;
    }>;
    getMessageHistory(limit?: number): CollaborationMessage[];
    getTasks(agentId?: string): CollaborationTask[];
    onMessage(type: string, handler: (message: CollaborationMessage) => void): void;
    sendToAgent(agentId: string, message: any): boolean;
}
export declare const openClawNetwork: OpenClawNetwork;
export {};
