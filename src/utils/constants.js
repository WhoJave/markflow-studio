export const MERMAID_SNIPPETS = {
  flowchart: `\`\`\`mermaid
graph TD
    A[用户发起请求] --> B{系统鉴权认证}
    B -- 认证成功 --> C[调用核心业务处理]
    B -- 认证失败 --> D[返回 401 未授权]
    C --> E[更新数据库记录]
    E --> F[发布消息队列通知]
    F --> G[返回 200 OK 响应]
\`\`\``,

  sequence: `\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Client as 客户端
    participant Gateway as API 网关
    participant Auth as 认证服务
    participant Service as 核心业务服务
    participant DB as 数据库

    Client->>Gateway: 发送 API 请求 (携带 Token)
    Gateway->>Auth: 验证 Token 有效性
    Auth-->>Gateway: 验签通过 (UserID: 1001)
    Gateway->>Service: 转发请求 Payload
    Service->>DB: 事务读写操作
    DB-->>Service: 返回操作结果
    Service-->>Gateway: 组装 JSON 响应
    Gateway-->>Client: 200 OK 响应数据
\`\`\``,

  class: `\`\`\`mermaid
classDiagram
    class Document {
        +String title
        +String content
        +Date createdAt
        +exportPdf() Blob
        +renderMarkdown() String
    }
    class MarkdownParser {
        +parse(String raw) String
        +highlightCode()
    }
    class MermaidRenderer {
        +theme: String
        +renderChart(Element el)
    }
    Document --> MarkdownParser : 使用
    MarkdownParser ..> MermaidRenderer : 触发图表渲染
\`\`\``,

  state: `\`\`\`mermaid
stateDiagram-v2
    [*] --> 草稿撰写
    草稿撰写 --> 实时预览 : 编辑输入
    实时预览 --> 渲染中 : 防抖触发
    渲染中 --> 渲染完成 : 解析成功
    渲染中 --> 语法告警 : Mermaid 语法异常
    语法告警 --> 草稿撰写 : 修改语法
    渲染完成 --> PDF导出 : 点击导出
    PDF导出 --> [*] : 下载完毕
\`\`\``,

  er: `\`\`\`mermaid
erDiagram
    USER ||--o{ DOCUMENT : owns
    DOCUMENT ||--|{ CHART : contains
    USER {
        string user_id PK
        string username
        string email
    }
    DOCUMENT {
        string doc_id PK
        string user_id FK
        string title
        text content
        datetime updated_at
    }
    CHART {
        string chart_id PK
        string doc_id FK
        string chart_type
        text raw_code
    }
\`\`\``,

  gantt: `\`\`\`mermaid
gantt
    title 产品迭代排期与发布计划
    dateFormat  YYYY-MM-DD
    section 需求与设计
    需求评审与交互设计      :done,    des1, 2026-09-01, 2026-09-03
    UI 高保真视觉设计       :active,  des2, 2026-09-03, 3d
    section 前端研发
    Markdown 解析与渲染器   :crit, done, dev1, 2026-09-02, 2d
    Mermaid 图表集成        :crit, active, dev2, 2026-09-04, 2d
    PDF 导出与打印样式      :dev3, after dev2, 2d
    section 测试与发布
    功能联调与多端适配      :qa1, after dev3, 2d
    Vercel 自动化一键部署   :milestone, 2026-09-10, 0d
\`\`\``,

  pie: `\`\`\`mermaid
pie title 用户访问端平台占比统计
    "Desktop (macOS)" : 45
    "Desktop (Windows)" : 32
    "Mobile (iOS)" : 15
    "Mobile (Android)" : 8
\`\`\``,

  gitgraph: `\`\`\`mermaid
gitGraph
    commit id: "初始化仓库"
    commit id: "基础框架搭建"
    branch feature/mermaid
    checkout feature/mermaid
    commit id: "集成 Mermaid 渲染器"
    commit id: "支持深浅主题图表联动"
    checkout main
    merge feature/mermaid id: "合并 Mermaid 特性"
    branch feature/pdf-export
    checkout feature/pdf-export
    commit id: "添加 PDF 导出与打印优化"
    checkout main
    merge feature/pdf-export id: "合并 PDF 特性"
    commit id: "发布 v1.0.0" tag: "v1.0.0"
\`\`\``,

  mindmap: `\`\`\`mermaid
mindmap
  root((MarkFlow Studio))
    Markdown 编辑
      GFM 规范
      代码高亮
      快捷工具栏
    Mermaid 渲染
      流程图 / 时序图
      甘特图 / ER图
      自动暗黑主题
    导出分享
      高保真 PDF 导出
      原生矢量打印
      MD / HTML 导出
    部署
      Vercel 一键上线
      零配置静态部署
\`\`\``
};

export const TEMPLATES = {
  welcome: `# 🚀 欢迎使用 MarkFlow Studio

> **MarkFlow Studio** 是一款高颜值、极速、现代化的 Markdown 与 Mermaid 在线创作排版工具，支持实时双栏同步渲染、语法高亮、以及高保真 PDF 导出。

---

## 🌟 核心特性一览

- ⚡ **实时响应渲染**：即打即显，防抖优化，超大文档流畅无卡顿
- 📊 **Mermaid 图表全能支持**：流程图、时序图、甘特图、类图、脑图、Git 分支图等应有尽有
- 🎨 **Rich Aesthetics 现代设计**：毛玻璃质感、深度暗黑/明亮主题自适应、优雅排版
- 📄 **高保真 PDF 导出**：支持一键生成打印级排版 PDF，针对 A4 纸张智能防截断
- 🚀 **Vercel 一键部署**：开箱即用，支持零配置即时部署上线

---

## 🔀 Mermaid 业务流程图示例

\`\`\`mermaid
graph TD
    Start([用户进入编辑器]) --> Input[编辑 Markdown 文本]
    Input --> Branch{包含 Mermaid 代码块?}
    Branch -- 是 --> RenderMermaid[提取图表并调用 Mermaid 引擎]
    Branch -- 否 --> RenderMD[标准 Markdown 语法解析]
    RenderMermaid --> Combine[动态拼装高保真视图]
    RenderMD --> Combine
    Combine --> Ready((实时渲染完成))
    Ready --> Export[一键导出高清晰 PDF / 原生矢量打印]
\`\`\`

---

## ⏱️ 系统时序图 (Sequence Diagram)

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User as 创作者
    participant Editor as 编辑器 (Editor)
    participant Parser as Markdown 引擎
    participant Mermaid as Mermaid 渲染器
    participant PDF as PDF 导出引擎

    User->>Editor: 输入文本与 Mermaid 代码
    Editor->>Parser: 传递 Raw Markdown
    Parser->>Mermaid: 识别并转换流程图
    Mermaid-->>Parser: 返回无损 SVG 矢量图
    Parser-->>User: 毫秒级双栏实时预览
    User->>PDF: 点击「导出 PDF」
    PDF-->>User: 下载高清晰排版 PDF 文件
\`\`\`

---

## 💻 代码高亮演示 (带仿 Mac 视窗与一键复制)

\`\`\`typescript
import mermaid from 'mermaid';
import { marked } from 'marked';

interface RenderOptions {
  theme: 'dark' | 'light';
  enableSyncScroll: boolean;
}

export async function renderDocument(content: string, options: RenderOptions): Promise<string> {
  // 初始化配置
  mermaid.initialize({
    startOnLoad: false,
    theme: options.theme === 'dark' ? 'dark' : 'default',
    fontFamily: 'Inter, sans-serif'
  });

  const html = await marked.parse(content);
  return html;
}
\`\`\`

---

## 📊 数据表格展示

| 功能模块 | 支持状态 | 性能表现 | 说明 |
| :--- | :---: | :---: | :--- |
| **Markdown GFM** | ✅ 完美支持 | < 5ms | 支持表格、删除线、任务列表 |
| **Mermaid 流程图** | ✅ 完整支持 | 毫秒级防抖 | 自动适配当前暗黑/明朗主题 |
| **代码高亮** | ✅ 深度集成 | 高性能缓存 | 基于 Highlight.js 丰富主题 |
| **PDF 导出** | ✅ 双引擎驱动 | 打印级精度 | 客户端直出 + 浏览器矢量打印 |

---

## ✅ 待办事项列表

- [x] 搭建现代化 Vite 工程架构与 Git 工作流
- [x] 深度定制 Glassmorphism 暗色与明朗双主题
- [x] 完善 Mermaid 各种图表语法支持与容错告警
- [x] 优化 PDF 导出与 A4 纸张智能防分页截断
- [x] 配置 Vercel 一键云端部署
`,

  mermaid_gallery: `# 📊 Mermaid 流程图与图表全景画廊

本模版汇集了 Mermaid 最具代表性的各类图表范式，供您快速复制、参考与排版。

---

## 1. 业务流程图 (Flowchart)

\`\`\`mermaid
flowchart LR
    subgraph 用户端
        A[Web 浏览器]
        B[移动 App]
    end
    subgraph 接入层
        LB{负载均衡网关}
    end
    subgraph 微服务集群
        S1[用户微服务]
        S2[订单微服务]
        S3[支付服务]
    end
    A --> LB
    B --> LB
    LB --> S1
    LB --> S2
    LB --> S3
\`\`\`

---

## 2. 系统时序交互图 (Sequence Diagram)

\`\`\`mermaid
sequenceDiagram
    autonumber
    Client->>Server: POST /api/v1/checkout (创建订单)
    Server->>Payment: 请求第三方支付网关
    Payment-->>Server: 返回预支付凭证
    Server-->>Client: 吊起支付收银台
    Client->>Payment: 授权并完成扣款
    Payment-->>Server: Webhook 支付成功异步通知
    Server->>Client: WebSocket 推送「支付成功」
\`\`\`

---

## 3. 甘特图排期 (Gantt)

\`\`\`mermaid
gantt
    title 系统重构与性能调优计划
    dateFormat  YYYY-MM-DD
    section 调研阶段
    性能瓶颈定位分析      :done,    des1, 2026-09-01, 2026-09-03
    方案评审与立项        :done,    des2, 2026-09-04, 1d
    section 研发攻坚
    服务端缓存改造        :active,  dev1, 2026-09-05, 3d
    前端资源静态化CDN加速 :active,  dev2, 2026-09-06, 2d
    数据库索引与读写分离  :crit,    dev3, after dev1, 3d
    section 压测验收
    全链路全场景压力测试  :qa1, after dev3, 2d
    灰度全量上线发布      :milestone, 2026-09-14, 0d
\`\`\`

---

## 4. 实体关系图 (Entity Relationship)

\`\`\`mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    CUSTOMER }|..|{ DELIVERY_ADDRESS : uses
    CUSTOMER {
        string customer_id PK
        string full_name
        string phone
    }
    ORDER {
        int order_number PK
        datetime created_at
        string status
    }
    LINE_ITEM {
        string product_id PK
        int quantity
        float price
    }
\`\`\`

---

## 5. 饼状分布图 (Pie Chart)

\`\`\`mermaid
pie title 生产环境微服务资源消耗占比
    "Order Service" : 38
    "Search Service" : 24
    "Payment Gateway" : 18
    "Notification Center" : 12
    "Other Utilities" : 8
\`\`\`

---

## 6. Git 分支演进图 (GitGraph)

\`\`\`mermaid
gitGraph
    commit
    commit
    branch feature/dark-mode
    checkout feature/dark-mode
    commit
    commit
    checkout main
    merge feature/dark-mode
    branch hotfix/print-layout
    checkout hotfix/print-layout
    commit
    checkout main
    merge hotfix/print-layout
    commit tag: "v1.1.0"
\`\`\`
`,

  tech_spec: `# 📐 架构设计方案与技术规格书 (RFC)

**文档编号**：RFC-2026-0905  
**状态**：APPROVED  
**负责人**：系统架构组  
**日期**：2026-09-05  

---

## 1. 方案背景与目标

当前业务面临高并发图表渲染与排版打印需求，客户端需要直接在本地浏览器完成 Markdown 与复杂的无损流程图渲染，并导出为高保真 PDF，要求：
1. **零服务端依赖**：所有 Markdown 与 Mermaid 的解析完全在客户端浏览器执行。
2. **极速响应**：防抖调度，DOM 动态差异化更新，保障输入流畅度。
3. **打印无断裂**：PDF 导出时保证每张图表与代码块不在页面交界处截断。

---

## 2. 总体系统架构

\`\`\`mermaid
graph TB
    subgraph 浏览器客户端
        UI[用户交互界面]
        Sync[双向滚动同步控制器]
        subgraph 解析流水线
            MParser[Marked Markdown 解析器]
            HL[Highlight.js 语法分析器]
            MMD[Mermaid 矢量图生成器]
        end
        subgraph 导出引擎
            H2P[html2pdf.js 客户端驱动]
            Print[原生系统矢量打印引擎]
        end
    end
    UI --> MParser
    MParser --> HL
    MParser --> MMD
    HL --> UI
    MMD --> UI
    UI <--> Sync
    UI --> H2P
    UI --> Print
\`\`\`

---

## 3. 核心流转时序

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Dev as 工程师
    participant UI as 编辑窗口
    participant Core as 调度控制器
    participant Cache as 本地 LocalStorage

    Dev->>UI: 键盘输入 Markdown 内容
    UI->>Core: 派发 input 事件
    Core->>Core: 启动 300ms 防抖定时器
    Core->>Cache: 自动异步备份草稿 (AutoSave)
    Core->>UI: 触发无闪烁 DOM 刷新
    Core->>UI: 更新字数、行数与状态指示灯
\`\`\`

---

## 4. 部署与交付规范

本项目配置标准 \`vercel.json\`，通过以下方式即可实现持续集成与自动部署：
1. 推送代码至 GitHub/GitLab 仓库。
2. 在 Vercel 控制台点击 **Import Project**。
3. 构建命令设为 \`npm run build\`，输出目录为 \`dist\`，实现 0 秒自动化灰度发布。
`,

  api_docs: `# ⚡ MarkFlow RESTful API 接口规范说明书

---

## 1. 认证鉴权流程

所有客户端请求均需在 HTTP Header 中携带 Bearer 格式的 JWT Access Token：
\`\`\`http
Authorization: Bearer <your_jwt_token_here>
\`\`\`

\`\`\`mermaid
sequenceDiagram
    autonumber
    Client->>AuthService: POST /auth/login (账号/密码)
    AuthService-->>Client: 返回 AccessToken (有效期 2h)
    Client->>ResourceService: GET /api/v1/documents (携带 Token)
    ResourceService-->>Client: 200 OK 业务数据
\`\`\`

---

## 2. 文档资源接口

### 2.1 获取文档详情
- **请求方式**：\`GET\`
- **路径**：\`/api/v1/documents/{documentId}\`
- **响应格式**：\`application/json\`

#### 响应示例：
\`\`\`json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "doc_8f9a2b",
    "title": "项目架构说明书",
    "content": "# Markdown 正文...",
    "updatedAt": "2026-09-05T12:00:00Z"
  }
}
\`\`\`

---

## 3. 错误码定义

| 错误码 (Code) | HTTP 状态码 | 含义说明 | 处置建议 |
| :--- | :---: | :--- | :--- |
| **0** | 200 | 请求成功 | 正常处理业务数据 |
| **40001** | 400 | 参数校验失败 | 检查请求 Body 或 Query 参数 |
| **40101** | 401 | Token 无效或已过期 | 触发刷新 Token 或重定向至登录页 |
| **40401** | 404 | 请求的文档资源不存在 | 确认文档 ID 是否已被删除 |
`
};
