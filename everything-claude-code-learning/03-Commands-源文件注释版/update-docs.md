<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：将文档与代码库同步，从真理来源文件生成          ║
║  什么时候用它：需要更新项目文档、脚本参考、环境变量文档时            ║
║  核心能力：识别真理来源、生成脚本参考、更新贡献指南                  ║
║  触发方式：/update-docs                                            ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Update Documentation

<!--
【说明】将文档与代码库同步，从真理来源文件生成。
-->
Sync documentation with the codebase, generating from source-of-truth files.

<!--
【说明】步骤1：识别真理来源：
| 来源 | 生成 |
| package.json scripts | 可用命令参考 |
| .env.example | 环境变量文档 |
| openapi.yaml / 路由文件 | API 端点参考 |
| 源代码导出 | 公共 API 文档 |
| Dockerfile / docker-compose.yml | 基础设施设置文档 |
-->
## Step 1: Identify Sources of Truth

| Source | Generates |
|--------|-----------|
| `package.json` scripts | Available commands reference |
| `.env.example` | Environment variable documentation |
| `openapi.yaml` / route files | API endpoint reference |
| Source code exports | Public API documentation |
| `Dockerfile` / `docker-compose.yml` | Infrastructure setup docs |

<!--
【说明】步骤2：生成脚本参考：
1. 读取 `package.json`（或 `Makefile`、`Cargo.toml`、`pyproject.toml`）
2. 提取所有脚本/命令及其描述
3. 生成参考表
-->
## Step 2: Generate Script Reference

1. Read `package.json` (or `Makefile`, `Cargo.toml`, `pyproject.toml`)
2. Extract all scripts/commands with their descriptions
3. Generate a reference table:

<!--
【说明】规则：
- 单一真理来源：始终从代码生成，永远不要手动编辑生成的部分
- 保留手动部分：只更新生成的部分；保持手写内容完整
- 标记生成内容：在生成部分周围使用 `<!-- AUTO-GENERATED -->` 标记
- 不要主动创建文档：只有当命令明确请求时才创建新的文档文件
-->
## Rules

- **Single source of truth**: Always generate from code, never manually edit generated sections
- **Preserve manual sections**: Only update generated sections; leave hand-written prose intact
- **Mark generated content**: Use `<!-- AUTO-GENERATED -->` markers around generated sections
- **Don't create docs unprompted**: Only create new doc files if the command explicitly requests it
