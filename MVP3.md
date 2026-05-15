# MVP3 - 代码质量

> 🧹 P2 优先级：代码质量改进

## 任务列表

- [ ] **消除 `as any` 类型** - `database.ts` 和 `routes/` 中有多处 `as any`，应加正确类型
- [ ] **前端 JS/CSS 拆分** - `public/index.html` 长 1700 行，JS、CSS、HTML 混在一起
- [ ] **请求体校验** - 所有 POST body 无校验，无效输入导致崩溃
- [ ] **删除物理文件选项** - `DELETE /api/files/:id` 只删数据库记录，可选同时删除磁盘文件

---

*关联文件: `MVP.md`*
*最后更新: 2026-05-15*
