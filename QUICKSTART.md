# 快速开始指南

## 1️⃣ 环境要求

- Node.js 18+
- npm

## 2️⃣ 安装

```bash
# 进入项目目录
cd file-manager

# 安装依赖
npm install
```

## 3️⃣ 配置

编辑 `config/config.ts`，修改文件根目录：

```typescript
export const config = {
  port: 3000,
  rootPath: '/你的文件目录',  // ← 修改这里
  // ...
};
```

## 4️⃣ 启动

```bash
npm start
```

## 5️⃣ 访问

打开浏览器：http://localhost:3000

## 6️⃣ 扫描文件

1. 点击"扫描文件"
2. 输入目录路径
3. 点击"开始扫描"

## 7️⃣ 使用界面

- 🔍 搜索文件
- 🏷️ 按标签筛选
- 📁 按类型筛选
- 📊 查看统计

---

## 命令行使用

### 扫描文件
```bash
curl -X POST http://localhost:3000/api/scan/start \
  -H "Content-Type: application/json" \
  -d '{"rootPath": "/你的文件目录"}'
```

### 获取文件列表
```bash
curl http://localhost:3000/api/files
```

### 搜索文件
```bash
curl "http://localhost:3000/api/search?q=关键词"
```

### 获取统计
```bash
curl http://localhost:3000/api/files/stats
```
