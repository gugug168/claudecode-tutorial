<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：TypeScript/JavaScript 语言特定的测试规范       ║
║  什么时候用它：编写 TS/JS 测试、运行测试时参考                       ║
║  核心能力：E2E 测试、代理支持                                       ║
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

# TypeScript/JavaScript Testing

> This file extends [common/testing.md](../common/testing.md) with TypeScript/JavaScript specific content.

<!--
【说明】E2E 测试：使用 Playwright 作为关键用户流程的 E2E 测试框架
-->
## E2E Testing

Use **Playwright** as the E2E testing framework for critical user flows.

<!--
【说明】代理支持：e2e-runner - Playwright E2E 测试专家
-->
## Agent Support

- **e2e-runner** - Playwright E2E testing specialist
