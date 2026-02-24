<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：管理 eval 驱动的开发工作流                       ║
║  什么时候用它：需要定义、检查、报告功能评估时                        ║
║  核心能力：定义 eval、检查 eval、生成报告、列出 eval                 ║
║  触发方式：/eval [define|check|report|list] [feature-name]         ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Eval Command

<!--
【说明】管理 eval 驱动的开发工作流。
-->
Manage eval-driven development workflow.

<!--
【说明】用法：/eval [define|check|report|list] [功能名称]
-->
## Usage

`/eval [define|check|report|list] [feature-name]`

<!--
【说明】定义 Eval：/eval define 功能名称。创建新的 eval 定义，包含能力评估、回归评估和成功标准
-->
## Define Evals

`/eval define feature-name`

Create a new eval definition:

1. Create `.claude/evals/feature-name.md` with template:

```markdown
## EVAL: feature-name
Created: $(date)

### Capability Evals
- [ ] [Description of capability 1]
- [ ] [Description of capability 2]

### Regression Evals
- [ ] [Existing behavior 1 still works]
- [ ] [Existing behavior 2 still works]

### Success Criteria
- pass@3 > 90% for capability evals
- pass^3 = 100% for regression evals
```

<!--
【说明】检查 Eval：/eval check 功能名称。为功能运行 eval，验证标准、记录通过/失败、与基线比较、报告当前状态
-->
## Check Evals

`/eval check feature-name`

Run evals for a feature:

1. Read eval definition from `.claude/evals/feature-name.md`
2. For each capability eval:
   - Attempt to verify criterion
   - Record PASS/FAIL
3. For each regression eval:
   - Run relevant tests
   - Compare against baseline
4. Report current status:

<!--
【说明】报告 Eval：/eval report 功能名称。生成全面的 eval 报告，包含能力评估、回归评估和建议（发布/需要工作/阻塞）
-->
## Report Evals

`/eval report feature-name`

Generate comprehensive eval report:

```
EVAL REPORT: feature-name
=========================
Generated: $(date)

CAPABILITY EVALS
----------------
[eval-1]: PASS (pass@1)
[eval-2]: PASS (pass@2) - required retry
[eval-3]: FAIL - see notes

REGRESSION EVALS
----------------
[test-1]: PASS
[test-2]: PASS

RECOMMENDATION
--------------
[SHIP / NEEDS WORK / BLOCKED]
```

<!--
【说明】列出 Eval：/eval list。显示所有 eval 定义及其状态（进行中/就绪/未开始）
-->
## List Evals

`/eval list`

Show all eval definitions:

```
EVAL DEFINITIONS
================
feature-auth      [3/5 passing] IN PROGRESS
feature-search    [5/5 passing] READY
feature-export    [0/4 passing] NOT STARTED
```

<!--
【说明】参数：
- define <名称> - 创建新的 eval 定义
- check <名称> - 运行并检查 eval
- report <名称> - 生成完整报告
- list - 显示所有 eval
- clean - 删除旧的 eval 日志（保留最近 10 次运行）
-->
## Arguments

$ARGUMENTS:
- `define <name>` - Create new eval definition
- `check <name>` - Run and check evals
- `report <name>` - Generate full report
- `list` - Show all evals
- `clean` - Remove old eval logs (keeps last 10 runs)
