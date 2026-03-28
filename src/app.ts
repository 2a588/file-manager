import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/config';
import { scanRouter } from './routes/scan';
import { filesRouter } from './routes/files';
import { searchRouter } from './routes/search';
import { statsRouter } from './routes/stats';
import { logger } from './services/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

app.use(express.static(join(__dirname, '../public')));

app.use('/api/scan', scanRouter);
app.use('/api/files', filesRouter);
app.use('/api/search', searchRouter);
app.use('/api/stats', statsRouter);

app.get('/', (_req, res) => {
  res.json({
    name: 'File Manager',
    version: '1.0.0',
    endpoints: {
      scan: {
        'POST /api/scan/start': '开始扫描 (body: { rootPath, scanType })',
        'GET /api/scan/status': '获取扫描状态',
      },
      files: {
        'GET /api/files': '获取文件列表',
        'GET /api/files/stats': '获取统计信息',
        'GET /api/files/:id': '获取文件详情',
        'GET /api/files/:id/download': '下载文件',
        'GET /api/files/:id/preview': '预览文件',
        'DELETE /api/files/:id': '删除文件记录',
      },
      search: {
        'GET /api/search?q=keyword': '关键词搜索',
        'GET /api/search?type=media': '按类型搜索',
        'GET /api/search?tag=videos': '按标签搜索',
        'GET /api/search/tags': '获取所有标签',
        'GET /api/search/tags/:tagName': '获取标签下的文件',
      },
      stats: {
        'POST /api/stats/record': '记录文件点击/播放 (body: { fileId, actionType })',
        'GET /api/stats/file/:id': '获取单个文件统计',
        'GET /api/stats/overall': '获取总体统计',
        'GET /api/stats/top': '获取热门文件排行',
      },
    },
  });
});

app.listen(config.port, '0.0.0.0', () => {
  logger.info(`服务器运行在 http://0.0.0.0:${config.port}`);
  logger.info(`API文档: http://0.0.0.0:${config.port}/`);
});

export default app;
