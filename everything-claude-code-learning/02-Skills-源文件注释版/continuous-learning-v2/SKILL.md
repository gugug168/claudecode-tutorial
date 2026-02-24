<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：基于 Instinct 的持续学习系统                    ║
║  什么时候用它：配置自动学习、管理学习模式、进化为技能/命令/代理      ║
║  核心能力：会话观察、instinct 创建、置信度评分、进化机制            ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: continuous-learning-v2
description: Instinct-based learning system that observes sessions via hooks, creates atomic instincts with confidence scoring, and evolves them into skills/commands/agents.
version: 2.0.0
---

# Continuous Learning v2 - Instinct-Based Architecture

<!--
【说明】持续学习 v2 的核心内容：
- 高级学习系统，通过原子级的"instincts"将会话转化为可重用知识
- instincts 是带置信度评分的小型学习行为
-->
An advanced learning system that turns your Claude Code sessions into reusable knowledge through atomic "instincts" - small learned behaviors with confidence scoring.

<!--
【说明】何时激活此技能：
- 设置从 Claude Code 会话自动学习
- 配置通过 hooks 提取基于 instinct 的行为
- 调整学习行为的置信度阈值
- 审查、导出或导入 instinct 库
- 将 instinct 进化为完整的技能、命令或代理
-->
## When to Activate

- Setting up automatic learning from Claude Code sessions
- Configuring instinct-based behavior extraction via hooks
- Tuning confidence thresholds for learned behaviors
- Reviewing, exporting, or importing instinct libraries
- Evolving instincts into full skills, commands, or agents

<!--
【说明】v2 新特性 - 与 v1 比较：
- 观察：使用 PreToolUse/PostToolUse hooks（100% 可靠）
- 分析：后台代理（Haiku）
- 粒度：原子级"instincts"
- 置信度：0.3-0.9 加权
-->
## What's New in v2

| Feature | v1 | v2 |
|---------|----|----|
| Observation | Stop hook (session end) | PreToolUse/PostToolUse (100% reliable) |
| Analysis | Main context | Background agent (Haiku) |
| Granularity | Full skills | Atomic "instincts" |
| Confidence | None | 0.3-0.9 weighted |

<!--
【说明】Instinct 模型 - 一个 instinct 是一个小型学习行为：
- 原子级：一个触发器，一个动作
- 置信度加权：0.3 = 试探性，0.9 = 几乎确定
- 领域标记：code-style、testing、git、debugging 等
- 证据支持：追踪创建了它的观察
-->
## The Instinct Model

An instinct is a small learned behavior:

```yaml
---
id: prefer-functional-style
trigger: "when writing new functions"
confidence: 0.7
domain: "code-style"
source: "session-observation"
---

# Prefer Functional Style

## Action
Use functional patterns over classes when appropriate.

## Evidence
- Observed 5 instances of functional pattern preference
```

**Properties:**
- **Atomic** — one trigger, one action
- **Confidence-weighted** — 0.3 = tentative, 0.9 = near certain
- **Domain-tagged** — code-style, testing, git, debugging, workflow, etc.
- **Evidence-backed** — tracks what observations created it

<!--
【说明】工作原理 - 流程图：
1. Hooks 捕获提示 + 工具使用（100% 可靠）
2. 观察者代理读取（后台，Haiku）
3. 模式检测：用户纠正/错误解决/重复工作流 → instinct
-->
## How It Works

```
Session Activity
      │
      │ Hooks capture prompts + tool use (100% reliable)
      ▼
┌─────────────────────────────────────────┐
│         observations.jsonl              │
│   (prompts, tool calls, outcomes)       │
└─────────────────────────────────────────┘
      │
      │ Observer agent reads (background, Haiku)
      ▼
┌─────────────────────────────────────────┐
│          PATTERN DETECTION              │
│   • User corrections → instinct         │
│   • Error resolutions → instinct        │
│   • Repeated workflows → instinct       │
└─────────────────────────────────────────┘
```

<!--
【说明】快速开始：
1. 启用观察 Hooks - 添加到 settings.json
2. 使用 Instinct 命令管理
-->
## Quick Start

### 1. Enable Observation Hooks

Add to your `~/.claude/settings.json`.

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

### 3. Use the Instinct Commands

```bash
/instinct-status     # Show learned instincts with confidence scores
/evolve              # Cluster related instincts into skills/commands
/instinct-export     # Export instincts for sharing
/instinct-import <file>     # Import instincts from others
```

<!--
【说明】命令列表：
- /instinct-status：显示所有已学习的 instinct 及其置信度
- /evolve：将相关 instinct 聚类为技能/命令
- /instinct-export：导出 instinct 用于分享
- /instinct-import：从他人导入 instinct
-->
## Commands

| Command | Description |
|---------|-------------|
| `/instinct-status` | Show all learned instincts with confidence |
| `/evolve` | Cluster related instincts into skills/commands |
| `/instinct-export` | Export instincts for sharing |
| `/instinct-import <file>` | Import instincts from others |

<!--
【说明】置信度评分：
- 0.3 试探性：建议但不强制
- 0.5 中等：相关时应用
- 0.7 强：自动批准应用
- 0.9 几乎确定：核心行为
-->
## Confidence Scoring

| Score | Meaning | Behavior |
|-------|---------|----------|
| 0.3 | Tentative | Suggested but not enforced |
| 0.5 | Moderate | Applied when relevant |
| 0.7 | Strong | Auto-approved for application |
| 0.9 | Near-certain | Core behavior |
