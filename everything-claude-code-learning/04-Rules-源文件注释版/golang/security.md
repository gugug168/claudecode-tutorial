<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：Go 语言特定的安全规范                          ║
║  什么时候用它：编写 Go 代码、安全检查时参考                          ║
║  核心能力：密钥管理、安全扫描、上下文超时控制                        ║
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

# Go Security

> This file extends [common/security.md](../common/security.md) with Go specific content.

<!--
【说明】密钥管理：从环境变量获取密钥，如果未配置则退出
-->
## Secret Management

```go
apiKey := os.Getenv("OPENAI_API_KEY")
if apiKey == "" {
    log.Fatal("OPENAI_API_KEY not configured")
}
```

<!--
【说明】安全扫描：使用 gosec 进行静态安全分析
-->
## Security Scanning

- Use **gosec** for static security analysis:
  ```bash
  gosec ./...
  ```

<!--
【说明】上下文和超时：始终使用 context.Context 进行超时控制
- 创建带超时的上下文
- 使用 defer 确保在函数退出时取消上下文
-->
## Context & Timeouts

Always use `context.Context` for timeout control:

```go
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
```
