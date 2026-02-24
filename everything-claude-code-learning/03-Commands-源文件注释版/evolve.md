<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：将相关 instinct 聚类为技能、命令或代理           ║
║  什么时候用它：需要从学习的 instinct 中创建更高级结构时              ║
║  核心能力：聚类分析、进化类型判断、生成文件                          ║
║  触发方式：/evolve                                                 ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: evolve
description: Cluster related instincts into skills, commands, or agents
command: true
---

# Evolve Command

<!--
【说明】分析 instinct 并将相关的聚类为更高级结构：
- 命令：当 instinct 描述用户调用的操作时
- 技能：当 instinct 描述自动触发的行为时
- 代理：当 instinct 描述复杂的多步骤流程时
-->
Analyzes instincts and clusters related ones into higher-level structures:
- **Commands**: When instincts describe user-invoked actions
- **Skills**: When instincts describe auto-triggered behaviors
- **Agents**: When instincts describe complex, multi-step processes

<!--
【说明】用法：
- 分析所有 instinct 并建议进化
- 只进化测试领域的 instinct
- 显示将创建什么而不实际创建
- 要求 5+ 个相关 instinct 才能聚类
-->
## Usage

```
/evolve                    # Analyze all instincts and suggest evolutions
/evolve --domain testing   # Only evolve instincts in testing domain
/evolve --dry-run          # Show what would be created without creating
/evolve --threshold 5      # Require 5+ related instincts to cluster
```

<!--
【说明】进化规则：
→ 命令（用户调用）：当 instinct 描述用户会明确请求的操作时，如"当用户要求..."、"当创建新 X"、遵循可重复序列
→ 技能（自动触发）：当 instinct 描述应该自动发生的行为时，如模式匹配触发器、错误处理响应、代码风格强制
→ 代理（需要深度/隔离）：当 instinct 描述受益于隔离的复杂多步骤流程时，如调试工作流、重构序列、研究任务
-->
## Evolution Rules

### → Command (User-Invoked)
When instincts describe actions a user would explicitly request:
- Multiple instincts about "when user asks to..."
- Instincts with triggers like "when creating a new X"
- Instincts that follow a repeatable sequence

### → Skill (Auto-Triggered)
When instincts describe behaviors that should happen automatically:
- Pattern-matching triggers
- Error handling responses
- Code style enforcement

### → Agent (Needs Depth/Isolation)
When instincts describe complex, multi-step processes that benefit from isolation:
- Debugging workflows
- Refactoring sequences
- Research tasks

<!--
【说明】标志：
- --execute：实际创建进化结构（默认是预览）
- --dry-run：预览而不创建
- --domain <名称>：只进化指定领域的 instinct
- --threshold <n>：形成聚类所需的最小 instinct 数（默认：3）
- --type <command|skill|agent>：只创建指定类型
-->
## Flags

- `--execute`: Actually create the evolved structures (default is preview)
- `--dry-run`: Preview without creating
- `--domain <name>`: Only evolve instincts in specified domain
- `--threshold <n>`: Minimum instincts required to form cluster (default: 3)
- `--type <command|skill|agent>`: Only create specified type
