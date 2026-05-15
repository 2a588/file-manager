# MVP2 - 体验增强

> ⚡ P1 优先级：中等价值 / 中等工作量 ✅ 已完成

## 修改详情

### 1. 文件夹目录浏览

| 文件 | 改动 |
|------|------|
| `src/services/database.ts` | 新增 `getFolderTree()` 从 `folder_hierarchy` 构建树结构 |
| `src/routes/files.ts` | `GET /api/files/folders` 返回文件夹树；`GET /api/files/folder?path=` 按路径筛选 |
| `public/index.html` | 工具栏新增「目录」按钮切换侧栏，可展开/折叠文件夹树，点击筛选文件 |

### 2. 暗色模式

| 文件 | 改动 |
|------|------|
| `public/index.html` | CSS `:root` / `.dark-mode` 自定义属性覆盖所有颜色；头部切换按钮；偏好保存到 localStorage |

### 3. 批量操作

| 文件 | 改动 |
|------|------|
| `src/services/database.ts` | 新增 `batchDeleteFiles(ids)` 使用事务批量删除 |
| `src/routes/files.ts` | `POST /api/files/batch-delete` 批量删除接口 |
| `public/index.html` | 文件卡片新增复选框；选中后显示批量操作栏（批量删除） |

### 4. 收藏/书签功能

| 文件 | 改动 |
|------|------|
| `src/services/database.ts` | 新增 `bookmarks` 表 + `toggleBookmark()` / `getBookmarkedFiles()` / `isBookmarked()` |
| `src/routes/files.ts` | `POST /api/files/:id/bookmark` 切换书签；`GET /api/files/bookmarked` 获取书签列表 |
| `public/index.html` | 文件卡片右上角星标按钮；⭐ 已收藏 / ☆ 未收藏；状态实时同步 |

### 5. 图像预览

✅ 已在 MVP1 完成

### 6. 最近文件

| 文件 | 改动 |
|------|------|
| `src/services/database.ts` | 新增 `getRecentFiles(days)` 按扫描时间倒序查询 |
| `src/routes/files.ts` | `GET /api/files/recent?days=7` 获取最近文件 |
| `public/index.html` | 导航标签新增「最近文件」页面，展示文件列表 |

### 7. 重复文件检测

| 文件 | 改动 |
|------|------|
| `src/services/database.ts` | 新增 `getDuplicateFiles()` 按 `filename + file_size` 分组查出重复 |
| `src/routes/files.ts` | `GET /api/files/duplicates` 获取重复文件列表 |
| `public/index.html` | 导航标签新增「重复文件」页面，按组展示所有重复项 |

---

*关联文件: `MVP.md`*
*最后更新: 2026-05-15 (全部完成)*
