# 倾城之恋 项目启动与开发指南

本项目是一个基于 React (Vite) 和 Express 的全栈应用，使用 Supabase 作为后端数据库。

## 1. 环境准备

### 必备条件
- **Node.js**: 建议版本 18.x 或更高
- **npm**: 项目包管理器

### 依赖安装
在项目根目录下运行：
```bash
npm install
```

## 2. 数据库配置 (Supabase)

本项目依赖 Supabase。你需要：

1.  **创建项目**: 在 [Supabase](https://supabase.com/) 创建一个新项目。
2.  **执行 SQL**: 将项目根目录下的 `database.sql` 内容复制并粘贴到 Supabase 的 **SQL Editor** 中运行，以创建必要的表（users, messages, likes, notifications）和 RLS 策略。
3.  **环境变量**: 修改根目录下的 `.env` 文件（或创建 `.env.local`），确保以下变量正确配置：
    ```env
    SUPABASE_URL=你的Supabase项目URL
    SUPABASE_ANON_KEY=你的Supabase匿名Key
    VITE_SUPABASE_URL=你的Supabase项目URL
    VITE_SUPABASE_ANON_KEY=你的Supabase匿名Key
    ```

## 3. 运行项目

你需要打开两个终端，分别运行后端和前端。

### 终端 1: 启动后端服务器
后端主要处理一些复杂的逻辑或 API 转发（如果需要）。
```bash
npm run start:backend
```
默认运行在: `http://localhost:3001`

### 终端 2: 启动前端开发服务器
```bash
npm run dev
```
默认运行在: `http://localhost:3000`

## 4. 数据初始化 (可选)

如果你需要快速填充一些测试数据，可以使用种子脚本：
```bash
npm run seed
```
> **注意**: 运行 `seed` 会清空当前数据库中的部分数据并插入预设的测试用户和消息。

## 5. 项目结构说明

- `/src`: 前端 React 源代码。
- `/server`: 后端 Express 源代码。
- `vite.config.ts`: Vite 配置文件，处理前端构建和代理。
- `database.sql`: 数据库建表脚本。
- `.env`: 环境变量配置。
