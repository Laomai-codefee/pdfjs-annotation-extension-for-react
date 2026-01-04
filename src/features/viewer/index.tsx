import '@radix-ui/themes/styles.css'

import React, { useEffect, useMemo, useState } from 'react'
import { PdfViewerProvider, SidebarPanel, SidebarPanelKey } from '../../context/pdf_viewer_provider'
import i18n from '@/i18n'
import { PdfBaseProps } from '@/types'
import { ZoomTool } from '@/components/zoom_tool'
import { Flex, Separator, Theme } from '@radix-ui/themes'
import { PdfViewerContextValue, usePdfViewerContext } from '@/context/pdf_viewer_context'
import { ViewerExtension } from '@/extensions/viewer'
import { EventBus, PDFViewer } from 'pdfjs-dist/types/web/pdf_viewer'
import { SearchSidebar } from '@/components/search_sidebar'
import { AiOutlineSearch } from 'react-icons/ai'
import { useTranslation } from 'react-i18next'
import { PrintTool } from '@/components/print_tool'
import useSystemAppearance from '@/hooks/useSystemAppearance'


export interface PdfViewerProps extends PdfBaseProps {
    /**
     * 自定义额外按钮区域组件
     * 可以是一个 React 组件或者 React 元素
     */
    actions?: React.ReactNode | ((context: PdfViewerContextValue) => React.ReactNode)

    /**
     * 自定义侧边栏组件
     */
    sidebar?: SidebarPanel[]

    /**
     * 自定义工具栏组件
     * 可以是一个 React 组件或者 React 元素
     * 默认显示 ZoomTool 组件
     */
    toolbar?: React.ReactNode | ((context: PdfViewerContextValue) => React.ReactNode)

    /**
     * 是否显示文本层（用于选择和搜索文本）
     * @default true
     */
    showTextLayer?: boolean

    /**
     * 是否显示原生批注
     * @default false
     */
    showAnnotations?: boolean

    /**
     * 默认选中的侧边栏项 key
     */
    defaultActiveSidebarKey?: SidebarPanelKey | null

    /**
     * 文档加载完成回调
     * @param pdfViewer
     * @returns
     */
    onDocumentLoaded?: (pdfViewer: PDFViewer | null) => void

    /**
     * PDFjs EventBus 完成回调
     * @param eventBus
     * @returns
     */
    onEventBusReady?: (eventBus: EventBus | null) => void
}

const ActionsRenderer: React.FC<{ actions?: PdfViewerProps['actions'] }> = ({ actions }) => {
    const context = usePdfViewerContext()

    if (!actions) {
        return <>
            <Flex gap="3" align="center">
                <PrintTool />
            </Flex>
        </>
    }

    if (typeof actions === 'function') {
        return actions(context)
    }

    return actions
}

const ToolBarRenderer: React.FC<{ toolbar?: PdfViewerProps['toolbar'] }> = ({ toolbar }) => {
    const context = usePdfViewerContext()

    if (!toolbar) {
        return (
            <Flex gap="3" align="center">
                <ZoomTool />
            </Flex>
        )
    }

    if (typeof toolbar === 'function') {
        return (
            <Flex gap="3" align="center">
                <ZoomTool />
                <Separator orientation="vertical" />
                {toolbar(context)}
            </Flex>
        )
    }

    return toolbar
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
    appearance = 'auto',
    enableRange = 'auto',
    title = 'PDF VIEWER',
    url,
    locale = 'zh-CN',
    initialScale,
    layoutStyle,
    theme = 'violet',
    actions,
    sidebar,
    toolbar,
    showTextLayer = true,
    showAnnotations = false,
    defaultActiveSidebarKey,
    onDocumentLoaded,
    onEventBusReady
}) => {
    const { t } = useTranslation(['viewer'], { useSuspense: false })
    const viewerOptions = useMemo(
        () => ({
            textLayerMode: showTextLayer ? 1 : 0,
            annotationMode: showAnnotations ? 1 : 0,
            externalLinkTarget: 0,
            enableRange
        }),
        [showTextLayer]
    )

    useEffect(() => {
        i18n.changeLanguage(locale)
    }, [locale])

    const systemAppearance = useSystemAppearance();

    const finalAppearance = appearance === 'auto' ? systemAppearance : appearance

    return (
        <Theme accentColor={theme} appearance={finalAppearance}>
            <PdfViewerProvider
                title={title}
                url={url}
                sidebar={[{
                    key: 'search-sidebar',
                    title: t('viewer:search.search'),
                    icon: <AiOutlineSearch style={{ width: 18, height: 18 }} />,
                    render: (context) => <SearchSidebar pdfViewer={context.pdfViewer} />
                }, ...(sidebar || [])]}
                defaultActiveSidebarKey={defaultActiveSidebarKey}
                toolbar={<ToolBarRenderer toolbar={toolbar} />}
                initialScale={initialScale}
                {...viewerOptions}
                style={layoutStyle}
                actions={<ActionsRenderer actions={actions} />}
            >
                <ViewerExtension onEventBusReady={onEventBusReady} onDocumentLoaded={onDocumentLoaded} />
            </PdfViewerProvider>
        </Theme>
    )
}
