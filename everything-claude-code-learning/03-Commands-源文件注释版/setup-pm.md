<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：自动分析项目并生成 PM2 服务命令                  ║
║  什么时候用它：需要为项目配置 PM2 进程管理时                         ║
║  核心能力：服务检测、配置生成、命令文件生成                          ║
║  触发方式：/setup-pm                                               ║
╚══════════════════════════════════════════════════════════════════╝
-->

# PM2 Init

<!--
【说明】自动分析项目并生成 PM2 服务命令。
-->
Auto-analyze project and generate PM2 service commands.

<!--
【说明】工作流：
1. 检查 PM2（如果缺失，通过 npm install -g pm2 安装）
2. 扫描项目识别服务（前端/后端/数据库）
3. 生成配置文件和单独的命令文件
-->
## Workflow

1. Check PM2 (install via `npm install -g pm2` if missing)
2. Scan project to identify services (frontend/backend/database)
3. Generate config files and individual command files

<!--
【说明】服务检测：
| 类型 | 检测方式 | 默认端口 |
| Vite | vite.config.* | 5173 |
| Next.js | next.config.* | 3000 |
| Nuxt | nuxt.config.* | 3000 |
| CRA | package.json 中的 react-scripts | 3000 |
| Express/Node | server/backend/api 目录 + package.json | 3000 |
| FastAPI/Flask | requirements.txt / pyproject.toml | 8000 |
| Go | go.mod / main.go | 8080 |
-->
## Service Detection

| Type | Detection | Default Port |
|------|-----------|--------------|
| Vite | vite.config.* | 5173 |
| Next.js | next.config.* | 3000 |
| Nuxt | nuxt.config.* | 3000 |
| CRA | react-scripts in package.json | 3000 |
| Express/Node | server/backend/api directory + package.json | 3000 |
| FastAPI/Flask | requirements.txt / pyproject.toml | 8000 |
| Go | go.mod / main.go | 8080 |

<!--
【说明】生成文件：
- ecosystem.config.cjs：PM2 配置
- {backend}/start.cjs：Python 包装器（如适用）
- .claude/commands/pm2-all.md：启动所有 + 监控
- .claude/commands/pm2-all-stop.md：停止所有
- .claude/commands/pm2-{port}.md：启动单个 + 日志
-->
## Generated Files

```
project/
├── ecosystem.config.cjs              # PM2 config
├── {backend}/start.cjs               # Python wrapper (if applicable)
└── .claude/
    ├── commands/
    │   ├── pm2-all.md                # Start all + monit
    │   ├── pm2-all-stop.md           # Stop all
    │   ├── pm2-{port}.md             # Start single + logs
    │   └── ...
```

<!--
【说明】关键规则：
1. 配置文件：ecosystem.config.cjs（不是 .js）
2. Node.js：直接指定 bin 路径 + 解释器
3. Python：Node.js 包装脚本 + windowsHide: true
4. 最小内容：每个命令文件只有 1-2 行描述 + bash 块
5. 直接执行：不需要 AI 解析，只需运行 bash 命令
-->
## Key Rules

1. **Config file**: `ecosystem.config.cjs` (not .js)
2. **Node.js**: Specify bin path directly + interpreter
3. **Python**: Node.js wrapper script + `windowsHide: true`
4. **Minimal content**: Each command file has only 1-2 lines description + bash block
5. **Direct execution**: No AI parsing needed, just run the bash command
