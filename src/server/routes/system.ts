import { Router, Request, Response } from 'express';
import os from 'os';

export const systemRouter = Router();

systemRouter.get('/status', (_req: Request, res: Response) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  
  res.json({
    status: 'ONLINE',
    uptimeSeconds: Math.floor(uptime),
    memoryRssMb: (memory.rss / 1024 / 1024).toFixed(2),
    heapUsedMb: (memory.heapUsed / 1024 / 1024).toFixed(2),
    nodeVersion: process.version,
    platform: `${os.type()} ${os.release()} (${os.arch()})`,
    timestamp: new Date().toISOString()
  });
});

systemRouter.get('/ping', (_req: Request, res: Response) => {
  res.json({ pong: true, time: Date.now() });
});
