<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：Go 语言特定的设计模式                          ║
║  什么时候用它：编写 Go 代码、架构设计时参考                          ║
║  核心能力：函数式选项、小接口、依赖注入                             ║
║  适用范围：Go 语言项目                                             ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
# 【元数据说明】paths: 指定此规则适用于哪些 Go 文件路径
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---

# Go Patterns

> This file extends [common/patterns.md](../common/patterns.md) with Go specific content.

<!--
【说明】函数式选项：使用选项函数模式配置对象
- 定义 Option 函数类型
- 提供具体的选项函数（如 WithPort）
- 构造函数接受可变参数选项
-->
## Functional Options

```go
type Option func(*Server)

func WithPort(port int) Option {
    return func(s *Server) { s.port = port }
}

func NewServer(opts ...Option) *Server {
    s := &Server{port: 8080}  // default
    for _, opt := range opts {
        opt(s)
    }
    return s
}
```

<!--
【说明】小接口：在使用处定义接口，而不是在实现处定义
-->
## Small Interfaces

Define interfaces where they are used, not where they are implemented.

<!--
【说明】依赖注入：使用构造函数注入依赖
-->
## Dependency Injection

Use constructor functions to inject dependencies:

```go
func NewUserService(repo UserRepository, logger Logger) *UserService {
    return &UserService{repo: repo, logger: logger}
}
```

<!--
【说明】参考：参见技能 golang-patterns 获取全面的 Go 模式
-->
## Reference

See skill: `golang-patterns` for comprehensive Go patterns including concurrency, error handling, and package organization.
