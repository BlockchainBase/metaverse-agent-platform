import { Router } from 'express';
import { agentRouter } from './agent';
import { projectRouter } from './project';
import { customerRouter } from './customer';
import { taskRouter } from './task';
import { financeRouter } from './finance';
import { messageRouter } from './message';

export function setupRoutes(app: Router) {
  const apiRouter = Router();
  
  apiRouter.use('/agents', agentRouter);
  apiRouter.use('/projects', projectRouter);
  apiRouter.use('/customers', customerRouter);
  apiRouter.use('/tasks', taskRouter);
  apiRouter.use('/finance', financeRouter);
  apiRouter.use('/messages', messageRouter);
  
  app.use('/api', apiRouter);
}