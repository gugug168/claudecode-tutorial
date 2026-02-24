<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：TypeScript/JavaScript 语言特定的安全规范       ║
║  什么时候用它：编写 TS/JS 代码、安全检查时参考                       ║
║  核心能力：密钥管理、代理支持                                       ║
║  适用范围：TypeScript/JavaScript 项目                             ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
# 【元数据说明】paths: 指定此规则适用于哪些 TypeScript/JavaScript 文件路径
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# TypeScript/JavaScript Security

> This file extends [common/security.md](../common/security.md) with TypeScript/JavaScript specific content.

<!--
【说明】密钥管理：
- 永远不要：硬编码密钥
- 始终：使用环境变量
- 如果缺失则抛出错误
-->
## Secret Management

```typescript
// NEVER: Hardcoded secrets
const apiKey = "sk-proj-xxxxx"

// ALWAYS: Environment variables
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

<!--
【说明】代理支持：使用 security-reviewer 技能进行全面安全审计
-->
## Agent Support

- Use **security-reviewer** skill for comprehensive security audits
