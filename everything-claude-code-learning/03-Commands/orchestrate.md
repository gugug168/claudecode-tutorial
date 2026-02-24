# Orchestrate 编排命令

复杂任务的顺序代理工作流。

## 用法

`/orchestrate [工作流类型] [任务描述]`

## 工作流类型

### feature（功能）

完整功能实现工作流：
```
planner -> tdd-guide -> code-reviewer -> security-reviewer
```

### bugfix（修复）

Bug 调查和修复工作流：
```
planner -> tdd-guide -> code-reviewer
```

### refactor（重构）

安全重构工作流：
```
architect -> code-reviewer -> tdd-guide
```

### security（安全）

安全聚焦审查：
```
security-reviewer -> code-reviewer -> architect
```

## 执行模式

对于工作流中的每个代理：

1. **调用代理**，带上前一个代理的上下文
2. **收集输出**为结构化交接文档
3. **传递给下一个代理**在链中
4. **汇总结果**为最终报告

## 交接文档格式

在代理之间创建交接文档：

```markdown
## HANDOFF: [previous-agent] -> [next-agent]

### 上下文
[完成的工作摘要]

### 发现
[关键发现或决策]

### 已修改文件
[触及的文件列表]

### 待解决问题
[下一个代理需要解决的未决项]

### 建议
[建议的下一步]
```

## 参数

$ARGUMENTS:
- `feature <描述>` - 完整功能工作流
- `bugfix <描述>` - Bug 修复工作流
- `refactor <描述>` - 重构工作流
- `security <描述>` - 安全审查工作流
- `custom <代理列表> <描述>` - 自定义代理序列

## 技巧

1. **从 planner 开始**用于复杂功能
2. **始终包含 code-reviewer**在合并前
3. **使用 security-reviewer**用于认证/支付/PII
4. **保持交接简洁** - 专注于下一个代理需要什么
