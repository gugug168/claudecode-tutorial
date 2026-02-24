<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：增量式修复构建和类型错误，使用最小、安全的变更  ║
║  什么时候用它：构建失败、出现类型错误时使用                          ║
║  核心能力：检测构建系统、解析错误、逐个修复、安全护栏                 ║
║  触发方式：/build-fix                                              ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Build and Fix

<!--
【说明】增量式修复构建和类型错误，使用最小、安全的变更。
-->
Incrementally fix build and type errors with minimal, safe changes.

<!--
【说明】步骤1：检测构建系统。识别项目的构建工具并运行构建。
| 指示器 | 构建命令 |
| 带有 build 脚本的 package.json | npm run build 或 pnpm build |
| tsconfig.json（仅 TypeScript） | npx tsc --noEmit |
| Cargo.toml | cargo build 2>&1 |
| pom.xml | mvn compile |
| build.gradle | ./gradlew compileJava |
| go.mod | go build ./... |
| pyproject.toml | python -m py_compile 或 mypy . |
-->
## Step 1: Detect Build System

Identify the project's build tool and run the build:

| Indicator | Build Command |
|-----------|---------------|
| `package.json` with `build` script | `npm run build` or `pnpm build` |
| `tsconfig.json` (TypeScript only) | `npx tsc --noEmit` |
| `Cargo.toml` | `cargo build 2>&1` |
| `pom.xml` | `mvn compile` |
| `build.gradle` | `./gradlew compileJava` |
| `go.mod` | `go build ./...` |
| `pyproject.toml` | `python -m py_compile` or `mypy .` |

<!--
【说明】步骤2：解析和分组错误：
1. 运行构建命令并捕获 stderr
2. 按文件路径分组错误
3. 按依赖顺序排序（先修复导入/类型，再修复逻辑错误）
4. 统计总错误数用于进度跟踪
-->
## Step 2: Parse and Group Errors

1. Run the build command and capture stderr
2. Group errors by file path
3. Sort by dependency order (fix imports/types before logic errors)
4. Count total errors for progress tracking

<!--
【说明】步骤3：修复循环（一次修复一个错误）：
1. 读取文件 - 使用 Read 工具查看错误上下文
2. 诊断 - 识别根本原因（缺少导入、类型错误、语法错误）
3. 最小修复 - 使用 Edit 工具进行解决错误的最小变更
4. 重新运行构建 - 验证错误已消失且没有引入新错误
5. 继续下一个 - 继续处理剩余错误
-->
## Step 3: Fix Loop (One Error at a Time)

For each error:

1. **Read the file** — Use Read tool to see error context (10 lines around the error)
2. **Diagnose** — Identify root cause (missing import, wrong type, syntax error)
3. **Fix minimally** — Use Edit tool for the smallest change that resolves the error
4. **Re-run build** — Verify the error is gone and no new errors introduced
5. **Move to next** — Continue with remaining errors

<!--
【说明】步骤4：安全护栏。停止并询问用户，如果：
- 修复引入的错误比解决的还多
- 3 次尝试后同一错误仍然存在（可能是更深层的问题）
- 修复需要架构变更（不仅仅是构建修复）
- 构建错误源于缺少依赖（需要 npm install、cargo add 等）
-->
## Step 4: Guardrails

Stop and ask the user if:
- A fix introduces **more errors than it resolves**
- The **same error persists after 3 attempts** (likely a deeper issue)
- The fix requires **architectural changes** (not just a build fix)
- Build errors stem from **missing dependencies** (need `npm install`, `cargo add`, etc.)

<!--
【说明】步骤5：摘要。显示结果：
- 已修复的错误（带文件路径）
- 剩余错误（如果有）
- 引入的新错误（应该为零）
- 未解决问题的建议下一步
-->
## Step 5: Summary

Show results:
- Errors fixed (with file paths)
- Errors remaining (if any)
- New errors introduced (should be zero)
- Suggested next steps for unresolved issues

<!--
【说明】恢复策略：
| 情况 | 行动 |
| 缺少模块/导入 | 检查包是否已安装；建议安装命令 |
| 类型不匹配 | 读取两个类型定义；修复较窄的类型 |
| 循环依赖 | 用导入图识别循环；建议提取 |
| 版本冲突 | 检查 package.json / Cargo.toml 的版本约束 |
| 构建工具配置错误 | 读取配置文件；与工作默认值比较 |
-->
## Recovery Strategies

| Situation | Action |
|-----------|--------|
| Missing module/import | Check if package is installed; suggest install command |
| Type mismatch | Read both type definitions; fix the narrower type |
| Circular dependency | Identify cycle with import graph; suggest extraction |
| Version conflict | Check `package.json` / `Cargo.toml` for version constraints |
| Build tool misconfiguration | Read config file; compare with working defaults |

<!--
【说明】为了安全，一次修复一个错误。优先最小化差异而非重构。
-->
Fix one error at a time for safety. Prefer minimal diffs over refactoring.
