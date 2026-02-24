# Instinct Status 本能状态命令

显示所有已学习的 instinct 及其置信分数，按领域分组。

## 用法

```
/instinct-status
/instinct-status --domain code-style
/instinct-status --low-confidence
```

## 执行步骤

1. 从 `~/.claude/homunculus/instincts/personal/` 读取所有 instinct 文件
2. 从 `~/.claude/homunculus/instincts/inherited/` 读取继承的 instinct
3. 按领域分组显示，带置信度条

## 标志

- `--domain <名称>`：按领域过滤（code-style、testing、git 等）
- `--low-confidence`：只显示置信度 < 0.5 的 instinct
- `--high-confidence`：只显示置信度 >= 0.7 的 instinct
- `--source <类型>`：按来源过滤（session-observation、repo-analysis、inherited）
- `--json`：以 JSON 输出用于程序化使用
