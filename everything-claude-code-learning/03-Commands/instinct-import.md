# Instinct Import 本能导入命令

从队友、Skill Creator 或其他来源导入 instinct。

## 实现

使用插件根路径运行 instinct CLI：

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" import <文件或URL> [--dry-run] [--force] [--min-confidence 0.7]
```

如果 `CLAUDE_PLUGIN_ROOT` 未设置（手动安装）：

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py import <文件或URL>
```

## 导入来源

从以下来源导入 instinct：
- 队友的导出
- Skill Creator（仓库分析）
- 社区收集
- 以前机器的备份

## 用法

```
/instinct-import team-instincts.yaml
/instinct-import https://github.com/org/repo/instincts.yaml
/instinct-import --from-skill-creator acme/webapp
```

## 执行步骤

1. 获取 instinct 文件（本地路径或 URL）
2. 解析并验证格式
3. 检查与现有 instinct 的重复
4. 合并或添加新 instinct
5. 保存到 `~/.claude/homunculus/instincts/inherited/`

## 导入流程示例

```
📥 从以下位置导入 instinct：team-instincts.yaml
================================================

找到 12 个 instinct 待导入。

分析冲突...

## 新 Instinct（8 个）
这些将被添加：
  ✓ use-zod-validation (置信度: 0.7)
  ✓ prefer-named-exports (置信度: 0.65)
  ✓ test-async-functions (置信度: 0.8)
  ...

## 重复 Instinct（3 个）
已有类似 instinct：
  ⚠️ prefer-functional-style
     本地: 0.8 置信度, 12 次观察
     导入: 0.7 置信度
     → 保留本地（更高置信度）

  ⚠️ test-first-workflow
     本地: 0.75 置信度
     导入: 0.9 置信度
     → 更新为导入（更高置信度）

## 冲突 Instinct（1 个）
这些与本地 instinct 矛盾：
  ❌ use-classes-for-services
     与以下冲突: avoid-classes
     → 跳过（需要手动解决）

---
导入 8 个新的，更新 1 个，跳过 3 个？
```

## 合并策略

### 对于重复项

当导入与现有 instinct 匹配时：
- **高置信度胜出**：保留置信度更高的
- **合并证据**：合并观察次数
- **更新时间戳**：标记为最近验证

### 对于冲突项

当导入与现有 instinct 矛盾时：
- **默认跳过**：不导入冲突的 instinct
- **标记待审核**：将两者标记为需要关注
- **手动解决**：用户决定保留哪个

## 来源追踪

导入的 instinct 标记为：
```yaml
source: "inherited"
imported_from: "team-instincts.yaml"
imported_at: "2025-01-22T10:30:00Z"
original_source: "session-observation"  # 或 "repo-analysis"
```

## 标志

- `--dry-run`：预览而不导入
- `--force`：即使存在冲突也导入
- `--merge-strategy <higher|local|import>`：如何处理重复
- `--from-skill-creator <owner/repo>`：从 Skill Creator 分析导入
- `--min-confidence <n>`：只导入高于阈值的 instinct

## 输出

导入完成后：
```
✅ 导入完成！

添加: 8 instincts
更新: 1 instinct
跳过: 3 instincts (2 duplicates, 1 conflict)

新 instinct 保存到: ~/.claude/homunculus/instincts/inherited/

运行 /instinct-status 查看所有 instinct。
```
