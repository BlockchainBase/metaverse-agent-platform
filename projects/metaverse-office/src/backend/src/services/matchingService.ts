// v3.0 能力匹配服务
import { 
  AgentCapability, 
  TaskRequirements, 
  MatchResult,
  TaskAssignment 
} from '../models/types';

class MatchingService {
  /**
   * 基于能力匹配任务到Agent
   */
  async matchAgentsToTask(
    task: TaskRequirements,
    availableAgents: AgentCapability[]
  ): Promise<MatchResult> {
    
    // 1. 过滤不满足最低要求的Agent
    const qualifiedAgents = availableAgents.filter(agent => {
      return task.requiredCapabilities.every(req => {
        const agentExp = agent.expertise.find(e => e.domain === req.domain);
        return agentExp && agentExp.level >= req.minLevel;
      });
    });

    // 如果没有符合条件的Agent，返回空结果
    if (qualifiedAgents.length === 0) {
      return {
        primary: null as any,
        alternatives: [],
        allMatches: []
      };
    }

    // 2. 计算匹配度得分
    const scoredAgents = qualifiedAgents.map(agent => {
      // 能力匹配度计算
      let capabilityScore = 0;
      let totalWeight = 0;
      
      task.requiredCapabilities.forEach(req => {
        const agentExp = agent.expertise.find(e => e.domain === req.domain);
        if (agentExp) {
          // 超出要求的能力给予奖励
          const bonus = agentExp.level > req.minLevel ? 0.1 : 0;
          capabilityScore += (Math.min(agentExp.level, 1.0) + bonus) * req.weight;
        }
        totalWeight += req.weight;
      });
      
      capabilityScore = totalWeight > 0 ? capabilityScore / totalWeight : 0;
      
      // 协作特征匹配度
      let collaborationScore = 0;
      
      // 响应时间匹配
      if (task.collaborationProfile.communicationIntensity === 'realtime') {
        collaborationScore += agent.collaborationProfile.responseTime < 30 ? 0.3 : 0.15;
      } else if (task.collaborationProfile.communicationIntensity === 'daily') {
        collaborationScore += agent.collaborationProfile.responseTime < 60 ? 0.3 : 0.15;
      } else {
        collaborationScore += 0.25;
      }
      
      // 历史质量
      collaborationScore += agent.collaborationProfile.qualityScore * 0.4;
      
      // 任务规模偏好匹配
      const sizeMatch = agent.collaborationProfile.preferredTaskSize === 'large' && task.collaborationProfile.expectedDuration > 40
        ? 0.3
        : agent.collaborationProfile.preferredTaskSize === 'medium' && task.collaborationProfile.expectedDuration >= 16 && task.collaborationProfile.expectedDuration <= 40
        ? 0.3
        : agent.collaborationProfile.preferredTaskSize === 'small' && task.collaborationProfile.expectedDuration < 16
        ? 0.3
        : 0.15;
      collaborationScore += sizeMatch;
      
      // 负载均衡（惩罚高负载）
      const workload = agent.currentState?.workload || 0;
      const workloadPenalty = workload > 0.8 ? 0.6 : workload > 0.5 ? 0.8 : 1.0;
      
      // 综合得分：能力60% + 协作40%，再乘以负载惩罚
      const totalScore = (capabilityScore * 0.6 + collaborationScore * 0.4) * workloadPenalty;
      
      return {
        agentId: agent.agentId,
        agentName: agent.name,
        totalScore: Math.round(totalScore * 100) / 100,
        breakdown: {
          capabilityScore: Math.round(capabilityScore * 100) / 100,
          collaborationScore: Math.round(collaborationScore * 100) / 100,
          workloadPenalty,
          currentWorkload: workload
        },
        reasoning: `能力匹配度${(capabilityScore * 100).toFixed(0)}%，协作匹配度${(collaborationScore * 100).toFixed(0)}%，当前负载${(workload * 100).toFixed(0)}%`
      };
    });

    // 3. 排序并返回结果
    const sortedAgents = scoredAgents.sort((a, b) => b.totalScore - a.totalScore);
    
    return {
      primary: sortedAgents[0],
      alternatives: sortedAgents.slice(1, 4),
      allMatches: sortedAgents
    };
  }

  /**
   * 快速匹配：只返回最优结果
   */
  async quickMatch(
    task: TaskRequirements,
    availableAgents: AgentCapability[]
  ): Promise<string | null> {
    const result = await this.matchAgentsToTask(task, availableAgents);
    return result.primary?.agentId || null;
  }

  /**
   * 团队匹配：为需要多人协作的任务匹配团队
   */
  async matchTeam(
    task: TaskRequirements,
    availableAgents: AgentCapability[]
  ): Promise<string[]> {
    const teamSize = task.collaborationProfile?.teamSize || 1;
    
    if (teamSize === 1) {
      const bestMatch = await this.quickMatch(task, availableAgents);
      return bestMatch ? [bestMatch] : [];
    }
    
    // 匹配团队
    const result = await this.matchAgentsToTask(task, availableAgents);
    return (result.allMatches || []).slice(0, teamSize).map(m => m.agentId);
  }

  /**
   * 计算Agent负载
   */
  calculateAgentWorkload(agent: AgentCapability): number {
    const activeContracts = agent.currentState?.activeContracts?.length || 0;
    const baseWorkload = Math.min(activeContracts * 0.2, 0.8);
    
    // 考虑Agent的完成率调整
    const completionRate = agent.collaborationProfile?.completionRate || 0.9;
    const adjustedWorkload = baseWorkload / Math.max(completionRate, 0.5);
    
    return Math.min(adjustedWorkload, 1.0);
  }

  /**
   * 验证Agent是否满足任务要求
   */
  validateAgentForTask(
    agent: AgentCapability,
    task: TaskRequirements
  ): { valid: boolean; reasons: string[] } {
    const reasons: string[] = [];
    
    // 检查能力要求
    for (const req of task.requiredCapabilities) {
      const agentExp = agent.expertise.find(e => e.domain === req.domain);
      if (!agentExp) {
        reasons.push(`缺少${req.domain}领域经验`);
      } else if (agentExp.level < req.minLevel) {
        reasons.push(`${req.domain}能力不足(${agentExp.level.toFixed(2)} < ${req.minLevel})`);
      }
    }
    
    // 检查负载
    const workload = agent.currentState?.workload || 0;
    if (workload > 0.9) {
      reasons.push(`当前负载过高(${workload.toFixed(2)})`);
    }
    
    // 检查排除列表
    if (task.constraints?.excludeAgents?.includes(agent.agentId)) {
      reasons.push('在排除列表中');
    }
    
    return {
      valid: reasons.length === 0,
      reasons
    };
  }
}

export const matchingService = new MatchingService();
export default matchingService;
