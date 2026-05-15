# MVP3 - 代码质量

> 🧹 P2 优先级：代码质量改进 ✅ 已完成

## 修改详情

### 1. 消除 `as any` 类型

| 文件 | 改动 |
|------|------|
| `src/services/database.ts` | 新增 `CountResult`、`FileRow` 接口；全部 16 处 `as any` 替换为正确类型 |
| `src/routes/files.ts` | 3 处 `as any` 替换为 `as FileRow`；导入 `FileRow` 类型 |

### 2. 前端 JS/CSS 拆分

| 文件 | 改动 |
|------|------|
| `public/index.html` | 移除全部内联 `<style>` 和 `<script>`；引用外部 `style.css` 和 `app.js` |
| `public/style.css` | 新建 — 全部 CSS（含媒体查询、暗色模式变量） |
| `public/app.js` | 新建 — 全部 JavaScript（含所有功能函数） |

### 3. 请求体校验

| 文件 | 改动 |
|------|------|
| `src/routes/scan.ts` | `POST /start` 校验 `rootPath` 类型 |
| `src/routes/stats.ts` | `POST /record` 校验 `fileId` 为数字、`actionType` 为 `click`/`play` |
| `src/routes/files.ts` | `POST /batch-delete` 校验 `ids` 数组元素均为数字；`/download` `/preview` `/delete` 校验 `id` 有效性 |

### 4. 删除物理文件选项

| 文件 | 改动 |
|------|------|
| `src/routes/files.ts` | `DELETE /api/files/:id?deleteFile=true` 同步删除磁盘文件（`unlinkSync`） |

---

*关联文件: `MVP.md`*
*最后更新: 2026-05-15 (全部完成)*
