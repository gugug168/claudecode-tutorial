<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：对未提交的变更进行全面的安全和质量审查           ║
║  什么时候用它：编写或修改代码后、提交前使用                          ║
║  核心能力：安全检查、代码质量检查、最佳实践验证                       ║
║  触发方式：/code-review                                            ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Code Review

<!--
【说明】对未提交的变更进行全面的安全和质量审查：
1. 获取已更改的文件
2. 对每个更改的文件进行检查
3. 生成报告
4. 如果发现关键或高优先级问题，阻止提交
-->
Comprehensive security and quality review of uncommitted changes:

1. Get changed files: git diff --name-only HEAD

2. For each changed file, check for:

<!--
【说明】安全问题（关键）：
- 硬编码的凭证、API 密钥、令牌
- SQL 注入漏洞
- XSS 漏洞
- 缺少输入验证
- 不安全的依赖
- 路径遍历风险
-->
**Security Issues (CRITICAL):**
- Hardcoded credentials, API keys, tokens
- SQL injection vulnerabilities
- XSS vulnerabilities
- Missing input validation
- Insecure dependencies
- Path traversal risks

<!--
【说明】代码质量（高优先级）：
- 函数 > 50 行
- 文件 > 800 行
- 嵌套深度 > 4 层
- 缺少错误处理
- console.log 语句
- TODO/FIXME 注释
- 公共 API 缺少 JSDoc
-->
**Code Quality (HIGH):**
- Functions > 50 lines
- Files > 800 lines
- Nesting depth > 4 levels
- Missing error handling
- console.log statements
- TODO/FIXME comments
- Missing JSDoc for public APIs

<!--
【说明】最佳实践（中优先级）：
- 变异模式（应该使用不可变）
- 代码/注释中使用 emoji
- 新代码缺少测试
- 可访问性问题 (a11y)
-->
**Best Practices (MEDIUM):**
- Mutation patterns (use immutable instead)
- Emoji usage in code/comments
- Missing tests for new code
- Accessibility issues (a11y)

<!--
【说明】生成报告包含：
- 严重程度：关键、高、中、低
- 文件位置和行号
- 问题描述
- 建议的修复
-->
3. Generate report with:
   - Severity: CRITICAL, HIGH, MEDIUM, LOW
   - File location and line numbers
   - Issue description
   - Suggested fix

<!--
【说明】如果发现关键或高优先级问题，阻止提交。永远不要批准有安全漏洞的代码！
-->
4. Block commit if CRITICAL or HIGH issues found

Never approve code with security vulnerabilities!
