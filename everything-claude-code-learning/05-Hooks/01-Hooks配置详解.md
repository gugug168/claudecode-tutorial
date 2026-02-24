# Hooks 配置详解

<!--
╔══════════════════════════════════════════════════════════════════╗
║  【教学概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  Hooks 是什么：事件驱动的自动化系统，在工具执行前后自动运行         ║
║  有什么用：强制代码质量、及早发现错误、自动化重复检查               ║
║  核心类型：PreToolUse、PostToolUse、Stop、SessionStart/End        ║
╚══════════════════════════════════════════════════════════════════╝
-->

## Hooks 工作原理

```
用户请求 → Claude 选择工具 → PreToolUse hook 运行 → 工具执行 → PostToolUse hook 运行
```

### Hook 类型说明

| Hook 类型 | 触发时机 | 能做什么 | 不能做什么 |
|-----------|----------|----------|------------|
| **PreToolUse** | 工具执行前 | 阻止执行（退出码2）、发出警告 | 修改工具输出 |
| **PostToolUse** | 工具执行后 | 分析输出、自动格式化 | 阻止执行 |
| **Stop** | 每次响应后 | 最终验证 | 阻止执行 |
| **SessionStart** | 会话开始时 | 加载上下文 | - |
| **SessionEnd** | 会话结束时 | 保存状态 | - |
| **PreCompact** | 上下文压缩前 | 保存重要状态 | - |

---

## 本插件包含的 Hooks

### PreToolUse Hooks（工具执行前）

#### 1. 开发服务器阻止器

**作用**：阻止在 tmux 外运行开发服务器

```
触发条件：npm run dev、pnpm dev、yarn dev 等命令
行为：阻止执行（退出码 2）
原因：确保你能访问服务器日志
```

**正确做法**：
```bash
# 创建 tmux 会话
tmux new-session -d -s dev "npm run dev"

# 连接到会话查看日志
tmux attach -t dev
```

#### 2. Tmux 提醒

**作用**：建议在 tmux 中运行长时间命令

```
触发条件：npm test、cargo build、docker、pytest 等命令
行为：发出警告（不阻止）
原因：tmux 提供会话持久性
```

#### 3. Git Push 提醒

**作用**：推送前提醒审查更改

```
触发条件：git push 命令
行为：发出警告（不阻止）
原因：确保你知道要推送什么
```

#### 4. 文档文件阻止器

**作用**：阻止创建随意的 .md/.txt 文件

```
触发条件：创建非 README、CLAUDE、CONTRIBUTING 的 .md 文件
行为：阻止执行（退出码 2）
原因：保持文档集中管理
```

**允许的文件**：
- README.md
- CLAUDE.md
- AGENTS.md
- CONTRIBUTING.md

#### 5. 策略压缩建议

**作用**：在逻辑间隔建议手动压缩

```
触发条件：Edit 或 Write 操作
行为：发出警告（不阻止）
原因：在正确时机压缩上下文
```

### PostToolUse Hooks（工具执行后）

#### 1. PR 日志记录器

**作用**：创建 PR 后记录 URL 和审查命令

```bash
# 输出示例
[Hook] PR created: https://github.com/owner/repo/pull/123
[Hook] To review: gh pr review 123 --repo owner/repo
```

#### 2. 构建分析器

**作用**：构建完成后后台分析（异步，不阻塞）

#### 3. Prettier 格式化

**作用**：编辑 JS/TS 文件后自动格式化

#### 4. TypeScript 检查

**作用**：编辑 .ts/.tsx 文件后运行类型检查

#### 5. console.log 警告

**作用**：编辑后警告 console.log 语句

### 生命周期 Hooks

| Hook | 触发时机 | 作用 |
|------|----------|------|
| SessionStart | 会话开始 | 加载上一次的上下文，检测包管理器 |
| PreCompact | 压缩前 | 保存状态 |
| Stop | 每次响应后 | 检查修改文件中的 console.log |
| SessionEnd | 会话结束 | 持久化会话状态，评估可提取模式 |

---

## 自定义 Hooks

### 如何禁用 Hook

在 `~/.claude/settings.json` 中覆盖：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [],
        "description": "覆盖：允许所有 .md 文件创建"
      }
    ]
  }
}
```

### 如何编写自己的 Hook

Hooks 是接收 stdin 上 JSON 输入并必须在 stdout 上输出 JSON 的 shell 命令。

**基本结构**：

```javascript
// my-hook.js
let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  const input = JSON.parse(data);

  // 访问工具信息
  const toolName = input.tool_name;        // "Edit", "Bash", "Write" 等
  const toolInput = input.tool_input;      // 工具特定参数
  const toolOutput = input.tool_output;    // 仅 PostToolUse 可用

  // 警告（不阻塞）：写入 stderr
  console.error('[Hook] 显示给 Claude 的警告消息');

  // 阻止（仅 PreToolUse）：退出码 2
  // process.exit(2);

  // 始终将原始数据输出到 stdout
  console.log(data);
});
```

**退出码**：
- `0` — 成功（继续执行）
- `2` — 阻止工具调用（仅 PreToolUse）
- 其他非零 — 错误（记录但不阻止）

### Hook 输入结构

```typescript
interface HookInput {
  tool_name: string;          // "Bash", "Edit", "Write", "Read" 等
  tool_input: {
    command?: string;         // Bash: 正在运行的命令
    file_path?: string;       // Edit/Write/Read: 目标文件
    old_string?: string;      // Edit: 被替换的文本
    new_string?: string;      // Edit: 替换文本
    content?: string;         // Write: 文件内容
  };
  tool_output?: {             // 仅 PostToolUse 可用
    output?: string;          // 命令/工具输出
  };
}
```

### 异步 Hooks

对于不应阻塞主流程的 hooks：

```json
{
  "type": "command",
  "command": "node my-slow-hook.js",
  "async": true,
  "timeout": 30
}
```

异步 hooks 在后台运行，无法阻止工具执行。

---

## 常用 Hook 示例

### 警告 TODO 注释

```json
{
  "matcher": "Edit",
  "hooks": [{
    "type": "command",
    "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const ns=i.tool_input?.new_string||'';if(/TODO|FIXME|HACK/.test(ns)){console.error('[Hook] 新增 TODO/FIXME - 考虑创建 issue')}console.log(d)})\""
  }],
  "description": "添加 TODO/FIXME 时发出警告"
}
```

### 阻止大文件创建

```json
{
  "matcher": "Write",
  "hooks": [{
    "type": "command",
    "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const c=i.tool_input?.content||'';const lines=c.split('\\n').length;if(lines>800){console.error('[Hook] 已阻止: 文件超过 800 行 ('+lines+' 行)');console.error('[Hook] 请拆分为更小、更专注的模块');process.exit(2)}console.log(d)})\""
  }],
  "description": "阻止创建超过 800 行的文件"
}
```

### 用 ruff 自动格式化 Python 文件

```json
{
  "matcher": "Edit",
  "hooks": [{
    "type": "command",
    "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const p=i.tool_input?.file_path||'';if(/\\.py$/.test(p)){const{execFileSync}=require('child_process');try{execFileSync('ruff',['format',p],{stdio:'pipe'})}catch(e){}}console.log(d)})\""
  }],
  "description": "编辑后用 ruff 自动格式化 Python 文件"
}
```

### 要求新源文件有测试文件

```json
{
  "matcher": "Write",
  "hooks": [{
    "type": "command",
    "command": "node -e \"const fs=require('fs');let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const p=i.tool_input?.file_path||'';if(/src\\/.*\\.(ts|js)$/.test(p)&&!/\\.test\\.|\\.spec\\./.test(p)){const testPath=p.replace(/\\.(ts|js)$/,'.test.$1');if(!fs.existsSync(testPath)){console.error('[Hook] 未找到测试文件: '+p);console.error('[Hook] 期望: '+testPath);console.error('[Hook] 考虑先写测试 (/tdd)')}}console.log(d)})\""
  }],
  "description": "添加新源文件时提醒创建测试"
}
```

---

## 跨平台注意事项

本插件中的所有 hooks 都使用 Node.js（`node -e` 或 `node script.js`）以实现 Windows、macOS 和 Linux 的最大兼容性。避免在 hooks 中使用 bash 特定语法。

---

## 相关文档

- [Rules/common/hooks.md](../04-Rules/common/06-Hooks系统.md) — Hook 架构指南
- [Skills/strategic-compact/](../02-Skills/strategic-compact/) — 策略压缩技能
