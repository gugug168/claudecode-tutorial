<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：渐进式上下文检索模式                            ║
║  什么时候用它：子代理需要代码上下文、多代理工作流、RAG 检索管道时   ║
║  核心能力：DISPATCH-EVALUATE-REFINE-LOOP 循环、相关性评分、Gap识别║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: iterative-retrieval
description: Pattern for progressively refining context retrieval to solve the subagent context problem
---

# Iterative Retrieval Pattern

Solves the "context problem" in multi-agent workflows where subagents don't know what context they need until they start working.

<!--
【说明】何时激活此技能：
- 生成需要无法预测的代码库上下文的子代理
- 构建上下文渐进式精化的多代理工作流
- 遇到"上下文太大"或"缺少上下文"失败
- 设计类似 RAG 的代码探索检索管道
- 优化代理编排中的 token 使用
-->
## When to Activate

- Spawning subagents that need codebase context they cannot predict upfront
- Building multi-agent workflows where context is progressively refined
- Encountering "context too large" or "missing context" failures in agent tasks
- Designing RAG-like retrieval pipelines for code exploration
- Optimizing token usage in agent orchestration

<!--
【说明】问题描述：
子代理在有限上下文中生成，它们不知道哪些文件包含相关代码、
代码库中存在什么模式、项目使用什么术语。

标准方法会失败：
- 发送所有内容：超出上下文限制
- 不发送：代理缺少关键信息
- 猜测需要什么：经常出错
-->
## The Problem

Subagents are spawned with limited context. They don't know:
- Which files contain relevant code
- What patterns exist in the codebase
- What terminology the project uses

Standard approaches fail:
- **Send everything**: Exceeds context limits
- **Send nothing**: Agent lacks critical information
- **Guess what's needed**: Often wrong

<!--
【说明】解决方案：迭代检索
一个4阶段循环，渐进式精化上下文：
- DISPATCH：初始广泛查询
- EVALUATE：评估相关性
- REFINE：更新搜索条件
- LOOP：重复（最多3次）
-->
## The Solution: Iterative Retrieval

A 4-phase loop that progressively refines context:

```
┌─────────────────────────────────────────────┐
│                                             │
│   ┌──────────┐      ┌──────────┐            │
│   │ DISPATCH │─────▶│ EVALUATE │            │
│   └──────────┘      └──────────┘            │
│        ▲                  │                 │
│        │                  ▼                 │
│   ┌──────────┐      ┌──────────┐            │
│   │   LOOP   │◀─────│  REFINE  │            │
│   └──────────┘      └──────────┘            │
│                                             │
│        Max 3 cycles, then proceed           │
└─────────────────────────────────────────────┘
```

<!--
【说明】阶段1：DISPATCH（分发）
初始广泛查询以收集候选文件，从高层意图开始。
-->
### Phase 1: DISPATCH

Initial broad query to gather candidate files:

```javascript
// Start with high-level intent
const initialQuery = {
  patterns: ['src/**/*.ts', 'lib/**/*.ts'],
  keywords: ['authentication', 'user', 'session'],
  excludes: ['*.test.ts', '*.spec.ts']
};

// Dispatch to retrieval agent
const candidates = await retrieveFiles(initialQuery);
```

<!--
【说明】阶段2：EVALUATE（评估）
评估检索内容的相关性，返回相关性评分、原因和缺失上下文。

评分标准：
- 高 (0.8-1.0)：直接实现目标功能
- 中 (0.5-0.7)：包含相关模式或类型
- 低 (0.2-0.4)：略微相关
- 无 (0-0.2)：不相关，排除
-->
### Phase 2: EVALUATE

Assess retrieved content for relevance:

```javascript
function evaluateRelevance(files, task) {
  return files.map(file => ({
    path: file.path,
    relevance: scoreRelevance(file.content, task),
    reason: explainRelevance(file.content, task),
    missingContext: identifyGaps(file.content, task)
  }));
}
```

Scoring criteria:
- **High (0.8-1.0)**: Directly implements target functionality
- **Medium (0.5-0.7)**: Contains related patterns or types
- **Low (0.2-0.4)**: Tangentially related
- **None (0-0.2)**: Not relevant, exclude

<!--
【说明】阶段3：REFINE（精化）
根据评估更新搜索条件：
- 添加在高相关性文件中发现的新模式
- 添加代码库中发现的术语
- 排除确认不相关的路径
- 针对特定缺失
-->
### Phase 3: REFINE

Update search criteria based on evaluation:

```javascript
function refineQuery(evaluation, previousQuery) {
  return {
    // Add new patterns discovered in high-relevance files
    patterns: [...previousQuery.patterns, ...extractPatterns(evaluation)],

    // Add terminology found in codebase
    keywords: [...previousQuery.keywords, ...extractKeywords(evaluation)],

    // Exclude confirmed irrelevant paths
    excludes: [...previousQuery.excludes, ...evaluation
      .filter(e => e.relevance < 0.2)
      .map(e => e.path)
    ],

    // Target specific gaps
    focusAreas: evaluation
      .flatMap(e => e.missingContext)
      .filter(unique)
  };
}
```

<!--
【说明】阶段4：LOOP（循环）
使用精化条件重复（最多3次循环）。
当有3个以上高相关性文件且无关键缺失时停止。
-->
### Phase 4: LOOP

Repeat with refined criteria (max 3 cycles):

```javascript
async function iterativeRetrieve(task, maxCycles = 3) {
  let query = createInitialQuery(task);
  let bestContext = [];

  for (let cycle = 0; cycle < maxCycles; cycle++) {
    const candidates = await retrieveFiles(query);
    const evaluation = evaluateRelevance(candidates, task);

    // Check if we have sufficient context
    const highRelevance = evaluation.filter(e => e.relevance >= 0.7);
    if (highRelevance.length >= 3 && !hasCriticalGaps(evaluation)) {
      return highRelevance;
    }

    // Refine and continue
    query = refineQuery(evaluation, query);
    bestContext = mergeContext(bestContext, highRelevance);
  }

  return bestContext;
}
```

<!--
【说明】实际示例
示例1：Bug 修复上下文 - 通过2次循环找到4个高相关性文件
示例2：功能实现 - 通过3次循环发现代码库使用"throttle"而非"rate"术语
-->
## Practical Examples

### Example 1: Bug Fix Context

```
Task: "Fix the authentication token expiry bug"

Cycle 1:
  DISPATCH: Search for "token", "auth", "expiry" in src/**
  EVALUATE: Found auth.ts (0.9), tokens.ts (0.8), user.ts (0.3)
  REFINE: Add "refresh", "jwt" keywords; exclude user.ts

Cycle 2:
  DISPATCH: Search refined terms
  EVALUATE: Found session-manager.ts (0.95), jwt-utils.ts (0.85)
  REFINE: Sufficient context (2 high-relevance files)

Result: auth.ts, tokens.ts, session-manager.ts, jwt-utils.ts
```

### Example 2: Feature Implementation

```
Task: "Add rate limiting to API endpoints"

Cycle 1:
  DISPATCH: Search "rate", "limit", "api" in routes/**
  EVALUATE: No matches - codebase uses "throttle" terminology
  REFINE: Add "throttle", "middleware" keywords

Cycle 2:
  DISPATCH: Search refined terms
  EVALUATE: Found throttle.ts (0.9), middleware/index.ts (0.7)
  REFINE: Need router patterns

Cycle 3:
  DISPATCH: Search "router", "express" patterns
  EVALUATE: Found router-setup.ts (0.8)
  REFINE: Sufficient context

Result: throttle.ts, middleware/index.ts, router-setup.ts
```

<!--
【说明】与代理集成
在代理提示中使用迭代检索模式。
-->
## Integration with Agents

Use in agent prompts:

```markdown
When retrieving context for this task:
1. Start with broad keyword search
2. Evaluate each file's relevance (0-1 scale)
3. Identify what context is still missing
4. Refine search criteria and repeat (max 3 cycles)
5. Return files with relevance >= 0.7
```

<!--
【说明】最佳实践：
1. 从宽泛开始，逐步缩小 - 不要过度指定初始查询
2. 学习代码库术语 - 第一次循环通常会揭示命名约定
3. 跟踪缺失内容 - 明确的缺口识别推动精化
4. "足够好"就停止 - 3个高相关性文件胜过10个平庸的
5. 自信排除 - 低相关性文件不会变得相关
-->
## Best Practices

1. **Start broad, narrow progressively** - Don't over-specify initial queries
2. **Learn codebase terminology** - First cycle often reveals naming conventions
3. **Track what's missing** - Explicit gap identification drives refinement
4. **Stop at "good enough"** - 3 high-relevance files beats 10 mediocre ones
5. **Exclude confidently** - Low-relevance files won't become relevant

<!--
【说明】相关资源
-->
## Related

- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) - Subagent orchestration section
- `continuous-learning` skill - For patterns that improve over time
- Agent definitions in `~/.claude/agents/`
