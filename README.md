# File Manager

一个基于 Node.js + Express + SQLite 的本地文件管理系统。

## 功能

- 📂 递归扫描目录
- 🏷️ 自动标签分类（文件夹、类型、分类）
- 🔍 搜索与筛选
- 🎬 文件在线预览（视频、音频、PDF、TXT）
- 📊 统计分析（点击/播放次数）
- 📱 分页与视图切换

## 支持格式

| 类型 | 格式 |
|------|------|
| 视频 | MP4, AVI, MKV, MOV, WMV, FLV, WebM |
| 音频 | MP3, OGG, WAV, FLAC, AAC, WMA, M4A |
| 文档 | PDF, TXT, DOC, DOCX, XLS, XLSX, PPT, PPTX |
| 网页 | HTML, HTM |

## 快速开始

```bash
# 克隆项目
git clone https://github.com/2a588/file-manager.git
cd file-manager

# 安装依赖
npm install

# 启动服务
npm run dev
```

访问 http://localhost:3000

## 技术栈

- Node.js 18+
- Express.js
- SQLite (better-sqlite3)
- 原生 HTML/CSS/JS

## License

MIT