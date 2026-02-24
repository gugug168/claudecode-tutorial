<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：在逻辑间隔建议手动压缩上下文                    ║
║  什么时候用它：长会话接近上下文限制、多阶段任务、切换任务时         ║
║  核心能力：上下文管理、手动压缩建议、阶段边界检测                  ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: strategic-compact
description: Suggests manual context compaction at logical intervals to preserve context through task phases rather than arbitrary auto-compaction.
---

# Strategic Compact Skill

<!--
【说明】在工作流的策略点建议手动 `/compact`，而不是依赖任意的自动压缩。
-->
Suggests manual `/compact` at strategic points in your workflow rather than relying on arbitrary auto-compaction.

<!--
【说明】何时激活：
- 运行接近上下文限制的长会话（200K+ tokens）
- 处理多阶段任务（研究 → 计划 → 实现 → 测试）
- 在同一会话中切换不相关的任务
- 完成主要里程碑并开始新工作后
- 当响应变慢或变得不连贯时（上下文压力）
-->
## When to Activate

- Running long sessions that approach context limits (200K+ tokens)
- Working on multi-phase tasks (research → plan → implement → test)
- Switching between unrelated tasks within the same session
- After completing a major milestone and starting new work
- When responses slow down or become less coherent (context pressure)

<!--
【说明】为什么需要策略性压缩？

自动压缩在任意点触发：
- 经常在任务中途，丢失重要上下文
- 不感知逻辑任务边界
- 可能中断复杂的多步操作

在逻辑边界的策略性压缩：
- **探索后、执行前** — 压缩研究上下文，保留实现计划
- **完成里程碑后** — 为下一阶段重新开始
- **重大上下文切换前** — 在不同任务前清理探索上下文
-->
## Why Strategic Compaction?

Auto-compaction triggers at arbitrary points:
- Often mid-task, losing important context
- No awareness of logical task boundaries
- Can interrupt complex multi-step operations

Strategic compaction at logical boundaries:
- **After exploration, before execution** — Compact research context, keep implementation plan
- **After completing a milestone** — Fresh start for next phase
- **Before major context shifts** — Clear exploration context before different task

<!--
【说明】工作原理：
`suggest-compact.js` 脚本在 PreToolUse（Edit/Write）时运行，并且：
1. **追踪工具调用** — 计算会话中的工具调用次数
2. **阈值检测** — 在可配置阈值（默认：50 次调用）时建议
3. **定期提醒** — 阈值后每 25 次调用提醒一次
-->
## How It Works

The `suggest-compact.js` script runs on PreToolUse (Edit/Write) and:

1. **Tracks tool calls** — Counts tool invocations in session
2. **Threshold detection** — Suggests at configurable threshold (default: 50 calls)
3. **Periodic reminders** — Reminds every 25 calls after threshold

<!--
【说明】Hook 设置：添加到 `~/.claude/settings.json`
-->
## Hook Setup

Add to your `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [{ "type": "command", "command": "node ~/.claude/skills/strategic-compact/suggest-compact.js" }]
      },
      {
        "matcher": "Write",
        "hooks": [{ "type": "command", "command": "node ~/.claude/skills/strategic-compact/suggest-compact.js" }]
      }
    ]
  }
}
```

<!--
【说明】配置：
- `COMPACT_THRESHOLD` — 首次建议前的工具调用次数（默认：50）
-->
## Configuration

Environment variables:
- `COMPACT_THRESHOLD` — Tool calls before first suggestion (default: 50)

<!--
【说明】压缩决策指南：
- 研究 → 计划：是（研究上下文臃肿；计划是提炼的输出）
- 计划 → 实现：是（计划在 TodoWrite 或文件中；释放上下文给代码）
- 实现 → 测试：可能（如果测试引用最近代码则保留；切换焦点则压缩）
- 调试 → 下一功能：是（调试痕迹污染不相关工作的上下文）
- 实现中途：否（丢失变量名、文件路径和部分状态代价高昂）
- 失败方法后：是（在尝试新方法前清理死胡同推理）
-->
## Compaction Decision Guide

Use this table to decide when to compact:

| Phase Transition | Compact? | Why |
|-----------------|----------|-----|
| Research → Planning | Yes | Research context is bulky; plan is the distilled output |
| Planning → Implementation | Yes | Plan is in TodoWrite or a file; free up context for code |
| Implementation → Testing | Maybe | Keep if tests reference recent code; compact if switching focus |
| Debugging → Next feature | Yes | Debug traces pollute context for unrelated work |
| Mid-implementation | No | Losing variable names, file paths, and partial state is costly |
| After a failed approach | Yes | Clear the dead-end reasoning before trying a new approach |

<!--
【说明】压缩后保留什么：
- 保留：CLAUDE.md 指令、TodoWrite 任务列表、内存文件、Git 状态、磁盘上的文件
- 丢失：中间推理和分析、读取过的文件内容、多步对话上下文、工具调用历史和计数、口头表达的细微用户偏好
-->
## What Survives Compaction

Understanding what persists helps you compact with confidence:

| Persists | Lost |
|----------|------|
| CLAUDE.md instructions | Intermediate reasoning and analysis |
| TodoWrite task list | File contents you previously read |
| Memory files (`~/.claude/memory/`) | Multi-step conversation context |
| Git state (commits, branches) | Tool call history and counts |
| Files on disk | Nuanced user preferences stated verbally |

<!--
【说明】最佳实践：
1. **计划后压缩** — 计划在 TodoWrite 中确定后，压缩以重新开始
2. **调试后压缩** — 继续前清理错误解决上下文
3. **不要在实现中途压缩** — 保留相关更改的上下文
4. **阅读建议** — Hook 告诉你*何时*，你决定*是否*
5. **压缩前写入** — 压缩前将重要上下文保存到文件或内存
6. **使用带摘要的 `/compact`** — 添加自定义消息
-->
## Best Practices

1. **Compact after planning** — Once plan is finalized in TodoWrite, compact to start fresh
2. **Compact after debugging** — Clear error-resolution context before continuing
3. **Don't compact mid-implementation** — Preserve context for related changes
4. **Read the suggestion** — The hook tells you *when*, you decide *if*
5. **Write before compacting** — Save important context to files or memory before compacting
6. **Use `/compact` with a summary** — Add a custom message: `/compact Focus on implementing auth middleware next`

<!--
【说明】相关资源
-->
## Related

- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) — Token optimization section
- Memory persistence hooks — For state that survives compaction
- `continuous-learning` skill — Extracts patterns before session ends
