# CODEBUDDY.md

本文件为 CodeBuddy Code 在本仓库中工作时提供指导。

## 项目概述

Terra 是一个基于 AI 的简历管理与优化平台，使用 Next.js 15（App Router）和 React 19 构建。用户以 PDF 形式上传/下载简历，管理职位描述（JD），并获得 AI 驱动的简历评估与优化建议。认证方式仅支持 Google Sign-In（supabase/ssr）。AI 功能由 LangChain + LangGraph 通过 OpenRouter 路由实现。

## 常用命令

```bash
npm run dev          # 启动 Next.js 开发服务器（next dev）
npm run build        # 生产构建（next build）
npm start            # 启动生产服务器（next start）
npm run lint        # TypeScript 类型检查（tsc --noEmit，无 ESLint）
npm run db          # 启动本地 Supabase 环境（supabase start）
```

本项目未配置单元测试。`npm test` 未定义。`npm run lint` 仅执行 TypeScript 类型检查。

## 代码架构

### 目录结构

```
app/                  # Next.js App Router（前端页面 + API 路由）
  api/                # API 路由处理器（route.ts）
    resume/
      parse/          # POST — 解析上传的 PDF，通过 Node.js pdf-parse 提取文本
      generate-pdf/   # POST — 通过 Python reportlab 根据简历 JSON 生成 PDF
      optimize/       # POST — AI 简历优化（LangGraph）
      evaluate/       # POST — 简历 vs JD 评估（LangGraph）
    chat/             # POST — AI 对话（LangGraph）
  page.tsx            # 根页面（重定向至 /dashboard）
  dashboard/          # 认证后的主应用界面
  login/              # Google Sign-In 页面
  layout.tsx          # 根布局（Google OAuth + 字体设置）
  globals.css         # Tailwind + 自定义 CSS 变量

lib/                  # 后端库代码（API 路由间共享）
  agent/
    graph.ts          # LangGraph 图定义（简历优化工作流）
    openrouter.ts     # ChatOpenAI 模型配置（OpenRouter 兼容）
    prompts.ts        # 所有 LLM 交互的 System Prompt
    state.ts          # LangGraph 状态类型定义
    tools.ts          # LangChain 工具（saveResume、getResume 等）
  supabase/           # Supabase 客户端配置（服务端 + 浏览器端）
    client.ts
    middleware.ts
  types.ts            # 后端专用类型别名（Resume、JobDescription 等）

scripts/              # API 路由通过 child_process 调用的 Python 辅助脚本
  parse_pdf.py        # 使用 pypdf 从 PDF 提取文本（Node.js pdf-parse 因 worker 问题无法在 Next.js 下工作）
  generate_resume_pdf.py  # 使用 reportlab 根据简历 JSON 生成 PDF

src/                  # 旧版 React 源码（较旧的结构，部分仍在使用）
  App.tsx             # 主 SPA 壳（仪表盘、简历编辑器、对话视图）
  types.ts            # 前端类型定义（Resume、JobDescription 等）
  components/         # React 组件（Dashboard、ResumeEditor、ChatView 等）
  index.css           # 旧版样式
```

### 关键架构决策

- **Next.js 15 App Router** — 所有 API 路由均声明 `export const runtime = "nodejs"`（因需使用 child_process）。
- **PDF 解析** — `app/api/resume/parse/route.ts` 通过 `child_process.spawn("python3", ...)` 调用 `scripts/parse_pdf.py`（`pypdf`）提取文本。Node.js `pdf-parse` 库因 `pdfjs-dist` worker 在 Next.js 下无法正确加载，故仍使用 Python 方案。
- **PDF 生成** — `app/api/resume/generate-pdf/route.ts` 通过 `child_process.spawn("python3", ...)` 调用 `scripts/generate_resume_pdf.py`（reportlab）生成 PDF。Python 脚本必须存在且系统 Python 已安装 `reportlab`。
- **OpenRouter 兼容** — `lib/agent/openrouter.ts` 在模块加载时将 `OPENROUTER_API_KEY` 映射到 `OPENAI_API_KEY`。所有 LLM 调用均通过配置了 `baseURL: https://openrouter.ai/api/v1` 的 `ChatOpenAI` 进行。切勿直接设置 `OPENAI_API_KEY`，映射逻辑已处理此问题。
- **Supabase Auth** — 仅支持 Google Sign-In。认证流程使用 `@supabase/ssr` + cookies。`lib/supabase/middleware.ts` 处理会话刷新。不支持短信登录。
- **LangGraph 工作流** — `lib/agent/graph.ts` 定义优化管线。状态定义见 `lib/agent/state.ts`。`lib/agent/tools.ts` 中的工具允许 Agent 保存简历、查询数据库等。
- **无测试框架** — 项目没有配置测试。不要寻找测试文件或测试命令。

### PDF 处理管线

两条独立的 PDF 处理路径：

1. **解析**（`app/api/resume/parse/route.ts` → `scripts/parse_pdf.py`，使用 `pypdf`）：
   - 接收前端传来的 base64 PDF → 写入临时文件 → `pypdf.PdfReader` 提取文本 → 将文本交由 LLM 结构化为 JSON。
   - 曾尝试迁移至 Node.js `pdf-parse`（基于 `pdfjs-dist`），但因 Next.js 下 `pdf.worker.mjs` 无法正确加载而放弃，继续使用 Python 方案。
2. **生成**（`app/api/resume/generate-pdf/route.ts` → `scripts/generate_resume_pdf.py`，使用 `reportlab`）：
   - 接收简历 JSON → 写入临时 JSON 文件 → Python 脚本使用 `reportlab` 生成 PDF → 返回 PDF 字节流。

### 环境变量

在 `.env` 中配置以下变量：
```
OPENROUTER_API_KEY=...     # OpenRouter API 密钥（自动映射到 OPENAI_API_KEY）
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```
Python 依赖（`pypdf`、`reportlab`）必须安装在系统 Python 中（`pip3 install pypdf reportlab`）。

## 开发注意事项

- **TypeScript 配置**：启用严格模式。Target ES2017，module `esnext`，moduleResolution `bundler`。`@/*` 映射到项目根目录（而非 `./src`）。
- **样式**：Tailwind CSS v4 + `@tailwindcss/postcss`。无 UI 组件库 — 全程使用原生 Tailwind 类名。
- **状态管理**：前端使用 React `useState`/`useEffect`（无 Redux/Zustand）。Supabase 作为持久化存储。
- **构建输出**：`.next/` 目录。若 PDF 生成报字体错误，请检查 `pdfkit` 字体文件是否可通过 `process.cwd()` 访问。
- **Git 工作流**：主分支为 `main`，远程为 `origin`。始终创建新提交；禁止使用 `git commit --amend`。禁止跳过 git hooks。不得修改 git 配置。
- **每次改动后验证**：每次完成代码修改/重构后，必须使用 webapp-testing 技能对相关功能进行端到端验证，通过后再提交或报告结果。
