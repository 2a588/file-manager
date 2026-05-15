import { Router } from 'express';
import { db } from '../services/database';
import { join } from 'path';
import { createReadStream, statSync } from 'fs';

export const filesRouter = Router();

filesRouter.get('/', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const sortBy = (req.query.sortBy as string) || 'scanned_at';
  const sortOrder = (req.query.sortOrder as string) || 'DESC';
  
  const result = db.getFilesWithPagination(page, pageSize, sortBy, sortOrder);
  res.json({ 
    success: true, 
    data: result.files,
    pagination: {
      page,
      pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / pageSize)
    }
  });
});

filesRouter.get('/stats', (_req, res) => {
  const stats = db.getStats();
  res.json({ success: true, data: stats });
});

filesRouter.get('/folders', (_req, res) => {
  const tree = db.getFolderTree();
  res.json({ success: true, data: tree });
});

filesRouter.get('/recent', (req, res) => {
  const days = parseInt(req.query.days as string) || 7;
  const files = db.getRecentFiles(days);
  res.json({ success: true, data: files });
});

filesRouter.get('/duplicates', (_req, res) => {
  const duplicates = db.getDuplicateFiles();
  res.json({ success: true, data: duplicates });
});

filesRouter.get('/bookmarked', (_req, res) => {
  const files = db.getBookmarkedFiles();
  res.json({ success: true, data: files });
});

filesRouter.post('/batch-delete', (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: '请提供要删除的文件ID列表' });
  }
  const deleted = db.batchDeleteFiles(ids);
  res.json({ success: true, message: `已删除 ${deleted} 个文件` });
});

filesRouter.post('/:id/bookmark', (req, res) => {
  const id = parseInt(req.params.id);
  const file = db.getFileById(id);
  if (!file) {
    return res.status(404).json({ success: false, message: '文件未找到' });
  }
  const bookmarked = db.toggleBookmark(id);
  res.json({ success: true, data: { bookmarked } });
});

filesRouter.get('/folder', (req, res) => {
  const path = req.query.path as string;
  if (!path) {
    return res.status(400).json({ success: false, message: '请提供文件夹路径' });
  }
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const result = db.getFilesByFolder(path, page, pageSize);
  res.json({
    success: true,
    data: result.files,
    pagination: {
      page,
      pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / pageSize),
    },
  });
});

filesRouter.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const file = db.getFileById(id);
  if (!file) {
    return res.status(404).json({ success: false, message: '文件未找到' });
  }
  res.json({ success: true, data: file });
});

filesRouter.get('/:id/download', (req, res) => {
  const id = parseInt(req.params.id);
  const file = db.getFileById(id) as any;
  if (!file) {
    return res.status(404).json({ success: false, message: '文件未找到' });
  }
  res.download(file.original_path, file.filename);
});

filesRouter.get('/:id/preview', (req, res) => {
  const id = parseInt(req.params.id);
  const file = db.getFileById(id) as any;
  if (!file) {
    return res.status(404).json({ success: false, message: '文件未找到' });
  }

  const filePath = file.original_path;
  const mimeType = file.mime_type || 'application/octet-stream';

  try {
    const stat = statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mimeType,
      });

      createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
      });

      createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '文件读取失败' });
  }
});

filesRouter.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const file = db.getFileById(id) as any;
  if (!file) {
    return res.status(404).json({ success: false, message: '文件未找到' });
  }
  db.deleteFile(id);
  res.json({ success: true, message: '已删除文件记录' });
});
