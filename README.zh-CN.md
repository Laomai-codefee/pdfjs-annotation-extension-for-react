> ⚠️ **InkLayer 生态项目**
>
> 本仓库提供 InkLayer 的 React 绑定及示例集成，用于在前端应用中快速接入 PDF 批注能力。
>
> 👉 **InkLayer 主入口：** https://github.com/Laomai-codefee/inklayer

<div>
    <h1 align="center"><code>pdfjs-annotation-extension-for-react</code> ⚡️ </h1>
    <p align="center">
        <strong>一个基于 PDF.js 构建的轻量级、可扩展的 React PDF 批注器和查看器</strong><br/> 支持编辑现有 PDF 文件批注、发布评论、回复、提交注释数据和加载以进行进一步编辑。
    </p>
</div>

---
[English](./README.md) ｜ 简体中文
---

[![NPM](https://img.shields.io/npm/v/pdfjs-annotation-extension-for-react.svg)](https://www.npmjs.com/package/pdfjs-annotation-extension-for-react)
[![License](https://img.shields.io/npm/l/pdfjs-annotation-extension-for-react)](./LICENSE)

## 在线演示

[![Demo](https://img.shields.io/badge/🔥_Live_Demo-React_PDF_Viewer_Plus-FF6F61?style=for-the-badge&logo=github&logoColor=white)](https://laomai-codefee.github.io/pdfjs-annotation-extension-for-react-demo/)

## ✨ 特性

- ✍️ 丰富的注释系统
  - 高亮、绘图、形状、文本注释
  - 签名（手绘 / 输入 / 上传）
  - 带编辑器支持的印章
  - 直接编辑原生 PDF 注释
- 📄 基于 PDF.js 的高保真 PDF 渲染
- 🎨 基于 Radix UI Themes 的主题系统
- 🌍 国际化（中文简体、英文）
- 🧩 高度可自定义的 UI
  - 工具栏 / 侧边栏 / 操作完全可覆盖
- 🏢 企业友好配置
  - `defaultOptions` 支持深度部分 + 深度合并
- 💾 导出
  - 将注释导出为 PDF
  - 将注释导出为 Excel
- 🧠 为可扩展性而设计
  - 清晰的上下文和扩展架构

## ✍️ 批注工具

1. 矩形
2. 圆形
3. 自由手绘（短时间内绘制的会被分组）
4. 自由高亮（带自动校正）
5. 箭头
6. 云线
7. 自由文本
8. 签名 （上传、手绘、输入、默认签名）
9. 印章（上传自定义图片、自定义印章、 默认印章）
10. 文本高亮
11. 文本删除线
12. 文本下划线
13. 文本

## ✍️ 编辑 PDF 文件中的现有批注

1. 矩形
2. 圆形
3. 绘制
4. 自由文本
5. 线条
6. 多边形
7. 折线
8. 文本
9. 高亮
10. 下划线
11. 删除线

## 📦 安装

```bash
npm install pdfjs-annotation-extension-for-react
or
yarn add pdfjs-annotation-extension-for-react
```

# 🚀 快速开始

## 1. PDF 批注

```jsx
import { PdfAnnotator } from 'pdfjs-annotation-extension-for-react'
import 'pdfjs-annotation-extension-for-react/style'

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

## 2. 基础 PDF 查看器

```jsx
import { PdfViewer } from 'pdfjs-annotation-extension-for-react'
import 'pdfjs-annotation-extension-for-react/style'

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

# 🧩 组件

### 基础属性

| Name                   | Type                    | Default                                 | Description                                            |
| ---------------------- | ----------------------- | --------------------------------------- | ------------------------------------------------------ |
| `appearance`         | `auto \| dark \| light`       | `auto`                       | Dark or Light theme. 
| `theme`              | Radix Theme Color       | `violet`                              | Theme color of the viewer UI                           |
| `title`              | `React.ReactNode`     | —                                      | Page title content; accepts text or custom React nodes |
| `url *`              | `string \| URL`        | —                                      | PDF file URL; supports string URLs or `URL` objects  |
| `locale`             | `'zh-CN' \| 'en-US'`   | `zh-CN`                               | Locale used for internationalization                   |
| `initialScale`       | `PdfScale`            | `auto`                                | Initial zoom level of the PDF viewer                   |
| `layoutStyle`        | `React.CSSProperties` | `{ width: '100vw', height: '100vh' }` | Styles applied to the PDF viewer container             |
| `isSidebarCollapsed` | `boolean`             | `false`                               | Whether the sidebar is collapsed by default            |
| `enableRange`        | `boolean \| 'auto'`    | `auto`                                | Enables HTTP Range (streaming) loading for PDFs        |

## ✍️ PdfAnnotator -  PDF批注器

具有注释功能的高级 PDF 查看器

### 属性

| Name                        | Type                                                                | Default                             | Description                                                          |
| --------------------------- | ------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------- |
| `user`                    | `User`                                                            | `{ id: 'null', name: 'unknown' }` | Current user information<br />used to identify the annotation author |
| `enableNativeAnnotations` | `boolean`                                                         | `false`                           | Native annotations embedded in the PDF file                          |
| `defaultShowAnnotationsSidebar` | `boolean`                                                   | `false`                           | Show Annotations Sidebar                                             |
| `defaultOptions`          | `DeepPartial`                                                     | —                                  | Default configuration for the annotator;                             |
| `initialAnnotations`      | `IAnnotationStore[]`                                              | —                                  | Existing annotations to be rendered during initialization            |
| `actions`                 | `React.ReactNode \| React.ComponentType`                           | —                                  | Custom actions area                                                 |
| `onSave`                  | `(annotations: IAnnotationStore[]) => void`                       | —                                  | Callback triggered when annotations are saved                        |
| `onLoad`                  | `() => void`                                                      | —                                  | Callback triggered when the PDF and annotator are fully loaded       |
| `onAnnotationAdded`       | `(annotation: IAnnotationStore) => void`                          | —                                  | Fired when a new annotation is created                               |
| `onAnnotationDeleted`     | `(id: string) => void`                                            | —                                  | Fired when an annotation is deleted                                  |
| `onAnnotationSelected`    | `(annotation: IAnnotationStore \| null, isClick: boolean) => void` | —                                  | Fired when an annotation is selected or deselected                   |
| `onAnnotationUpdated`     | `(annotation: IAnnotationStore) => void`                          | —                                  | Fired when an existing annotation is modified                        |

### ⚙️ defaultOptions

#### ✅ 深度部分 + 深度合并

`defaultOptions` 不是完整的配置覆盖

- 它被定义为 `DeepPartial<PdfAnnotatorOptions> `
- 它将与系统默认配置进行深度合并

这确保了：
- 您只需覆盖需要的内容
- 系统默认值保持稳定
- 适合长期企业使用

#### 示例

```tsx
import qiantubifengshouxietiFont from './fonts/qiantubifengshouxieti.ttf';

<PdfAnnotator
    url="sample.pdf"
    defaultOptions={{
        colors: ['#000', '#1677ff'],
        signature: {
            colors: ['#000000', '#ff0000', '#1677ff'],
            type: 'Upload',
            maxSize: 1024 * 1024 * 5,
            accept: '.png,.jpg,.jpeg,.bmp',
            defaultSignature: ['data:image/png;base64,...'],
            defaultFont: [
                {
                    label: '楷体',
                    value: 'STKaiti',
                    external: false
                },
                {
                    label: '千图笔锋手写体',
                    value: 'qiantubifengshouxieti',
                    external: true,
                    url: qiantubifengshouxietiFont
                },
                {
                    label: '平方长安体',
                    value: 'PingFangChangAnTi-2',
                    external: true,
                    url: 'http://server/PingFangChangAnTi-2.ttf'
                }
            ]
        },
        stamp: {
            maxSize: 1024 * 1024 * 5,
            accept: '.png,.jpg,.jpeg,.bmp',
            defaultStamp: ['data:image/png;base64,...'],
            editor: {
                defaultBackgroundColor: '#2f9e44',
                defaultBorderColor: '#2b8a3e',
                defaultBorderStyle: 'none',
                defaultTextColor: '#fff',
                defaultFont: [
                    {
                        label: '楷体',
                        value: 'STKaiti'
                    }
                ]
            }
        }
    }}
/>
```

### 🎨 自定义UI

####  Actions

```jsx
<PdfAnnotator
  url={pdfUrl}
  actions={({ save, exportToPdf, exportToExcel }) => (
    <>
      <button onClick={save}>Save</button>
      <button onClick={() => exportToPdf('annotations')}>
        Export PDF
      </button>
      <button onClick={() => exportToExcel('annotations')}>
        Export Excel
      </button>
    </>
  )}
/>
```

### 🖋 签名和印章配置

```jsx
<PdfAnnotator
  url={pdfUrl}
  defaultOptions={{
    signature: {
      defaultSignature: ['data:image/png;base64,...'],
      defaultFont: [
        {
          label: 'Custom Font',
          value: 'MyFont',
          external: true,
          url: '/fonts/myfont.ttf'
        }
      ]
    },
    stamp: {
      defaultStamp: ['data:image/png;base64,...']
    }
  }}
/>
```

## 📄 PdfViewer - PDF 查看器

具有工具栏、侧边栏、操作和可扩展 UI 插槽的轻量级 PDF 查看器。

### Props

| Name                   | Type                                                                      | Default   | Description                                                                                |
| ---------------------- | ------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------ |
| `actions`            | `React.ReactNode \| (context: PdfViewerContextValue) => React.ReactNode` | —        | Custom actions area in the toolbar                                                         |
| `sidebar`            | `SidebarPanel[]` | —        | Custom sidebar component                                                                   |
| `toolbar`            | `React.ReactNode \| (context: PdfViewerContextValue) => React.ReactNode` | —        | Custom toolbar component                                                                   |
| `showTextLayer`      | `boolean`                                                               | `true`  | Whether to render the text layer                                                           |
| `showAnnotations`      | `boolean`                                                               | `false`  | Whether to render the pdf annotations layer                                              |
| `defaultActiveSidebarKey`      | `string`                                                     | null  | Default Active Sidebar Key                                                       |
| `onDocumentLoaded`   | `(pdfViewer: PDFViewer \| null) => void`                                 | —        | Callback invoked when the PDF <br />document is fully loaded and the viewer is initialized |
| `onEventBusReady`    | `(eventBus: EventBus \| null) => void`                                   | —        | Callback invoked when the pdf.js EventBus is ready                                         |

### 🎨 自定义 UI

####  Toolbar

```jsx
<PdfViewer
  url={pdfUrl}
  toolbar={(context) => (
    <>
    <button onClick={() => console.log(context.pdfViewer)}>
        PDF Viewer
    </button>
    <button onClick={context.toggleSidebar}>
        Toggle Sidebar
    </button>
    <button onClick={() => context.setSidebarCollapsed(false)}>
        Open Sidebar
    </button>
    <button onClick={() => context.setSidebarCollapsed(true)}>
        Close Sidebar
    </button>
</>
  )}
/>
```

###  Sidebar

```jsx
<PdfViewer
  url={pdfUrl}
   sidebar={[{
            key: 'sidebar-1',
            title: 'Sidebar 1',
            icon: <BsLayoutTextSidebar />,
            render: (context) => (
                <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
                    Sidebar 1
                    <button onClick={context.toggleSidebar}>
                        toggleSidebar
                    </button>
                    <button onClick={() => console.log(context.pdfViewer)}>
                        Get PDF Viewer
                    </button>
                    <button onClick={() => {
                        context.pdfViewer?.scrollPageIntoView({
                            pageNumber: 1
                        })
                    }}>
                        goto page1
                    </button>
                    <button onClick={() => {
                        context.pdfViewer?.scrollPageIntoView({
                            pageNumber: 10
                        })
                    }}>
                        goto page 10
                    </button>
                </div>
            )
        }]}
/>
```

### Actions

```jsx
<PdfViewer
  url={pdfUrl}
  actions={(context) => (
    <>
        <button onClick={() => console.log(context.pdfViewer)}>
            PDF Viewer
        </button>
        <button onClick={context.toggleSidebar}>
            Toggle Sidebar
        </button>
        <button onClick={() => context.setSidebarCollapsed(false)}>
            Open Sidebar
        </button>
        <button onClick={() => context.setSidebarCollapsed(true)}>
            Close Sidebar
        </button>
    </>
  )}
/>
```

---

# 🌍 浏览器支持

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

# 📄 许可证

MIT
