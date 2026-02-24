<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：Django 测试驱动开发                            ║
║  什么时候用它：编写 Django 应用、DRF API、测试模型/视图/序列化器   ║
║  核心能力：pytest-django、factory_boy、mocking、覆盖率、DRF测试   ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: django-tdd
description: Django testing strategies with pytest-django, TDD methodology, factory_boy, mocking, coverage, and testing Django REST Framework APIs.
---

# Django Testing with TDD

Test-driven development for Django applications using pytest, factory_boy, and Django REST Framework.

<!--
【说明】何时使用此技能：
- 编写新的 Django 应用
- 实现 Django REST Framework API
- 测试 Django 模型、视图和序列化器
- 设置 Django 项目测试基础设施
-->
## When to Activate

- Writing new Django applications
- Implementing Django REST Framework APIs
- Testing Django models, views, and serializers
- Setting up testing infrastructure for Django projects

<!--
【说明】TDD 红-绿-重构循环：
- RED：先写失败的测试
- GREEN：编写最少代码使测试通过
- REFACTOR：在保持测试通过的同时改进代码
-->
## TDD Workflow for Django

### Red-Green-Refactor Cycle

```python
# Step 1: RED - Write failing test
def test_user_creation():
    user = User.objects.create_user(email='test@example.com', password='testpass123')
    assert user.email == 'test@example.com'
    assert user.check_password('testpass123')
    assert not user.is_staff

# Step 2: GREEN - Make test pass
# Create User model or factory

# Step 3: REFACTOR - Improve while keeping tests green
```

<!--
【说明】pytest 配置要点：
- 指定 Django 测试设置模块
- 使用 --reuse-db 加速测试
- 使用 --nomigrations 跳过迁移
- 配置覆盖率报告
- 定义测试标记（slow、integration 等）
-->
## Setup

### pytest Configuration

```ini
# pytest.ini
[pytest]
DJANGO_SETTINGS_MODULE = config.settings.test
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    --reuse-db
    --nomigrations
    --cov=apps
    --cov-report=html
    --cov-report=term-missing
    --strict-markers
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
```

<!--
【说明】conftest.py 常用 fixtures：
- user：创建测试用户
- authenticated_client：已登录的客户端
- api_client：DRF API 客户端
- authenticated_api_client：已认证的 API 客户端
-->
### conftest.py

```python
# tests/conftest.py
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def user(db):
    """Create a test user."""
    return User.objects.create_user(
        email='test@example.com',
        password='testpass123',
        username='testuser'
    )

@pytest.fixture
def authenticated_client(client, user):
    """Return authenticated client."""
    client.force_login(user)
    return client

@pytest.fixture
def api_client():
    """Return DRF API client."""
    from rest_framework.test import APIClient
    return APIClient()

@pytest.fixture
def authenticated_api_client(api_client, user):
    """Return authenticated API client."""
    api_client.force_authenticate(user=user)
    return api_client
```

<!--
【说明】Factory Boy 使用要点：
- 使用 Sequence 生成唯一值
- 使用 Faker 生成随机测试数据
- 使用 FuzzyDecimal/FuzzyInteger 生成随机数值
- 使用 SubFactory 创建关联对象
-->
## Factory Boy

### Factory Setup

```python
# tests/factories.py
import factory
from factory import fuzzy
from django.contrib.auth import get_user_model

User = get_user_model()

class UserFactory(factory.django.DjangoModelFactory):
    """Factory for User model."""

    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    username = factory.Sequence(lambda n: f"user{n}")
    password = factory.PostGenerationMethodCall('set_password', 'testpass123')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    is_active = True

class ProductFactory(factory.django.DjangoModelFactory):
    """Factory for Product model."""

    class Meta:
        model = Product

    name = factory.Faker('sentence', nb_words=3)
    slug = factory.LazyAttribute(lambda obj: obj.name.lower().replace(' ', '-'))
    description = factory.Faker('text')
    price = fuzzy.FuzzyDecimal(10.00, 1000.00, 2)
    stock = fuzzy.FuzzyInteger(0, 100)
    is_active = True
    category = factory.SubFactory(CategoryFactory)
```

<!--
【说明】模型测试要点：
- 每个测试类测试一个模型
- 测试创建、验证、约束
- 使用 Factory 创建测试数据
-->
## Model Testing

```python
# tests/test_models.py
import pytest
from django.core.exceptions import ValidationError
from tests.factories import UserFactory, ProductFactory

class TestUserModel:
    """Test User model."""

    def test_create_user(self, db):
        """Test creating a regular user."""
        user = UserFactory(email='test@example.com')
        assert user.email == 'test@example.com'
        assert user.check_password('testpass123')
        assert not user.is_staff

class TestProductModel:
    """Test Product model."""

    def test_product_creation(self, db):
        """Test creating a product."""
        product = ProductFactory()
        assert product.id is not None
        assert product.is_active is True

    def test_product_price_validation(self, db):
        """Test price cannot be negative."""
        product = ProductFactory(price=-10)
        with pytest.raises(ValidationError):
            product.full_clean()
```

<!--
【说明】DRF API 测试：
- 使用 APIClient 发送请求
- 测试认证/未认证场景
- 测试 CRUD 操作和状态码
-->
## DRF API Testing

```python
# tests/test_api.py
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from tests.factories import ProductFactory, UserFactory

class TestProductAPI:
    """Test Product API endpoints."""

    def test_list_products(self, api_client, db):
        """Test listing products."""
        ProductFactory.create_batch(10)

        url = reverse('api:product-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 10

    def test_create_product_unauthorized(self, api_client, db):
        """Test creating product without authentication."""
        url = reverse('api:product-list')
        data = {'name': 'Test Product', 'price': '99.99'}

        response = api_client.post(url, data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_product_authorized(self, authenticated_api_client, db):
        """Test creating product as authenticated user."""
        url = reverse('api:product-list')
        data = {
            'name': 'Test Product',
            'description': 'Test',
            'price': '99.99',
            'stock': 10,
        }

        response = authenticated_api_client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED
```

<!--
【说明】Mock 和 Patch 技巧：
- 使用 @patch 装饰器 mock 外部依赖
- 配置 mock 返回值
- 验证 mock 是否被调用
-->
## Mocking and Patching

```python
# tests/test_views.py
from unittest.mock import patch, Mock
import pytest

class TestPaymentView:
    """Test payment view with mocked payment gateway."""

    @patch('apps.payments.services.stripe')
    def test_successful_payment(self, mock_stripe, client, user, product):
        """Test successful payment with mocked Stripe."""
        # Configure mock
        mock_stripe.Charge.create.return_value = {
            'id': 'ch_123',
            'status': 'succeeded',
            'amount': 9999,
        }

        client.force_login(user)
        response = client.post(reverse('payments:process'), {
            'product_id': product.id,
            'token': 'tok_visa',
        })

        assert response.status_code == 302
        mock_stripe.Charge.create.assert_called_once()
```

<!--
【说明】测试最佳实践：
- 使用工厂模式创建测试数据
- 每个测试一个断言，保持聚焦
- 测试名称要描述场景
- 测试边缘情况（空输入、None、边界值）
- Mock 外部服务，不依赖外部 API
-->
## Testing Best Practices

### DO

- **Use factories**: Instead of manual object creation
- **One assertion per test**: Keep tests focused
- **Descriptive test names**: `test_user_cannot_delete_others_post`
- **Test edge cases**: Empty inputs, None values, boundary conditions
- **Mock external services**: Don't depend on external APIs
- **Use fixtures**: Eliminate duplication

### DON'T

- **Don't test Django internals**: Trust Django to work
- **Don't test third-party code**: Trust libraries to work
- **Don't ignore failing tests**: All tests must pass
- **Don't over-mock**: Mock only external dependencies

<!--
【说明】覆盖率目标：
- 模型：90%+（业务核心）
- 序列化器：85%+（数据验证）
- 视图：80%+（业务逻辑）
- 服务层：90%+（关键逻辑）
- 总体：80%+
-->
## Coverage

### Coverage Goals

| Component | Target Coverage |
|-----------|-----------------|
| Models | 90%+ |
| Serializers | 85%+ |
| Views | 80%+ |
| Services | 90%+ |
| Overall | 80%+ |

<!--
【说明】pytest 常用功能快速参考：
- @pytest.mark.django_db：启用数据库访问
- client：Django 测试客户端
- api_client：DRF API 客户端
- factory.create_batch(n)：批量创建对象
- patch('module.function')：Mock 外部依赖
- force_authenticate()：测试中绕过认证
-->
## Quick Reference

| Pattern | Usage |
|---------|-------|
| `@pytest.mark.django_db` | Enable database access |
| `client` | Django test client |
| `api_client` | DRF API client |
| `factory.create_batch(n)` | Create multiple objects |
| `patch('module.function')` | Mock external dependencies |
| `force_authenticate()` | Bypass authentication in tests |

**Remember**: Tests are documentation. Good tests explain how your code should work. Keep them simple, readable, and maintainable.
