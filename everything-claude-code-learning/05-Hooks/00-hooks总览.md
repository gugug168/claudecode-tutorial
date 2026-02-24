# Hooks 总览

## 什么是 Hooks（钩子）？

Hooks 是事件驱动的自动化机制，在 Claude Code 工具执行之前或之后触发。它们强制执行代码质量、早期捕获错误、自动化重复检查。

### 用一个比喻

- **Commands** = 你主动按的快捷键
- **Agents** = 你委托的专家
- **Hooks** = 自动触发的后台监控

**Hooks 就是你的"后台监控"**，它们在特定事件发生时自动运行，不需要你手动触发。

---

## 钩子如何工作

```
用户请求 → Claude 选择工具 → PreToolUse 钩子运行 → 工具执行 → PostToolUse 钩子运行
```

### 钩子类型

| 类型 | 触发时机 | 能否阻止 |
|------|----------|----------|
| **PreToolUse** | 工具执行前 | ✅ 可以阻止 (exit 2) |
| **PostToolUse** | 工具执行后 | ❌ 不能阻止 |
| **Stop** | 每次Claude响应后 | ❌ 不能阻止 |
| **SessionStart** | 会话开始时 | ❌ 不能阻止 |
| **SessionEnd** | 会话结束时 | ❌ 不能阻止 |
| **PreCompact** | 上下文压缩前 | ❌ 不能阻止 |

---

## 本插件中的钩子

### PreToolUse 钩子

| 钩子 | 匹配器 | 行为 | 退出码 |
|------|--------|------|--------|
| **开发服务器阻止器** | `Bash` | 阻止 tmux 外的 `npm run dev` — 确保日志可访问 | 2 (阻止) |
| **Tmux 提醒** | `Bash` | 建议对长时间命令使用 tmux | 0 (警告) |
| **Git push 提醒** | `Bash` | 提醒 `git push` 前审查变更 | 0 (警告) |
| **文档文件阻止器** | `Write` | 阻止创建随机的 `.md`/`.txt` 文件 | 2 (阻止) |
| **策略压缩** | `Edit|Write` | 建议在逻辑间隔手动 `/compact` | 0 (警告) |

### PostToolUse 钩子

| 钩子 | 匹配器 | 作用 |
|------|--------|------|
| **PR 记录器** | `Bash` | `gh pr create` 后记录 PR URL |
| **构建分析** | `Bash` | 构建命令后后台分析（异步） |
| **Prettier 格式化** | `Edit` | 编辑后自动格式化 JS/TS 文件 |
| **TypeScript 检查** | `Edit` | 编辑 `.ts`/`.tsx` 后运行 `tsc --noEmit` |
| **console.log 警告** | `Edit` | 警告编辑文件中的 `console.log` |

### 生命周期钩子

| 钩子 | 事件 | 作用 |
|------|------|------|
| **会话开始** | `SessionStart` | 加载之前的上下文并检测包管理器 |
| **预压缩** | `PreCompact` | 上下文压缩前保存状态 |
| **console.log 审计** | `Stop` | 每次响应后检查所有修改文件中的 `console.log` |
| **会话结束** | `SessionEnd` | 持久化会话状态供下次使用 |
| **模式提取** | `SessionEnd` | 评估会话以提取可复用模式（持续学习） |

---

## 自定义钩子

### 禁用钩子

在 `~/.claude/settings.json` 中覆盖：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [],
        "description": "覆盖: 允许所有 .md 文件创建"
      }
    ]
  }
}
```

### 编写自己的钩子

钩子是接收 stdin 上的 JSON 并必须输出 JSON 到 stdout 的脚本。

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

  // 警告（非阻止）: 写入 stderr
  console.error('[Hook] 显示给 Claude 的警告信息');

  // 阻止（仅 PreToolUse）: 以代码 2 退出
  // process.exit(2);

  // 总是输出原始数据到 stdout
  console.log(data);
});
```

**退出码**：
- `0` — 成功（继续执行）
- `2` — 阻止工具调用（仅 PreToolUse）
- 其他非零 — 错误（记录但不阻止）

---

## 钩子输入模式

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
  tool_output?: {             // 仅 PostToolUse
    output?: string;          // 命令/工具输出
  };
}
```

---

## 常用钩子配方

### 1. 警告 TODO 注释

```json
{
  "matcher": "Edit",
  "hooks": [{
    "type": "command",
    "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const ns=i.tool_input?.new_string||'';if(/TODO|FIXME|HACK/.test(ns)){console.error('[Hook] 添加了新的 TODO/FIXME - 考虑创建 issue')}console.log(d)})\""
  }],
  "description": "添加 TODO/FIXME 注释时警告"
}
```

### 2. 阻止大文件创建

```json
{
  "matcher": "Write",
  "hooks": [{
    "type": "command",
    "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const c=i.tool_input?.content||'';const lines=c.split('\\n').length;if(lines>800){console.error('[Hook] 已阻止: 文件超过800行 ('+lines+' 行)');console.error('[Hook] 拆分成更小的模块');process.exit(2)}console.log(d)})\""
  }],
  "description": "阻止创建超过800行的文件"
}
```

### 3. 用 ruff 自动格式化 Python 文件

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

### 4. 要求新源文件旁边有测试文件

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

## 异步钩子

对于不应阻止主流程的钩子（如后台分析）：

```json
{
  "type": "command",
  "command": "node my-slow-hook.js",
  "async": true,
  "timeout": 30
}
```

异步钩子在后台运行，不能阻止工具执行。

---

## 跨平台注意事项

本插件中的所有钩子使用 Node.js（`node -e` 或 `node script.js`）以在 Windows、macOS 和 Linux 上获得最大兼容性。避免在钩子中使用 bash 特定语法。

---

## 关键要点

1. **钩子自动触发** - 不需要手动调用
2. **PreToolUse 可以阻止** - 用于强制执行规则
3. **PostToolUse 用于分析** - 检查结果、自动格式化
4. **生命周期钩子管理状态** - 会话开始/结束、压缩
5. **可以自定义** - 创建你自己的钩子
6. **使用 Node.js** - 确保跨平台兼容

---

## 相关文档

- [Rules 总览](../04-Rules/00-rules总览.md) - 强制执行的规则
- [Skills 总览](../02-Skills/00-skills总览.md) - 工作流程指南
