# 文件管理系统 (File Manager)

## 📋 项目概述

一个基于 Node.js + Express + SQLite 的本地文件管理系统，支持自动扫描、分类和管理多媒体文件和文档。

### 支持的文件类型

| 类别 | 格式 |
|------|------|
| 视频 | MP4, AVI, MKV, MOV, WMV, FLV, WebM |
| 音频 | MP3, OGG, WAV, FLAC, AAC, WMA, M4A |
| 文档 | PDF, TXT, DOC, DOCX, XLS, XLSX, PPT, PPTX, RTF, ODT |
| 网页 | HTML, HTM |

---

## 🏗️ 技术架构

### 技术栈

| 组件 | 技术选型 |
|------|----------|
| 运行时 | Node.js 18+ |
| 后端框架 | Express.js |
| 数据库 | SQLite (better-sqlite3) |
| 前端 | 原生 HTML/CSS/JavaScript |
| 包管理 | npm |

### 项目结构

```
file-manager/
├── src/
│   ├── services/
│   │   ├── database.ts      # SQLite数据库服务
│   │   ├── scanner.ts       # 文件扫描服务
│   │   └── logger.ts        # 日志服务
│   ├── routes/
│   │   ├── scan.ts          # 扫描API路由
│   │   ├── files.ts         # 文件API路由
│   │   └── search.ts        # 搜索API路由
│   ├── utils/
│   │   └── fileType.ts      # 文件类型识别工具
│   └── app.ts               # 主应用入口
├── config/
│   └── config.ts            # 配置文件
├── public/
│   └── index.html           # 前端界面
├── data/
│   └── files.db             # SQLite数据库
├── logs/                    # 日志目录
├── package.json
└── tsconfig.json
```

---

## 📊 数据库设计

### 文件表 (files)

```sql
CREATE TABLE files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_path TEXT NOT NULL UNIQUE,
    relative_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    mime_type TEXT,
    file_extension TEXT,
    file_size INTEGER,
    parent_folder TEXT,
    folder_hierarchy TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified_at DATETIME,
    scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 标签表 (tags)

```sql
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    tag_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 文件标签关联表 (file_tags)

```sql
CREATE TABLE file_tags (
    file_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (file_id, tag_id),
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

### 扫描日志表 (scan_logs)

```sql
CREATE TABLE scan_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    root_path TEXT NOT NULL,
    scan_type TEXT,
    files_found INTEGER DEFAULT 0,
    files_added INTEGER DEFAULT 0,
    files_skipped INTEGER DEFAULT 0,
    errors TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    status TEXT DEFAULT 'running'
);
```

---

## 🔌 API 文档

### 扫描相关

#### 开始扫描
```
POST /api/scan/start
Content-Type: application/json

{
  "rootPath": "/path/to/files",
  "scanType": "full"
}

Response:
{
  "success": true,
  "message": "扫描完成",
  "data": {
    "totalFiles": 35,
    "addedFiles": 32,
    "skippedFiles": 3,
    "errors": []
  }
}
```

#### 获取扫描状态
```
GET /api/scan/status

Response:
{
  "success": true,
  "data": {
    "status": "idle"
  }
}
```

### 文件相关

#### 获取文件列表
```
GET /api/files

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "filename": "video.mp4",
      "original_path": "/path/to/video.mp4",
      "relative_path": "video.mp4",
      "file_type": "media",
      "mime_type": "video/mp4",
      "file_extension": "mp4",
      "file_size": 1024000,
      "parent_folder": "root",
      "folder_hierarchy": "[]",
      "scanned_at": "2026-03-27 12:00:00"
    }
  ]
}
```

#### 获取统计信息
```
GET /api/files/stats

Response:
{
  "success": true,
  "data": {
    "total": 38,
    "byType": [
      {"file_type": "media", "count": 34},
      {"file_type": "document", "count": 3},
      {"file_type": "html", "count": 1}
    ]
  }
}
```

#### 获取文件详情
```
GET /api/files/:id

Response:
{
  "success": true,
  "data": { ... }
}
```

#### 下载文件
```
GET /api/files/:id/download
```

#### 删除文件记录
```
DELETE /api/files/:id

Response:
{
  "success": true,
  "message": "已删除文件记录"
}
```

### 搜索相关

#### 关键词搜索
```
GET /api/search?q=keyword

Response:
{
  "success": true,
  "data": [ ... ]
}
```

#### 按类型搜索
```
GET /api/search?type=media

Response:
{
  "success": true,
  "data": [ ... ]
}
```

#### 按标签搜索
```
GET /api/search?tag=videos

Response:
{
  "success": true,
  "data": [ ... ]
}
```

#### 获取所有标签
```
GET /api/search/tags

Response:
{
  "success": true,
  "data": [
    {"id": 1, "name": "media", "tag_type": "folder"},
    {"id": 2, "name": "mp4", "tag_type": "filetype"}
  ]
}
```

#### 获取标签下的文件
```
GET /api/search/tags/:tagName

Response:
{
  "success": true,
  "data": [ ... ]
}
```

---

## ⚙️ 配置说明

### 配置文件 (config/config.ts)

```typescript
export const config = {
  port: 3000,                    // 服务器端口
  rootPath: '/你的文件根目录',    // 默认扫描目录
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

## 🚀 使用指南

### 安装依赖

```bash
cd file-manager
npm install
```

### 启动服务

```bash
# 开发模式 (热重载)
npm run dev

# 生产模式
npm start
```

### 访问界面

打开浏览器访问: http://localhost:3000

### 使用步骤

1. 点击"扫描文件"按钮
2. 输入文件目录路径
3. 点击"开始扫描"
4. 等待扫描完成
5. 浏览、搜索、筛选文件

---

## 🔍 当前扫描结果

### 测试目录: /mnt/d/mCloudDownload

| 统计项 | 数量 |
|--------|------|
| 总文件数 | 38 |
| 媒体文件 | 34 |
| 文档文件 | 3 |
| HTML文件 | 1 |

### 文件类型分布

| 类型 | 数量 | 格式 |
|------|------|------|
| MP4 | 16 | 视频 |
| MP3 | 3 | 音频 |
| AAC | 9 | 音频 |
| FLAC | 1 | 音频 |
| M4A | 1 | 音频 |
| OGG | 1 | 音频 |
| PDF | 2 | 文档 |
| TXT | 1 | 文档 |
| HTML | 1 | 网页 |

### 文件夹结构

```
/mnt/d/mCloudDownload
├── (根目录) - 12个文件
├── 抖音/ - 9个文件
├── 抖音录播/ - 1个文件
├── 新概念英语3/
│   ├── (根目录) - 1个文件
│   └── 2x/ - 1个文件
```

---

## 🛠️ 开发计划

### 已完成 ✅

- [x] 项目基础架构搭建
- [x] SQLite数据库设计与实现
- [x] 文件扫描服务
- [x] 文件类型识别
- [x] 标签系统
- [x] 搜索功能
- [x] RESTful API
- [x] 前端界面
- [x] 统计功能
- [x] 文件预览功能（视频/音频/PDF/TXT）
- [x] 分页功能
- [x] 展示模式切换（图标/列表视图）
- [x] 统计分析页面

### 待开发 📋

- [ ] 定时自动扫描
- [ ] 文件监听 (自动检测新增文件)
- [ ] 用户认证
- [ ] 文件分享
- [ ] 批量操作
- [ ] 高级搜索 (正则、日期范围等)

---

## 📝 注意事项

1. **文件路径**: 配置中的 `rootPath` 需要修改为实际的文件目录
2. **权限**: 确保程序有读取目标目录的权限
3. **数据库**: 数据库文件存储在 `data/files.db`
4. **日志**: 扫描日志存储在 `logs/` 目录
5. **去重**: 重复扫描会自动跳过已存在的文件

---

## 🐛 常见问题

### Q: 扫描没有发现文件？
A: 检查路径是否正确，以及程序是否有读取权限

### Q: 如何重新扫描？
A: 再次调用扫描API，已存在的文件会自动跳过

### Q: 如何删除文件记录？
A: 调用 `DELETE /api/files/:id` 接口

### Q: 支持哪些文件格式？
A: 在 `config/config.ts` 中的 `fileTypeMap` 配置

---

## 📄 许可证

MIT License

---

## 👨‍💻 开发信息

- **开发日期**: 2026-03-27
- **技术栈**: Node.js + Express + SQLite
- **当前版本**: 1.0.0
