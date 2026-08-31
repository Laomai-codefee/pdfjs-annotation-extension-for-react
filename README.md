
<p align="center">
  <img src="https://raw.githubusercontent.com/Laomai-codefee/inklayer-react/main/public/logo.svg" alt="InkLayer" width="80" />
</p>

<h1 align="center">InkLayer React</h1>

<p align="center">
  <a href="./README.md">English</a> <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
  <a href="./README-zh-CN.md">简体中文</a>
</p>

<p align="center">
  🖊️ A PDF viewer and annotation SDK for React applications<br/>
  For building document review, collaborative annotation, and commenting workflows
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
  <a href="https://laomai-codefee.github.io/inklayer-react/" target="_blank"><b>🔥 Live Demo</b></a>
  <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
  <a href="https://inklayer.dev/docs/react" target="_blank"><b>📚 Docs</b></a>
  <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
  <a href="https://github.com/Laomai-codefee/inklayer-react" target="_blank"><b>⭐ GitHub</b></a>
</div>

---

<p align="center">
  <img alt="InkLayer React PDF annotation demo — highlight, ink, shapes and comments" 
       width="80%" src="https://github.com/user-attachments/assets/73144a7f-6001-4f23-877a-144ac5231e76" />
</p>

## ⭐ Quick Start (Recommended)

The fastest way to try InkLayer React: use the [official starter 🚀 ](https://github.com/Laomai-codefee/inklayer-react-starter).

```bash
git clone https://github.com/Laomai-codefee/inklayer-react-starter.git
cd inklayer-react-starter
npm install
npm run dev
```

Open:

http://localhost:5173

> 💡 The starter comes with a complete PDF annotation example pre-configured — no extra setup needed to experience the full SDK.

---

## ✨ Features

- 🚀 PDF Viewer (zoom / search / theming)
- 🖍️ PDF Annotation System (highlight / ink / shapes / stamps / signatures)
- 💬 Comment & review workflow
- 🔗 Annotation references and cross-page navigation (`#` references / hover previews / click-to-jump)
- 🔐 Collaborative annotation permissions (ownership / admin overrides / read-only)
- 💾 Annotation data model (persistable)
- 📤 Export support (PDF / Excel)
- 🎨 Customizable UI (toolbar / sidebar)

---

## 📣 Recent updates

### 🔥 1.2.3

- Fixed exports for native `/Line` annotations without `/LE`, with a regression test using the exact 595-byte PDF fixture
- Preserved existing native PDF annotations when `enableNativeAnnotations` is disabled instead of removing them during export
- `exportToPdf` now returns a `Promise`, allowing callers to await completion and handle export failures

### 🔥 1.2.2

- Refined annotation interactions: Sidebar and PDF synchronize on selection only, while Canvas hover keeps author labels without a distracting outline
- Fixed annotation navigation at automatic zoom, clipped Sidebar editors, and menu positioning after user or permission changes
- Improved PDF and Excel numbering: main PDF annotations use `Author · #N`, while Excel uses stable `#N / #N.1` references
- Localized annotation-type filters, preserved filter state, and polished collaborative permission and read-only behavior

### 🔥 1.2.1

- Restore a deleted annotation or reply before the notification disappears
- Fixed annotation selection state and the color picker's back, layout, and timer interactions
- Improved author-label collision handling, drag updates, and hover-preview layering

### 🔥 1.2.0

- Reference other annotations with `#` from comments and replies
- Preview referenced annotations, selected text, authors, pages, and replies on hover
- Jump between sidebar entries and PDF annotations, including across pages
- Improved annotation selection, editor focus, and hover interactions

---

## 📦 Installation

```bash
npm install inklayer-react
```

---

## 🚀 Basic Usage

### PdfAnnotator (annotation)

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

### PdfViewer (viewer)

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

## 📖 API Docs

👉 https://inklayer.dev/docs/react

---

## 🔐 Collaborative Annotation Permissions

`user` is the current application user supplied by the host application. InkLayer uses this identity only to determine annotation and reply ownership; authentication remains the host application's responsibility, and callers do not need to provide a separate `role`. In `owner-only` mode, a current user with a valid `user.id` may create annotations and replies, while only the annotation owner may move, resize, edit, change status, or delete that annotation. A reply can be edited or deleted only by its author.

```tsx
<PdfAnnotator
  user={{ id: currentUser.id, name: currentUser.name }}
  annotationPermissions={{
    mode: 'owner-only',
    // isAdmin is implemented by your application
    can: ({ currentUser }) =>
      isAdmin(currentUser?.id) ? true : undefined
  }}
/>
```

The optional synchronous `can(request)` resolver overrides the mode: return `true` to allow, `false` to deny, or `undefined` to keep the mode's default decision. The request includes `action`, `currentUser`, `annotation`, `comment`, and `defaultAllowed`, so applications can add administrator, workflow-state, or document-level rules.

For a fully read-only annotator, pass `annotationPermissions={{ can: () => false }}`. Users can still select and inspect annotations, while every mutation is denied.

> These are browser interaction permissions for InkLayer UI and local mutations. Your backend API must still authorize every read and write; client-side decisions are not a security boundary.

---

## 🔗 Related Projects

- InkLayer Vue: https://github.com/Laomai-codefee/inklayer-vue
- Vue Starter: https://github.com/Laomai-codefee/inklayer-vue-starter
- React Starter: https://github.com/Laomai-codefee/inklayer-react-starter

---

## 💬 Community & Commercial Support

The core InkLayer SDK is MIT licensed and free to use in personal and commercial projects.

### Community Support

- Questions and feature ideas: [GitHub Discussions](https://github.com/Laomai-codefee/inklayer-react/discussions)
- Bug reports: [GitHub Issues](https://github.com/Laomai-codefee/inklayer-react/issues)
- Documentation: https://inklayer.dev/docs/react

Community support is provided on a best-effort basis as maintainer time allows, without a guaranteed response time.

### Commercial Technical Support

Contact the maintainer if your project needs:

- React or Vue integration and troubleshooting
- Annotation persistence and backend integration
- User, role, and workflow permission integration
- Custom features or support for another framework
- Ongoing maintenance and priority response for a private project

Email: [codefee@foxmail.com](mailto:codefee@foxmail.com?subject=InkLayer%20Project%20Inquiry)

Please include your use case, technology stack, required capabilities, and target timeline.

---

## 🌐 Runtime Environment

InkLayer React is browser-only and does not support server-side rendering (SSR). Its components depend on the DOM, Canvas, and Web Workers, so import and render them only in client-side code.

- Supports React 18 and React 19
- Supports Vite and Webpack 5
- Provides both ESM and CommonJS entry points; ESM is recommended
- In isomorphic frameworks such as Next.js or Remix, keep the components behind a client boundary and disable SSR for them

---

## 📄 License

MIT © InkLayer
