<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：分析代码库结构并生成 token 优化的架构文档       ║
║  什么时候用它：重大功能添加或重构会话后                             ║
║  核心能力：扫描项目结构、生成代码地图、差异检测                      ║
║  触发方式：/update-codemaps                                        ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Update Codemaps

<!--
【说明】分析代码库结构并生成 token 优化的架构文档。
-->
Analyze the codebase structure and generate token-lean architecture documentation.

<!--
【说明】步骤1：扫描项目结构：
1. 识别项目类型（monorepo、单应用、库、微服务）
2. 查找所有源目录（src/、lib/、app/、packages/）
3. 映射入口点（main.ts、index.ts、app.py、main.go 等）
-->
## Step 1: Scan Project Structure

1. Identify the project type (monorepo, single app, library, microservice)
2. Find all source directories (src/, lib/, app/, packages/)
3. Map entry points (main.ts, index.ts, app.py, main.go, etc.)

<!--
【说明】步骤2：生成代码地图。在 `docs/CODEMAPS/`（或 `.reports/codemaps/`）创建或更新：
| 文件 | 内容 |
| architecture.md | 高层系统图、服务边界、数据流 |
| backend.md | API 路由、中间件链、服务 → 仓库映射 |
| frontend.md | 页面树、组件层次、状态管理流 |
| data.md | 数据库表、关系、迁移历史 |
| dependencies.md | 外部服务、第三方集成、共享库 |
-->
## Step 2: Generate Codemaps

Create or update codemaps in `docs/CODEMAPS/` (or `.reports/codemaps/`):

| File | Contents |
|------|----------|
| `architecture.md` | High-level system diagram, service boundaries, data flow |
| `backend.md` | API routes, middleware chain, service → repository mapping |
| `frontend.md` | Page tree, component hierarchy, state management flow |
| `data.md` | Database tables, relationships, migration history |
| `dependencies.md` | External services, third-party integrations, shared libraries |

<!--
【说明】技巧：
- 专注于高层结构，而不是实现细节
- 优先使用文件路径和函数签名而不是完整代码块
- 保持每个代码地图在 1000 tokens 以下以实现高效的上下文加载
- 使用 ASCII 图表示数据流而不是冗长的描述
- 在重大功能添加或重构会话后运行
-->
## Tips

- Focus on **high-level structure**, not implementation details
- Prefer **file paths and function signatures** over full code blocks
- Keep each codemap under **1000 tokens** for efficient context loading
- Use ASCII diagrams for data flow instead of verbose descriptions
- Run after major feature additions or refactoring sessions
