import { Router } from 'express';
import { createScanner } from '../services/scanner';
import { config } from '../../config/config';
import { logger } from '../services/logger';

export const scanRouter = Router();

scanRouter.post('/start', async (req, res) => {
  try {
    const { rootPath, scanType } = req.body;
    const path = rootPath || config.rootPath;

    logger.info(`收到扫描请求: ${path}, 类型: ${scanType || 'full'}`);

    const scanner = createScanner(path);
    const result = await scanner.scan(scanType || 'full');

    res.json({
      success: true,
      message: '扫描完成',
      data: result,
    });
  } catch (error) {
    logger.error(`扫描失败: ${error}`);
    res.status(500).json({
      success: false,
      message: '扫描失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

scanRouter.get('/status', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'idle',
    },
  });
});
