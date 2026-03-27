# AGENTS.md

> **AI Agent 上下文文档**
>
> 此文件为 AI 助手（如 opencode、GitHub Copilot 等）提供项目上下文信息。

---

## 📋 项目概述

**文件管理系统 (File Manager)** 是一个本地文件管理工具，用于扫描、分类和管理用户的多媒体文件和文档。

### 核心用途

- 扫描本地目录中的文件
- 自动识别文件类型（视频、音频、文档、HTML）
- 为文件自动生成标签
- 提供搜索和筛选功能
- 通过 Web 界面管理文件
- 支持文件在线预览（视频、音频、PDF、TXT）
- 文件点击/播放统计功能

---

## 🗂️ 项目结构

```
file-manager/
├── src/
│   ├── services/           # 核心服务层
│   │   ├── database.ts     # SQLite 数据库操作
│   │   ├── scanner.ts      # 文件扫描逻辑
│   │   └── logger.ts       # 日志记录
│   ├── routes/             # API 路由
│   │   ├── scan.ts         # 扫描相关接口
│   │   ├── files.ts        # 文件 CRUD 接口
│   │   ├── search.ts       # 搜索接口
│   │   └── stats.ts        # 统计接口
│   ├── utils/              # 工具函数
│   │   └── fileType.ts     # 文件类型识别
│   └── app.ts              # Express 应用入口
├── config/
│   └── config.ts           # 配置文件
├── public/
│   └── index.html          # 前端界面（原生 JS）
├── data/
│   └── files.db            # SQLite 数据库文件
├── logs/                   # 日志目录
├── MVP.md                  # MVP 进度报告
├── PROJECT.md              # 完整项目文档
├── AGENTS.md               # AI 上下文文档
├── QUICKSTART.md           # 快速开始指南
├── package.json
└── tsconfig.json
```

---

## 🚀 当前版本状态

| 版本 | 状态 | 完成度 |
|------|------|--------|
| MVP 核心功能 | ✅ 完成 | 100% |
| MVP2 文件预览 | ✅ 完成 | 100% |
| MVP3 增强功能 | ✅ 完成 | 100% |

---

## ✨ 已完成功能

### MVP 核心功能
- 递归扫描目录结构
- 自动识别文件类型（视频/音频/文档/HTML）
- 提取文件元数据
- SQLite 数据库存储
- 标签系统（文件夹标签、类型标签、分类标签）
- 关键词搜索、类型筛选、标签筛选
- RESTful API 接口
- Web 前端界面

### MVP2 文件预览
- 视频播放器（MP4、AVI、MKV、MOV 等）
- 音频播放器（MP3、OGG、WAV、FLAC、AAC、M4A）
- PDF 阅读器（iframe 嵌入）
- TXT 文本阅读器
- 模态窗口预览界面
- 范围请求支持（视频拖动播放）
- 全屏播放支持
- 下载功能

### MVP3 增强功能
- 分页功能（支持 10/20/50 条每页）
- 展示模式切换（图标视图/列表视图）
- 用户偏好保存（localStorage）
- 统计分析页面
  - 总点击/播放次数
  - 今日点击/播放统计
  - 热门文件排行 TOP 10
  - 按类型统计
- 文件点击/播放记录

---

## 🛣️ API 路由

### 扫描 (`/api/scan`)
- `POST /start` - 开始扫描
- `GET /status` - 获取扫描状态

### 文件 (`/api/files`)
- `GET /` - 获取文件列表（支持分页）
- `GET /stats` - 获取统计信息
- `GET /:id` - 获取文件详情
- `GET /:id/download` - 下载文件
- `GET /:id/preview` - 预览文件（支持范围请求）
- `DELETE /:id` - 删除文件记录

### 搜索 (`/api/search`)
- `GET /?q=keyword` - 关键词搜索
- `GET /?type=media` - 按类型筛选
- `GET /?tag=videos` - 按标签筛选
- `GET /tags` - 获取所有标签
- `GET /tags/:tagName` - 获取标签下的文件

### 统计 (`/api/stats`)
- `POST /record` - 记录点击/播放
- `GET /overall` - 获取总体统计
- `GET /file/:id` - 获取文件统计
- `GET /top` - 获取热门文件排行

---

## 📁 支持的文件格式

| 类别 | 格式 |
|------|------|
| 视频 | MP4, AVI, MKV, MOV, WMV, FLV, WebM |
| 音频 | MP3, OGG, WAV, FLAC, AAC, WMA, M4A |
| 文档 | PDF, TXT, DOC, DOCX, XLS, XLSX, PPT, PPTX, RTF, ODT |
| 网页 | HTML, HTM |

---

## 🔧 技术栈

| 组件 | 技术 |
|------|------|
| 运行时 | Node.js 18+ |
| 后端框架 | Express.js |
| 数据库 | SQLite (better-sqlite3) |
| 前端 | 原生 HTML/CSS/JavaScript |
| 类型系统 | TypeScript |
| 包管理 | npm |

---

## 📊 数据库架构

### 表结构

1. **files** - 文件信息表
   - 存储文件名、路径、类型、大小等元数据
   - `original_path` 有唯一约束，防止重复导入

2. **tags** - 标签表
   - 存储标签名称和类型
   - 标签类型：`folder`（文件夹）、`filetype`（文件类型）、`category`（分类）

3. **file_tags** - 文件标签关联表
   - 多对多关系
   - 删除文件时级联删除关联

4. **scan_logs** - 扫描日志表
   - 记录每次扫描的结果

5. **file_stats** - 文件统计表（新增）
   - 记录文件点击和播放事件

---

## ⚙️ 配置说明

配置文件：`config/config.ts`

```typescript
export const config = {
  port: 3000,                    // 服务器端口
  rootPath: '/mnt/d/mCloudDownload',  // 默认扫描目录
  database: {
    path: './data/files.db'      // 数据库路径
  },
  logs: {
    path: './logs'               // 日志目录
  },
  fileTypeMap: {
    media: {
      video: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'],
      audio: ['mp3', 'ogg', 'wav', 'flac', 'aac', 'wma', 'm4a']
    },
    document: ['pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rtf', 'odt'],
    html: ['html', 'htm']
  }
};
```

---

## 🔄 常见操作

### 启动服务
```bash
cd /app/file-manager
npm run dev
# 访问 http://localhost:3000
```

### 修改扫描目录
编辑 `config/config.ts`，修改 `rootPath` 字段。

### 添加新文件类型
编辑 `config/config.ts`，在 `fileTypeMap` 中添加新格式。

---

## ⚠️ 注意事项

1. **路径唯一性**: 文件的 `original_path` 必须唯一，重复扫描会自动跳过
2. **权限**: 确保程序有读取目标目录的权限
3. **ES Modules**: 项目使用 ES 模块
4. **数据库位置**: 数据库文件在 `data/files.db`
5. **日志**: 扫描日志在 `logs/` 目录

---

## 🐛 已知限制

1. 不支持文件内容全文索引
2. 不支持实时文件监听
3. 不支持用户认证
4. 不支持文件移动/重命名操作
5. 不支持批量操作

---

## 📦 依赖包

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "better-sqlite3": "^9.4.3"
  },
  "devDependencies": {
    "tsx": "^4.7.0",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/better-sqlite3": "^7.6.8"
  }
}
```

---

## 📖 相关文档

- `PROJECT.md` - 完整项目文档
- `MVP.md` - MVP 进度报告
- `QUICKSTART.md` - 快速开始指南

---

## 🧪 测试

```bash
# 健康检查
curl http://localhost:3000/

# 扫描
curl -X POST http://localhost:3000/api/scan/start \
  -H "Content-Type: application/json" \
  -d '{"rootPath": "/app/test-files"}'

# 获取文件（分页）
curl "http://localhost:3000/api/files?page=1&pageSize=10"

# 搜索
curl "http://localhost:3000/api/search?q=test"

# 记录统计
curl -X POST http://localhost:3000/api/stats/record \
  -H "Content-Type: application/json" \
  -d '{"fileId": 1, "actionType": "click"}'

# 获取统计
curl http://localhost:3000/api/stats/overall
```

---

*此文件由 AI 助手自动生成，用于提供项目上下文。*
*最后更新: 2026-03-27*