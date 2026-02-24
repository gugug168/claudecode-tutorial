# Setup PM PM2 配置初始化命令

自动分析项目并生成 PM2 服务命令。

## 工作流

1. 检查 PM2（如果缺失，通过 `npm install -g pm2` 安装）
2. 扫描项目识别服务（前端/后端/数据库）
3. 生成配置文件和单独的命令文件

## 服务检测

| 类型 | 检测方式 | 默认端口 |
|------|----------|----------|
| Vite | vite.config.* | 5173 |
| Next.js | next.config.* | 3000 |
| Nuxt | nuxt.config.* | 3000 |
| CRA | package.json 中的 react-scripts | 3000 |
| Express/Node | server/backend/api 目录 + package.json | 3000 |
| FastAPI/Flask | requirements.txt / pyproject.toml | 8000 |
| Go | go.mod / main.go | 8080 |

## 生成文件

```
project/
├── ecosystem.config.cjs              # PM2 配置
├── {backend}/start.cjs               # Python 包装器（如适用）
└── .claude/
    ├── commands/
    │   ├── pm2-all.md                # 启动所有 + 监控
    │   ├── pm2-all-stop.md           # 停止所有
    │   ├── pm2-{port}.md             # 启动单个 + 日志
    │   └── ...
```

## 关键规则

1. **配置文件**：`ecosystem.config.cjs`（不是 .js）
2. **Node.js**：直接指定 bin 路径 + 解释器
3. **Python**：Node.js 包装脚本 + `windowsHide: true`
4. **最小内容**：每个命令文件只有 1-2 行描述 + bash 块
5. **直接执行**：不需要 AI 解析，只需运行 bash 命令
