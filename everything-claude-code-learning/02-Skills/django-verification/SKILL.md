<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：Django 验证循环                                ║
║  什么时候用它：PR 前、重大变更后、部署前验证                        ║
║  核心能力：环境检查、迁移、测试覆盖、安全扫描、部署就绪检查        ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: django-verification
description: "Verification loop for Django projects: migrations, linting, tests with coverage, security scans, and deployment readiness checks before release or PR."
---

# Django Verification Loop

Run before PRs, after major changes, and pre-deploy to ensure Django application quality and security.

<!--
【说明】何时使用此技能：
- Django 项目开 PR 前
- 重大模型变更、迁移更新或依赖升级后
- 部署到 staging 或生产前的验证
- 运行完整的验证管道
-->
## When to Activate

- Before opening a pull request for a Django project
- After major model changes, migration updates, or dependency upgrades
- Pre-deployment verification for staging or production
- Running full environment → lint → test → security → deploy readiness pipeline

<!--
【说明】阶段1 环境检查：
- 验证 Python 版本
- 确认虚拟环境激活
- 检查必要的环境变量是否设置
-->
## Phase 1: Environment Check

```bash
# Verify Python version
python --version  # Should match project requirements

# Check virtual environment
which python
pip list --outdated

# Verify environment variables
python -c "import os; print('DJANGO_SECRET_KEY set' if os.environ.get('DJANGO_SECRET_KEY') else 'MISSING')"
```

<!--
【说明】阶段2 代码质量检查：
- mypy 类型检查
- ruff 代码检查（可自动修复）
- black 代码格式化
- Django check --deploy 生产部署检查
-->
## Phase 2: Code Quality & Formatting

```bash
# Type checking
mypy . --config-file pyproject.toml

# Linting with ruff
ruff check . --fix

# Formatting with black
black . --check
black .  # Auto-fix

# Django-specific checks
python manage.py check --deploy
```

<!--
【说明】阶段3 迁移检查：
- 检查未应用的迁移
- 检查是否有缺失的迁移
- 应用迁移到测试环境
-->
## Phase 3: Migrations

```bash
# Check for unapplied migrations
python manage.py showmigrations

# Create missing migrations
python manage.py makemigrations --check

# Apply migrations (test environment)
python manage.py migrate
```

<!--
【说明】阶段4 测试和覆盖率：
- 使用 pytest 运行所有测试
- 生成覆盖率报告
- 各组件覆盖率目标：模型90%+、序列化器85%+、视图80%+
-->
## Phase 4: Tests + Coverage

```bash
# Run all tests with pytest
pytest --cov=apps --cov-report=html --cov-report=term-missing --reuse-db

# Run specific app tests
pytest apps/users/tests/

# Coverage report
open htmlcov/index.html
```

### Coverage Targets

| Component | Target |
|-----------|--------|
| Models | 90%+ |
| Serializers | 85%+ |
| Views | 80%+ |
| Overall | 80%+ |

<!--
【说明】阶段5 安全扫描：
- pip-audit 检查依赖漏洞
- safety 检查已知漏洞
- Django check --deploy 生产安全检查
- bandit 安全代码扫描
-->
## Phase 5: Security Scan

```bash
# Dependency vulnerabilities
pip-audit
safety check --full-report

# Django security checks
python manage.py check --deploy

# Bandit security linter
bandit -r . -f json -o bandit-report.json
```

<!--
【说明】阶段6 Django 管理命令：
- check 检查模型问题
- collectstatic 收集静态文件
- 数据库完整性检查
-->
## Phase 6: Django Management Commands

```bash
# Check for model issues
python manage.py check

# Collect static files
python manage.py collectstatic --noinput --clear

# Database integrity
python manage.py check --database default
```

<!--
【说明】阶段9 配置审查：
- 在 Python shell 中验证关键配置
- 检查 DEBUG、SECRET_KEY、ALLOWED_HOSTS、HTTPS 等
-->
## Phase 9: Configuration Review

```python
# Run in Python shell to verify settings
python manage.py shell << EOF
from django.conf import settings

# Critical checks
checks = {
    'DEBUG is False': not settings.DEBUG,
    'SECRET_KEY set': bool(settings.SECRET_KEY and len(settings.SECRET_KEY) > 30),
    'ALLOWED_HOSTS set': len(settings.ALLOWED_HOSTS) > 0,
    'HTTPS enabled': getattr(settings, 'SECURE_SSL_REDIRECT', False),
}

for check, result in checks.items():
    status = '✓' if result else '✗'
    print(f"{status} {check}")
EOF
```

<!--
【说明】验证报告模板示例：
- 分阶段展示检查结果
- 使用 ✓/✗ 标记通过/失败
- 给出修复建议
-->
## Output Template

```
DJANGO VERIFICATION REPORT
==========================

Phase 1: Environment Check
  ✓ Python 3.11.5
  ✓ Virtual environment active
  ✓ All environment variables set

Phase 2: Code Quality
  ✓ mypy: No type errors
  ✗ ruff: 3 issues found (auto-fixed)
  ✓ black: No formatting issues

Phase 3: Migrations
  ✓ No unapplied migrations
  ✓ No migration conflicts

Phase 4: Tests + Coverage
  Tests: 247 passed, 0 failed, 5 skipped
  Coverage: Overall 87%

Phase 5: Security Scan
  ✗ pip-audit: 2 vulnerabilities found (fix required)
  ✓ bandit: No security issues
  ✓ DEBUG = False

RECOMMENDATION: ⚠️ Fix pip-audit vulnerabilities before deploying
```

<!--
【说明】部署前检查清单：
- 所有测试通过
- 覆盖率 >= 80%
- 无安全漏洞
- 迁移已应用
- 生产配置正确
- 数据库备份、日志、HTTPS 已配置
-->
## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Coverage ≥ 80%
- [ ] No security vulnerabilities
- [ ] No unapplied migrations
- [ ] DEBUG = False in production settings
- [ ] SECRET_KEY properly configured
- [ ] ALLOWED_HOSTS set correctly
- [ ] Database backups enabled
- [ ] Static files collected and served
- [ ] Logging configured and working
- [ ] HTTPS/SSL configured

<!--
【说明】CI/CD 集成配置：
- 使用 GitHub Actions 自动化验证
- 包含代码质量检查、安全扫描、测试运行
-->
## Continuous Integration

```yaml
# .github/workflows/django-verification.yml
name: Django Verification

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Code quality checks
        run: |
          ruff check .
          black . --check
          mypy .

      - name: Security scan
        run: |
          bandit -r . -f json -o bandit-report.json
          safety check --full-report

      - name: Run tests
        run: pytest --cov=apps --cov-report=xml
```

<!--
【说明】快速参考命令：
- 环境：python --version
- 类型检查：mypy .
- Lint：ruff check .
- 格式化：black . --check
- 迁移：python manage.py makemigrations --check
- 测试：pytest --cov=apps
- 安全：pip-audit && bandit -r .
- Django 检查：python manage.py check --deploy
-->
## Quick Reference

| Check | Command |
|-------|---------|
| Environment | `python --version` |
| Type checking | `mypy .` |
| Linting | `ruff check .` |
| Formatting | `black . --check` |
| Migrations | `python manage.py makemigrations --check` |
| Tests | `pytest --cov=apps` |
| Security | `pip-audit && bandit -r .` |
| Django check | `python manage.py check --deploy` |

**Remember**: Automated verification catches common issues but doesn't replace manual code review and testing in staging environment.
