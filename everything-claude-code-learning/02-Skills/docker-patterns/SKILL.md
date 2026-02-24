<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的:Docker 和 Docker Compose 模式                  ║
║  什么时候用它:设置本地开发环境、多容器架构、网络/卷问题、安全审查   ║
║  核心能力:Docker Compose、多阶段构建、网络、卷策略、容器安全      ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: docker-patterns
description: Docker and Docker Compose patterns for local development, container security, networking, volume strategies, and multi-service orchestration.
---

# Docker 模式

Docker 和 Docker Compose 最佳实践,用于容器化开发。

<!--
【说明】何时使用此技能:
- 为本地开发设置 Docker Compose
- 设计多容器架构
- 排查容器网络或卷问题
- 审查 Dockerfile 安全性和镜像大小
- 从本地开发迁移到容器化工作流
-->
## 何时激活

- 为本地开发设置 Docker Compose
- 设计多容器架构
- 排查容器网络或卷问题
- 审查 Dockerfile 安全性和镜像大小
- 从本地开发迁移到容器化工作流

<!--
【说明】标准 Web 应用栈配置:
- 使用多阶段构建的 dev 目标
- 绑定挂载实现热重载
- 匿名卷保留容器依赖
- healthcheck 确保服务就绪
- mailpit 用于本地邮件测试
-->
## 本地开发的 Docker Compose

### 标准 Web 应用栈

```yaml
# docker-compose.yml
services:
  app:
    build:
      context: .
      target: dev                     # 使用多阶段 Dockerfile 的 dev 阶段
    ports:
      - "3000:3000"
    volumes:
      - .:/app                        # 绑定挂载用于热重载
      - /app/node_modules             # 匿名卷 -- 保留容器依赖
    environment:
      - DATABASE_URL=postgres://postgres:postgres@db:5432/app_dev
      - REDIS_URL=redis://redis:6379/0
      - NODE_ENV=development
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    command: npm run dev

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_dev
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  mailpit:                            # 本地邮件测试
    image: axllent/mailpit
    ports:
      - "8025:8025"                   # Web UI
      - "1025:1025"                   # SMTP

volumes:
  pgdata:
  redisdata:
```

<!--
【说明】多阶段 Dockerfile 最佳实践:
- deps 阶段:安装依赖
- dev 阶段:开发环境,包含调试工具
- build 阶段:构建生产代码
- production 阶段:最小化镜像,非 root 用户
-->
### 开发与生产 Dockerfile

```dockerfile
# 阶段:依赖
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 阶段:dev(热重载,调试工具)
FROM node:22-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# 阶段:build
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --production

# 阶段:production(最小镜像)
FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
USER appuser
COPY --from=build --chown=appuser:appgroup /app/dist ./dist
COPY --from=build --chown=appuser:appgroup /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

<!--
【说明】Docker Compose 覆盖文件:
- docker-compose.override.yml 自动加载,用于开发设置
- docker-compose.prod.yml 显式指定,用于生产配置
- 开发用 docker compose up,生产需指定文件
-->
### 覆盖文件

```yaml
# docker-compose.override.yml(自动加载,仅开发设置)
services:
  app:
    environment:
      - DEBUG=app:*
      - LOG_LEVEL=debug
    ports:
      - "9229:9229"                   # Node.js 调试器

# docker-compose.prod.yml(显式指定生产配置)
services:
  app:
    build:
      target: production
    restart: always
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
```

```bash
# 开发环境(自动加载覆盖)
docker compose up

# 生产环境
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

<!--
【说明】Docker 网络要点:
- 同一 Compose 网络中的服务通过服务名解析
- 可创建自定义网络隔离服务
- db 只能从 api 访问,不能从 frontend 访问
-->
## 网络

### 服务发现

同一 Compose 网络中的服务通过服务名解析:
```
# 从 "app" 容器中:
postgres://postgres:postgres@db:5432/app_dev    # "db" 解析为 db 容器
redis://redis:6379/0                             # "redis" 解析为 redis 容器
```

### 自定义网络

```yaml
services:
  frontend:
    networks:
      - frontend-net

  api:
    networks:
      - frontend-net
      - backend-net

  db:
    networks:
      - backend-net              # 只能从 api 访问,不能从 frontend 访问

networks:
  frontend-net:
  backend-net:
```

<!--
【说明】卷策略:
- 命名卷:跨容器重启持久化,由 Docker 管理
- 绑定挂载:将主机目录映射到容器(用于开发)
- 匿名卷:保护容器生成的内容不被绑定挂载覆盖
-->
## 卷策略

```yaml
volumes:
  # 命名卷:跨容器重启持久化,由 Docker 管理
  pgdata:

  # 绑定挂载:将主机目录映射到容器(用于开发)
  # - ./src:/app/src

  # 匿名卷:保护容器生成的内容不被绑定挂载覆盖
  # - /app/node_modules
```

<!--
【说明】容器安全最佳实践:
- 使用特定标签(不用 :latest)
- 以非 root 用户运行
- 丢弃不必要的能力
- 尽可能使用只读根文件系统
- 镜像层中不要有密钥
-->
## 容器安全

### Dockerfile 强化

```dockerfile
# 1. 使用特定标签(永远不用 :latest)
FROM node:22.12-alpine3.20

# 2. 以非 root 用户运行
RUN addgroup -g 1001 -S app && adduser -S app -u 1001
USER app

# 3. 丢弃能力(在 compose 中)
# 4. 尽可能使用只读根文件系统
# 5. 镜像层中无密钥
```

### Compose 安全

```yaml
services:
  app:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /app/.cache
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE          # 仅在绑定到端口 < 1024 时需要
```

<!--
【说明】密钥管理:
- 好:使用环境变量(运行时注入)
- 坏:在镜像中硬编码密钥
- .env 文件不要提交到 git
-->
### 密钥管理

```yaml
# 好的做法:使用环境变量(运行时注入)
services:
  app:
    env_file:
      - .env                     # 永远不要将 .env 提交到 git
    environment:
      - API_KEY                  # 从主机环境继承

# 坏的做法:在镜像中硬编码
# ENV API_KEY=sk-proj-xxxxx      # 永远不要这样做
```

<!--
【说明】.dockerignore 文件:
- 排除不需要复制到镜像的文件
- 减小镜像大小,加速构建
-->
## .dockerignore

```
node_modules
.git
.env
.env.*
dist
coverage
*.log
.next
.cache
docker-compose*.yml
Dockerfile*
README.md
tests/
```

<!--
【说明】常用调试命令:
- docker compose logs 查看日志
- docker compose exec 进入容器
- docker compose ps 查看运行状态
- docker stats 查看资源使用
- docker compose down -v 清理包括卷
-->
## 调试

### 常用命令

```bash
# 查看日志
docker compose logs -f app           # 跟踪 app 日志
docker compose logs --tail=50 db     # db 的最后 50 行

# 在运行容器中执行命令
docker compose exec app sh           # 进入 app shell
docker compose exec db psql -U postgres  # 连接到 postgres

# 检查
docker compose ps                     # 运行中的服务
docker stats                          # 资源使用

# 重新构建
docker compose up --build             # 重新构建镜像
docker compose build --no-cache app   # 强制完全重新构建

# 清理
docker compose down                   # 停止并删除容器
docker compose down -v                # 同时删除卷(破坏性)
docker system prune                   # 删除未使用的镜像/容器
```

<!--
【说明】Docker 反模式:
- 生产用 docker compose 而没有编排(用 K8s/ECS/Swarm)
- 容器中存储数据而没有卷
- 以 root 运行
- 使用 :latest 标签
- 一个容器包含所有服务
- 在 docker-compose.yml 中放密钥
-->
## 反模式

```
# 坏的做法:在生产中使用 docker compose 而没有编排
# 使用 Kubernetes、ECS 或 Docker Swarm 进行生产多容器工作负载

# 坏的做法:在没有卷的容器中存储数据
# 容器是临时的 -- 没有卷会在重启时丢失所有数据

# 坏的做法:以 root 运行
# 始终创建并使用非 root 用户

# 坏的做法:使用 :latest 标签
# 固定到特定版本以实现可复现的构建

# 坏的做法:一个包含所有服务的巨大容器
# 分离关注点:每个容器一个进程

# 坏的做法:在 docker-compose.yml 中放置密钥
# 使用 .env 文件(git忽略)或 Docker secrets
```
