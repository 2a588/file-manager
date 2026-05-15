# MVP1 - 核心优化

> 🔥 P0 优先级：高价值 / 低工作量 ✅ 已完成

## 修改详情

### 1. 添加图片支持

| 文件 | 改动 |
|------|------|
| `config/config.ts` | `fileTypeMap` 新增 `image` 类型（jpg/jpeg/png/gif/svg/webp/bmp/ico） |
| `src/utils/fileType.ts` | `getMimeType()` 新增 8 种图片 MIME 类型映射 |
| `public/index.html` | 图片图标 `🖼️`、图片预览 `<img>` 渲染、统计卡片、类型筛选选项 |

### 2. 真实扫描进度

| 文件 | 改动 |
|------|------|
| `src/services/scanner.ts` | 新增 `scanProgress` 模块级对象，扫描中实时更新总文件数/已处理/已新增/已跳过/当前文件路径 |
| `src/routes/scan.ts` | `GET /api/scan/status` 返回 `scanProgress` 实时数据（不再是固定 idle） |

### 3. 搜索支持分页

| 文件 | 改动 |
|------|------|
| `src/services/database.ts` | 新增 `searchFilesPaginated()` / `searchByTypePaginated()` / `searchByTagPaginated()` 三个分页方法 |
| `src/routes/search.ts` | `GET /search` 和 `GET /search/tags/:tagName` 均支持 `page`/`pageSize` 参数，返回 `pagination` 对象 |
| `public/index.html` | 前端搜索/筛选流程重构：统一使用 `currentMode` + `currentQuery` 追踪状态，所有查询走 API 分页 |

### 4. 文件排序

| 文件 | 改动 |
|------|------|
| `src/services/database.ts` | `getFilesWithPagination()` 新增 `sortBy`/`sortOrder` 参数，白名单校验防注入 |
| `src/routes/files.ts` | `GET /api/files` 新增 `sortBy`/`sortOrder` 查询参数 |
| `public/index.html` | 工具栏新增排序下拉框（扫描时间/文件名/文件大小/修改时间 + 升降序），偏好保存到 localStorage |

### 5. 定时自动扫描

| 文件 | 改动 |
|------|------|
| `config/config.ts` | 新增 `autoScan` 配置项（`enabled: boolean`, `interval: number`） |
| `src/app.ts` | 启动时检查 `autoScan.enabled`，若开启则执行初始扫描 + `setInterval` 定时扫描 |

### 6. 键盘快捷键

| 文件 | 改动 |
|------|------|
| `public/index.html` | 全局 `keydown` 监听：`f` 聚焦搜索、`n`/`p` 翻页、`g`/`l` 视图切换、`s`/`b` 标签切换、`Esc` 关闭弹窗 |

---

*关联文件: `MVP.md`*
*最后更新: 2026-05-15 (全部完成)*
