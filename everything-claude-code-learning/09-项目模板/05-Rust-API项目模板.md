<!--
╔══════════════════════════════════════════════════════════════════╗
║  【教学概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  模板用途：Rust API 服务项目配置模板                              ║
║  适合人群：使用 Rust + Axum + PostgreSQL 的后端开发者             ║
║  核心要点：                                                        ║
║    - 分层架构（处理 → 服务 → 仓储）                                ║
║    - SQLx 编译时类型检查                                           ║
║    - thiserror 错误处理                                           ║
║    - 零成本抽象和内存安全                                          ║
║    - 严格的代码审查（clippy + rustfmt）                            ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Rust API 服务 — 项目 CLAUDE.md

> Rust API 服务与 Axum、PostgreSQL 和 Docker 的真实示例。
> 将此复制到你的项目根目录并为你的服务进行定制。

## 项目概述

**技术栈：** Rust 1.78+、Axum（Web 框架）、SQLx（异步数据库）、PostgreSQL、Tokio（异步运行时）、Docker

**架构：** 具有处理 → 服务 → 仓储分离的分层架构。Axum 用于 HTTP，SQLx 用于编译时类型检查的 SQL，Tower 中间件用于横切关注点。

## 关键规则

### Rust 约定

- 对库错误使用 `thiserror`，仅在二进制 crate 或测试中使用 `anyhow`
- 生产代码中没有 `.unwrap()` 或 `.expect()` - 使用 `?` 传播错误
- 函数参数中优先使用 `&str` 而不是 `String`；所有权转移时返回 `String`
- 使用带 `#![deny(clippy::all, clippy::pedantic)]` 的 `clippy` - 修复所有警告
- 在所有公共类型上派生 `Debug`；仅在需要时派生 `Clone`、`PartialEq`
- 除非用 `// SAFETY:` 注释证明，否则没有 `unsafe` 块

### 数据库

- 所有查询使用 SQLx `query!` 或 `query_as!` 宏 - 在编译时针对架构进行验证
- 使用 `sqlx migrate` 的 `migrations/` 中的迁移 - 永远不要直接修改数据库
- 使用 `sqlx::Pool<Postgres>` 作为共享状态 - 永远不要为每个请求创建连接
- 所有查询使用参数化占位符（`$1`、`$2`）- 永远不要字符串格式化

```rust
// 错误：字符串插值（SQL 注入风险）
let q = format!("SELECT * FROM users WHERE id = '{}'", id);

// 正确：参数化查询，编译时检查
let user = sqlx::query_as!(User, "SELECT * FROM users WHERE id = $1", id)
    .fetch_optional(&pool)
    .await?;
```

### 错误处理

- 使用 `thiserror` 为每个模块定义域错误枚举
- 通过 `IntoResponse` 将错误映射到 HTTP 响应 - 永远不要暴露内部详情
- 使用 `tracing` 进行结构化日志记录 - 永远不要用 `println!` 或 `eprintln!`

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Resource not found")]
    NotFound,
    #[error("Validation failed: {0}")]
    Validation(String),
    #[error("Unauthorized")]
    Unauthorized,
    #[error(transparent)]
    Internal(#[from] anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match &self {
            Self::NotFound => (StatusCode::NOT_FOUND, self.to_string()),
            Self::Validation(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            Self::Unauthorized => (StatusCode::UNAUTHORIZED, self.to_string()),
            Self::Internal(err) => {
                tracing::error!(?err, "internal error");
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal error".into())
            }
        };
        (status, Json(json!({ "error": message }))).into_response()
    }
}
```

### 测试

- 每个源文件中的 `#[cfg(test)]` 模块中的单元测试
- `tests/` 目录中使用真实 PostgreSQL 的集成测试（Testcontainers 或 Docker）
- 对数据库测试使用 `#[sqlx::test]`，自动迁移和回滚
- 使用 `mockall` 或 `wiremock` 模拟外部服务

### 代码风格

- 最大行长度：100 个字符（由 rustfmt 强制执行）
- 分组导入：`std`、外部 crate、`crate`/`super` - 用空行分隔
- 模块：每模块一个文件，`mod.rs` 仅用于重新导出
- 类型：PascalCase，函数/变量：snake_case，常量：UPPER_SNAKE_CASE

## 文件结构

```
src/
  main.rs              # 入口点、服务器设置、优雅关闭
  lib.rs               # 集成测试的重新导出
  config.rs            # 环境配置，使用 envy 或 figment
  router.rs            # 带所有路由的 Axum 路由器
  middleware/
    auth.rs            # JWT 提取和验证
    logging.rs         # 请求/响应跟踪
  handlers/
    mod.rs             # 路由处理器（精简 - 委托给服务）
    users.rs
    orders.rs
  services/
    mod.rs             # 业务逻辑
    users.rs
    orders.rs
  repositories/
    mod.rs             # 数据库访问（SQLx 查询）
    users.rs
    orders.rs
  domain/
    mod.rs             # 域类型、错误枚举
    user.rs
    order.rs
migrations/
  001_create_users.sql
  002_create_orders.sql
tests/
  common/mod.rs        # 共享测试助手、测试服务器设置
  api_users.rs         # 用户端点的集成测试
  api_orders.rs        # 订单端点的集成测试
```

## 关键模式

### 处理器（精简）

```rust
async fn create_user(
    State(ctx): State<AppState>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<UserResponse>), AppError> {
    let user = ctx.user_service.create(payload).await?;
    Ok((StatusCode::CREATED, Json(UserResponse::from(user))))
}
```

### 服务（业务逻辑）

```rust
impl UserService {
    pub async fn create(&self, req: CreateUserRequest) -> Result<User, AppError> {
        if self.repo.find_by_email(&req.email).await?.is_some() {
            return Err(AppError::Validation("Email already registered".into()));
        }

        let password_hash = hash_password(&req.password)?;
        let user = self.repo.insert(&req.email, &req.name, &password_hash).await?;

        Ok(user)
    }
}
```

### 仓储（数据访问）

```rust
impl UserRepository {
    pub async fn find_by_email(&self, email: &str) -> Result<Option<User>, sqlx::Error> {
        sqlx::query_as!(User, "SELECT * FROM users WHERE email = $1", email)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn insert(
        &self,
        email: &str,
        name: &str,
        password_hash: &str,
    ) -> Result<User, sqlx::Error> {
        sqlx::query_as!(
            User,
            r#"INSERT INTO users (email, name, password_hash)
               VALUES ($1, $2, $3) RETURNING *"#,
            email, name, password_hash,
        )
        .fetch_one(&self.pool)
        .await
    }
}
```

### 集成测试

```rust
#[tokio::test]
async fn test_create_user() {
    let app = spawn_test_app().await;

    let response = app
        .client
        .post(&format!("{}/api/v1/users", app.address))
        .json(&json!({
            "email": "alice@example.com",
            "name": "Alice",
            "password": "securepassword123"
        }))
        .send()
        .await
        .expect("Failed to send request");

    assert_eq!(response.status(), StatusCode::CREATED);
    let body: serde_json::Value = response.json().await.unwrap();
    assert_eq!(body["email"], "alice@example.com");
}

#[tokio::test]
async fn test_create_user_duplicate_email() {
    let app = spawn_test_app().await;
    // 创建第一个用户
    create_test_user(&app, "alice@example.com").await;
    // 尝试重复
    let response = create_user_request(&app, "alice@example.com").await;
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}
```

## 环境变量

```bash
# 服务器
HOST=0.0.0.0
PORT=8080
RUST_LOG=info,tower_http=debug

# 数据库
DATABASE_URL=postgres://user:pass@localhost:5432/myapp

# 认证
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRY_HOURS=24

# 可选
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## 测试策略

```bash
# 运行所有测试
cargo test

# 运行并显示输出
cargo test -- --nocapture

# 运行特定测试模块
cargo test api_users

# 检查覆盖率（需要 cargo-llvm-cov）
cargo llvm-cov --html
open target/llvm-cov/html/index.html

# Lint
cargo clippy -- -D warnings

# 格式检查
cargo fmt -- --check
```

## ECC 工作流

```bash
# 规划
/plan "添加带有 Stripe 支付的订单履行"

# 使用 TDD 开发
/tdd                    # 基于 cargo test 的 TDD 工作流

# 审查
/code-review            # Rust 特定代码审查
/security-scan          # 依赖审计 + unsafe 扫描

# 验证
/verify                 # 构建、clippy、测试、安全扫描
```

## Git 工作流

- `feat:` 新功能，`fix:` 错误修复，`refactor:` 代码更改
- 从 `main` 创建功能分支，需要 PR
- CI：`cargo fmt --check`、`cargo clippy`、`cargo test`、`cargo audit`
- 部署：使用 `scratch` 或 `distroless` 基础的 Docker 多阶段构建
