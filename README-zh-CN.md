
<p align="center">
  <img src="https://raw.githubusercontent.com/Laomai-codefee/inklayer-react/main/public/logo.svg" alt="InkLayer" width="80" />
</p>

<h1 align="center">InkLayer React</h1>

<p align="center">
  <a href="./README.md">English</a> <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
  <a href="./README-zh-CN.md">简体中文</a>
</p>

<p align="center">
  🖊️ 为 React 应用打造的 PDF 查看与批注 SDK<br/>
  用于快速构建文档审阅、协作批注与评论系统
</p>

<div align="center">
  <a href="https://www.npmjs.com/package/inklayer-react" target="_blank">
    <img src="https://img.shields.io/npm/v/inklayer-react.svg" />
  </a>
  <a href="./LICENSE" target="_blank">
    <img src="https://img.shields.io/npm/l/inklayer-react" />
  </a>
</div>

<br/>

<div align="center">
  <a href="https://laomai-codefee.github.io/inklayer-react/" target="_blank"><b>🔥 在线体验</b></a>
  <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
  <a href="https://inklayer.dev/zh-cn/docs/react" target="_blank"><b>📚 文档</b></a>
  <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
  <a href="https://github.com/Laomai-codefee/inklayer-react" target="_blank"><b>⭐ GitHub</b></a>
</div>

---
<p align="center">
  <img alt="InkLayer React PDF annotation demo — highlight, ink, shapes and comments" 
       width="80%" src="https://github.com/user-attachments/assets/73144a7f-6001-4f23-877a-144ac5231e76" />
</p>


## ⭐ 快速开始（推荐）

最快体验 InkLayer React 的方式：直接使用 [官方 Starter 🚀 ](https://github.com/Laomai-codefee/inklayer-react-starter)

```bash
git clone https://github.com/Laomai-codefee/inklayer-react-starter.git
cd inklayer-react-starter
npm install
npm run dev
```

打开：

http://localhost:5173

> 💡 Starter 已内置完整 PDF 批注能力示例，无需额外配置即可体验 SDK 全功能。

---

## ✨ 特性

- 🚀 PDF 查看器（缩放 / 搜索 / 主题）
- 🖍️ PDF 批注系统（高亮 / 笔迹 / 图形 / 印章 / 签名）
- 💬 评论与审阅流程
- 🔗 批注引用与跨页导航（`#` 引用 / 悬停预览 / 点击跳转）
- 🔐 协作批注权限（拥有者规则 / 管理员覆盖 / 整体只读）
- 💾 批注数据模型（可持久化）
- 📤 导出能力（PDF / Excel）
- 🎨 可自定义 UI（工具栏 / 侧边栏）

---

## 📣 最新动态

### 🔥 1.2.3

- 修复原生 `/Line` 批注缺少 `/LE` 时无法导出的问题，并使用精确的 595-byte PDF 样本补充回归测试
- `enableNativeAnnotations` 关闭时保留 PDF 中已有的原生批注，避免导出时意外移除
- `exportToPdf` 现在返回 `Promise`，调用方可以等待导出完成并处理失败

### 🔥 1.2.2

- 优化批注交互：Sidebar 与 PDF 仅在选中时联动，Canvas 悬停保留作者标签并移除干扰边框
- 修复自动缩放下的批注跳转、侧边栏编辑器遮挡，以及切换用户或权限后的菜单定位
- 改进 PDF / Excel 导出编号，主批注使用“作者 · #N”，Excel 使用稳定的 `#N / #N.1`
- 批注类型过滤支持本地化并保留筛选状态，完善协作权限与只读体验

### 🔥 1.2.1

- 删除批注或回复后，可在提示消失前一键恢复
- 修复批注选择状态与颜色选择器的返回、布局及计时交互
- 优化作者标签碰撞、拖拽更新和悬停预览层级

### 🔥 1.2.0

- 在批注内容和回复中使用 `#` 引用其他批注
- 悬停引用，预览目标批注、选中文字、作者、页码和回复
- 点击引用，在侧边栏与 PDF 批注之间快速定位，支持跨页跳转
- 优化批注选择、编辑器焦点和悬停交互

---

## 📦 安装

```bash
npm install inklayer-react
```

---

## 🚀 基础用法

### PdfAnnotator（批注）

```jsx
import { PdfAnnotator } from 'inklayer-react'
import 'inklayer-react/style'

export default function App() {
  return (
    <PdfAnnotator
      title="PDF Annotator"
      url="https://example.com/sample.pdf"
      user={{ id: 'u1', name: 'Alice' }}
      onSave={(annotations) => {
        console.log('Saved annotations:', annotations)
      }}
    />
  )
}
```

---

### PdfViewer（查看器）

```jsx
import { PdfViewer } from 'inklayer-react'
import 'inklayer-react/style'

export default function App() {
  return (
    <PdfViewer
      title="PDF Viewer"
      url="https://example.com/sample.pdf"
      layoutStyle={{ width: '100vw', height: '100vh' }}
    />
  )
}
```

---

## 📖 API 文档

👉 https://inklayer.dev/zh-cn/docs/react

---

## 🔐 协作批注权限

`user` 是调用方传入的当前业务用户。InkLayer 只使用该身份判断批注与回复的归属，不负责用户登录或身份认证，也不要求额外传入 `role`。启用 `owner-only` 后，具有有效 `user.id` 的当前用户可以新建批注和回复，但只有批注拥有者可移动、缩放、编辑、修改状态或删除该批注；回复也只能由其作者编辑或删除。

```tsx
<PdfAnnotator
  user={{ id: currentUser.id, name: currentUser.name }}
  annotationPermissions={{
    mode: 'owner-only',
    // isAdmin 由你的业务系统实现
    can: ({ currentUser }) =>
      isAdmin(currentUser?.id) ? true : undefined
  }}
/>
```

`can(request)` 是可选的同步覆盖函数。返回 `true` 强制允许，`false` 强制拒绝，`undefined` 保留 `mode` 的默认结果。`request` 包含 `action`、`currentUser`、`annotation`、`comment` 和 `defaultAllowed`，因此可以接入应用自己的管理员、审批状态或文档级规则。

如果需要整个批注器只读，传入 `annotationPermissions={{ can: () => false }}`。用户仍可选中和查看批注，但所有写操作都会被禁止。

> 这是浏览器交互权限，用于控制 InkLayer UI 和本地写入。后端 API 仍必须独立验证读写权限，不能把客户端结果当作安全边界。

---

## 🔗 相关项目

- InkLayer Vue：https://github.com/Laomai-codefee/inklayer-vue
- Vue Starter：https://github.com/Laomai-codefee/inklayer-vue-starter
- React Starter：https://github.com/Laomai-codefee/inklayer-react-starter

---

## 💬 社区与商业支持

InkLayer 基础 SDK 采用 MIT 协议，可以免费用于个人和商业项目。

### 社区支持

- 使用交流与功能建议：[GitHub Discussions](https://github.com/Laomai-codefee/inklayer-react/discussions)
- Bug 报告：[GitHub Issues](https://github.com/Laomai-codefee/inklayer-react/issues)
- 项目文档：https://inklayer.dev/zh-cn/docs/react

社区支持按项目维护者的时间尽力提供，不承诺响应时间。

### 商业技术支持

如果你的项目需要以下服务，可以联系项目维护者：

- React / Vue 项目接入与问题排查
- 批注数据持久化和业务系统对接
- 用户、角色及流程权限接入
- 功能定制和其他框架适配
- 私有项目的持续维护与优先响应

邮件：[codefee@foxmail.com](mailto:codefee@foxmail.com?subject=InkLayer%20项目咨询)

来信建议说明项目场景、技术栈、所需功能和计划时间。

---

## 🌐 运行环境

InkLayer React 仅支持浏览器环境，不支持服务端渲染（SSR）。组件依赖 DOM、Canvas 和 Web Worker，请只在客户端代码中导入和渲染。

- 支持 React 18 和 React 19
- 支持 Vite 和 Webpack 5
- 同时提供 ESM 和 CommonJS 入口，推荐优先使用 ESM
- 在 Next.js、Remix 等同构框架中使用时，需要将组件放在客户端边界内，并关闭该组件的 SSR

---

## 📄 License

MIT © InkLayer
