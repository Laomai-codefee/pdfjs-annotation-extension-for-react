import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { usePdfViewer, type UseViewerOptions } from '../hooks/usePdfViewer'
import { PdfViewerContext, type PdfViewerContextValue } from './pdf_viewer_context'
import 'pdfjs-dist/legacy/web/pdf_viewer.css'
import { UserContext, UserContextValue } from './user_context'
import { PdfScale, User } from '@/types'
import styles from './styles.module.scss'
import { Flex, Box, Tooltip, Button } from '@radix-ui/themes'
import { LoadingIndicator } from '@/components/loading_indicator'
import { ErrorDisplay } from '@/components/error_display'
import { PageIndicator } from '@/components/page_indicator'
import { usePdfTool } from '@/hooks/usePdfTool'

export type SidebarPanelKey = string

export interface SidebarPanel {
    key: string
    title: React.ReactNode
    icon: React.ReactNode
    render: (context: PdfViewerContextValue) => React.ReactNode
}

export interface PdfViewerProviderProps extends Omit<UseViewerOptions, 'eventBus'> {
    children: React.ReactNode
    toolbar?: React.ReactNode
    title?: React.ReactNode
    actions?: React.ReactNode
    sidebar?: SidebarPanel[]
    defaultActiveSidebarKey?: SidebarPanelKey | null
    style?: React.CSSProperties
    initialScale?: PdfScale
    user?: User
}

export const PdfViewerProvider: React.FC<PdfViewerProviderProps> = ({
    children,
    toolbar,
    sidebar,
    defaultActiveSidebarKey,
    title,
    actions,
    style = { width: '100vw', height: '100vh' },
    initialScale = 'auto',
    user,
    ...viewerOptions
}) => {
    const viewerContainerRef = useRef<HTMLDivElement>(null)
    const { loading, progress, pdfDocument, pdfViewer, eventBus, loadError } = usePdfViewer(viewerContainerRef, viewerOptions)

    const [activeSidebarPanel, setActiveSidebarPanel] = useState<SidebarPanelKey | null>(() => {
        if (defaultActiveSidebarKey) return defaultActiveSidebarKey
        return null
    })

    const sidebarCollapsed = activeSidebarPanel === null

    useEffect(() => {
        if (!pdfViewer || !eventBus) return

        const handlePagesLoaded = () => {
            pdfViewer.currentScaleValue = initialScale
        }

        eventBus.on('pagesloaded', handlePagesLoaded)

        return () => {
            eventBus.off('pagesloaded', handlePagesLoaded)
        }
    }, [pdfViewer, eventBus, initialScale])

    const toggleSidebar = useCallback(() => {
        setActiveSidebarPanel((prev) => {
            if (prev) return null
            return sidebar?.[0]?.key ?? null
        })
    }, [sidebar])

    const openSidebar = useCallback((key: string) => {
        setActiveSidebarPanel(key)
    }, [])

    const closeSidebar = useCallback(() => {
        setActiveSidebarPanel(null)
    }, [])

    const isReady = !!(pdfViewer && eventBus && viewerContainerRef.current && !loading)

    const { printClean, downloadClean } = usePdfTool(pdfDocument);

    const contextValue = useMemo<PdfViewerContextValue>(
        () => ({
            pdfDocument,
            pdfViewer,
            eventBus,
            viewerContainerRef,
            isReady,
            activeSidebarPanel,
            toggleSidebar,
            openSidebar,
            closeSidebar,
            isSidebarCollapsed: sidebarCollapsed,
            print: printClean,
            download: downloadClean
        }),
        [
            pdfDocument,
            pdfViewer,
            eventBus,
            loading,
            progress,
            viewerOptions.url,
            viewerOptions,
            isReady,
            toggleSidebar,
            sidebarCollapsed,
            openSidebar,
            closeSidebar,
            activeSidebarPanel,
            printClean,
            downloadClean
        ]
    )

    const userContextValue = useMemo<UserContextValue>(
        () => ({
            user: user || null
        }),
        [user]
    )

    useEffect(() => {
        if (!pdfViewer || !eventBus) {
            return
        }
        const handleResize = () => {
            const currentScaleValue = pdfViewer.currentScaleValue
            if (currentScaleValue === 'auto' || currentScaleValue === 'page-fit' || currentScaleValue === 'page-width') {
                pdfViewer.currentScaleValue = currentScaleValue
            }
            pdfViewer.update()
        }

        window.addEventListener('resize', handleResize)
        handleResize()
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [pdfViewer, eventBus, sidebarCollapsed])

    const sidebarTriggerElement = sidebar && (
        <Flex gap="2">
            {sidebar.map((panel) => (
                <Tooltip key={panel.key} content={panel.title}>
                    <Button
                        variant={activeSidebarPanel === panel.key ? 'soft' : 'outline'}
                        size="2"
                        color="gray"
                        highContrast
                        style={{
                            boxShadow: 'none',
                        }}
                        onClick={() => setActiveSidebarPanel((prev) => (prev === panel.key ? null : panel.key))}
                    >
                        {panel.icon}
                    </Button>
                </Tooltip>
            ))}
        </Flex>
    )

    const activePanel = useMemo(() => {
        if (!sidebar || !activeSidebarPanel) return null
        return sidebar.find((p) => p.key === activeSidebarPanel) || null
    }, [sidebar, activeSidebarPanel])

    useEffect(() => {
        if (!sidebar || !activeSidebarPanel) return

        const exists = sidebar.some((p) => p.key === activeSidebarPanel)
        if (!exists) {
            setActiveSidebarPanel(null)
        }
    }, [sidebar, activeSidebarPanel])

    return (
        <UserContext.Provider value={userContextValue}>
            <PdfViewerContext.Provider value={contextValue}>
                <Flex id="PdfjsExtension" className={styles.PdfjsExtensionViewer} style={style} direction="column" width="100%" position="relative">
                    <LoadingIndicator progress={progress} loading={loading} />
                    {loadError && <ErrorDisplay error={loadError} />}
                    <Flex pl="2" pr="2" className={styles.viewerHeader}>
                        <div className={styles['viewerHeader-title']}>
                            <div className={styles['viewerHeader-title-name']}>{title || 'PDF Viewer'}</div>
                            <div>
                                <Flex direction="row" gap="3" justify="between" align="center">
                                    {sidebarTriggerElement}
                                    {actions}
                                </Flex>
                            </div>
                        </div>
                    </Flex>
                    <Flex flexGrow="1" minHeight="0">
                        <Flex className={styles.viewerContainer} direction="column" flexGrow="1">
                            {toolbar && (
                                <Flex align="center" justify="center" className={styles['viewerContainer-header']}>
                                    {toolbar}
                                </Flex>
                            )}
                            <Box position="relative" flexGrow="1" className={styles['viewerContainer-content']}>
                                <PageIndicator />
                                <div ref={viewerContainerRef} className={styles.pdfjsViewerContainer}>
                                    <div className="pdfViewer"></div>
                                </div>
                            </Box>
                        </Flex>
                        {activePanel && (
                            <Box className={styles.viewerSidebar} pl="1" pr="1">
                                <div className={styles['viewerSidebar-container']}>{activePanel.render(contextValue)}</div>
                            </Box>
                        )}
                    </Flex>
                    {children}
                </Flex>
            </PdfViewerContext.Provider>
        </UserContext.Provider>
    )
}
