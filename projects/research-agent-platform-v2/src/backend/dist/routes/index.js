"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = setupRoutes;
const express_1 = require("express");
const agent_1 = require("./agent");
const project_1 = require("./project");
const customer_1 = require("./customer");
const task_1 = require("./task");
const finance_1 = require("./finance");
const message_1 = require("./message");
function setupRoutes(app) {
    const apiRouter = (0, express_1.Router)();
    apiRouter.use('/agents', agent_1.agentRouter);
    apiRouter.use('/projects', project_1.projectRouter);
    apiRouter.use('/customers', customer_1.customerRouter);
    apiRouter.use('/tasks', task_1.taskRouter);
    apiRouter.use('/finance', finance_1.financeRouter);
    apiRouter.use('/messages', message_1.messageRouter);
    app.use('/api', apiRouter);
}
//# sourceMappingURL=index.js.map