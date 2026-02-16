// v3.0 协作契约服务
import { 
  CollaborationContract, 
  NegotiationRound, 
  Consensus,
  ContractExecution,
  HumanIntervention,
  Evidence 
} from '../models/types';

class ContractService {
  private contracts: Map<string, CollaborationContract> = new Map();

  /**
   * 创建新的协作契约
   */
  async createContract(
    projectId: string,
    type: CollaborationContract['type'],
    initiatorId: string,
    context: CollaborationContract['context'],
    proposal: CollaborationContract['proposal']
  ): Promise<CollaborationContract> {
    const contractId = `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const contract: CollaborationContract = {
      contractId,
      projectId,
      type,
      context,
      proposal: {
        ...proposal,
        timestamp: new Date().toISOString()
      },
      negotiation: [],
      auditTrail: {
        createdAt: new Date().toISOString(),
        decisionRationale: `由${initiatorId}发起`,
        keyEvidence: proposal.evidence || []
      }
    };

    this.contracts.set(contractId, contract);
    
    // TODO: 持久化到数据库
    
    return contract;
  }

  /**
   * 提交协商意见
   */
  async submitNegotiation(
    contractId: string,
    agentId: string,
    stance: NegotiationRound['stance'],
    content: string,
    evidence?: Evidence[],
    confidence?: number
  ): Promise<CollaborationContract> {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      throw new Error(`契约不存在: ${contractId}`);
    }

    const round: NegotiationRound = {
      round: contract.negotiation.length + 1,
      agentId,
      stance,
      content,
      evidence,
      confidence,
      timestamp: new Date().toISOString()
    };

    contract.negotiation.push(round);
    
    // 自动检查是否达成共识
    await this.checkConsensus(contractId);
    
    return contract;
  }

  /**
   * 检查是否达成共识
   */
  private async checkConsensus(contractId: string): Promise<void> {
    const contract = this.contracts.get(contractId);
    if (!contract) return;

    // 简单共识检查：所有参与方都accept
    const lastRoundByAgent = new Map<string, NegotiationRound>();
    
    for (const round of contract.negotiation) {
      lastRoundByAgent.set(round.agentId, round);
    }

    const allAccepted = Array.from(lastRoundByAgent.values()).every(
      r => r.stance === 'accept'
    );

    if (allAccepted && lastRoundByAgent.size >= 2) {
      // 达成共识
      const participatingAgents = Array.from(lastRoundByAgent.keys());
      const avgConfidence = participatingAgents.reduce((sum, agentId) => {
        const round = lastRoundByAgent.get(agentId)!;
        return sum + (round.confidence || 0.8);
      }, 0) / participatingAgents.length;

      contract.consensus = {
        reached: true,
        finalAgreement: this.generateAgreement(contract),
        participatingAgents,
        confidence: Math.round(avgConfidence * 100) / 100,
        consensusAt: new Date().toISOString()
      };

      contract.auditTrail.consensusReachedAt = new Date().toISOString();
      
      // 触发执行阶段
      await this.startExecution(contractId, participatingAgents[0]);
    }
  }

  /**
   * 生成协议文本
   */
  private generateAgreement(contract: CollaborationContract): string {
    // 基于协商历史生成协议摘要
    const lastProposals = contract.negotiation
      .filter(r => r.stance === 'accept' || r.stance === 'amend')
      .slice(-3);
    
    return `基于${contract.negotiation.length}轮协商，各方就${contract.context.description}达成共识。`;
  }

  /**
   * 开始执行阶段
   */
  async startExecution(
    contractId: string, 
    assignedAgentId: string
  ): Promise<void> {
    const contract = this.contracts.get(contractId);
    if (!contract) return;

    contract.execution = {
      status: 'inProgress',
      assignedAgentId,
      deliverables: [],
      verificationResult: undefined,
      completedAt: undefined
    };

    contract.auditTrail.executionStartedAt = new Date().toISOString();
  }

  /**
   * 提交交付物
   */
  async submitDeliverable(
    contractId: string,
    deliverableId: string,
    name: string,
    content: string
  ): Promise<void> {
    const contract = this.contracts.get(contractId);
    if (!contract || !contract.execution) return;

    contract.execution.deliverables.push({
      id: deliverableId,
      name,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      content
    });
  }

  /**
   * 验证交付物
   */
  async verifyDeliverable(
    contractId: string,
    deliverableId: string,
    verified: boolean,
    verifiedBy: string,
    notes?: string
  ): Promise<void> {
    const contract = this.contracts.get(contractId);
    if (!contract || !contract.execution) return;

    const deliverable = contract.execution.deliverables.find(d => d.id === deliverableId);
    if (deliverable) {
      deliverable.status = verified ? 'approved' : 'rejected';
    }

    contract.execution.verificationResult = {
      verified,
      verifiedBy,
      notes
    };

    // 如果验证通过，标记契约完成
    if (verified) {
      contract.execution.status = 'completed';
      contract.execution.completedAt = new Date().toISOString();
      contract.auditTrail.completedAt = new Date().toISOString();
    }
  }

  /**
   * 请求人类介入
   */
  async requestHumanIntervention(
    contractId: string,
    type: HumanIntervention['type'],
    reason: string
  ): Promise<void> {
    const contract = this.contracts.get(contractId);
    if (!contract) return;

    contract.humanIntervention = {
      required: true,
      type,
      requestId: `intervention-${Date.now()}`,
      resolvedAt: undefined,
      decision: undefined
    };

    // TODO: 触发通知给人类
  }

  /**
   * 获取契约详情
   */
  async getContract(contractId: string): Promise<CollaborationContract | null> {
    return this.contracts.get(contractId) || null;
  }

  /**
   * 获取项目的所有契约
   */
  async getContractsByProject(projectId: string): Promise<CollaborationContract[]> {
    return Array.from(this.contracts.values())
      .filter(c => c.projectId === projectId);
  }

  /**
   * 获取活跃的契约
   */
  async getActiveContracts(): Promise<CollaborationContract[]> {
    return Array.from(this.contracts.values())
      .filter(c => !c.execution?.completedAt);
  }

  /**
   * 获取需要人类介入的契约
   */
  async getPendingHumanIntervention(): Promise<CollaborationContract[]> {
    return Array.from(this.contracts.values())
      .filter(c => c.humanIntervention?.required && !c.humanIntervention?.resolvedAt);
  }
}

export const contractService = new ContractService();
export default contractService;
