# Security-Reviewer（安全审查代理）

## 一句话总结
Security-Reviewer 是一个安全漏洞检测专家，它会扫描你的代码，查找OWASP Top 10漏洞、硬编码密钥、注入风险等安全问题，保护你的应用免受攻击。

---

## 它是什么？（小白视角）

### 用一个比喻来理解

想象你的代码是一座房子：

- **没有 Security-Reviewer**：门窗没锁、贵重物品放在门口、陌生人可以随便进出
- **有 Security-Reviewer**：有位安保专家检查每个入口，指出哪些地方容易被闯入

**Security-Reviewer 就是那位"安保专家"**，它帮你发现并修复安全漏洞，防止黑客攻击。

### 为什么安全审查很重要？

| 后果 | 说明 |
|------|------|
| 数据泄露 | 用户密码、个人信息被窃取 |
| 财务损失 | 攻击者盗取资金或勒索 |
| 声誉损害 | 用户失去信任 |
| 法律责任 | 违反数据保护法规 |
| 业务中断 | 系统被攻击导致服务不可用 |

---

## 工作原理

```
代码/项目 ──→ Security-Reviewer ──→ 初始扫描
    │                                 │
    │                                 ↓
    │                           npm audit / eslint-plugin-security
    │                                 │
    │                                 ↓
    │                           OWASP Top 10检查
    │                                 │
    │                                 ↓
    │                           代码模式审查
    │                                 │
    │                                 ↓
    └─────────────────←─────────── 报告安全问题
```

---

## 配置详解

```yaml
---
name: security-reviewer                              # 代理名称
description: Security vulnerability detection...     # 描述
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]  # 可读写执行
model: sonnet                                        # 使用Sonnet模型
---
```

---

## 核心职责

1. **漏洞检测** - 识别OWASP Top 10和常见安全问题
2. **密钥检测** - 查找硬编码的API密钥、密码、令牌
3. **输入验证** - 确保所有用户输入都正确消毒
4. **认证/授权** - 验证访问控制是否正确
5. **依赖安全** - 检查有漏洞的npm包
6. **安全最佳实践** - 强制安全编码模式

---

## 分析命令

Security-Reviewer 会运行这些工具：

```bash
# 检查依赖漏洞
npm audit --audit-level=high

# 安全相关的ESLint检查
npx eslint . --plugin security
```

---

## OWASP Top 10 检查清单

OWASP = Open Web Application Security Project（开放式Web应用程序安全项目）

每年发布Top 10最关键的Web应用安全风险：

### 1. 注入 (Injection)

| 检查项 | 说明 |
|--------|------|
| 查询参数化? | SQL使用参数而非字符串拼接 |
| 用户输入消毒? | 所有用户输入都经过验证 |
| ORM安全使用? | 不在ORM中使用原始字符串查询 |

```typescript
// ❌ 错误: SQL注入
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ 正确: 参数化查询
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [email]);
```

### 2. 失效的身份认证

| 检查项 | 说明 |
|--------|------|
| 密码哈希? | 使用bcrypt/argon2 |
| JWT验证? | 令牌有效性检查 |
| 会话安全? | 安全cookie设置 |

```typescript
// ❌ 错误: 明文密码比较
if (password === user.password) { ... }

// ✅ 正确: bcrypt比较
const valid = await bcrypt.compare(password, user.passwordHash);
```

### 3. 敏感数据泄露

| 检查项 | 说明 |
|--------|------|
| HTTPS强制? | 生产环境必须HTTPS |
| 密钥在环境变量? | 不在代码中硬编码 |
| PII加密? | 敏感数据加密存储 |
| 日志消毒? | 不记录敏感信息 |

### 4. XML外部实体 (XXE)

| 检查项 | 说明 |
|--------|------|
| XML解析器安全配置? | 禁用外部实体 |
| 外部实体禁用? | 防止XXE攻击 |

### 5. 失效的访问控制

| 检查项 | 说明 |
|--------|------|
| 每个路由都检查认证? | 无遗漏 |
| CORS正确配置? | 限制允许的源 |

### 6. 安全配置错误

| 检查项 | 说明 |
|--------|------|
| 默认凭据已更改? | 不使用admin/admin |
| 生产关闭调试? | debug=false |
| 安全头已设置? | CSP, HSTS等 |

### 7. 跨站脚本 (XSS)

| 检查项 | 说明 |
|--------|------|
| 输出转义? | 用户内容正确编码 |
| CSP设置? | 内容安全策略 |
| 框架自动转义? | React自动转义 |

```typescript
// ❌ 错误: 未转义用户输入
element.innerHTML = userComment;

// ✅ 正确: 使用textContent或消毒
element.textContent = userComment;
// 或
element.innerHTML = DOMPurify.sanitize(userComment);
```

### 8. 不安全的反序列化

| 检查项 | 说明 |
|--------|------|
| 用户输入安全反序列化? | 不信任序列化数据 |

### 9. 使用含有已知漏洞的组件

| 检查项 | 说明 |
|--------|------|
| 依赖是最新的? | npm audit干净 |
| 无已知CVE? | 无公开漏洞 |

### 10. 日志和监控不足

| 检查项 | 说明 |
|--------|------|
| 安全事件记录? | 登录失败、权限变更 |
| 告警配置? | 异常行为通知 |

---

## 代码模式审查

Security-Reviewer 会立即标记这些模式：

| 模式 | 严重性 | 修复方法 |
|------|--------|----------|
| 硬编码密钥 | CRITICAL | 使用 `process.env` |
| 用户输入执行Shell命令 | CRITICAL | 使用安全API或execFile |
| 字符串拼接SQL | CRITICAL | 参数化查询 |
| `innerHTML = userInput` | HIGH | 使用 `textContent` 或 DOMPurify |
| `fetch(userProvidedUrl)` | HIGH | 白名单允许的域名 |
| 明文密码比较 | CRITICAL | 使用 `bcrypt.compare()` |
| 路由无认证检查 | CRITICAL | 添加认证中间件 |
| 余额检查无锁 | CRITICAL | 事务中使用 `FOR UPDATE` |
| 无限流 | HIGH | 添加 `express-rate-limit` |
| 日志记录密码/密钥 | MEDIUM | 消毒日志输出 |

---

## 核心安全原则

1. **纵深防御** - 多层安全措施
2. **最小权限** - 只授予必要的权限
3. **安全失败** - 错误不应暴露数据
4. **不信任输入** - 验证和消毒一切
5. **定期更新** - 保持依赖最新

---

## 常见误报

Security-Reviewer 会验证上下文，以下不是真正的问题：

- `.env.example` 中的环境变量（不是真正的密钥）
- 测试文件中的测试凭据（如果明确标记）
- 公开的API密钥（如果确实需要公开）
- 用于校验和的SHA256/MD5（不是用于密码）

**标记前总是验证上下文**

---

## 应急响应

如果发现CRITICAL漏洞：

1. 记录详细报告
2. 立即通知项目所有者
3. 提供安全代码示例
4. 验证修复有效
5. 如果凭据暴露则轮换密钥

---

## 什么时候运行

**总是**：新API端点、认证代码变更、用户输入处理、数据库查询变更、文件上传、支付代码、外部API集成、依赖更新

**立即**：生产事故、依赖CVE、用户安全报告、重大发布前

---

## 成功指标

- [ ] 无CRITICAL问题
- [ ] 所有HIGH问题已解决
- [ ] 代码中无密钥
- [ ] 依赖是最新的
- [ ] 安全检查清单完成

---

## 使用方法

### 通过命令调用
```bash
/security-scan
```

### 或者描述安全需求
```
我写了一个用户登录API，帮我检查有没有安全问题
```

---

## 工作流配合

```
/plan "添加支付功能"   ← planner制定计划
/tdd                   ← tdd-guide测试先行
[你写代码...]
/code-review           ← code-reviewer代码审查
/security-scan         ← security-reviewer安全审查  ← 重要!
```

---

## 注意事项

1. **安全不是可选项** - 一个漏洞可能导致真正的财务损失
2. **偏执是好事** - 假设所有输入都是恶意的
3. **持续检查** - 安全审查应该定期进行
4. **不要自满** - 即使"小"项目也可能被攻击
5. **记录一切** - 安全事件需要审计追踪

---

## 相关代理

- **code-reviewer** - 通用代码审查（包含基础安全检查）
- **build-error-resolver** - 修复构建问题
- **database-reviewer** - 数据库相关安全（SQL注入、RLS）

## 相关技能

- `skill: security-review` - 详细漏洞模式、代码示例、报告模板
- `skill: security-scan` - AgentShield安全审计集成
