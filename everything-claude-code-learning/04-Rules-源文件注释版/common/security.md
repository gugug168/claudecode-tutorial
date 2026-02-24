<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：定义安全检查和密钥管理规范                       ║
║  什么时候用它：提交前检查、发现安全问题时参考                        ║
║  核心能力：强制安全检查、密钥管理、安全响应协议                      ║
║  适用范围：通用规则                                                ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Security Guidelines

<!--
【说明】强制安全检查：在任何提交之前
- 无硬编码密钥（API 密钥、密码、令牌）
- 所有用户输入已验证
- SQL 注入防护（参数化查询）
- XSS 防护（清理 HTML）
- CSRF 保护已启用
- 认证/授权已验证
- 所有端点都有速率限制
- 错误消息不泄露敏感数据
-->
## Mandatory Security Checks

Before ANY commit:
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized HTML)
- [ ] CSRF protection enabled
- [ ] Authentication/authorization verified
- [ ] Rate limiting on all endpoints
- [ ] Error messages don't leak sensitive data

<!--
【说明】密钥管理：
- 永远不要在源代码中硬编码密钥
- 始终使用环境变量或密钥管理器
- 在启动时验证必需的密钥是否存在
- 轮换任何可能已暴露的密钥
-->
## Secret Management

- NEVER hardcode secrets in source code
- ALWAYS use environment variables or a secret manager
- Validate that required secrets are present at startup
- Rotate any secrets that may have been exposed

<!--
【说明】安全响应协议：如果发现安全问题
1. 立即停止
2. 使用 security-reviewer 代理
3. 在继续之前修复 CRITICAL 问题
4. 轮换任何已暴露的密钥
5. 审查整个代码库以发现类似问题
-->
## Security Response Protocol

If security issue found:
1. STOP immediately
2. Use **security-reviewer** agent
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets
5. Review entire codebase for similar issues
