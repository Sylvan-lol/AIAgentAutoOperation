# Open Claw - 企业级 AI 助手

一个基于 LLM Function Calling 的智能 AI 助手，支持通过自然语言操控文件系统和发送邮件。

## 📋 项目简介

Open Claw 是一个前后端分离的企业级 AI 助手系统。用户可以通过自然语言与 AI 对话，AI 会智能判断用户意图，自动调用文件管理或邮件发送等工具来完成用户请求。

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | Vue 3 (Composition API + `<script setup>`) + Pinia + Tailwind CSS + Vite |
| **后端** | Node.js + Express + OpenAI SDK + Nodemailer + SQLite |
| **AI 模型** | 通过 OpenRouter 调用 LLM（支持任意 OpenAI 兼容接口） |
| **认证** | JWT (JSON Web Token) |
| **构建工具** | Vite |
| **状态管理** | Pinia + 持久化插件 |

## 🏗 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        前端 (Vue 3 + Vite)                       │
│  ┌──────────────────────┐        ┌──────────────────────────┐   │
│  │   Chat 聊天组件       │        │   FileList 文件管理组件   │   │
│  │   - SSE 流式输出      │        │   - 文件列表展示         │   │
│  │   - 对话记忆          │        │   - 创建/编辑/删除       │   │
│  └──────────┬───────────┘        └──────────┬───────────────┘   │
│             │                               │                    │
│        ┌────▼───────────────────────────────▼────┐              │
│        │         Pinia Store (状态管理)            │              │
│        │    chatStore.js / fileStore.js           │              │
│        └───────────────────┬─────────────────────┘              │
│                            │                                    │
│                    ┌───────▼───────┐                            │
│                    │  Axios API 层  │                            │
│                    │  api/index.js  │                            │
│                    └───────┬───────┘                            │
└─────────────────────────────────────────────────────────────────┘
                            │ HTTP / SSE
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      后端 (Express)                               │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │   路由层     │  │  控制器层     │  │      服务层            │  │
│  │ chatRoutes  │─▶│chatController│─▶│   AgentService         │─▶│ LLM
│  │ fileRoutes  │─▶│fileController│─▶│   FileService          │─▶│ 文件系统
│  │ authRoutes  │─▶│authController│─▶│   MailService          │─▶│ SMTP
│  └─────────────┘  └──────────────┘  └────────────────────────┘  │
│                                            │                    │
│                                      ┌─────▼─────┐              │
│                                      │  SQLite    │              │
│                                      │  数据库    │              │
│                                      └───────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## ✨ 核心亮点

### 🤖 AI 工具调用 (Function Calling)
AI 可以自动判断用户意图，决定是直接回答还是调用以下工具：
- **文件操作**：创建、读取、编辑、删除文件
- **邮件发送**：通过 SMTP 发送邮件
- 用户只需用自然语言描述需求，AI 自动完成

### ⚡ 流式输出
采用 SSE (Server-Sent Events) 技术实现 AI 回复的实时逐字渲染，体验流畅自然。

### 💬 对话记忆
完整记录对话历史，AI 能够理解上下文，支持多轮连续对话。

### 🔐 用户认证
基于 JWT 的用户认证系统，保护所有 API 接口安全。

### 🗄 数据持久化
使用 SQLite 数据库持久化存储用户信息和对话记录。

### 📁 可视化管理
右侧面板提供完整的文件可视化管理界面，支持创建、查看、编辑、删除操作。

## 🚀 快速开始

### 前置要求
- Node.js >= 16
- npm >= 7

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd open-claw-pro
```

### 2. 后端配置与启动

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 API Key 和邮箱配置

# 启动服务
npm start
```

### 3. 前端配置与启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 4. 访问应用

打开浏览器访问 `http://localhost:5173`

## ⚙️ 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 后端端口 | 3001 |
| `LLM_API_KEY` | OpenRouter API Key | - |
| `LLM_BASE_URL` | LLM API 地址 | https://openrouter.ai/api/v1 |
| `LLM_MODEL` | 使用的模型 | nvidia/nemotron-3-nano-30b-a3b:free |
| `EMAIL_HOST` | SMTP 服务器 | smtp.qq.com |
| `EMAIL_PORT` | SMTP 端口 | 465 |
| `EMAIL_USER` | 邮箱账号 | - |
| `EMAIL_PASS` | SMTP 授权码 | - |
| `JWT_SECRET` | JWT 签名密钥 | - |

## 📸 功能截图

> 截图待添加

## 📁 项目结构

```
open-claw-pro/
├── backend/                # 后端服务
│   ├── config/             # 配置文件
│   ├── controllers/        # 控制器
│   ├── db/                 # 数据库
│   ├── middleware/         # 中间件
│   ├── models/             # 数据模型
│   ├── routes/             # 路由
│   ├── services/           # 服务层
│   ├── uploads/            # 文件存储
│   ├── .env.example        # 环境变量模板
│   └── server.js           # 入口文件
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── api/            # API 封装
│   │   ├── components/     # 组件
│   │   ├── router/         # 路由配置
│   │   ├── store/          # 状态管理
│   │   ├── views/          # 页面视图
│   │   ├── App.vue         # 根组件
│   │   └── main.js         # 入口文件
│   ├── index.html
│   └── package.json
└── README.md
```

## 📄 License

MIT