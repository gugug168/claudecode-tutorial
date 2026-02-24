---
name: project-guidelines-example
description: "基于真实生产应用的项目特定技能模板示例。"
---

# Project Guidelines Skill (Example)
# 项目指南技能（示例）

<!--
【教学说明】
这是一个项目特定技能的示例——用它作为你自己项目的模板。

项目特定技能包含关于特定项目的所有信息：
- 架构概览
- 文件结构
- 代码模式
- 测试要求
- 部署工作流

就像项目的"使用说明书"。
-->

这是一个项目特定技能的示例。用它作为你自己项目的模板。

基于真实生产应用：[Zenith](https://zenith.chat) ——AI 驱动的客户发现平台。

## 何时使用

在为特定项目工作时参考此技能。项目技能包含：
- 架构概览
- 文件结构
- 代码模式
- 测试要求
- 部署工作流

---

## 架构概览

**技术栈：**
- **前端**：Next.js 15 (App Router)、TypeScript、React
- **后端**：FastAPI (Python)、Pydantic models
- **数据库**：Supabase (PostgreSQL)
- **AI**：Claude API with tool calling and structured output
- **部署**：Google Cloud Run
- **测试**：Playwright (E2E)、pytest (backend)、React Testing Library

**服务架构：**
```
┌─────────────────────────────────────────────────────────────┐
│                         前端                                │
│  Next.js 15 + TypeScript + TailwindCSS                      │
│  部署：Vercel / Cloud Run                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         后端                                │
│  FastAPI + Python 3.11 + Pydantic                          │
│  部署：Cloud Run                                            │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ Supabase │   │  Claude  │   │  Redis   │
        │ Database │   │   API    │   │  Cache   │
        └──────────┘   └──────────┘   └──────────┘
```

**架构说明：**
- **前端**：用户交互界面
- **后端**：业务逻辑和 API
- **Supabase**：主数据库和用户认证
- **Claude API**：AI 分析和生成
- **Redis**：快速缓存和会话存储

---

## 文件结构

```
project/
├── frontend/
│   └── src/
│       ├── app/              # Next.js app router 页面
│       │   ├── api/          # API 路由
│       │   ├── (auth)/       # 认证保护的路由
│       │   └── workspace/    # 主应用工作区
│       ├── components/       # React 组件
│       │   ├── ui/           # 基础 UI 组件
│       │   ├── forms/        # 表单组件
│       │   └── layouts/      # 布局组件
│       ├── hooks/            # 自定义 React hooks
│       ├── lib/              # 工具函数
│       ├── types/            # TypeScript 定义
│       └── config/           # 配置
│
├── backend/
│   ├── routers/              # FastAPI 路由处理器
│   ├── models.py             # Pydantic models
│   ├── main.py               # FastAPI app 入口
│   ├── auth_system.py        # 认证
│   ├── database.py           # 数据库操作
│   ├── services/             # 业务逻辑
│   └── tests/                # pytest 测试
│
├── deploy/                   # 部署配置
├── docs/                     # 文档
└── scripts/                  # 工具脚本
```

**目录说明：**
- `frontend/app/`：Next.js 页面（App Router）
- `frontend/components/`：React 组件
- `backend/routers/`：API 端点
- `backend/services/`：业务逻辑

---

## 代码模式

### API 响应格式 (FastAPI)

<!--
【教学说明】
统一的 API 响应格式使错误处理一致。
-->

```python
from pydantic import BaseModel
from typing import Generic, TypeVar, Optional

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None

    @classmethod
    def ok(cls, data: T) -> "ApiResponse[T]":
        return cls(success=True, data=data)

    @classmethod
    def fail(cls, error: str) -> "ApiResponse[T]":
        return cls(success=False, error=error)
```

**使用示例：**
```python
# 成功响应
return ApiResponse.ok(user_data)

# 错误响应
return ApiResponse.fail("用户未找到")
```

### 前端 API 调用 (TypeScript)

<!--
【教学说明】
带错误处理的 fetch 封装——统一的错误处理。
-->

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    return await response.json()
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
```

**使用示例：**
```typescript
const result = await fetchApi<User>('/users/123')
if (result.success) {
  console.log(result.data)  // 类型安全
} else {
  console.error(result.error)
}
```

### Claude AI 集成（结构化输出）

<!--
【教学说明】
使用 Claude API 的结构化输出——确保返回格式正确。
-->

```python
from anthropic import Anthropic
from pydantic import BaseModel

class AnalysisResult(BaseModel):
    summary: str
    key_points: list[str]
    confidence: float

async def analyze_with_claude(content: str) -> AnalysisResult:
    client = Anthropic()

    response = client.messages.create(
        model="claude-sonnet-4-5-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": content}],
        tools=[{
            "name": "provide_analysis",
            "description": "提供结构化分析",
            "input_schema": AnalysisResult.model_json_schema()
        }],
        tool_choice={"type": "tool", "name": "provide_analysis"}
    )

    # 提取工具使用结果
    tool_use = next(
        block for block in response.content
        if block.type == "tool_use"
    )

    return AnalysisResult(**tool_use.input)
```

**什么是结构化输出？** Claude 返回符合 Pydantic model 的 JSON，而不是自由文本。

### 自定义 Hooks (React)

<!--
【教学说明】
封装 API 调用状态管理——避免重复代码。
-->

```typescript
import { useState, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(
  fetchFn: () => Promise<ApiResponse<T>>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    const result = await fetchFn()

    if (result.success) {
      setState({ data: result.data!, loading: false, error: null })
    } else {
      setState({ data: null, loading: false, error: result.error! })
    }
  }, [fetchFn])

  return { ...state, execute }
}
```

**使用示例：**
```typescript
const { data, loading, error, execute } = useApi<User>(
  () => fetchApi('/users/123')
)

// 加载数据
execute()

// 渲染
{loading && <Spinner />}
{error && <Error message={error} />}
{data && <UserProfile user={data} />}
```

---

## 测试要求

### 后端 (pytest)

```bash
# 运行所有测试
poetry run pytest tests/

# 运行带覆盖率
poetry run pytest tests/ --cov=. --cov-report=html

# 运行特定测试文件
poetry run pytest tests/test_auth.py -v
```

**测试结构：**
```python
import pytest
from httpx import AsyncClient
from main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

### 前端 (React Testing Library)

```bash
# 运行测试
npm run test

# 运行带覆盖率
npm run test -- --coverage

# 运行 E2E 测试
npm run test:e2e
```

---

## 部署工作流

### 部署前检查清单

- [ ] 本地所有测试通过
- [ ] `npm run build` 成功（前端）
- [ ] `poetry run pytest` 通过（后端）
- [ ] 没有硬编码密钥
- [ ] 环境变量已记录
- [ ] 数据库迁移就绪

### 部署命令

```bash
# 构建和部署前端
cd frontend && npm run build
gcloud run deploy frontend --source .

# 构建和部署后端
cd backend
gcloud run deploy backend --source .
```

### 环境变量

```bash
# 前端 (.env.local)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# 后端 (.env)
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
```

---

## 关键规则

<!--
【教学说明】
这些是项目必须遵守的规则。
-->

1. **代码、注释或文档中没有表情符号**
2. **不可变性** ——永不修改对象或数组
3. **TDD** ——实现前先写测试
4. **80% 覆盖率最低要求**
5. **多小文件** ——典型 200-400 行，最多 800 行
6. **生产代码中没有 console.log**
7. **正确的错误处理**使用 try/catch
8. **输入验证**使用 Pydantic/Zod

---

## 创建你自己的项目指南

<!--
【教学说明】
基于此模板为你的项目创建特定技能。
-->

1. **复制此文件**到你的项目
2. **自定义部分**：
   - 架构：描述你的技术栈
   - 文件结构：列出你的目录
   - 代码模式：展示你的常用模式
   - 测试：你的测试命令和结构
   - 部署：你的部署流程
3. **添加项目特定规则**：编码约定、命名模式等
4. **保存为**：`~/.claude/skills/your-project-name/SKILL.md`

**示例项目特定规则：**
```markdown
## 项目特定规则

1. 命名约定：
   - 组件：PascalCase (UserProfile.tsx)
   - 文件：kebab-case (user-profile.ts)
   - 变量：camelCase (userName)

2. 导入顺序：
   1. React/Next.js
   2. 第三方库
   3. 本地组件
   4. 类型
   5. 工具函数

3. Git 提交消息：
   - feat: 新功能
   - fix: 错误修复
   - docs: 文档更改
   - refactor: 代码重构
```

## 相关技能

- `coding-standards.md` ——通用编码最佳实践
- `backend-patterns.md` ——API 和数据库模式
- `frontend-patterns.md` ——React 和 Next.js 模式
- `tdd-workflow/` ——测试驱动开发方法论

---

**记住**：项目特定技能是项目的"百科全书"——它包含所有项目特定的知识，让 AI 能更好地理解你的代码。
