---
name: security-review
description: 在添加认证、处理用户输入、使用密钥、创建API端点或实现支付/敏感功能时使用此技能。提供全面的安全检查清单和模式。
---

# Security Review Skill（安全审查技能）

<!--
【教学说明】
这个技能确保所有代码遵循安全最佳实践，并识别潜在漏洞。
安全不是可选项——一个漏洞可能危及整个平台。
-->

此技能确保所有代码遵循安全最佳实践，并识别潜在漏洞。

## 何时激活此技能

- 实现认证或授权功能时
- 处理用户输入或文件上传时
- 创建新的 API 端点时
- 使用密钥或凭据时
- 实现支付功能时
- 存储或传输敏感数据时
- 集成第三方 API 时

## 安全检查清单

### 1. 密钥管理（Secrets Management）

#### ❌ 永远不要这样做
```typescript
const apiKey = "sk-proj-xxxxx"  // 硬编码的密钥——危险！
const dbPassword = "password123" // 密码写在源代码里——会被泄露到 Git
```

**为什么危险？** 这些密钥会被提交到 Git 仓库，任何能访问代码的人都能看到。

#### ✅ 始终这样做
```typescript
// 从环境变量读取密钥
const apiKey = process.env.OPENAI_API_KEY
const dbUrl = process.env.DATABASE_URL

// 验证密钥是否存在（避免运行时崩溃）
if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

**为什么安全？** 密钥存储在环境变量中，不会被提交到代码仓库。

#### 验证步骤
- [ ] 没有硬编码的 API 密钥、令牌或密码
- [ ] 所有密钥都在环境变量中
- [ ] `.env.local` 在 `.gitignore` 中（防止本地密钥被提交）
- [ ] Git 历史中没有密钥（用 `git log --all --full-history --source -- "*key*"` 检查）
- [ ] 生产环境的密钥在托管平台（Vercel、Railway 等）中配置

### 2. 输入验证（Input Validation）

<!--
【教学说明】
永远不要相信用户输入！恶意用户会通过输入框攻击你的系统。
-->

#### 始终验证用户输入
```typescript
import { z } from 'zod'

// 定义验证模式（声明式规则）
const CreateUserSchema = z.object({
  email: z.string().email(), // 必须是有效的邮箱格式
  name: z.string().min(1).max(100), // 1-100 个字符
  age: z.number().int().min(0).max(150) // 0-150 之间的整数
})

// 在处理前验证
export async function createUser(input: unknown) {
  try {
    const validated = CreateUserSchema.parse(input)
    return await db.users.create(validated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      // 返回友好的错误信息（不泄露内部细节）
      return { success: false, errors: error.errors }
    }
    throw error
  }
}
```

**为什么使用 Zod？** 它提供类型安全的验证，防止无效数据进入你的系统。

#### 文件上传验证
```typescript
function validateFileUpload(file: File) {
  // 检查大小（5MB 限制）
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('文件过大（最大 5MB）')
  }

  // 检查类型（只允许图片）
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('无效的文件类型')
  }

  // 检查扩展名（双重验证）
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new Error('无效的文件扩展名')
  }

  return true
}
```

**为什么要检查三件事？** 攻击者可以伪造文件类型或扩展名，多重验证更安全。

#### 验证步骤
- [ ] 所有用户输入都经过模式验证
- [ ] 文件上传有限制（大小、类型、扩展名）
- [ ] 查询中不直接使用用户输入
- [ ] 使用白名单验证（不是黑名单）
- [ ] 错误消息不泄露敏感信息

### 3. SQL 注入防护（SQL Injection Prevention）

<!--
【教学说明】
SQL 注入是最危险的漏洞之一——攻击者可以窃取整个数据库。
-->

#### ❌ 永远不要拼接 SQL
```typescript
// 危险——SQL 注入漏洞！
const query = `SELECT * FROM users WHERE email = '${userEmail}'`
await db.query(query)

// 如果 userEmail 是：' OR '1'='1
// 生成的查询：SELECT * FROM users WHERE email = '' OR '1'='1'
// 结果：返回所有用户数据！
```

#### ✅ 始终使用参数化查询
```typescript
// 安全——参数化查询
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail) // Supabase 会自动转义

// 或使用原始 SQL
await db.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail] // 参数会被安全地转义
)
```

**为什么安全？** 参数化查询将数据和代码分开，攻击者无法注入恶意 SQL。

#### 验证步骤
- [ ] 所有数据库查询使用参数化查询
- [ ] SQL 中没有字符串拼接
- [ ] ORM/查询构建器正确使用
- [ ] Supabase 查询正确清理

### 4. 认证与授权（Authentication & Authorization）

<!--
【教学说明】
认证是"你是谁"，授权是"你能做什么"。
-->

#### JWT 令牌处理
```typescript
// ❌ 错误：使用 localStorage（易受 XSS 攻击）
localStorage.setItem('token', token)

// ✅ 正确：使用 httpOnly cookies
res.setHeader('Set-Cookie',
  `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
```

**为什么使用 httpOnly cookies？** JavaScript 无法访问 httpOnly cookies，即使有 XSS 攻击也无法窃取令牌。

#### 授权检查
```typescript
export async function deleteUser(userId: string, requesterId: string) {
  // 始终先验证授权
  const requester = await db.users.findUnique({
    where: { id: requesterId }
  })

  if (requester.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 } // 403 Forbidden（禁止访问）
    )
  }

  // 继续删除操作
  await db.users.delete({ where: { id: userId } })
}
```

**为什么要检查权限？** 普通用户不应该能删除其他用户的数据。

#### 行级安全（Row Level Security，Supabase）
```sql
-- 在所有表上启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的数据
CREATE POLICY "Users view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 用户只能更新自己的数据
CREATE POLICY "Users update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

**什么是 RLS？** 数据库层面的权限控制——即使代码有漏洞，数据库也会拒绝未授权访问。

#### 验证步骤
- [ ] 令牌存储在 httpOnly cookies 中（不是 localStorage）
- [ ] 敏感操作前有授权检查
- [ ] Supabase 中启用了行级安全
- [ ] 实现了基于角色的访问控制
- [ ] 会话管理安全

### 5. XSS 防护（跨站脚本攻击防护）

<!--
【教学说明】
XSS 攻击让攻击者能在其他用户的浏览器中执行恶意 JavaScript。
-->

#### 清理 HTML
```typescript
import DOMPurify from 'isomorphic-dompurify'

// 始终清理用户提供的 HTML
function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'], // 只允许安全的标签
    ALLOWED_ATTR: [] // 不允许任何属性
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

**为什么要清理 HTML？** 恶意用户可能注入 `<script>alert('XSS')</script>` 窃取数据。

#### 内容安全策略（Content Security Policy，CSP）
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://api.example.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

**什么是 CSP？** 浏览器安全机制，告诉浏览器只加载来自可信来源的资源。

#### 验证步骤
- [ ] 用户提供的 HTML 已清理
- [ ] CSP 头已配置
- [ ] 没有未验证的动态内容渲染
- [ ] 使用 React 内置的 XSS 防护

### 6. CSRF 防护（跨站请求伪造防护）

<!--
【教学说明】
CSRF 攻击诱骗用户在已登录的网站上执行非预期操作。
-->

#### CSRF 令牌
```typescript
import { csrf } from '@/lib/csrf'

export async function POST(request: Request) {
  const token = request.headers.get('X-CSRF-Token')

  if (!csrf.verify(token)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  // 处理请求
}
```

**什么是 CSRF 令牌？** 随机生成的值，证明请求来自你的网站而不是恶意网站。

#### SameSite Cookies
```typescript
res.setHeader('Set-Cookie',
  `session=${sessionId}; HttpOnly; Secure; SameSite=Strict`)
```

**SameSite=Strict 意味着什么？** Cookie 只在同站请求中发送，防止跨站请求。

#### 验证步骤
- [ ] 状态变更操作有 CSRF 令牌
- [ ] 所有 cookies 设置 SameSite=Strict
- [ ] 实现了双重提交 cookie 模式

### 7. 速率限制（Rate Limiting）

<!--
【教学说明】
速率限制防止暴力攻击和滥用 API。
-->

#### API 速率限制
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个窗口最多 100 次请求
  message: '请求过多，请稍后再试'
})

// 应用到路由
app.use('/api/', limiter)
```

**为什么需要速率限制？** 防止攻击者每秒发送 1000 次请求尝试破解密码。

#### 昂贵操作的严格限制
```typescript
// 搜索功能使用更严格的限制
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 10, // 每分钟最多 10 次请求
  message: '搜索请求过多'
})

app.use('/api/search', searchLimiter)
```

**为什么要区分？** 搜索操作消耗大量资源，需要更严格的限制。

#### 验证步骤
- [ ] 所有 API 端点都有速率限制
- [ ] 昂贵操作有更严格的限制
- [ ] 基于 IP 的速率限制
- [ ] 基于用户的速率限制（已认证用户）

### 8. 敏感数据暴露

#### 日志记录
```typescript
// ❌ 错误：记录敏感数据
console.log('User login:', { email, password })
console.log('Payment:', { cardNumber, cvv })

// ✅ 正确：编辑敏感数据
console.log('User login:', { email, userId }) // 不记录密码
console.log('Payment:', { last4: card.last4, userId }) // 只记录后四位
```

**为什么危险？** 日志文件可能被泄露，不应该包含敏感信息。

#### 错误消息
```typescript
// ❌ 错误：暴露内部细节
catch (error) {
  return NextResponse.json(
    { error: error.message, stack: error.stack },
    { status: 500 }
  )
}

// ✅ 正确：通用错误消息
catch (error) {
  console.error('Internal error:', error) // 详细错误记录到服务器日志
  return NextResponse.json(
    { error: '发生错误，请稍后再试。' }, // 用户看到的是通用消息
    { status: 500 }
  )
}
```

**为什么要隐藏错误细节？** 攻击者可以利用错误信息了解系统结构。

#### 验证步骤
- [ ] 日志中没有密码、令牌或密钥
- [ ] 给用户的错误消息是通用的
- [ ] 详细错误只在服务器日志中
- [ ] 不向用户暴露堆栈跟踪

### 9. 区块链安全（Solana）

<!--
【教学说明】
如果你在使用区块链，安全同样重要——一笔错误交易可能损失数百万。
-->

#### 钱包验证
```typescript
import { verify } from '@solana/web3.js'

async function verifyWalletOwnership(
  publicKey: string,
  signature: string,
  message: string
) {
  try {
    const isValid = verify(
      Buffer.from(message),
      Buffer.from(signature, 'base64'),
      Buffer.from(publicKey, 'base64')
    )
    return isValid
  } catch (error) {
    return false
  }
}
```

**为什么要验证签名？** 证明用户确实拥有该钱包的私钥。

#### 交易验证
```typescript
async function verifyTransaction(transaction: Transaction) {
  // 验证收款人
  if (transaction.to !== expectedRecipient) {
    throw new Error('无效的收款人')
  }

  // 验证金额
  if (transaction.amount > maxAmount) {
    throw new Error('金额超过限制')
  }

  // 验证用户有足够余额
  const balance = await getBalance(transaction.from)
  if (balance < transaction.amount) {
    throw new Error('余额不足')
  }

  return true
}
```

**为什么要多重验证？** 防止钓鱼攻击和恶意交易。

#### 验证步骤
- [ ] 钱包签名已验证
- [ ] 交易详情已验证
- [ ] 交易前检查余额
- [ ] 不盲目签署交易

### 10. 依赖安全

#### 定期更新
```bash
# 检查漏洞
npm audit

# 自动修复可修复的问题
npm audit fix

# 更新依赖
npm update

# 检查过期的包
npm outdated
```

**为什么要更新？** 旧版本可能有已知的安全漏洞。

#### 锁定文件
```bash
# 始终提交锁定文件
git add package-lock.json

# 在 CI/CD 中使用（可重现构建）
npm ci  # 而不是 npm install
```

**什么是锁定文件？** 记录确切的依赖版本，确保所有人使用相同版本。

#### 验证步骤
- [ ] 依赖是最新的
- [ ] 没有已知漏洞（npm audit 干净）
- [ ] 锁定文件已提交
- [ ] GitHub 上启用了 Dependabot
- [ ] 定期安全更新

## 安全测试

### 自动化安全测试
```typescript
// 测试认证
test('需要认证', async () => {
  const response = await fetch('/api/protected')
  expect(response.status).toBe(401) // 未认证应该返回 401
})

// 测试授权
test('需要管理员角色', async () => {
  const response = await fetch('/api/admin', {
    headers: { Authorization: `Bearer ${userToken}` }
  })
  expect(response.status).toBe(403) // 普通用户应该返回 403
})

// 测试输入验证
test('拒绝无效输入', async () => {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ email: 'not-an-email' })
  })
  expect(response.status).toBe(400) // 无效输入应该返回 400
})

// 测试速率限制
test('强制执行速率限制', async () => {
  const requests = Array(101).fill(null).map(() =>
    fetch('/api/endpoint')
  )

  const responses = await Promise.all(requests)
  const tooManyRequests = responses.filter(r => r.status === 429)

  expect(tooManyRequests.length).toBeGreaterThan(0) // 应该有 429 响应
})
```

## 部署前安全检查清单

**任何生产部署前：**

- [ ] **密钥**：没有硬编码密钥，全部在环境变量中
- [ ] **输入验证**：所有用户输入都经过验证
- [ ] **SQL 注入**：所有查询使用参数化
- [ ] **XSS**：用户内容已清理
- [ ] **CSRF**：已启用防护
- [ ] **认证**：正确的令牌处理
- [ ] **授权**：角色检查已到位
- [ ] **速率限制**：所有端点都已启用
- [ ] **HTTPS**：生产环境强制使用
- [ ] **安全头**：CSP、X-Frame-Options 已配置
- [ ] **错误处理**：错误中没有敏感数据
- [ ] **日志记录**：日志中没有敏感数据
- [ ] **依赖**：最新，没有漏洞
- [ ] **行级安全**：Supabase 中已启用
- [ ] **CORS**：正确配置
- [ ] **文件上传**：已验证（大小、类型）
- [ ] **钱包签名**：已验证（如果是区块链）

## 资源链接

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) —— 十大 Web 应用安全风险
- [Next.js Security](https://nextjs.org/docs/security) —— Next.js 安全指南
- [Supabase Security](https://supabase.com/docs/guides/auth) —— Supabase 安全指南
- [Web Security Academy](https://portswigger.net/web-security) —— 免费网络安全学院

---

**记住**：安全不是可选项。一个漏洞可能危及整个平台。有疑问时，宁可谨慎。
