<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：Django 安全最佳实践                            ║
║  什么时候用它：设置认证授权、生产安全配置、安全审查、部署时         ║
║  核心能力：CSRF、XSS、SQL注入防护、认证授权、安全头、文件上传      ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: django-security
description: Django security best practices, authentication, authorization, CSRF protection, SQL injection prevention, XSS prevention, and secure deployment configurations.
---

# Django Security Best Practices

Comprehensive security guidelines for Django applications to protect against common vulnerabilities.

<!--
【说明】何时使用此技能：
- 设置 Django 认证和授权系统
- 配置生产环境安全设置
- 进行安全审查
- 部署 Django 应用到生产环境
-->
## When to Activate

- Setting up Django authentication and authorization
- Implementing user permissions and roles
- Configuring production security settings
- Reviewing Django application for security issues
- Deploying Django applications to production

<!--
【说明】生产环境安全配置关键点：
- DEBUG 必须设为 False
- 启用 HTTPS 相关设置（SSL重定向、安全Cookie）
- 配置 HSTS、X-Frame-Options、CSP 等安全头
- 使用环境变量管理 SECRET_KEY
- 配置强密码验证规则
-->
## Core Security Settings

### Production Settings Configuration

```python
# settings/production.py
import os

DEBUG = False  # CRITICAL: Never use True in production

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# Security headers
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# HTTPS and Cookies
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'

# Secret key (must be set via environment variable)
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    raise ImproperlyConfigured('DJANGO_SECRET_KEY environment variable is required')

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 12}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
```

<!--
【说明】认证系统最佳实践：
- 使用自定义用户模型（继承 AbstractUser）
- 使用 email 作为认证字段（更安全）
- 在 settings 中指定 AUTH_USER_MODEL
-->
## Authentication

### Custom User Model

```python
# apps/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Custom user model for better security."""

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)

    USERNAME_FIELD = 'email'  # Use email as username
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'

# settings/base.py
AUTH_USER_MODEL = 'users.User'
```

<!--
【说明】授权系统：
- 创建自定义权限类控制访问
- IsOwnerOrReadOnly：只允许所有者编辑
- IsAdminOrReadOnly：管理员可写，其他只读
-->
## Authorization

### Permissions

```python
# permissions.py
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow only owners to edit objects."""

    def has_object_permission(self, request, view, obj):
        # Read permissions allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions only for owner
        return obj.author == request.user

class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow admins to do anything, others read-only."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff
```

<!--
【说明】SQL 注入防护：
- Django ORM 自动转义参数，是安全的
- 使用 raw() 时必须参数化查询
- 永远不要直接拼接用户输入到 SQL
-->
## SQL Injection Prevention

```python
# GOOD: Django ORM automatically escapes parameters
def get_user(username):
    return User.objects.get(username=username)  # Safe

# GOOD: Using parameters with raw()
def search_users(query):
    return User.objects.raw('SELECT * FROM users WHERE username = %s', [query])

# BAD: Never directly interpolate user input
def get_user_bad(username):
    return User.objects.raw(f'SELECT * FROM users WHERE username = {username}')  # VULNERABLE!
```

<!--
【说明】XSS 防护要点：
- Django 默认自动转义模板变量
- 只对可信内容使用 |safe 过滤器
- 使用 striptags 移除 HTML 标签
-->
## XSS Prevention

### Template Escaping

```django
{# Django auto-escapes variables by default - SAFE #}
{{ user_input }}  {# Escaped HTML #}

{# Explicitly mark safe only for trusted content #}
{{ trusted_html|safe }}  {# Not escaped #}

{# Use template filters for safe HTML #}
{{ user_input|escape }}  {# Same as default #}
{{ user_input|striptags }}  {# Remove all HTML tags #}
```

<!--
【说明】CSRF 防护配置：
- Django 默认启用 CSRF 保护
- 生产环境配置安全 Cookie
- 表单中必须包含 {% csrf_token %}
-->
## CSRF Protection

```python
# settings.py - CSRF is enabled by default
CSRF_COOKIE_SECURE = True  # Only send over HTTPS
CSRF_COOKIE_HTTPONLY = True  # Prevent JavaScript access
CSRF_COOKIE_SAMESITE = 'Lax'  # Prevent CSRF in some cases
CSRF_TRUSTED_ORIGINS = ['https://example.com']  # Trusted domains

# Template usage
```

```django
<form method="post">
    {% csrf_token %}
    {{ form.as_p }}
    <button type="submit">Submit</button>
</form>
```

<!--
【说明】文件上传安全：
- 验证文件扩展名（白名单）
- 限制文件大小
- 不要信任用户上传的文件名
-->
## File Upload Security

```python
import os
from django.core.exceptions import ValidationError

def validate_file_extension(value):
    """Validate file extension."""
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
    if not ext.lower() in valid_extensions:
        raise ValidationError('Unsupported file extension.')

def validate_file_size(value):
    """Validate file size (max 5MB)."""
    filesize = value.size
    if filesize > 5 * 1024 * 1024:
        raise ValidationError('File too large. Max size is 5MB.')

# models.py
class Document(models.Model):
    file = models.FileField(
        upload_to='documents/',
        validators=[validate_file_extension, validate_file_size]
    )
```

<!--
【说明】API 安全配置：
- 配置速率限制防止滥用
- 匿名用户和认证用户设置不同限制
- 特殊操作（如上传）设置更严格限制
-->
## API Security

### Rate Limiting

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
        'upload': '10/hour',
    }
}
```

<!--
【说明】Django 安全检查清单：
- DEBUG = False（生产必须）
- 强制 HTTPS，安全 Cookie
- SECRET_KEY 通过环境变量设置
- CSRF/XSS 防护不要禁用
- SQL 使用 ORM，不拼接字符串
- 文件上传验证类型和大小
- API 端点设置速率限制
- 配置安全头（CSP、HSTS、X-Frame-Options）
-->
## Quick Security Checklist

| Check | Description |
|-------|-------------|
| `DEBUG = False` | Never run with DEBUG in production |
| HTTPS only | Force SSL, secure cookies |
| Strong secrets | Use environment variables for SECRET_KEY |
| CSRF protection | Enabled by default, don't disable |
| XSS prevention | Django auto-escapes, don't use `\|safe` with user input |
| SQL injection | Use ORM, never concatenate strings in queries |
| File uploads | Validate file type and size |
| Rate limiting | Throttle API endpoints |
| Security headers | CSP, X-Frame-Options, HSTS |

**Remember**: Security is a process, not a product. Regularly review and update your security practices.
