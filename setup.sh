#!/bin/bash

echo "📁 文件管理系统 - 安装脚本"
echo "================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✅ npm $(npm --version)"

# 安装依赖
echo ""
echo "📦 安装依赖..."
npm install

# 创建必要目录
echo ""
echo "📁 创建目录..."
mkdir -p data logs

# 完成
echo ""
echo "================================"
echo "✅ 安装完成！"
echo ""
echo "📌 下一步："
echo "1. 编辑 config/config.ts 修改文件目录路径"
echo "2. 运行 npm start 启动服务"
echo "3. 打开浏览器访问 http://localhost:3000"
echo ""
