<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：定义通用编码风格和代码质量标准                   ║
║  什么时候用它：编写代码、代码审查时参考                              ║
║  核心能力：不可变性、文件组织、错误处理、输入验证、质量检查清单       ║
║  适用范围：通用规则（适用于所有语言）                               ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Coding Style

<!--
【说明】不可变性（关键）：始终创建新对象，永远不要修改现有对象
- 错误：modify() 原地修改原始对象
- 正确：update() 返回带有变更的新副本
- 理由：不可变数据防止隐藏副作用，使调试更容易，并启用安全并发
-->
## Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate existing ones:

```
// Pseudocode
WRONG:  modify(original, field, value) → changes original in-place
CORRECT: update(original, field, value) → returns new copy with change
```

Rationale: Immutable data prevents hidden side effects, makes debugging easier, and enables safe concurrency.

<!--
【说明】文件组织：许多小文件优于少量大文件
- 高内聚，低耦合
- 典型 200-400 行，最多 800 行
- 从大模块提取工具
- 按功能/领域组织，不按类型
-->
## File Organization

MANY SMALL FILES > FEW LARGE FILES:
- High cohesion, low coupling
- 200-400 lines typical, 800 max
- Extract utilities from large modules
- Organize by feature/domain, not by type

<!--
【说明】错误处理：始终全面处理错误
- 在每一层显式处理错误
- 在面向 UI 的代码中提供用户友好的错误消息
- 在服务端记录详细的错误上下文
- 永远不要静默吞掉错误
-->
## Error Handling

ALWAYS handle errors comprehensively:
- Handle errors explicitly at every level
- Provide user-friendly error messages in UI-facing code
- Log detailed error context on the server side
- Never silently swallow errors

<!--
【说明】输入验证：始终在系统边界验证
- 处理前验证所有用户输入
- 在可用时使用基于 schema 的验证
- 快速失败并提供清晰的错误消息
- 永远不要信任外部数据（API 响应、用户输入、文件内容）
-->
## Input Validation

ALWAYS validate at system boundaries:
- Validate all user input before processing
- Use schema-based validation where available
- Fail fast with clear error messages
- Never trust external data (API responses, user input, file content)

<!--
【说明】代码质量检查清单：标记工作完成前检查
- 代码可读且命名良好
- 函数小（<50 行）
- 文件聚焦（<800 行）
- 无深层嵌套（>4 层）
- 适当的错误处理
- 无硬编码值（使用常量或配置）
- 无变更（使用不可变模式）
-->
## Code Quality Checklist

Before marking work complete:
- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling
- [ ] No hardcoded values (use constants or config)
- [ ] No mutation (immutable patterns used)
