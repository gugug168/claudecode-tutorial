# Instinct Export 本能导出命令

将 instinct 导出为可分享格式。适用于：
- 与队友分享
- 迁移到新机器
- 贡献到项目约定

## 用法

```
/instinct-export                           # 导出所有个人 instinct
/instinct-export --domain testing          # 只导出测试领域的 instinct
/instinct-export --min-confidence 0.7      # 只导出高置信度的 instinct
/instinct-export --output team-instincts.yaml
```

## 执行步骤

1. 从 `~/.claude/homunculus/instincts/personal/` 读取 instinct
2. 根据标志过滤
3. 去除敏感信息：
   - 删除会话 ID
   - 删除文件路径（只保留模式）
   - 删除超过"上周"的时间戳
4. 生成导出文件

## 输出格式

创建 YAML 文件：

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

## 隐私考虑

导出包含：
- ✅ 触发器模式
- ✅ 动作
- ✅ 置信度分数
- ✅ 领域
- ✅ 观察次数

导出不包含：
- ❌ 实际代码片段
- ❌ 文件路径
- ❌ 会话记录
- ❌ 个人标识

## 标志

- `--domain <名称>`：只导出指定领域
- `--min-confidence <n>`：最小置信度阈值（默认 0.3）
- `--output <文件>`：输出文件路径
- `--format <yaml|json|md>`：输出格式（默认 yaml）
- `--include-evidence`：包含证据文本（默认不包含）
