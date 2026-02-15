import { WebSocketServer } from 'ws';
import { PrismaClient } from '@prisma/client';
export declare function setupWebSocket(wss: WebSocketServer, prisma: PrismaClient): void;
