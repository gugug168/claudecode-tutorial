---
name: iterative-retrieval
description: 渐进式精化上下文检索模式，解决子代理上下文问题
---

# Iterative Retrieval Pattern
# 迭代检索模式

<!--
【教学说明】
这个模式解决了多代理系统中的一个核心问题：子代理需要上下文，
但我们不知道哪些文件相关，直到代理开始工作。

就像给一个新员工分配任务——你不知道需要哪些文档，
直到他们开始工作并提问。这个模式自动化了这个"提问-获取-精化"循环。
-->

解决多代理工作流中的"上下文问题"，即子代理在开始工作之前无法知道它们需要什么上下文。

## 何时激活此技能

- 生成需要代码库上下文的子代理（无法预测）
- 构建上下文渐进式精化的多代理工作流
- 遇到"上下文太大"或"缺少上下文"失败
- 设计类似 RAG 的代码探索检索管道
- 优化代理编排中的 token 使用

## 问题描述

<!--
【教学说明】
子代理启动时上下文有限，它们不知道：
- 哪些文件包含相关代码
- 代码库中存在什么模式
- 项目使用什么术语
-->

子代理在有限上下文中生成。它们不知道：
- 哪些文件包含相关代码
- 代码库中存在什么模式
- 项目使用什么术语

**标准方法会失败：**
- **发送所有内容**：超出上下文限制
- **不发送**：代理缺少关键信息
- **猜测需要什么**：经常出错

**示例：**
```
任务："修复身份验证令牌过期 bug"

方法 1：发送所有文件
结果：上下文太大（200K+ tokens）❌

方法 2：不发送任何文件
结果：代理不知道在哪里找代码 ❌

方法 3：猜测
结果：可能发送错误的文件 ❌

方法 4：迭代检索
结果：渐进式找到正确的文件 ✅
```

## 解决方案：迭代检索

<!--
【教学说明】
一个 4 阶段循环，渐进式精化上下文。
-->

一个 4 阶段循环，渐进式精化上下文：

```
┌─────────────────────────────────────────────┐
│                                             │
│   ┌──────────┐      ┌──────────┐            │
│   │ 分发     │─────▶│ 评估     │            │
│   │ DISPATCH │      │ EVALUATE │            │
│   └──────────┘      └──────────┘            │
│        ▲                  │                 │
│        │                  ▼                 │
│   ┌──────────┐      ┌──────────┐            │
│   │   循环   │◀─────│  精化    │            │
│   │   LOOP   │      │  REFINE  │            │
│   └──────────┘      └──────────┘            │
│                                             │
│        最多 3 次循环，然后继续              │
└─────────────────────────────────────────────┘
```

**流程说明：**
1. **分发（DISPATCH）**：初始广泛查询
2. **评估（EVALUATE）**：检查相关性
3. **精化（REFINE）**：更新搜索条件
4. **循环（LOOP）**：重复（最多 3 次）

### 阶段 1：分发（DISPATCH）

<!--
【教学说明】
从宽泛的查询开始，收集候选文件。
-->

初始广泛查询以收集候选文件：

```javascript
// 从高层意图开始
const initialQuery = {
  patterns: ['src/**/*.ts', 'lib/**/*.ts'],
  keywords: ['authentication', 'user', 'session'],
  excludes: ['*.test.ts', '*.spec.ts']
};

// 分发到检索代理
const candidates = await retrieveFiles(initialQuery);
```

**为什么宽泛？**
- 我们不知道确切的术语
- 代码库可能使用意外的命名
- 宽泛查询减少遗漏

### 阶段 2：评估（EVALUATE）

<!--
【教学说明】
评估检索内容的相关性，返回评分和原因。
-->

评估检索内容的相关性：

```javascript
function evaluateRelevance(files, task) {
  return files.map(file => ({
    path: file.path,
    relevance: scoreRelevance(file.content, task), // 0-1 分数
    reason: explainRelevance(file.content, task),  // 为什么相关
    missingContext: identifyGaps(file.content, task) // 缺少什么
  }));
}
```

**评分标准：**
- **高 (0.8-1.0)**：直接实现目标功能
- **中 (0.5-0.7)**：包含相关模式或类型
- **低 (0.2-0.4)**：略微相关
- **无 (0-0.2)**：不相关，排除

**为什么评分？**
- 优先处理最相关的文件
- 识别需要更多信息的地方
- 循环终止条件

### 阶段 3：精化（REFINE）

<!--
【教学说明】
根据评估更新搜索条件——这是关键步骤。
-->

根据评估更新搜索条件：

```javascript
function refineQuery(evaluation, previousQuery) {
  return {
    // 添加在高相关性文件中发现的新模式
    patterns: [...previousQuery.patterns, ...extractPatterns(evaluation)],

    // 添加代码库中发现的术语
    keywords: [...previousQuery.keywords, ...extractKeywords(evaluation)],

    // 排除确认不相关的路径
    excludes: [...previousQuery.excludes, ...evaluation
      .filter(e => e.relevance < 0.2)
      .map(e => e.path)
    ],

    // 针对特定缺失
    focusAreas: evaluation
      .flatMap(e => e.missingContext)
      .filter(unique)
  };
}
```

**精化策略：**
- **添加模式**：如果高相关性文件使用 `auth/*.ts`，添加到模式
- **添加术语**：如果代码库使用"throttle"而非"rate"，添加关键词
- **排除路径**：低相关性文件不太可能变得相关
- **关注缺口**：明确识别缺失的上下文

### 阶段 4：循环（LOOP）

<!--
【教学说明】
使用精化条件重复（最多 3 次循环）。
-->

使用精化条件重复（最多 3 次循环）：

```javascript
async function iterativeRetrieve(task, maxCycles = 3) {
  let query = createInitialQuery(task);
  let bestContext = [];

  for (let cycle = 0; cycle < maxCycles; cycle++) {
    const candidates = await retrieveFiles(query);
    const evaluation = evaluateRelevance(candidates, task);

    // 检查是否有足够上下文
    const highRelevance = evaluation.filter(e => e.relevance >= 0.7);
    if (highRelevance.length >= 3 && !hasCriticalGaps(evaluation)) {
      return highRelevance; // 提前退出
    }

    // 精化并继续
    query = refineQuery(evaluation, query);
    bestContext = mergeContext(bestContext, highRelevance);
  }

  return bestContext;
}
```

**为什么最多 3 次？**
- 通常 2-3 次后收益递减
- 平衡质量和速度
- 避免无限循环

**提前退出条件：**
- 3+ 个高相关性文件
- 无关键缺口

## 实际示例

### 示例 1：Bug 修复上下文

```
任务："修复身份验证令牌过期 bug"

循环 1:
  分发: 在 src/** 中搜索 "token"、"auth"、"expiry"
  评估: 找到 auth.ts (0.9), tokens.ts (0.8), user.ts (0.3)
  精化: 添加 "refresh"、"jwt" 关键词；排除 user.ts

循环 2:
  分发: 搜索精化术语
  评估: 找到 session-manager.ts (0.95), jwt-utils.ts (0.85)
  精化: 足够上下文（2 个高相关性文件）

结果: auth.ts, tokens.ts, session-manager.ts, jwt-utils.ts
```

### 示例 2：功能实现

```
任务："为 API 端点添加速率限制"

循环 1:
  分发: 在 routes/** 中搜索 "rate"、"limit"、"api"
  评估: 无匹配——代码库使用"throttle"术语
  精化: 添加 "throttle"、"middleware" 关键词

循环 2:
  分发: 搜索精化术语
  评估: 找到 throttle.ts (0.9), middleware/index.ts (0.7)
  精化: 需要路由器模式

循环 3:
  分发: 搜索 "router"、"express" 模式
  评估: 找到 router-setup.ts (0.8)
  精化: 足够上下文

结果: throttle.ts, middleware/index.ts, router-setup.ts
```

**关键教训：** 代码库可能使用意外术语——第一次循环揭示命名约定。

## 与代理集成

<!--
【教学说明】
在代理提示中使用迭代检索模式。
-->

在代理提示中使用：

```markdown
检索此任务的上下文时：
1. 从广泛的关键字搜索开始
2. 评估每个文件的相关性（0-1 级）
3. 识别仍然缺少什么上下文
4. 精化搜索条件并重复（最多 3 次循环）
5. 返回相关性 >= 0.7 的文件
```

**代理输出示例：**
```markdown
## 上下文检索结果

循环 1:
- 搜索: ["auth", "token"]
- 结果: 15 个文件
- 高相关性: auth.ts (0.9), session.ts (0.8)

循环 2:
- 精化: 添加 "jwt"、"refresh"
- 结果: 8 个文件
- 高相关性: jwt-utils.ts (0.95), refresh.ts (0.85)

最终上下文: 4 个文件，总相关性 0.87
```

## 最佳实践

<!--
【教学说明】
这些实践确保迭代检索有效工作。
-->

1. **从宽泛开始，逐步缩小** ——不要过度指定初始查询
2. **学习代码库术语** ——第一次循环通常揭示命名约定
3. **跟踪缺少什么** ——明确的缺口识别推动精化
4. **"足够好"就停止** ——3 个高相关性文件胜过 10 个平庸的
5. **自信排除** ——低相关性文件不会变得相关

**常见错误：**
- ❌ 初始查询太具体（错过相关文件）
- ❌ 不学习代码库术语（重复搜索相同术语）
- ❌ 跟踪太多文件（上下文膨胀）
- ❌ 循环太多次（收益递减）

## 性能考虑

**Token 使用：**
```
方法 1：发送所有文件
- Token: 200,000
- 质量：高（包含所有内容）
- 成本：高 ❌

方法 2：迭代检索
- 循环 1: 20,000 tokens（10 个文件）
- 循环 2: 15,000 tokens（5 个文件）
- 循环 3: 8,000 tokens（3 个文件）
- 总计: 43,000 tokens
- 质量：高（包含正确文件）
- 成本：低 ✅
```

**节省：** 200K → 43K tokens（78% 减少）

## 相关资源

- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) ——子代理编排章节
- `continuous-learning` 技能——随时间改进的模式
- `~/.claude/agents/` 中的代理定义

---

**记住**：迭代检索解决了子代理的上下文困境——渐进式找到正确的文件，而不是猜测或发送所有内容。
