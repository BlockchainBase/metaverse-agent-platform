-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "deviceId" TEXT,
    "hostName" TEXT,
    "platform" TEXT,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "lastSeen" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'STAGE1',
    "stageStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "requirements" TEXT,
    "budget" REAL,
    "contractAmount" REAL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "scale" TEXT,
    "region" TEXT,
    "level" TEXT NOT NULL DEFAULT 'B',
    "status" TEXT NOT NULL DEFAULT 'POTENTIAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Contact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "dueDate" DATETIME,
    "completedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "creatorId" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "startDate" DATETIME,
    "dueDate" DATETIME,
    "completedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "estimatedHours" INTEGER,
    "actualHours" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Agent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Agent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "percentage" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "plannedDate" DATETIME NOT NULL,
    "actualDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromAgentId" TEXT NOT NULL,
    "toAgentId" TEXT,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "data" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_fromAgentId_fkey" FOREIGN KEY ("fromAgentId") REFERENCES "Agent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_agentId_key" ON "Agent"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");
