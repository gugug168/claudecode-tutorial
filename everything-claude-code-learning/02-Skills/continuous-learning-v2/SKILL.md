---
name: continuous-learning-v2
description: 基于 instinct 的学习系统，通过 hooks 观察会话，创建带置信度评分的原子级 instincts，并将它们进化为技能/命令/代理。
version: 2.0.0
---

# Continuous Learning v2 - Instinct-Based Architecture
# 持续学习 v2 - 基于 Instinct 的架构

<!--
【教学说明】
v2 是持续学习的进化版本。它使用更小的"instincts"（本能）作为学习单元，
而不是完整的技能。Instincts 更精确、更可靠，并且有置信度评分。

就像把一个大任务分解成许多小习惯——每个习惯更容易学习和应用。
-->

高级学习系统，通过原子级"instincts"——带置信度评分的小型学习行为——将会话转化为可重用知识。

## 何时激活此技能

- 设置从 Claude Code 会话自动学习
- 配置通过 hooks 提取基于 instinct 的行为
- 调整学习行为的置信度阈值
- 审查、导出或导入 instinct 库
- 将 instinct 进化为完整的技能、命令或代理

## v2 新特性

| 特性 | v1 | v2 |
|------|----|----|
| 观察 | Stop hook（会话结束时） | PreToolUse/PostToolUse（100% 可靠） |
| 分析 | 主上下文 | 后台代理（Haiku） |
| 粒度 | 完整技能 | 原子级"instincts" |
| 置信度 | 无 | 0.3-0.9 加权 |

**主要改进：**
- **更可靠**：使用 hooks 而不是技能观察（100% vs 50-80%）
- **更精确**：instincts 是单个行为，不是大型技能
- **更智能**：置信度评分让 AI 知道何时应用

## Instinct 模型

<!--
【教学说明】
Instinct 是最小的学习单元——一个触发条件，一个动作。
比完整技能更小、更聚焦、更容易应用。
-->

一个 instinct 是一个小型学习行为：

```yaml
---
id: prefer-functional-style
trigger: "when writing new functions"
confidence: 0.7
domain: "code-style"
source: "session-observation"
---

# Prefer Functional Style（偏好函数式风格）

## 动作
在适当的时候使用函数式模式而非类。

## 证据
- 观察到 5 次函数式模式偏好
```

**属性：**
- **原子级** ——一个触发器，一个动作
- **置信度加权** ——0.3 = 试探性，0.9 = 几乎确定
- **领域标记** ——code-style、testing、git、debugging、workflow 等
- **证据支持** ——追踪创建了它的观察

**什么是原子级？** 原子级意味着不可再分的最小单元。

## 工作原理

```
会话活动
      │
      │ Hooks 捕获提示 + 工具使用（100% 可靠）
      ▼
┌─────────────────────────────────────────┐
│         observations.jsonl              │
│   (提示、工具调用、结果)                 │
└─────────────────────────────────────────┘
      │
      │ 观察者代理读取（后台，Haiku）
      ▼
┌─────────────────────────────────────────┐
│          模式检测                        │
│   • 用户纠正 → instinct                  │
│   • 错误解决 → instinct                  │
│   • 重复工作流 → instinct                │
└─────────────────────────────────────────┘
```

**流程说明：**
1. **Hooks 捕获**：每次工具调用前/后记录
2. **观察者分析**：后台 AI 找出模式
3. **Instinct 创建**：保存为可重用的 instinct

## 快速开始

### 1. 启用观察 Hooks

添加到你的 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/hooks/observe.sh pre"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/hooks/observe.sh post"
      }]
    }]
  }
}
```

**PreToolUse vs PostToolUse：**
- PreToolUse：工具调用**前**触发（知道意图）
- PostToolUse：工具调用**后**触发（知道结果）

### 2. 使用 Instinct 命令

```bash
/instinct-status     # 显示已学习的 instincts 及其置信度
/evolve              # 将相关 instincts 聚类为技能/命令
/instinct-export     # 导出 instincts 用于分享
/instinct-import <file>     # 从他人导入 instincts
```

## 命令列表

| 命令 | 说明 |
|------|------|
| `/instinct-status` | 显示所有已学习的 instincts 及其置信度 |
| `/evolve` | 将相关 instincts 聚类为技能/命令 |
| `/instinct-export` | 导出 instincts 用于分享 |
| `/instinct-import <file>` | 从他人导入 instincts |

## 置信度评分

<!--
【教学说明】
置信度让 AI 知道何时应该应用学习的模式。
高置信度 = 自动应用，低置信度 = 仅建议。
-->

| 分数 | 含义 | 行为 |
|------|------|------|
| 0.3 | 试探性 | 建议但不强制 |
| 0.5 | 中等 | 相关时应用 |
| 0.7 | 强 | 自动批准应用 |
| 0.9 | 几乎确定 | 核心行为 |

**置信度如何计算？**
- 观察次数：更多观察 = 更高置信度
- 一致性：每次都出现 = 更高置信度
- 成功率：有效解决方案 = 更高置信度

**置信度衰减：**
- 如果 instinct 导致错误，置信度下降
- 如果用户纠正，置信度大幅下降
- 长期未使用，置信度缓慢下降

## Instinct 进化

<!--
【教学说明】
相关 instincts 可以聚合成更大的技能——就像小习惯组合成工作流程。
-->

### 聚类到技能

```yaml
# 独立的 instincts
- instinct-1: "使用 TypeScript 严格模式"
- instinct-2: "定义所有函数参数类型"
- instinct-3: "避免 any 类型"

# 进化后的技能
skill: "typescript-strict-style"
  包含: [instinct-1, instinct-2, instinct-3]
  置信度: 0.85
```

### 进化到命令

```yaml
# 检测到的工作流模式
- instinct-1: "先写测试"
- instinct-2: "运行测试"
- instinct-3: "修复失败"
- instinct-4: "重复"

# 进化后的命令
command: "/tdd-cycle"
  动作: 自动执行 TDD 循环
```

### 进化到代理

```yaml
# 复杂行为模式
- 多个相关 instincts
- 跨多个领域的操作
- 需要多步工作流

# 进化后的代理
agent: "full-stack-developer"
  包含: [testing-instincts, api-instincts, ui-instincts]
```

## 与 v1 比较

### v1 方法（技能观察）

```
会话结束 → Stop hook → 提取完整技能
  ↓
技能文件（大型、通用）
  ↓
下次会话：技能可能触发（50-80%）
```

**问题：**
- 技能太大，不精确
- 触发不可靠（技能系统是概率性的）
- 无法追踪置信度

### v2 方法（Instinct 观察）

```
每个工具调用 → Pre/Post hook → 记录观察
  ↓
后台分析 → 检测模式 → 创建 instincts
  ↓
下次会话：高置信度 instincts 自动应用
  ↓
定期：聚类相关 instincts → 技能/命令
```

**优势：**
- Instincts 小而精确
- 100% 可靠（hooks 总是触发）
- 置信度追踪

## 实际示例

### 示例 1：代码风格 Instinct

```yaml
---
id: use-arrow-functions
trigger: "编写回调函数时"
confidence: 0.8
domain: "code-style"
source: "user-corrections"
---

# Use Arrow Functions（使用箭头函数）

## 何时应用
编写回调函数或简短函数时

## 动作
使用箭头函数而非 function 关键字

## 示例
```typescript
// 优先
array.map(x => x * 2)

// 而非
array.map(function(x) { return x * 2 })
```

## 证据
- 用户纠正了 3 次
- 项目代码中 90% 使用箭头函数
```

### 示例 2：调试 Instinct

```yaml
---
id: check-network-first
trigger: "调试 API 错误时"
confidence: 0.9
domain: "debugging"
source: "error-resolution"
---

# Check Network First（先检查网络）

## 何时应用
API 调用失败或数据不正确时

## 动作
1. 打开浏览器网络面板
2. 检查请求状态码
3. 验证请求/响应格式
4. 检查 CORS 错误

## 证据
- 在 5 个独立调试会话中有效
- 解决了 80% 的 API 问题
```

## 最佳实践

1. **从小开始** ——让系统积累 instincts，不要急躁
2. **定期审查** ——每周检查 `/instinct-status`
3. **手动进化** ——使用 `/evolve` 创建技能
4. **分享有用** ——使用 `/instinct-export` 与团队分享
5. **导入谨慎** ——审查导入的 instincts

## 相关资源

- v1 技能：`continuous-learning/SKILL.md`
- Homunculus 项目：[github.com/humanplane/homunculus](https://github.com/humanplane/homunculus)
- 完整规范：`/Users/affoon/Documents/tasks/12-continuous-learning-v2.md`

---

**记住**：v2 是下一代持续学习——更精确、更可靠、更智能。
