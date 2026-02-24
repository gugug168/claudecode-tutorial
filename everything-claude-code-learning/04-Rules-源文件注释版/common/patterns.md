<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：定义通用设计模式和项目骨架使用规范                ║
║  什么时候用它：实现新功能、架构设计时参考                            ║
║  核心能力：骨架项目、仓库模式、API响应格式                          ║
║  适用范围：通用规则                                                ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Common Patterns

<!--
【说明】骨架项目：实现新功能时
1. 搜索经过实战检验的骨架项目
2. 使用并行代理评估选项（安全评估、可扩展性分析、相关性评分、实现规划）
3. 克隆最佳匹配作为基础
4. 在经过验证的结构内迭代
-->
## Skeleton Projects

When implementing new functionality:
1. Search for battle-tested skeleton projects
2. Use parallel agents to evaluate options:
   - Security assessment
   - Extensibility analysis
   - Relevance scoring
   - Implementation planning
3. Clone best match as foundation
4. Iterate within proven structure

## Design Patterns

<!--
【说明】仓库模式：将数据访问封装在一致的接口后面
- 定义标准操作：findAll, findById, create, update, delete
- 具体实现处理存储细节（数据库、API、文件等）
- 业务逻辑依赖抽象接口，而不是存储机制
- 支持轻松切换数据源，并通过 mock 简化测试
-->
### Repository Pattern

Encapsulate data access behind a consistent interface:
- Define standard operations: findAll, findById, create, update, delete
- Concrete implementations handle storage details (database, API, file, etc.)
- Business logic depends on the abstract interface, not the storage mechanism
- Enables easy swapping of data sources and simplifies testing with mocks

<!--
【说明】API 响应格式：为所有 API 响应使用一致的封装格式
- 包含成功/状态指示器
- 包含数据负载（错误时可为空）
- 包含错误消息字段（成功时可为空）
- 包含分页响应的元数据（total, page, limit）
-->
### API Response Format

Use a consistent envelope for all API responses:
- Include a success/status indicator
- Include the data payload (nullable on error)
- Include an error message field (nullable on success)
- Include metadata for paginated responses (total, page, limit)
