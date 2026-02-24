<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：Claude Code 会话的综合验证系统                  ║
║  什么时候用它：完成功能后、创建PR前、重构后                         ║
║  核心能力：构建验证、类型检查、Lint、测试套件、安全扫描、差异审查   ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: verification-loop
description: "A comprehensive verification system for Claude Code sessions."
---

# Verification Loop Skill

<!--
【说明】Claude Code 会话的综合验证系统。
-->
A comprehensive verification system for Claude Code sessions.

<!--
【说明】何时使用：
- 完成功能或重大代码更改后
- 创建 PR 之前
- 当你想确保质量门通过时
- 重构后
-->
## When to Use

Invoke this skill:
- After completing a feature or significant code change
- Before creating a PR
- When you want to ensure quality gates pass
- After refactoring

<!--
【说明】验证阶段
-->
## Verification Phases

<!--
【说明】阶段 1：构建验证。如果构建失败，停止并在继续前修复。
-->
### Phase 1: Build Verification
```bash
# Check if project builds
npm run build 2>&1 | tail -20
# OR
pnpm build 2>&1 | tail -20
```

If build fails, STOP and fix before continuing.

<!--
【说明】阶段 2：类型检查。报告所有类型错误。在继续前修复关键错误。
-->
### Phase 2: Type Check
```bash
# TypeScript projects
npx tsc --noEmit 2>&1 | head -30

# Python projects
pyright . 2>&1 | head -30
```

Report all type errors. Fix critical ones before continuing.

<!--
【说明】阶段 3：Lint 检查
-->
### Phase 3: Lint Check
```bash
# JavaScript/TypeScript
npm run lint 2>&1 | head -30

# Python
ruff check . 2>&1 | head -30
```

<!--
【说明】阶段 4：测试套件。
报告：总测试数、通过、失败、覆盖率
-->
### Phase 4: Test Suite
```bash
# Run tests with coverage
npm run test -- --coverage 2>&1 | tail -50

# Check coverage threshold
# Target: 80% minimum
```

Report:
- Total tests: X
- Passed: X
- Failed: X
- Coverage: X%

<!--
【说明】阶段 5：安全扫描
- 检查密钥
- 检查 console.log
-->
### Phase 5: Security Scan
```bash
# Check for secrets
grep -rn "sk-" --include="*.ts" --include="*.js" . 2>/dev/null | head -10
grep -rn "api_key" --include="*.ts" --include="*.js" . 2>/dev/null | head -10

# Check for console.log
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10
```

<!--
【说明】阶段 6：差异审查。
审查每个更改文件的：非预期更改、缺少错误处理、潜在边缘情况
-->
### Phase 6: Diff Review
```bash
# Show what changed
git diff --stat
git diff HEAD~1 --name-only
```

Review each changed file for:
- Unintended changes
- Missing error handling
- Potential edge cases

<!--
【说明】输出格式：运行所有阶段后，生成验证报告
-->
## Output Format

After running all phases, produce a verification report:

```
VERIFICATION REPORT
==================

Build:     [PASS/FAIL]
Types:     [PASS/FAIL] (X errors)
Lint:      [PASS/FAIL] (X warnings)
Tests:     [PASS/FAIL] (X/Y passed, Z% coverage)
Security:  [PASS/FAIL] (X issues)
Diff:      [X files changed]

Overall:   [READY/NOT READY] for PR

Issues to Fix:
1. ...
2. ...
```

<!--
【说明】持续模式：对于长时间会话，每 15 分钟或重大更改后运行验证
-->
## Continuous Mode

For long sessions, run verification every 15 minutes or after major changes:

```markdown
Set a mental checkpoint:
- After completing each function
- After finishing a component
- Before moving to next task

Run: /verify
```

<!--
【说明】与 Hooks 集成：此技能与 PostToolUse hooks 互补，但提供更深入的验证。
Hooks 立即捕获问题；此技能提供全面审查。
-->
## Integration with Hooks

This skill complements PostToolUse hooks but provides deeper verification.
Hooks catch issues immediately; this skill provides comprehensive review.
