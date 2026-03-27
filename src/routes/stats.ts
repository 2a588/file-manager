import { Router } from 'express';
import { db } from '../services/database';

export const statsRouter = Router();

// 记录统计
statsRouter.post('/record', (req, res) => {
  const { fileId, actionType } = req.body;
  
  if (!fileId || !actionType) {
    return res.status(400).json({ success: false, message: '参数不完整' });
  }
  
  try {
    if (actionType === 'click') {
      db.recordFileClick(fileId);
    } else if (actionType === 'play') {
      db.recordFilePlay(fileId);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: '记录失败' });
  }
});

// 获取文件统计
statsRouter.get('/file/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const stats = db.getFileStats(id);
  res.json({ success: true, data: stats });
});

// 获取总体统计
statsRouter.get('/overall', (req, res) => {
  const stats = db.getOverallStats();
  const topFiles = db.getTopFiles(10);
  const typeStats = db.getStatsByType();
  res.json({ success: true, data: { ...stats, topFiles, typeStats } });
});

// 获取热门文件
statsRouter.get('/top', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const topFiles = db.getTopFiles(limit);
  res.json({ success: true, data: topFiles });
});