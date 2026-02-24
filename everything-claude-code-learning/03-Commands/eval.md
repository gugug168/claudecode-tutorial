# Eval 评估命令

管理 eval 驱动的开发工作流。

## 用法

`/eval [define|check|report|list] [功能名称]`

## 定义 Eval

`/eval define feature-name`

创建新的 eval 定义：

1. 在 `.claude/evals/feature-name.md` 创建模板：

```markdown
## EVAL: feature-name
Created: $(date)

### Capability Evals（能力评估）
- [ ] [能力描述 1]
- [ ] [能力描述 2]

### Regression Evals（回归评估）
- [ ] [现有行为 1 仍然正常]
- [ ] [现有行为 2 仍然正常]

### Success Criteria（成功标准）
- pass@3 > 90% for capability evals
- pass^3 = 100% for regression evals
```

## 检查 Eval

`/eval check feature-name`

为功能运行评估：

1. 从 `.claude/evals/feature-name.md` 读取 eval 定义
2. 对每个能力评估：
   - 尝试验证标准
   - 记录 PASS/FAIL
3. 对每个回归评估：
   - 运行相关测试
   - 与基线比较
4. 报告当前状态

## 报告 Eval

`/eval report feature-name`

生成全面的 eval 报告：

```
EVAL REPORT: feature-name
=========================
Generated: $(date)

CAPABILITY EVALS（能力评估）
----------------
[eval-1]: PASS (pass@1)
[eval-2]: PASS (pass@2) - required retry
[eval-3]: FAIL - see notes

REGRESSION EVALS（回归评估）
----------------
[test-1]: PASS
[test-2]: PASS

RECOMMENDATION（建议）
--------------
[SHIP / NEEDS WORK / BLOCKED]
```

## 列出 Eval

`/eval list`

显示所有 eval 定义：

```
EVAL DEFINITIONS
================
feature-auth      [3/5 passing] IN PROGRESS
feature-search    [5/5 passing] READY
feature-export    [0/4 passing] NOT STARTED
```

## 参数

$ARGUMENTS:
- `define <名称>` - 创建新的 eval 定义
- `check <名称>` - 运行并检查 eval
- `report <名称>` - 生成完整报告
- `list` - 显示所有 eval
- `clean` - 删除旧的 eval 日志（保留最近 10 次运行）
