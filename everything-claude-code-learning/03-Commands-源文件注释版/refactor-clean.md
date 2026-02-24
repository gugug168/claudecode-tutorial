<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：安全地识别和删除死代码                          ║
║  什么时候用它：清理代码库、删除未使用代码、减少代码体积               ║
║  核心能力：死代码检测、安全删除、重复整合                            ║
║  触发方式：/refactor-clean                                         ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Refactor Clean

<!--
【说明】安全地识别和删除死代码，每一步都有测试验证。
-->
Safely identify and remove dead code with test verification at every step.

<!--
【说明】步骤1：检测死代码。根据项目类型运行分析工具：
| 工具 | 查找什么 | 命令 |
| knip | 未使用的导出、文件、依赖 | `npx knip` |
| depcheck | 未使用的 npm 依赖 | `npx depcheck` |
| ts-prune | 未使用的 TypeScript 导出 | `npx ts-prune` |
| vulture | 未使用的 Python 代码 | `vulture src/` |
| deadcode | 未使用的 Go 代码 | `deadcode ./...` |
| cargo-udeps | 未使用的 Rust 依赖 | `cargo +nightly udeps` |
-->
## Step 1: Detect Dead Code

Run analysis tools based on project type:

| Tool | What It Finds | Command |
|------|--------------|---------|
| knip | Unused exports, files, dependencies | `npx knip` |
| depcheck | Unused npm dependencies | `npx depcheck` |
| ts-prune | Unused TypeScript exports | `npx ts-prune` |
| vulture | Unused Python code | `vulture src/` |
| deadcode | Unused Go code | `deadcode ./...` |
| cargo-udeps | Unused Rust dependencies | `cargo +nightly udeps` |

<!--
【说明】步骤2：分类发现。按安全层级分类：
| 层级 | 示例 | 行动 |
| 安全 | 未使用的工具、测试助手、内部函数 | 自信删除 |
| 小心 | 组件、API 路由、中间件 | 验证没有动态导入或外部消费者 |
| 危险 | 配置文件、入口点、类型定义 | 动手前调查 |
-->
## Step 2: Categorize Findings

Sort findings into safety tiers:

| Tier | Examples | Action |
|------|----------|--------|
| **SAFE** | Unused utilities, test helpers, internal functions | Delete with confidence |
| **CAUTION** | Components, API routes, middleware | Verify no dynamic imports or external consumers |
| **DANGER** | Config files, entry points, type definitions | Investigate before touching |

<!--
【说明】步骤3：安全删除循环。对于每个安全项目：
1. 运行完整测试套件 — 建立基线（全部通过）
2. 删除死代码 — 使用 Edit 工具进行精确删除
3. 重新运行测试套件 — 验证没有破坏
4. 如果测试失败 — 立即用 `git checkout -- <file>` 还原并跳过此项
5. 如果测试通过 — 继续下一项
-->
## Step 3: Safe Deletion Loop

For each SAFE item:

1. **Run full test suite** — Establish baseline (all green)
2. **Delete the dead code** — Use Edit tool for surgical removal
3. **Re-run test suite** — Verify nothing broke
4. **If tests fail** — Immediately revert with `git checkout -- <file>` and skip this item
5. **If tests pass** — Move to next item

<!--
【说明】规则：
- 永远不要在没有先运行测试的情况下删除
- 一次删除一个 — 原子变更使回滚容易
- 不确定时跳过 — 保留死代码比破坏生产环境好
- 清理时不要重构 — 分离关注点（先清理，后重构）
-->
## Rules

- **Never delete without running tests first**
- **One deletion at a time** — Atomic changes make rollback easy
- **Skip if uncertain** — Better to keep dead code than break production
- **Don't refactor while cleaning** — Separate concerns (clean first, refactor later)
