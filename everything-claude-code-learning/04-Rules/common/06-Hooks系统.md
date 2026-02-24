# Hooks 系统 (Hooks System)

> **规则用途**：定义 Hooks 系统和最佳实践
>
> **适用场景**：配置自动化检查、使用 TodoWrite 时参考
>
> **核心能力**：Hook 类型、自动接受权限、TodoWrite 最佳实践
>
> **适用范围**：通用规则

---

## Hook 类型 (Hook Types)

### 什么是 Hooks？

Hooks 就像是自动化助手，在特定时间点自动执行任务：

```
你在工作 → Hook 监控 → 特定时机 → Hook 自动执行

就像：
- 上班打卡 → 自动记录考勤
- 红绿灯 → 自动控制交通
- 闹钟 → 自动提醒你起床
```

### 三种 Hook 类型

| Hook 类型 | 触发时机 | 用途 | 示例 |
|-----------|----------|------|------|
| **PreToolUse** | 工具执行前 | 验证、参数修改 | 检查参数格式、自动补全 |
| **PostToolUse** | 工具执行后 | 自动格式化、检查 | 自动格式化代码、运行测试 |
| **Stop** | 会话结束时 | 最终验证 | 检查遗漏、生成报告 |

### Hook 工作流程

```
┌─────────────────────────────────────────────────┐
│  PreToolUse Hook                                 │
│  ─────────────────                               │
│  触发时机：在你执行工具之前                       │
│                                                  │
│  用途：                                           │
│  ✓ 验证参数是否正确                              │
│  ✓ 修改参数（如自动补全）                         │
│  ✓ 检查前置条件                                  │
│  ✓ 记录操作日志                                  │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  执行工具                                         │
│  （你调用的实际操作）                              │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  PostToolUse Hook                                │
│  ─────────────────                               │
│  触发时机：在工具执行完成后                        │
│                                                  │
│  用途：                                           │
│  ✓ 自动格式化代码                                 │
│  ✓ 运行测试检查                                   │
│  ✓ 更新文档                                       │
│  ✓ 发送通知                                       │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  （继续工作...）                                   │
└─────────────────────────────────────────────────┘

│
│ 当会话结束时
│
▼
┌─────────────────────────────────────────────────┐
│  Stop Hook                                       │
│  ─────────                                       │
│  触发时机：会话即将结束                           │
│                                                  │
│  用途：                                           │
│  ✓ 最终验证                                       │
│  ✓ 生成工作总结                                   │
│  ✓ 检查遗漏的提交                                 │
│  ✓ 清理临时文件                                   │
└─────────────────────────────────────────────────┘
```

### Hook 配置示例

```javascript
// hooks.json - Hook 配置文件
{
  "preToolUse": [
    {
      "pattern": "Bash",
      "handler": "validateBashCommand"
    },
    {
      "pattern": "Write",
      "handler": "checkFilePermissions"
    }
  ],

  "postToolUse": [
    {
      "pattern": "Edit",
      "handler": "autoFormatCode"
    },
    {
      "pattern": "Write",
      "handler": "runLinter"
    }
  ],

  "stop": [
    {
      "handler": "generateSessionSummary"
    },
    {
      "handler": "checkUncommittedChanges"
    }
  ]
}
```

---

## 自动接受权限 (Auto-Accept Permissions)

### 什么是自动接受权限？

默认情况下，每次执行操作前都需要确认：

```
你：帮我创建一个文件
AI：我将创建文件 /path/to/file.js
[ ] 确认执行
```

自动接受权限后：

```
你：帮我创建一个文件
AI：直接创建文件（无需确认）
```

### 使用场景对比

| 场景 | 是否启用 | 理由 |
|------|----------|------|
| **明确、可信的计划** | ✅ 启用 | 节省时间，提高效率 |
| **探索性工作** | ❌ 禁用 | 需要人工确认每一步 |
| **生产环境操作** | ❌ 禁用 | 安全第一 |
| **重复性任务** | ✅ 启用 | 自动化处理 |

### 配置方式

#### 方法 1：配置文件（推荐）

```json
// ~/.claude.json
{
  "allowedTools": [
    "Read",
    "Write",
    "Edit",
    "Bash"
  ],
  "dangerouslySkipPermissions": false  // ⚠️ 永远不要设为 true
}
```

#### 方法 2：命令行标志（不推荐）

```bash
# ❌ 不推荐：跳过所有权限检查
claude --dangerously-skip-permissions

# ✅ 推荐：配置允许的工具
# 在 ~/.claude.json 中配置 allowedTools
```

### 安全注意事项

⚠️ **重要安全警告**

```markdown
永远不要使用 dangerouslySkipPermissions！

原因：
1. 它会跳过所有权限检查
2. 可能导致意外操作（删除文件、修改系统）
3. 没有二次确认的机会

正确做法：
- 在 ~/.claude.json 中配置 allowedTools
- 列出你信任的工具
- 探索性工作时保持手动确认
```

### 配置示例

```json
// ~/.claude.json - 开发环境配置
{
  "allowedTools": [
    // 读取操作（安全）
    "Read",
    "Glob",
    "Grep",

    // 写入操作（需要信任）
    "Write",
    "Edit",

    // 构建工具（需要信任）
    "Bash",

    // 其他工具（根据需要）
    "WebSearch"
  ],

  // 为特定模式设置不同的权限
  "modeSettings": {
    "exploration": {
      "allowedTools": ["Read", "Glob", "Grep"],
      "autoAccept": false
    },
    "implementation": {
      "allowedTools": ["Read", "Write", "Edit", "Bash"],
      "autoAccept": true
    }
  }
}
```

---

## TodoWrite 最佳实践

### 什么是 TodoWrite？

TodoWrite 是一个任务管理工具，就像购物清单：

```
购物清单：
□ 买牛奶
□ 买面包
□ 买鸡蛋

任务清单：
□ 实现登录功能
□ 编写测试
□ 更新文档
```

### 为什么使用 TodoWrite？

| 好处 | 说明 |
|------|------|
| **进度可视化** | 看到完成了多少，还剩多少 |
| **验证理解** | AI 可以检查是否正确理解任务 |
| **实时引导** | 可以调整优先级和顺序 |
| **防止遗漏** | 不会忘记重要步骤 |

### TodoWrite 使用场景

#### 场景 1：多步骤任务

```
你：帮我实现用户认证功能

AI 创建 Todo 列表：
□ [ ] 设计数据模型
□ [ ] 实现注册接口
□ [ ] 实现登录接口
□ [ ] 编写单元测试
□ [ ] 编写集成测试
□ [ ] 更新 API 文档

你看到：完整的工作计划，可以调整顺序
AI 看到：验证理解是否正确
```

#### 场景 2：验证理解

```
你：修复登录 bug

AI 创建 Todo 列表：
□ [ ] 复现 bug
□ [ ] 定位问题代码
□ [ ] 修复代码
□ [ ] 编写测试
□ [ ] 更新文档

你发现：缺少"验证修复"这一步
你：添加"验证修复不影响其他功能"

AI 更新：理解更准确了
```

#### 场景 3：实时引导

```
进行中...

AI：正在实现注册接口...
AI：遇到一个技术问题，有两个方案...

你查看 Todo 列表：
□ [x] 设计数据模型
□ [ ] 实现注册接口 ← 当前
□ [ ] 实现登录接口
□ [ ] 编写单元测试

你：先暂停注册接口，完成数据模型的测试
AI：好的，调整顺序...
```

### TodoWrite 揭示的问题

TodoWrite 可以揭示以下问题：

| 问题类型 | 表现 | 解决方法 |
|----------|------|----------|
| **顺序错误** | 后置任务放在前面 | 调整任务顺序 |
| **缺失项目** | 遗漏关键步骤 | 添加缺失任务 |
| **多余项目** | 不必要的步骤 | 删除多余任务 |
| **粒度错误** | 任务太大或太小 | 拆分或合并任务 |
| **误解需求** | 与需求不一致 | 重新沟通确认 |

### TodoWrite 最佳实践

#### 1. 合理的粒度

```markdown
❌ 太粗粒度：
□ 实现用户认证

✅ 合适粒度：
□ 设计 User 数据模型
□ 实现密码加密
□ 实现 JWT 生成
□ 实现注册接口
□ 实现登录接口

❌ 太细粒度：
□ 打开 IDE
□ 创建文件
□ 输入第一行代码
□ 输入第二行代码
```

#### 2. 清晰的任务描述

```markdown
❌ 模糊的描述：
□ 修复问题
□ 添加功能
□ 更新代码

✅ 清晰的描述：
□ 修复登录接口超时问题
□ 添加用户邮箱验证功能
□ 更新 auth.service.ts 中的错误处理
```

#### 3. 包含验收标准

```markdown
✅ 带有验收标准的任务：
□ 实现用户注册接口
  验收：可以通过邮箱和密码注册新用户

□ 编写单元测试
  验收：测试覆盖率达到 80% 以上

□ 更新 API 文档
  验收：包含请求和响应示例
```

#### 4. 标记依赖关系

```markdown
✅ 标注任务依赖：
□ [ ] 设计数据模型（阻塞其他任务）
  └─ □ [ ] 实现 User 仓库
      └─ □ [ ] 实现认证服务
          └─ □ [ ] 实现 API 端点
```

### TodoWrite 工作流程

```
┌─────────────────────────────────────────────────┐
│  1. 创建 Todo 列表                                │
│     - 分析任务                                   │
│     - 分解为步骤                                 │
│     - 标记依赖关系                               │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  2. 验证理解                                      │
│     - 检查是否遗漏                               │
│     - 检查顺序是否正确                           │
│     - 检查粒度是否合适                           │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  3. 执行任务                                      │
│     - 逐项完成                                   │
│     - 标记为进行中                               │
│     - 标记为已完成                               │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  4. 实时调整                                      │
│     - 发现新问题 → 添加任务                      │
│     - 优先级变化 → 调整顺序                      │
│     - 任务取消 → 删除任务                        │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  5. 完成确认                                      │
│     - 所有任务完成                               │
│     - 验收标准满足                               │
│     - 生成总结报告                               │
└─────────────────────────────────────────────────┘
```

### TodoWrite 示例

#### 示例 1：功能开发

```markdown
## Todo：实现用户认证功能

### 阶段 1：准备（估计 1 小时）
- [ ] 创建功能分支 `feature/user-auth`
- [ ] 阅读 API 设计文档
- [ ] 设置数据库连接

### 阶段 2：数据层（估计 2 小时）
- [ ] 设计 User 表结构
  - 验收：包含 id, email, password_hash 字段
- [ ] 创建 User 实体类
- [ ] 实现 UserRepository
  - 验收：支持 create, findByEmail, findById

### 阶段 3：业务层（估计 3 小时）
- [ ] 实现密码加密工具
  - 验收：使用 bcrypt，salt rounds = 10
- [ ] 实现 AuthService
  - 验收：包含 register, login 方法
- [ ] 实现 JWT 生成和验证
  - 验收：token 有效期 7 天

### 阶段 4：API 层（估计 2 小时）
- [ ] 实现 POST /api/auth/register
  - 验收：返回用户信息和 token
- [ ] 实现 POST /api/auth/login
  - 验收：验证邮箱和密码
- [ ] 实现认证中间件
  - 验收：保护需要认证的路由

### 阶段 5：测试（估计 2 小时）
- [ ] 编写单元测试
  - 验收：覆盖率 >= 80%
- [ ] 编写集成测试
  - 验收：测试完整的注册和登录流程
- [ ] 手动测试
  - 验收：在 Postman 中测试所有端点

### 阶段 6：文档和清理（估计 1 小时）
- [ ] 更新 API 文档
- [ ] 代码审查和重构
- [ ] 提交代码并创建 PR

**总计估计时间：11 小时**
```

#### 示例 2：Bug 修复

```markdown
## Todo：修复登录超时问题

### 诊断（估计 30 分钟）
- [ ] 复现问题
  - 步骤：使用错误密码登录，观察响应时间
- [ ] 定位问题代码
  - 文件：auth.service.ts，方法：login
- [ ] 分析原因
  - 初步判断：密码验证使用了不合理的比较方法

### 修复（估计 1 小时）
- [ ] 修复密码验证逻辑
  - 从：直接字符串比较
  - 改为：使用 bcrypt.compare
- [ ] 添加超时处理
  - 设置最大验证时间为 5 秒

### 测试（估计 1 小时）
- [ ] 编写回归测试
  - 验收：确保修复有效
- [ ] 测试正常登录
  - 验收：正确密码可以登录
- [ ] 测试错误密码
  - 验收：错误密码快速返回错误
- [ ] 测试边界情况
  - 验收：空密码、超长密码等

### 交付（估计 30 分钟）
- [ ] 代码审查
- [ ] 更新文档（添加性能说明）
- [ ] 提交修复

**总计估计时间：3 小时**
```

---

## Hooks 集成示例

### 完整的 Hook 配置

```javascript
// .claude/hooks.js
module.exports = {
  // PreToolUse Hooks
  preToolUse: [
    {
      name: 'validate-bash-command',
      match: (tool) => tool.name === 'Bash',
      action: async (context) => {
        const { tool } = context;

        // 检查危险命令
        const dangerous = ['rm -rf', 'del /q', 'format'];
        const command = tool.input.command;

        if (dangerous.some(cmd => command.includes(cmd))) {
          return {
            allowed: false,
            reason: '检测到危险命令，请手动确认'
          };
        }

        return { allowed: true };
      }
    },

    {
      name: 'validate-file-path',
      match: (tool) => ['Write', 'Edit'].includes(tool.name),
      action: async (context) => {
        const { tool } = context;
        const path = tool.input.file_path;

        // 防止修改系统文件
        const systemPaths = [
          '/etc/',
          '/usr/bin/',
          '/System/'
        ];

        if (systemPaths.some(sysPath => path.startsWith(sysPath))) {
          return {
            allowed: false,
            reason: '不允许修改系统文件'
          };
        }

        return { allowed: true };
      }
    }
  ],

  // PostToolUse Hooks
  postToolUse: [
    {
      name: 'auto-format',
      match: (tool) => ['Write', 'Edit'].includes(tool.name),
      action: async (context) => {
        const { tool, result } = context;

        // 在代码写入后自动格式化
        if (result.success) {
          const path = tool.input.file_path;

          if (path.endsWith('.js') || path.endsWith('.ts')) {
            await runPrettier(path);
          }
        }
      }
    },

    {
      name: 'run-tests',
      match: (tool) => tool.name === 'Write',
      action: async (context) => {
        const { tool } = context;
        const path = tool.input.file_path;

        // 如果写入测试文件，运行测试
        if (path.includes('.test.') || path.includes('.spec.')) {
          await runTests(path);
        }
      }
    }
  ],

  // Stop Hooks
  stop: [
    {
      name: 'check-uncommitted-changes',
      action: async (context) => {
        const result = await exec('git status --porcelain');

        if (result.stdout.trim()) {
          console.log('⚠️  警告：存在未提交的变更');
          console.log(result.stdout);
        }
      }
    },

    {
      name: 'generate-summary',
      action: async (context) => {
        // 生成会话总结
        const summary = await generateSessionSummary(context);

        // 保存到文件
        await writeFile('.claude/session-summary.md', summary);

        console.log('✅ 会话总结已生成');
      }
    }
  ]
};
```

---

## 常见问题 (FAQ)

### Q1: Hooks 会影响性能吗？

**答**：
- **PreToolUse/PostToolUse**：轻微影响（通常是毫秒级）
- **Stop Hook**：无影响（会话结束时执行）
- **权衡**：自动化带来的效率提升远大于性能开销

### Q2: TodoWrite 适用于所有任务吗？

**答**：
- **适用于**：多步骤任务、复杂功能、需要跟踪进度的任务
- **不适用于**：简单查询、单步操作、快速回答

### Q3: 如何处理 TodoWrite 中的失败任务？

**答**：
```markdown
1. 分析失败原因
2. 创建子任务处理问题
3. 或标记为阻塞（blocking）
4. 继续其他不依赖的任务
```

### Q4: 自动接受权限安全吗？

**答**：
- **相对安全**：如果配置了 allowedTools
- **不安全**：如果使用了 dangerouslySkipPermissions
- **最佳实践**：
  - 开发环境：启用
  - 生产操作：禁用
  - 探索工作：禁用

---

## 总结

### Hooks 系统速查表

| Hook 类型 | 时机 | 典型用途 | 配置位置 |
|-----------|------|----------|----------|
| **PreToolUse** | 工具执行前 | 验证、修改参数 | hooks.json |
| **PostToolUse** | 工具执行后 | 格式化、测试 | hooks.json |
| **Stop** | 会话结束时 | 总结、检查 | hooks.json |

### TodoWrite 最佳实践

```markdown
✅ DO（应该做）：
- 用于多步骤任务
- 包含验收标准
- 保持合理粒度
- 实时更新状态

❌ DON'T（不应该做）：
- 用于简单查询
- 任务过于粗糙
- 任务过于琐碎
- 创建后不更新
```

### 配置建议

```markdown
1. Hooks 配置：
   - 从简单开始
   - 逐步添加自动化
   - 测试每个 Hook

2. 权限管理：
   - 使用 allowedTools
   - 不要跳过权限检查
   - 按场景配置

3. TodoWrite：
   - 先规划再执行
   - 保持灵活可调整
   - 定期回顾优化
```

善用 Hooks 系统，让 AI 助手更智能、更高效！
