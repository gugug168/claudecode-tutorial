# Evolve 演进命令

分析 instinct 并将相关的聚类为更高级结构：
- **命令（Commands）**：当 instinct 描述用户调用的操作时
- **技能（Skills）**：当 instinct 描述自动触发的行为时
- **代理（Agents）**：当 instinct 描述复杂的多步骤流程时

## 用法

```
/evolve                    # 分析所有 instinct 并建议进化
/evolve --domain testing   # 只进化测试领域的 instinct
/evolve --dry-run          # 显示将创建什么而不实际创建
/evolve --threshold 5      # 要求 5+ 个相关 instinct 才能聚类
```

## 进化规则

### → 命令（用户调用）

当 instinct 描述用户会明确请求的操作时：
- 多个关于"当用户要求..."的 instinct
- 触发器如"当创建新 X"的 instinct
- 遵循可重复序列的 instinct

### → 技能（自动触发）

当 instinct 描述应该自动发生的行为时：
- 模式匹配触发器
- 错误处理响应
- 代码风格强制

### → 代理（需要深度/隔离）

当 instinct 描述受益于隔离的复杂多步骤流程时：
- 调试工作流
- 重构序列
- 研究任务

## 标志

- `--execute`：实际创建进化结构（默认是预览）
- `--dry-run`：预览而不创建
- `--domain <名称>`：只进化指定领域的 instinct
- `--threshold <n>`：形成聚类所需的最小 instinct 数（默认：3）
- `--type <command|skill|agent>`：只创建指定类型
