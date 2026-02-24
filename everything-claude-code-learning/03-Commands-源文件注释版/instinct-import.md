<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：导入队友或项目分享的 instinct                    ║
║  什么时候用它：需要接收他人分享的学习模式时                          ║
║  核心能力：导入 instinct、冲突检测、合并策略、来源追踪               ║
║  触发方式：/instinct-import [文件或URL]                            ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: instinct-import
description: Import instincts from teammates, Skill Creator, or other sources
command: true
---

# Instinct Import Command

<!--
【说明】实现：使用插件根路径运行 instinct CLI
- 可以从文件或 URL 导入
- 支持 --dry-run 预览、--force 强制导入等选项
-->
## Implementation

Run the instinct CLI using the plugin root path:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" import <file-or-url> [--dry-run] [--force] [--min-confidence 0.7]
```

Or if `CLAUDE_PLUGIN_ROOT` is not set (manual installation):

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py import <file-or-url>
```

<!--
【说明】导入来源：
- 队友的导出
- Skill Creator（仓库分析）
- 社区收集
- 以前机器的备份
-->
Import instincts from:
- Teammates' exports
- Skill Creator (repo analysis)
- Community collections
- Previous machine backups

<!--
【说明】用法示例：
- 从文件导入
- 从 URL 导入
- 从 Skill Creator 导入
-->
## Usage

```
/instinct-import team-instincts.yaml
/instinct-import https://github.com/org/repo/instincts.yaml
/instinct-import --from-skill-creator acme/webapp
```

<!--
【说明】做什么：
1. 获取 instinct 文件（本地路径或 URL）
2. 解析并验证格式
3. 检查与现有 instinct 的重复
4. 合并或添加新 instinct
5. 保存到 inherited/ 目录
-->
## What to Do

1. Fetch the instinct file (local path or URL)
2. Parse and validate the format
3. Check for duplicates with existing instincts
4. Merge or add new instincts
5. Save to `~/.claude/homunculus/instincts/inherited/`

<!--
【说明】导入流程示例：
- 显示找到的 instinct 数量
- 分析冲突（新/重复/冲突）
- 询问用户确认导入
-->
## Import Process

```
📥 Importing instincts from: team-instincts.yaml
================================================

Found 12 instincts to import.

Analyzing conflicts...

## New Instincts (8)
These will be added:
  ✓ use-zod-validation (confidence: 0.7)
  ✓ prefer-named-exports (confidence: 0.65)
  ✓ test-async-functions (confidence: 0.8)
  ...

## Duplicate Instincts (3)
Already have similar instincts:
  ⚠️ prefer-functional-style
     Local: 0.8 confidence, 12 observations
     Import: 0.7 confidence
     → Keep local (higher confidence)

  ⚠️ test-first-workflow
     Local: 0.75 confidence
     Import: 0.9 confidence
     → Update to import (higher confidence)

## Conflicting Instincts (1)
These contradict local instincts:
  ❌ use-classes-for-services
     Conflicts with: avoid-classes
     → Skip (requires manual resolution)

---
Import 8 new, update 1, skip 3?
```

<!--
【说明】合并策略：
- 对于重复项：高置信度胜出、合并证据、更新时间戳
- 对于冲突项：默认跳过、标记待审核、手动解决
-->
## Merge Strategies

### For Duplicates
When importing an instinct that matches an existing one:
- **Higher confidence wins**: Keep the one with higher confidence
- **Merge evidence**: Combine observation counts
- **Update timestamp**: Mark as recently validated

### For Conflicts
When importing an instinct that contradicts an existing one:
- **Skip by default**: Don't import conflicting instincts
- **Flag for review**: Mark both as needing attention
- **Manual resolution**: User decides which to keep

<!--
【说明】来源追踪：导入的 instinct 标记为 inherited，记录导入来源和时间
-->
## Source Tracking

Imported instincts are marked with:
```yaml
source: "inherited"
imported_from: "team-instincts.yaml"
imported_at: "2025-01-22T10:30:00Z"
original_source: "session-observation"  # or "repo-analysis"
```

<!--
【说明】Skill Creator 集成：
- 从仓库分析生成的 instinct
- 更高的初始置信度（0.7+）
- 链接到源仓库
-->
## Skill Creator Integration

When importing from Skill Creator:

```
/instinct-import --from-skill-creator acme/webapp
```

This fetches instincts generated from repo analysis:
- Source: `repo-analysis`
- Higher initial confidence (0.7+)
- Linked to source repository

<!--
【说明】标志：
- --dry-run：预览而不导入
- --force：即使存在冲突也导入
- --merge-strategy：如何处理重复
- --from-skill-creator：从 Skill Creator 分析导入
- --min-confidence：只导入高于阈值的 instinct
-->
## Flags

- `--dry-run`: Preview without importing
- `--force`: Import even if conflicts exist
- `--merge-strategy <higher|local|import>`: How to handle duplicates
- `--from-skill-creator <owner/repo>`: Import from Skill Creator analysis
- `--min-confidence <n>`: Only import instincts above threshold

<!--
【说明】输出：导入完成后显示统计信息
-->
## Output

After import:
```
✅ Import complete!

Added: 8 instincts
Updated: 1 instinct
Skipped: 3 instincts (2 duplicates, 1 conflict)

New instincts saved to: ~/.claude/homunculus/instincts/inherited/

Run /instinct-status to see all instincts.
```
