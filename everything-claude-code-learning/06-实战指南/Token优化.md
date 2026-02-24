# Token 优化指南

## 为什么需要优化 Token？

Claude Code 使用可能会很昂贵。每个请求都消耗 Token，包括：
- 系统提示
- 对话历史
- MCP 工具描述
- 文件内容

不优化的话，你可能会：
- 很快达到每日限制
- 上下文窗口快速缩小
- 成本意外增加

---

## 推荐设置

添加到 `~/.claude/settings.json`：

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50",
    "CLAUDE_CODE_SUBAGENT_MODEL": "haiku"
  }
}
```

### 设置说明

| 设置 | 默认值 | 推荐值 | 影响 |
|------|--------|--------|------|
| `model` | opus | **sonnet** | 成本降低约60%，能处理80%+任务 |
| `MAX_THINKING_TOKENS` | 31,999 | **10,000** | 隐藏思考成本降低约70% |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 95 | **50** | 更早压缩，长会话质量更好 |
| `CLAUDE_CODE_SUBAGENT_MODEL` | sonnet | **haiku** | 子代理使用更便宜的模型 |

---

## 模型选择策略

### Sonnet（日常使用）

适用于：
- 大多数编码任务
- 代码审查
- 文档编写
- 一般问题解答

```bash
/model sonnet
```

### Opus（复杂任务）

适用于：
- 深度架构推理
- 复杂调试
- 需要深度思考的问题
- planner/architect 代理

```bash
/model opus
```

### Haiku（简单任务）

适用于：
- 简单查询
- 文件读取
- 格式化
- 子代理任务

---

## 日常工作流命令

| 命令 | 用途 |
|------|------|
| `/model sonnet` | 大多数任务默认 |
| `/model opus` | 复杂架构、调试、深度推理 |
| `/clear` | 不相关任务之间（免费，即时重置） |
| `/compact` | 逻辑任务断点（研究完成、里程碑完成） |
| `/cost` | 监控会话中的 Token 消耗 |

---

## 策略性压缩

### 什么时候压缩

**应该压缩**：
- 研究/探索后，实现前
- 完成里程碑后，开始下一个前
- 调试后，继续功能工作前
- 失败方法后，尝试新方法前

**不应该压缩**：
- 实现中间（会丢失变量名、文件路径、部分状态）

### 压缩示例

```bash
# 研究阶段
[研究API文档...]
/compact        # 压缩研究结果

# 实现阶段
[实现功能...]
# 不压缩！保持上下文

# 完成后
/code-review
/compact        # 压缩实现细节，保留结论
```

---

## 上下文窗口管理

### MCP 服务器限制

**关键**: 不要同时启用所有 MCP。每个 MCP 工具描述都会消耗 200k 窗口中的 Token，可能将其减少到约70k。

- 每个项目保持 MCP 服务器 < 10 个
- 活跃工具 < 80 个
- 使用 `disabledMcpServers` 禁用未使用的

```json
// 在项目的 .claude/settings.json 中
{
  "disabledMcpServers": ["supabase", "railway", "vercel", "github"]
}
```

### 代理团队成本警告

代理团队会生成多个上下文窗口。每个队友独立消耗 Token。只在并行性提供明确价值时使用（多模块工作、并行审查）。对于简单的顺序任务，子代理更省 Token。

---

## 代码输入优化

### 避免读取整个大文件

```bash
# ❌ 不好: 读取整个大文件
Read: src/huge-file.ts

# ✅ 更好: 先搜索
Grep: "function targetFunction" src/
# 然后只读取相关部分
```

### 使用精确的搜索模式

```bash
# ❌ 不好: 模糊搜索
Grep: "user" src/

# ✅ 更好: 精确搜索
Grep: "function getUserById" src/
```

### 批量操作

```bash
# ❌ 不好: 多次小操作
Edit file1.ts
Edit file2.ts
Edit file3.ts

# ✅ 更好: 一次描述多个变更
"Update the API endpoints in file1.ts, file2.ts, and file3.ts"
```

---

## 成本监控

### 使用 /cost 命令

```bash
/cost
# 显示当前会话的 Token 消耗
```

### 设置预算提醒

在 Claude.ai 账户设置中配置使用限制。

---

## 成本对比示例

### 场景: 开发一个新功能

| 方法 | Token 使用 | 成本 |
|------|-----------|------|
| 全程 Opus | ~100k | $$$ |
| Sonnet + 偶尔 Opus | ~40k | $ |
| Sonnet + 策略压缩 | ~30k | $ |

### 场景: 长会话（10+ 轮）

| 方法 | Token 使用 | 质量 |
|------|-----------|------|
| 不压缩 | 上下文爆炸 | 下降 |
| 自动压缩@95% | 高 | 中等 |
| 策略压缩@50% | 优化 | 高 |

---

## 优化检查清单

- [ ] 默认使用 sonnet 模型
- [ ] 设置 MAX_THINKING_TOKENS=10000
- [ ] 设置自动压缩为 50%
- [ ] MCP 服务器 < 10 个
- [ ] 活跃工具 < 80 个
- [ ] 不相关任务之间使用 /clear
- [ ] 逻辑断点使用 /compact
- [ ] 定期使用 /cost 监控
- [ ] 禁用未使用的 MCP

---

## 关键要点

1. **Sonnet 是默认选择** - 处理80%+任务，成本更低
2. **策略性压缩** - 在逻辑断点压缩，不在实现中间
3. **管理 MCP** - 禁用不用的，保持 < 10 个
4. **监控成本** - 使用 /cost 跟踪消耗
5. **精确输入** - 搜索优于读取整个文件
