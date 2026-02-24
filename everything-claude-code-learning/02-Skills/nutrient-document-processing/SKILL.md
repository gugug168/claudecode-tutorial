---
name: nutrient-document-processing
description: 使用 Nutrient DWS API 处理、转换、OCR、提取、编辑、签名和填写文档。支持 PDF、DOCX、XLSX、PPTX、HTML 和图像。
---

# Nutrient Document Processing
# Nutrient 文档处理

<!--
【教学说明】
这个技能提供了处理各种文档格式的完整工具集。
就像一个"瑞士军刀"——一个工具就能做所有文档相关的事情。

Nutrient DWS API 是一个强大的文档处理服务，可以通过简单的 API 调用完成：
- 转换格式（PDF ↔ Word ↔ Excel）
- OCR（扫描文档转文字）
- 提取文本和表格
- 脱敏敏感信息
- 添加水印
- 数字签名
- 填写 PDF 表单
-->

使用 [Nutrient DWS Processor API](https://www.nutrient.io/api/) 处理文档。转换格式、提取文本和表格、OCR 扫描文档、脱敏 PII、添加水印、数字签名和填写 PDF 表单。

## 设置

<!--
【教学说明】
首先需要获取 API Key——免费版就有足够的配额。
-->

在 **[nutrient.io](https://dashboard.nutrient.io/sign_up/?product=processor)** 获取免费 API Key

```bash
export NUTRIENT_API_KEY="pdf_live_..."
```

**所有请求都发送到** `https://api.nutrient.io/build`，作为 multipart POST，带有 `instructions` JSON 字段。

**什么是 multipart POST？** 一种 HTTP 请求格式，可以同时发送文件和 JSON 数据。

## 操作示例

### 转换文档

<!--
【教学说明】
格式转换是最常见的用例——将 Word 转 PDF，PDF 转 Word 等。
-->

```bash
# DOCX 转 PDF
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "document.docx=@document.docx" \
  -F 'instructions={"parts":[{"file":"document.docx"}]}' \
  -o output.pdf

# PDF 转 DOCX
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "document.pdf=@document.pdf" \
  -F 'instructions={"parts":[{"file":"document.pdf"}],"output":{"type":"docx"}}' \
  -o output.docx

# HTML 转 PDF
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "index.html=@index.html" \
  -F 'instructions={"parts":[{"html":"index.html"}]}' \
  -o output.pdf
```

**支持的输入格式：** PDF, DOCX, XLSX, PPTX, DOC, XLS, PPT, PPS, PPSX, ODT, RTF, HTML, JPG, PNG, TIFF, HEIC, GIF, WebP, SVG, TGA, EPS

**常见转换：**
- DOCX → PDF（生成最终版本）
- PDF → DOCX（编辑现有 PDF）
- HTML → PDF（生成报告）
- 图片 → PDF（扫描件合并）

### 提取文本和数据

<!--
【教学说明】
从 PDF 中提取文本或表格，用于数据分析或索引。
-->

```bash
# 提取纯文本
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "document.pdf=@document.pdf" \
  -F 'instructions={"parts":[{"file":"document.pdf"}],"output":{"type":"text"}}' \
  -o output.txt

# 提取表格为 Excel
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "document.pdf=@document.pdf" \
  -F 'instructions={"parts":[{"file":"document.pdf"}],"output":{"type":"xlsx"}}' \
  -o tables.xlsx
```

**使用场景：**
- 从发票中提取数据
- 分析报告内容
- 索引 PDF 搜索
- 将表格导入数据库

### OCR 扫描文档

<!--
【教学说明】
OCR（光学字符识别）将扫描的图片或 PDF 转换为可搜索的文本。
-->

```bash
# OCR 为可搜索 PDF（支持 100+ 种语言）
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "scanned.pdf=@scanned.pdf" \
  -F 'instructions={"parts":[{"file":"scanned.pdf"}],"actions":[{"type":"ocr","language":"english"}]}' \
  -o searchable.pdf
```

**语言支持：** 100+ 种语言，通过 ISO 639-2 代码（例如 `eng`、`deu`、`fra`、`spa`、`jpn`、`kor`、`chi_sim`、`chi_tra`、`ara`、`hin`、`rus`）。完整语言名如 `english` 或 `german` 也可以。

**常见语言代码：**
- `eng` / `english` - 英语
- `chi_sim` / `chinese_simplified` - 简体中文
- `chi_tra` / `chinese_traditional` - 繁体中文
- `jpn` / `japanese` - 日语
- `kor` / `korean` - 韩语
- `deu` / `german` - 德语
- `fra` / `french` - 法语
- `spa` / `spanish` - 西班牙语

**什么是 OCR？** 光学字符识别——将图片中的文字转换为可编辑的文本。

### 脱敏敏感信息

<!--
【教学说明】
在分享文档前，删除敏感信息（如 SSN、邮箱、信用卡号）。
-->

```bash
# 基于模式（SSN、邮箱）
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "document.pdf=@document.pdf" \
  -F 'instructions={"parts":[{"file":"document.pdf"}],"actions":[{"type":"redaction","strategy":"preset","strategyOptions":{"preset":"social-security-number"}},{"type":"redaction","strategy":"preset","strategyOptions":{"preset":"email-address"}}]}' \
  -o redacted.pdf

# 基于正则表达式
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "document.pdf=@document.pdf" \
  -F 'instructions={"parts":[{"file":"document.pdf"}],"actions":[{"type":"redaction","strategy":"regex","strategyOptions":{"regex":"\\b[A-Z]{2}\\d{6}\\b"}}]}' \
  -o redacted.pdf
```

**预设类型：** `social-security-number`（SSN）、`email-address`（邮箱）、`credit-card-number`（信用卡）、`international-phone-number`（国际电话）、`north-american-phone-number`（北美电话）、`date`（日期）、`time`（时间）、`url`（链接）、`ipv4`、`ipv6`、`mac-address`、`us-zip-code`、`vin`（车辆识别码）

**使用场景：**
- 发布报告前删除个人数据
- 法律文档中的客户信息
- 医疗记录中的患者信息
- 财务报表中的账户号

### 添加水印

<!--
【教学说明】
水印标记文档状态（如草稿、机密）。
-->

```bash
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "document.pdf=@document.pdf" \
  -F 'instructions={"parts":[{"file":"document.pdf"}],"actions":[{"type":"watermark","text":"CONFIDENTIAL","fontSize":72,"opacity":0.3,"rotation":-45}]}' \
  -o watermarked.pdf
```

**可配置选项：**
- `text`：水印文本
- `fontSize`：字体大小
- `opacity`：透明度（0-1）
- `rotation`：旋转角度

**常见水印文本：**
- "CONFIDENTIAL"（机密）
- "DRAFT"（草稿）
- "DO NOT COPY"（请勿复制）
- "SAMPLE"（样品）

### 数字签名

<!--
【教学说明】
数字签名证明文档的真实性和完整性。
-->

```bash
# 自签名 CMS 签名
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "document.pdf=@document.pdf" \
  -F 'instructions={"parts":[{"file":"document.pdf"}],"actions":[{"type":"sign","signatureType":"cms"}]}' \
  -o signed.pdf
```

**什么是数字签名？** 加密签名证明：
- 文档未被修改
- 签名者是真实的
- 签名时间是准确的

**使用场景：**
- 合同签署
- 法律协议
- 财务报告
- 官方文件

### 填写 PDF 表单

<!--
【教学说明】
编程填写 PDF 表单，而不是手动输入。
-->

```bash
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "form.pdf=@form.pdf" \
  -F 'instructions={"parts":[{"file":"form.pdf"}],"actions":[{"type":"fillForm","formFields":{"name":"Jane Smith","email":"jane@example.com","date":"2026-02-06"}}]}' \
  -o filled.pdf
```

**使用场景：**
- 批量生成表单
- 从数据库填写表单
- 自动化文档工作流
- 客户自助服务

## MCP 服务器（替代方案）

<!--
【教学说明】
对于原生工具集成，使用 MCP 服务器而不是 curl。
-->

对于原生工具集成，使用 MCP 服务器：

```json
{
  "mcpServers": {
    "nutrient-dws": {
      "command": "npx",
      "args": ["-y", "@nutrient-sdk/dws-mcp-server"],
      "env": {
        "NUTRIENT_DWS_API_KEY": "YOUR_API_KEY",
        "SANDBOX_PATH": "/path/to/working/directory"
      }
    }
  }
}
```

**什么是 MCP 服务器？** Model Context Protocol 服务器——让 Claude Code 直接调用 Nutrient API，无需 curl。

**优势：**
- 无需手动 curl 命令
- 直接在 Claude Code 中使用
- 自动错误处理
- 文件路径自动解析

## 何时使用

<!--
【教学说明】
这些是 Nutrient 最有用的场景。
-->

- **转换格式**（PDF、DOCX、XLSX、PPTX、HTML、图像之间）
- **从 PDF 提取**文本、表格或键值对
- **扫描文档或图像的 OCR**
- **分享文档前脱敏 PII**
- **为草稿或机密文档添加水印**
- **数字签署合同或协议**
- **编程填写 PDF 表单**

## 实际工作流示例

### 工作流 1：处理扫描发票

```bash
# 1. OCR 扫描的发票
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "invoice.jpg=@invoice.jpg" \
  -F 'instructions={"parts":[{"file":"invoice.jpg"}],"actions":[{"type":"ocr","language":"english"}],"output":{"type":"pdf"}}' \
  -o invoice-searchable.pdf

# 2. 提取文本用于分析
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "invoice-searchable.pdf=@invoice-searchable.pdf" \
  -F 'instructions={"parts":[{"file":"invoice-searchable.pdf"}],"output":{"type":"text"}}' \
  -o invoice.txt

# 3. 提取表格为 Excel
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "invoice-searchable.pdf=@invoice-searchable.pdf" \
  -F 'instructions={"parts":[{"file":"invoice-searchable.pdf"}],"output":{"type":"xlsx"}}' \
  -o invoice-tables.xlsx
```

### 工作流 2：准备法律文档

```bash
# 1. 脱敏敏感信息
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "contract.pdf=@contract.pdf" \
  -F 'instructions={"parts":[{"file":"contract.pdf"}],"actions":[{"type":"redaction","strategy":"preset","strategyOptions":{"preset":"social-security-number"}},{"type":"redaction","strategy":"preset","strategyOptions":{"preset":"email-address"}}]}' \
  -o contract-redacted.pdf

# 2. 添加水印
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "contract-redacted.pdf=@contract-redacted.pdf" \
  -F 'instructions={"parts":[{"file":"contract-redacted.pdf"}],"actions":[{"type":"watermark","text":"CONFIDENTIAL - DRAFT","fontSize":48,"opacity":0.2}]}' \
  -o contract-final.pdf
```

### 工作流 3：批量表单生成

```bash
# 从 JSON 数据批量生成表单
for name in "Alice" "Bob" "Charlie"; do
  curl -X POST https://api.nutrient.io/build \
    -H "Authorization: Bearer $NUTRIENT_API_KEY" \
    -F "form.pdf=@form.pdf" \
    -F "instructions={\"parts\":[{\"file\":\"form.pdf\"}],\"actions\":[{\"type\":\"fillForm\",\"formFields\":{\"name\":\"$name\",\"date\":\"2026-02-16\"}}]}" \
    -o "form-$name.pdf"
done
```

## 链接

- [API Playground](https://dashboard.nutrient.io/processor-api/playground/) ——交互式测试 API
- [完整 API 文档](https://www.nutrient.io/guides/dws-processor/) ——所有选项和参数
- [Agent Skill Repo](https://github.com/PSPDFKit-labs/nutrient-agent-skill) ——示例代码
- [npm MCP Server](https://www.npmjs.com/package/@nutrient-sdk/dws-mcp-server) ——MCP 集成

## 定价

**免费层级：**
- 100 个文档/月
- 适用于测试和小型项目

**付费层级：**
- 从 $49/月起
- 更多文档和高级功能

---

**记住**：Nutrient DWS API 是一个强大的文档处理工具——几乎所有文档操作都可以通过简单的 API 调用完成。
