<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：导出 instinct 用于分享或迁移                     ║
║  什么时候用它：需要与队友分享学习成果、迁移到新机器时                 ║
║  核心能力：导出 instinct、过滤、隐私清理、多种输出格式               ║
║  触发方式：/instinct-export                                        ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: instinct-export
description: Export instincts for sharing with teammates or other projects
command: /instinct-export
---

# Instinct Export Command

<!--
【说明】将 instinct 导出为可分享格式。适用于：
- 与队友分享
- 迁移到新机器
- 贡献到项目约定
-->
Exports instincts to a shareable format. Perfect for:
- Sharing with teammates
- Transferring to a new machine
- Contributing to project conventions

<!--
【说明】用法示例：
- 导出所有个人 instinct
- 只导出测试领域的 instinct
- 只导出高置信度的 instinct
- 指定输出文件名
-->
## Usage

```
/instinct-export                           # Export all personal instincts
/instinct-export --domain testing          # Export only testing instincts
/instinct-export --min-confidence 0.7      # Only export high-confidence instincts
/instinct-export --output team-instincts.yaml
```

<!--
【说明】做什么：
1. 从 personal/ 目录读取 instinct
2. 根据标志过滤
3. 去除敏感信息（会话ID、文件路径、旧时间戳）
4. 生成导出文件
-->
## What to Do

1. Read instincts from `~/.claude/homunculus/instincts/personal/`
2. Filter based on flags
3. Strip sensitive information:
   - Remove session IDs
   - Remove file paths (keep only patterns)
   - Remove timestamps older than "last week"
4. Generate export file

<!--
【说明】输出格式：YAML 文件，包含版本、导出信息、instinct 列表
每个 instinct 包含：id、trigger、action、confidence、domain、observations
-->
## Output Format

Creates a YAML file:

```yaml
# Instincts Export
# Generated: 2025-01-22
# Source: personal
# Count: 12 instincts

version: "2.0"
exported_by: "continuous-learning-v2"
export_date: "2025-01-22T10:30:00Z"

instincts:
  - id: prefer-functional-style
    trigger: "when writing new functions"
    action: "Use functional patterns over classes"
    confidence: 0.8
    domain: code-style
    observations: 8

  - id: test-first-workflow
    trigger: "when adding new functionality"
    action: "Write test first, then implementation"
    confidence: 0.9
    domain: testing
    observations: 12

  - id: grep-before-edit
    trigger: "when modifying code"
    action: "Search with Grep, confirm with Read, then Edit"
    confidence: 0.7
    domain: workflow
    observations: 6
```

<!--
【说明】隐私考虑：
- 导出包含：触发器模式、动作、置信度分数、领域、观察次数
- 导出不包含：实际代码片段、文件路径、会话记录、个人标识
-->
## Privacy Considerations

Exports include:
- ✅ Trigger patterns
- ✅ Actions
- ✅ Confidence scores
- ✅ Domains
- ✅ Observation counts

Exports do NOT include:
- ❌ Actual code snippets
- ❌ File paths
- ❌ Session transcripts
- ❌ Personal identifiers

<!--
【说明】标志：
- --domain <名称>：只导出指定领域
- --min-confidence <n>：最小置信度阈值（默认 0.3）
- --output <文件>：输出文件路径
- --format <yaml|json|md>：输出格式（默认 yaml）
- --include-evidence：包含证据文本（默认不包含）
-->
## Flags

- `--domain <name>`: Export only specified domain
- `--min-confidence <n>`: Minimum confidence threshold (default: 0.3)
- `--output <file>`: Output file path (default: instincts-export-YYYYMMDD.yaml)
- `--format <yaml|json|md>`: Output format (default: yaml)
- `--include-evidence`: Include evidence text (default: excluded)
