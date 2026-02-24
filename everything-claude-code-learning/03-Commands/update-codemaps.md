# Update Codemaps 更新代码地图命令

分析代码库结构并生成 token 优化的架构文档。

## 步骤 1：扫描项目结构

1. 识别项目类型（monorepo、单应用、库、微服务）
2. 查找所有源目录（src/、lib/、app/、packages/）
3. 映射入口点（main.ts、index.ts、app.py、main.go 等）

## 步骤 2：生成代码地图

在 `docs/CODEMAPS/`（或 `.reports/codemaps/`）创建或更新：

| 文件 | 内容 |
|------|------|
| `architecture.md` | 高层系统图、服务边界、数据流 |
| `backend.md` | API 路由、中间件链、服务 → 仓库映射 |
| `frontend.md` | 页面树、组件层次、状态管理流 |
| `data.md` | 数据库表、关系、迁移历史 |
| `dependencies.md` | 外部服务、第三方集成、共享库 |

## 技巧

- 专注于**高层结构**，而不是实现细节
- 优先使用**文件路径和函数签名**而不是完整代码块
- 保持每个代码地图在 **1000 tokens 以下**以实现高效的上下文加载
- 使用 ASCII 图表示数据流而不是冗长的描述
- 在重大功能添加或重构会话后运行
