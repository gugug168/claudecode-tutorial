<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：在工作流中创建或验证检查点                      ║
║  什么时候用它：需要保存工作状态、比较进度、回滚时                    ║
║  核心能力：创建检查点、验证检查点、列出检查点                        ║
║  触发方式：/checkpoint [create|verify|list] [name]                 ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Checkpoint Command

<!--
【说明】在工作流中创建或验证检查点。
-->
Create or verify a checkpoint in your workflow.

<!--
【说明】用法：/checkpoint [create|verify|list] [名称]
-->
## Usage

`/checkpoint [create|verify|list] [name]`

<!--
【说明】创建检查点时：
1. 运行 `/verify quick` 确保当前状态干净
2. 用检查点名称创建 git stash 或 commit
3. 将检查点记录到 `.claude/checkpoints.log`
-->
## Create Checkpoint

When creating a checkpoint:

1. Run `/verify quick` to ensure current state is clean
2. Create a git stash or commit with checkpoint name
3. Log checkpoint to `.claude/checkpoints.log`:

<!--
【说明】验证检查点时：
1. 从日志读取检查点
2. 比较当前状态与检查点：检查点后添加的文件、检查点后修改的文件、现在 vs 当时的测试通过率、现在 vs 当时的覆盖率
-->
## Verify Checkpoint

When verifying against a checkpoint:

1. Read checkpoint from log
2. Compare current state to checkpoint:
   - Files added since checkpoint
   - Files modified since checkpoint
   - Test pass rate now vs then
   - Coverage now vs then

<!--
【说明】列出检查点：显示所有检查点，包含名称、时间戳、Git SHA、状态（当前、落后、领先）
-->
## List Checkpoints

Show all checkpoints with:
- Name
- Timestamp
- Git SHA
- Status (current, behind, ahead)

<!--
【说明】典型的检查点流程：开始 → 创建检查点 → 实现 → 创建检查点 → 测试 → 验证检查点 → 重构 → 创建检查点 → PR → 验证初始检查点
-->
## Workflow

Typical checkpoint flow:

```
[Start] --> /checkpoint create "feature-start"
   |
[Implement] --> /checkpoint create "core-done"
   |
[Test] --> /checkpoint verify "core-done"
   |
[Refactor] --> /checkpoint create "refactor-done"
   |
[PR] --> /checkpoint verify "feature-start"
```

<!--
【说明】参数：
- `create <名称>` - 创建命名检查点
- `verify <名称>` - 验证命名检查点
- `list` - 显示所有检查点
- `clear` - 删除旧检查点（保留最近5个）
-->
## Arguments

$ARGUMENTS:
- `create <name>` - Create named checkpoint
- `verify <name>` - Verify against named checkpoint
- `list` - Show all checkpoints
- `clear` - Remove old checkpoints (keeps last 5)
