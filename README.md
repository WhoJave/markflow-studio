# 🚀 MarkFlow Studio

> 现代化、高颜值的 Markdown 与 Mermaid 流程图实时编辑器，支持双栏同步滚动、语法高亮、多种图表渲染、高保真 PDF 导出与 Vercel 一键部署。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/)

---

## ✨ 核心亮点

- ⚡ **实时响应渲染**：即打即显，防抖优化，输入顺滑无卡顿。
- 📊 **Mermaid 全系列图表支持**：
  - 业务流程图 (`flowchart` / `graph`)
  - 系统时序交互图 (`sequenceDiagram`)
  - 项目规划甘特图 (`gantt`)
  - 面向对象类图 (`classDiagram`)
  - 状态机模型 (`stateDiagram`)
  - 数据库 ER 实体关系图 (`erDiagram`)
  - 数据占比饼状图 (`pie`)
  - Git 分支流转演进图 (`gitGraph`)
  - 思维导图 (`mindmap`)
- 🎨 **极客级视觉体验 (Rich Aesthetics)**：
  - 精心调配的深色暗黑毛玻璃风格与清新明亮浅色主题无缝切换
  - 代码块仿 macOS 视窗三色圆点装饰与一键复制代码功能
  - 现代中西文字体排版（Inter、JetBrains Mono / Fira Code、Plus Jakarta Sans）
- 📄 **高保真 PDF 导出与矢量打印**：
  - **客户端直接生成 PDF**：基于 `html2pdf.js`，一键生成 A4 纸张排版 PDF。
  - **原生矢量无损打印**：精心定制的 `@media print` 打印规范，自动防止图表、代码块和表格在跨页时被中途截断。
- 🛠️ **专业级创作与编辑辅助**：
  - 顶部快捷格式化工具栏（标题、加粗、斜体、列表、待办、代码块、表格、Mermaid 快捷插入）
  - 双栏实时同步滚动（可一键切换开启/关闭）
  - 多视图自由切换：仅编辑 / 双栏并排 / 仅预览
  - 左右分屏比例支持自由拖拽调节
  - 实时统计字数、字符数、行数、预估阅读时间
  - 本地草稿自动持久化存储（`LocalStorage`），误关页面防丢失
- ☁️ **Vercel 一键零配置部署**：预置 `vercel.json`，随时上线共享。

---

## 🛠️ 本地开发与运行

确保你的设备已安装 [Node.js](https://nodejs.org/) (>= 18.0.0)。

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd GeminiProj

# 2. 安装项目依赖
npm install

# 3. 启动本地热重载开发服务器
npm run dev
```

启动成功后，在浏览器访问本地地址（默认 `http://localhost:3000`）。

---

## 📦 打包构建

```bash
npm run build
```

打包产物将输出在 `dist/` 目录下。你也可以通过 `npm run preview` 预览构建后的生产环境包。

---

## 🚀 Vercel 一键部署指南

本项目原生支持 Vercel 静态托管与 SPA 渲染：

### 方法 1：通过 GitHub 仓库自动部署（推荐）
1. 在 GitHub 上新建一个仓库并将本项目推送上去：
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. 登录 [Vercel 控制台](https://vercel.com/)，点击 **Add New Project**。
3. 选择刚才推送的 GitHub 仓库，点击 **Import**。
4. Vercel 会自动识别 Vite 配置（构建命令为 `npm run build`，输出目录为 `dist`）。
5. 点击 **Deploy**，大约 30 秒内即可完成全球 CDN 加速部署并生成线上域名！

### 方法 2：使用 Vercel CLI 命令行部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 在项目根目录执行
vercel
```

---

## ⌨️ 常用快捷键

| 快捷键 | 功能 |
| :--- | :--- |
| `Ctrl / Cmd + S` | 保存草稿到本地存储 |
| `Ctrl / Cmd + B` | 粗体文字 |
| `Ctrl / Cmd + I` | 斜体文字 |
| `Ctrl / Cmd + K` | 插入超链接 |
| `Ctrl / Cmd + 1` | 切换为「仅编辑」视图 |
| `Ctrl / Cmd + 2` | 切换为「双栏分屏」视图 |
| `Ctrl / Cmd + 3` | 切换为「仅预览」视图 |
| `Tab` | 编辑器缩进 2 空格 |

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源。
