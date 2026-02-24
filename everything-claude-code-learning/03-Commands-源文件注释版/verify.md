<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：对当前代码库状态运行全面验证                    ║
║  什么时候用它：提交前、创建 PR 前、需要确认代码健康状态时            ║
║  核心能力：构建检查、类型检查、Lint 检查、测试套件、日志审计         ║
║  触发方式：/verify                                                 ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Verification Command

<!--
【说明】对当前代码库状态运行全面验证。
-->
Run comprehensive verification on current codebase state.

<!--
【说明】指令：按此确切顺序执行验证：
1. 构建检查：运行此项目的构建命令，如果失败，报告错误并停止
2. 类型检查：运行 TypeScript/类型检查器，报告所有错误，包含文件:行号
3. Lint 检查：运行 linter，报告警告和错误
4. 测试套件：运行所有测试，报告通过/失败计数和覆盖率百分比
5. Console.log 审计：在源文件中搜索 console.log，报告位置
6. Git 状态：显示未提交的变更和自上次提交以来修改的文件
-->
## Instructions

Execute verification in this exact order:

1. **Build Check**
   - Run the build command for this project
   - If it fails, report errors and STOP

2. **Type Check**
   - Run TypeScript/type checker
   - Report all errors with file:line

3. **Lint Check**
   - Run linter
   - Report warnings and errors

4. **Test Suite**
   - Run all tests
   - Report pass/fail count
   - Report coverage percentage

5. **Console.log Audit**
   - Search for console.log in source files
   - Report locations

6. **Git Status**
   - Show uncommitted changes
   - Show files modified since last commit

<!--
【说明】输出：生成简洁的验证报告，包含验证结果、构建状态、类型错误数、Lint 问题数、测试通过率/覆盖率、密钥发现数、console.log 数量，以及是否准备好 PR
-->
## Output

Produce a concise verification report:

```
VERIFICATION: [PASS/FAIL]

Build:    [OK/FAIL]
Types:    [OK/X errors]
Lint:     [OK/X issues]
Tests:    [X/Y passed, Z% coverage]
Secrets:  [OK/X found]
Logs:     [OK/X console.logs]

Ready for PR: [YES/NO]
```

If any critical issues, list them with fix suggestions.

<!--
【说明】参数：
- `quick` - 仅构建 + 类型
- `full` - 所有检查（默认）
- `pre-commit` - 与提交相关的检查
- `pre-pr` - 完整检查加安全扫描
-->
## Arguments

$ARGUMENTS can be:
- `quick` - Only build + types
- `full` - All checks (default)
- `pre-commit` - Checks relevant for commits
- `pre-pr` - Full checks plus security scan
