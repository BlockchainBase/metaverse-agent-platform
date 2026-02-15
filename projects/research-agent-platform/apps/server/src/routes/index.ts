import { Router } from 'express';
import { authRouter } from './auth';
import { userRouter } from './user';
import { customerRouter } from './customer';
import { projectRouter } from './project';
import { taskRouter } from './task';
import { financeRouter } from './finance';
import { documentRouter } from './document';
import { dashboardRouter } from './dashboard';
import { agentRouter } from './agent';
import { metaverseRouter } from './metaverse';

export function setupRoutes(app: Router) {
  const apiRouter = Router();
  
  // Public routes
  apiRouter.use('/auth', authRouter);
  
  // Protected routes (will add auth middleware later)
  apiRouter.use('/users', userRouter);
  apiRouter.use('/customers', customerRouter);
  apiRouter.use('/projects', projectRouter);
  apiRouter.use('/tasks', taskRouter);
  apiRouter.use('/finance', financeRouter);
  apiRouter.use('/documents', documentRouter);
  apiRouter.use('/dashboard', dashboardRouter);
  apiRouter.use('/agents', agentRouter);
  apiRouter.use('/metaverse', metaverseRouter);
  
  app.use('/api', apiRouter);
}