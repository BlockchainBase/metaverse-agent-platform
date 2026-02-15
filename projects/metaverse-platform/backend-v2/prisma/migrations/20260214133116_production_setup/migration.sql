-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "businesses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "process_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "definition" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "businessId" TEXT NOT NULL,
    CONSTRAINT "process_templates_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "process_instances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'running',
    "data" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "templateId" TEXT NOT NULL,
    CONSTRAINT "process_instances_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "process_templates" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "roles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "type" TEXT NOT NULL DEFAULT 'ai',
    "config" TEXT,
    "capabilities" TEXT,
    "lastSeenAt" DATETIME,
    "position" TEXT,
    "rolePlayConfig" TEXT,
    "roleTemplateId" TEXT,
    "skillProfile" TEXT,
    "performanceStats" TEXT,
    "availabilityScore" REAL NOT NULL DEFAULT 1.0,
    "workload" INTEGER NOT NULL DEFAULT 0,
    "maxWorkload" INTEGER NOT NULL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    "roleId" TEXT,
    "supervisorId" TEXT,
    CONSTRAINT "agents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "agents_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "agents_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "agents" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agent_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "agent_versions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "type" TEXT NOT NULL DEFAULT 'default',
    "data" TEXT,
    "requiredSkills" TEXT,
    "estimatedHours" INTEGER,
    "collaborationMode" TEXT NOT NULL DEFAULT 'single',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "dueDate" DATETIME,
    "claimDeadline" DATETIME,
    "processInstanceId" TEXT,
    "assigneeId" TEXT,
    "creatorId" TEXT,
    "delegatedById" TEXT,
    "delegatedAt" DATETIME,
    "delegationReason" TEXT,
    "transferHistory" TEXT,
    "autoUnlock" BOOLEAN NOT NULL DEFAULT true,
    "meetingResolutionId" TEXT,
    "meetingId" TEXT,
    CONSTRAINT "tasks_processInstanceId_fkey" FOREIGN KEY ("processInstanceId") REFERENCES "process_instances" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "agents" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tasks_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "agents" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tasks_delegatedById_fkey" FOREIGN KEY ("delegatedById") REFERENCES "agents" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tasks_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "task_collaborators" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL DEFAULT 'member',
    "status" TEXT NOT NULL DEFAULT 'active',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" DATETIME,
    "taskId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    CONSTRAINT "task_collaborators_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_collaborators_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "task_dependencies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dependencyType" TEXT NOT NULL DEFAULT 'blocks',
    "taskId" TEXT NOT NULL,
    "dependsOnTaskId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_dependencies_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_dependencies_dependsOnTaskId_fkey" FOREIGN KEY ("dependsOnTaskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "type" TEXT NOT NULL DEFAULT 'discussion',
    "rolePlayEnabled" BOOLEAN NOT NULL DEFAULT false,
    "meetingTemplateId" TEXT,
    "scheduledAt" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "roomId" TEXT,
    "roomPosition" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    CONSTRAINT "meetings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_participants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL DEFAULT 'participant',
    "status" TEXT NOT NULL DEFAULT 'invited',
    "joinedAt" DATETIME,
    "leftAt" DATETIME,
    "speakingStyle" TEXT,
    "meetingId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "speakCount" INTEGER NOT NULL DEFAULT 0,
    "speakDuration" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "meeting_participants_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_participants_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_agenda" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 10,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "meetingId" TEXT NOT NULL,
    "ownerId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "meeting_agenda_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_resolutions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'decision',
    "meetingId" TEXT NOT NULL,
    "agendaItemId" TEXT,
    "assigneeId" TEXT,
    "generatedTaskId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "meeting_resolutions_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "collaboration_edges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "agent_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "knowledge_bases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "vectorDimension" INTEGER NOT NULL DEFAULT 1536,
    "embeddingModel" TEXT NOT NULL DEFAULT 'text-embedding-3-small',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "knowledge_bases_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "knowledge_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT,
    "vectorStatus" TEXT NOT NULL DEFAULT 'pending',
    "chunkCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "knowledgeBaseId" TEXT NOT NULL,
    CONSTRAINT "knowledge_documents_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "knowledge_bases" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_chunks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "tokenCount" INTEGER NOT NULL,
    "vectorId" TEXT,
    "embedding" TEXT,
    "metadata" TEXT,
    "documentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_chunks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "knowledge_documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "role_play_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "personality" TEXT NOT NULL,
    "expertise" TEXT NOT NULL,
    "speakingStyle" TEXT NOT NULL,
    "behaviorRules" TEXT,
    "systemPrompt" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT
);

-- CreateTable
CREATE TABLE "task_match_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "skillMatchScore" REAL NOT NULL,
    "availabilityScore" REAL NOT NULL,
    "workloadScore" REAL NOT NULL,
    "historyScore" REAL NOT NULL,
    "overallScore" REAL NOT NULL,
    "wasAssigned" BOOLEAN NOT NULL DEFAULT false,
    "wasAccepted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "qualityRating" INTEGER,
    "matchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "nl_command_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rawCommand" TEXT NOT NULL,
    "parsedIntent" TEXT NOT NULL,
    "parsedParams" TEXT,
    "executed" BOOLEAN NOT NULL DEFAULT false,
    "success" BOOLEAN,
    "result" TEXT,
    "error" TEXT,
    "agentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME
);

-- CreateTable
CREATE TABLE "workflow_triggers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "triggerType" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "actionConfig" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "workflow_executions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "triggerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "input" TEXT,
    "output" TEXT,
    "error" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "workflow_executions_triggerId_fkey" FOREIGN KEY ("triggerId") REFERENCES "workflow_triggers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "agents_organizationId_idx" ON "agents"("organizationId");

-- CreateIndex
CREATE INDEX "agents_status_idx" ON "agents"("status");

-- CreateIndex
CREATE INDEX "agents_roleId_idx" ON "agents"("roleId");

-- CreateIndex
CREATE INDEX "agents_supervisorId_idx" ON "agents"("supervisorId");

-- CreateIndex
CREATE INDEX "agents_availabilityScore_idx" ON "agents"("availabilityScore");

-- CreateIndex
CREATE INDEX "agents_organizationId_status_idx" ON "agents"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "agent_versions_agentId_version_key" ON "agent_versions"("agentId", "version");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_assigneeId_idx" ON "tasks"("assigneeId");

-- CreateIndex
CREATE INDEX "tasks_creatorId_idx" ON "tasks"("creatorId");

-- CreateIndex
CREATE INDEX "tasks_createdAt_idx" ON "tasks"("createdAt");

-- CreateIndex
CREATE INDEX "tasks_dueDate_idx" ON "tasks"("dueDate");

-- CreateIndex
CREATE INDEX "tasks_status_assigneeId_idx" ON "tasks"("status", "assigneeId");

-- CreateIndex
CREATE UNIQUE INDEX "task_collaborators_taskId_agentId_key" ON "task_collaborators"("taskId", "agentId");

-- CreateIndex
CREATE UNIQUE INDEX "task_dependencies_taskId_dependsOnTaskId_key" ON "task_dependencies"("taskId", "dependsOnTaskId");

-- CreateIndex
CREATE INDEX "meetings_organizationId_idx" ON "meetings"("organizationId");

-- CreateIndex
CREATE INDEX "meetings_status_idx" ON "meetings"("status");

-- CreateIndex
CREATE INDEX "meetings_scheduledAt_idx" ON "meetings"("scheduledAt");

-- CreateIndex
CREATE INDEX "meetings_organizationId_status_idx" ON "meetings"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_participants_meetingId_agentId_key" ON "meeting_participants"("meetingId", "agentId");

-- CreateIndex
CREATE UNIQUE INDEX "collaboration_edges_sourceId_targetId_type_key" ON "collaboration_edges"("sourceId", "targetId", "type");

-- CreateIndex
CREATE INDEX "agent_activities_agentId_createdAt_idx" ON "agent_activities"("agentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "document_chunks_vectorId_key" ON "document_chunks"("vectorId");

-- CreateIndex
CREATE INDEX "document_chunks_documentId_idx" ON "document_chunks"("documentId");

-- CreateIndex
CREATE INDEX "task_match_history_taskId_idx" ON "task_match_history"("taskId");

-- CreateIndex
CREATE INDEX "task_match_history_agentId_idx" ON "task_match_history"("agentId");

-- CreateIndex
CREATE INDEX "nl_command_logs_agentId_idx" ON "nl_command_logs"("agentId");

-- CreateIndex
CREATE INDEX "nl_command_logs_createdAt_idx" ON "nl_command_logs"("createdAt");
