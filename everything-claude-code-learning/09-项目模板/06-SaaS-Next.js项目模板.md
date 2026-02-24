<!--
╔══════════════════════════════════════════════════════════════════╗
║  【教学概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  模板用途：SaaS 应用项目配置模板（Next.js 全栈）                  ║
║  适合人群：使用 Next.js + Supabase + Stripe 构建应用的独立开发者  ║
║  核心要点：                                                        ║
║    - Next.js 15 App Router（服务组件优先）                        ║
║    - Supabase RLS 行级安全                                        ║
║    - Stripe 订阅和 Webhook 处理                                   ║
║    - 服务端操作和表单验证                                          ║
║    - Playwright E2E 测试                                          ║
╚══════════════════════════════════════════════════════════════════╝
-->

# SaaS 应用 — 项目 CLAUDE.md

> Next.js + Supabase + Stripe SaaS 应用的真实示例。
> 将此复制到你的项目根目录并为你的技术栈进行定制。

## 项目概述

**技术栈：** Next.js 15（App Router）、TypeScript、Supabase（auth + DB）、Stripe（billing）、Tailwind CSS、Playwright（E2E）

**架构：** 默认使用服务组件。客户端组件仅用于交互。API 路由用于 webhooks，服务操作用于变更。

## 关键规则

### 数据库

- 所有查询使用启用 RLS 的 Supabase 客户端 - 永远不要绕过 RLS
- `supabase/migrations/` 中的迁移 - 永远不要直接修改数据库
- 使用带有显式列列表的 `select()`，而不是 `select('*')`
- 所有面向用户的查询必须包含 `.limit()` 以防止无界结果

### 认证

- 在服务组件中使用 `@supabase/ssr` 的 `createServerClient()`
- 在客户端组件中使用 `@supabase/ssr` 的 `createBrowserClient()`
- 受保护的路由检查 `getUser()` - 永远不要仅信任 `getSession()` 进行认证
- `middleware.ts` 中的中间件在每次请求时刷新认证令牌

### 计费

- `app/api/webhooks/stripe/route.ts` 中的 Stripe webhook 处理器
- 永远不要信任客户端价格数据 - 始终从服务器端获取 Stripe
- 通过 `subscription_status` 列检查订阅状态，由 webhook 同步
- 免费层用户：3 个项目，100 次 API 调用/天

### 代码风格

- 代码或注释中没有表情符号
- 仅不可变模式 - 扩展运算符，永远不要修改
- 服务组件：没有 `'use client'` 指令，没有 `useState`/`useEffect`
- 客户端组件：顶部有 `'use client'`，最小化 - 将逻辑提取到 hooks
- 优先使用 Zod 模式进行所有输入验证（API 路由、表单、环境变量）

## 文件结构

```
src/
  app/
    (auth)/          # 认证页面（登录、注册、忘记密码）
    (dashboard)/     # 受保护的仪表板页面
    api/
      webhooks/      # Stripe、Supabase webhooks
    layout.tsx       # 带有提供者的根布局
  components/
    ui/              # Shadcn/ui 组件
    forms/           # 带验证的表单组件
    dashboard/       # 仪表板特定组件
  hooks/             # 自定义 React hooks
  lib/
    supabase/        # Supabase 客户端工厂
    stripe/          # Stripe 客户端和助手
    utils.ts         # 通用工具
  types/             # 共享 TypeScript 类型
supabase/
  migrations/        # 数据库迁移
  seed.sql           # 开发种子数据
```

## 关键模式

### API 响应格式

```typescript
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }
```

### 服务操作模式

```typescript
'use server'

import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const schema = z.object({
  name: z.string().min(1).max(100),
})

export async function createProject(formData: FormData) {
  const parsed = schema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() }
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('projects')
    .insert({ name: parsed.data.name, user_id: user.id })
    .select('id, name, created_at')
    .single()

  if (error) return { success: false, error: 'Failed to create project' }
  return { success: true, data }
}
```

## 环境变量

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # 仅服务器，永远不要暴露给客户端

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# 应用
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 测试策略

```bash
/tdd                    # 新功能的单元 + 集成测试
/e2e                    # 认证流程、计费、仪表板的 Playwright 测试
/test-coverage          # 验证 80%+ 覆盖率
```

### 关键 E2E 流程

1. 注册 → 邮箱验证 → 创建第一个项目
2. 登录 → 仪表板 → CRUD 操作
3. 升级计划 → Stripe 结账 → 订阅激活
4. Webhook：订阅取消 → 降级到免费层

## ECC 工作流

```bash
# 规划功能
/plan "添加带有邮件通知的团队邀请"

# 使用 TDD 开发
/tdd

# 提交前
/code-review
/security-scan

# 发布前
/e2e
/test-coverage
```

## Git 工作流

- `feat:` 新功能，`fix:` 错误修复，`refactor:` 代码更改
- 从 `main` 创建功能分支，需要 PR
- CI 运行：lint、类型检查、单元测试、E2E 测试
- 部署：PR 时 Vercel 预览，合并到 `main` 时生产环境
