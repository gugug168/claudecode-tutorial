# Checkpoint 检查点命令

在工作流中创建或验证检查点。

## 用法

`/checkpoint [create|verify|list] [名称]`

## 创建检查点

当创建检查点时：

1. 运行 `/verify quick` 确保当前状态干净
2. 用检查点名称创建 git stash 或 commit
3. 将检查点记录到 `.claude/checkpoints.log`

## 验证检查点

当验证检查点时：

1. 从日志读取检查点
2. 比较当前状态与检查点：
   - 检查点后添加的文件
   - 检查点后修改的文件
   - 现在的测试通过率 vs 当时
   - 现在的覆盖率 vs 当时

## 列出检查点

显示所有检查点，包含：
- 名称
- 时间戳
- Git SHA
- 状态（当前、落后、领先）

## 典型工作流

```
[开始] --> /checkpoint create "feature-start"
   |
[实现] --> /checkpoint create "core-done"
   |
[测试] --> /checkpoint verify "core-done"
   |
[重构] --> /checkpoint create "refactor-done"
   |
[PR] --> /checkpoint verify "feature-start"
```

## 参数

$ARGUMENTS:
- `create <名称>` - 创建命名检查点
- `verify <名称>` - 验证命名检查点
- `list` - 显示所有检查点
- `clear` - 删除旧检查点（保留最近 5 个）
