<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：Python 语言特定的安全规范                       ║
║  什么时候用它：编写 Python 代码、安全检查时参考                       ║
║  核心能力：密钥管理、安全扫描                                       ║
║  适用范围：Python 语言项目                                         ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
# 【元数据说明】paths: 指定此规则适用于哪些 Python 文件路径
paths:
  - "**/*.py"
  - "**/*.pyi"
---

# Python Security

> This file extends [common/security.md](../common/security.md) with Python specific content.

<!--
【说明】密钥管理：从 .env 文件加载环境变量，如果缺失则抛出 KeyError
-->
## Secret Management

```python
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ["OPENAI_API_KEY"]  # Raises KeyError if missing
```

<!--
【说明】安全扫描：使用 bandit 进行静态安全分析
-->
## Security Scanning

- Use **bandit** for static security analysis:
  ```bash
  bandit -r src/
  ```

<!--
【说明】参考：参见技能 django-security 获取 Django 特定的安全指南（如适用）
-->
## Reference

See skill: `django-security` for Django-specific security guidelines (if applicable).
