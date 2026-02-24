<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：显示所有已学习的 instinct 及其置信度            ║
║  什么时候用它：需要查看已学习的模式和它们的置信水平时                ║
║  核心能力：列出 instinct、按领域分组、显示置信度                    ║
║  触发方式：/instinct-status                                        ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: instinct-status
description: Show all learned instincts with their confidence levels
command: true
---

# Instinct Status Command

<!--
【说明】显示所有已学习的 instinct 及其置信分数，按领域分组。
-->
Shows all learned instincts with their confidence scores, grouped by domain.

<!--
【说明】用法：/instinct-status、/instinct-status --domain code-style、/instinct-status --low-confidence
-->
## Usage

```
/instinct-status
/instinct-status --domain code-style
/instinct-status --low-confidence
```

<!--
【说明】做什么：
1. 从 ~/.claude/homunculus/instincts/personal/ 读取所有 instinct 文件
2. 从 ~/.claude/homunculus/instincts/inherited/ 读取继承的 instinct
3. 按领域分组显示，带置信度条
-->
## What to Do

1. Read all instinct files from `~/.claude/homunculus/instincts/personal/`
2. Read inherited instincts from `~/.claude/homunculus/instincts/inherited/`
3. Display them grouped by domain with confidence bars

<!--
【说明】标志：
- --domain <名称>：按领域过滤（code-style、testing、git 等）
- --low-confidence：只显示置信度 < 0.5 的 instinct
- --high-confidence：只显示置信度 >= 0.7 的 instinct
- --source <类型>：按来源过滤（session-observation、repo-analysis、inherited）
- --json：以 JSON 输出用于程序化使用
-->
## Flags

- `--domain <name>`: Filter by domain (code-style, testing, git, etc.)
- `--low-confidence`: Show only instincts with confidence < 0.5
- `--high-confidence`: Show only instincts with confidence >= 0.7
- `--source <type>`: Filter by source (session-observation, repo-analysis, inherited)
- `--json`: Output as JSON for programmatic use
