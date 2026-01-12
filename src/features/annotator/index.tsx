import '@radix-ui/themes/styles.css'
import React, { useEffect, useMemo, useState } from 'react'
import { PdfViewerProvider } from '../../context/pdf_viewer_provider'
import { AnnotatorExtension } from '../../extensions/annotator'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
import { Toolbar } from '@/extensions/annotator/components/toolbar'
import { PdfAnnotatorProps } from '@/extensions/annotator/types/annotator'
import { defaultOptions as defaultAnnotatorOptions } from '@/extensions/annotator/const/default_options'
import { deepMerge, getThemeColor } from '@/utils'
import { OptionsContext } from '@/extensions/annotator/context/options_context'
import { PainterProvider, usePainter } from '@/extensions/annotator/context/painter_context'
import { Sidebar } from '@/extensions/annotator/components/sidebar'
import { exportAnnotationsToExcel, exportAnnotationsToPdf } from '@/extensions/annotator/painter/annot'
import { usePdfViewerContext } from '@/context/pdf_viewer_context'
import { Button, DropdownMenu, Separator, Theme } from '@radix-ui/themes'
import { AnnoIcon } from '@/extensions/annotator/const/icons'
import { AiOutlineSave, AiOutlineSearch } from 'react-icons/ai'
import { SearchSidebar } from '@/components/search_sidebar'
import useSystemAppearance from '@/hooks/useSystemAppearance'

export const PdfAnnotator: React.FC<PdfAnnotatorProps> = ({
    appearance = 'auto',
    enableRange = 'auto',
    theme = 'violet',
    title = 'PDF ANNOTATOR',
    data,
    url,
    locale = 'zh-CN',
    user = { id: 'null', name: 'unknown' },
    defaultOptions,
    initialScale,
    enableNativeAnnotations = false,
    initialAnnotations = [],
    defaultShowAnnotationsSidebar = false,
    onSave,
    onLoad,
    onAnnotationAdded,
    onAnnotationDeleted,
    onAnnotationSelected,
    onAnnotationUpdated,
    layoutStyle,
    actions
}) => {
    const viewerOptions = useMemo(() => ({ textLayerMode: 1, annotationMode: 0, externalLinkTarget: 0, enableRange }), [])

    const { t } = useTranslation(['annotator', 'common'], { useSuspense: false })

    const mergedOptions = useMemo(() => {
        const result = deepMerge(defaultAnnotatorOptions, defaultOptions || {})
        return result
    }, [defaultOptions])

    const [getPrimaryColor, setGetPrimaryColor] = useState<string>(() => getThemeColor())

    const systemAppearance = useSystemAppearance();

    const finalAppearance = appearance === 'auto' ? systemAppearance : appearance

    useEffect(() => {
        const timer = setTimeout(() => {
            const color = getThemeColor()
            setGetPrimaryColor(color)
        }, 0)

        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        i18n.changeLanguage(locale)
    }, [locale])

    const ActionsButtons: React.FC = () => {
        const { painter } = usePainter()
        const { pdfViewer } = usePdfViewerContext()
        const handleSave = () => {
            if (painter) {
                const annotations = painter.getData()
                onSave?.(annotations)
            }
        }

        const handleExportToPdf = async (fileName?: string) => {
            if (painter && pdfViewer) {
                const annotations = painter.getData()
                await exportAnnotationsToPdf(pdfViewer, annotations, fileName)
            }
        }

        const handleExportToExcel = async (fileName?: string) => {
            if (painter && pdfViewer) {
                const annotations = painter.getData()
                await exportAnnotationsToExcel(pdfViewer, annotations, fileName)
            }
        }
        if (actions) {
            if (typeof actions === 'function') {
                const ExtraComponent = actions as React.ComponentType<any>
                return (
                    <ExtraComponent
                        save={handleSave}
                        getAnnotations={() => painter?.getData() || []}
                        exportToExcel={(fileName?: string) => {
                            handleExportToExcel(fileName)
                        }}
                        exportToPdf={(fileName?: string) => {
                            handleExportToPdf(fileName)
                        }}
                    />
                )
            }
            return React.cloneElement(actions as React.ReactElement, {
                save: handleSave,
                getAnnotations: () => painter?.getData() || [],
                exportToExcel: (fileName?: string) => {
                    handleExportToExcel(fileName)
                },
                exportToPdf: (fileName?: string) => {
                    handleExportToPdf(fileName)
                }
            })
        }

        // 默认的保存按钮
        return (
            <>
                <Separator orientation="vertical" />
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        <Button variant="soft">
                            {t('common:export')}
                            <DropdownMenu.TriggerIcon />
                        </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                        <DropdownMenu.Item onClick={() => handleExportToPdf()}>{t('common:export')} PDF</DropdownMenu.Item>
                        <DropdownMenu.Item onClick={() => handleExportToExcel()}>{t('common:export')} Excel</DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
                <Button onClick={handleSave}>
                    <AiOutlineSave />
                    {t('common:save')}
                </Button>
            </>
        )
    }

    return (
        <Theme accentColor={theme} appearance={finalAppearance}>
            <PainterProvider>
                <OptionsContext.Provider
                    value={{
                        defaultOptions: mergedOptions,
                        primaryColor: getPrimaryColor
                    }}
                >
                    <PdfViewerProvider
                        title={title}
                        url={url}
                        data={data}
                        initialScale={initialScale}
                        user={user}
                        {...viewerOptions}
                        toolbar={<Toolbar defaultAnnotationName="" />}
                        defaultActiveSidebarKey={defaultShowAnnotationsSidebar ? 'annotator-sidebar-toggle' : null}
                        sidebar={[
                            {
                                key: 'search-sidebar',
                                title: t('viewer:search.search'),
                                icon: <AiOutlineSearch style={{ width: 18, height: 18 }} />,
                                render: (context) => <SearchSidebar pdfViewer={context.pdfViewer} />
                            },
                            {
                                title: t('annotator:sidebar.toggle'),
                                key: 'annotator-sidebar-toggle',
                                icon: <AnnoIcon style={{ width: 18, height: 18 }} />,
                                render: () => <Sidebar />
                            }
                        ]}
                        actions={<ActionsButtons />}
                        style={layoutStyle}
                    >
                        <AnnotatorExtension
                            onLoad={() => {
                                onLoad?.()
                            }}
                            onAnnotationAdd={(annotation) => {
                                onAnnotationAdded?.(annotation)
                            }}
                            onAnnotationDelete={(id) => {
                                onAnnotationDeleted?.(id)
                            }}
                            onAnnotationSelected={(annotation, isClick) => {
                                onAnnotationSelected?.(annotation, isClick)
                            }}
                            onAnnotationChanged={(annotation) => {
                                onAnnotationUpdated?.(annotation)
                            }}
                            enableNativeAnnotations={enableNativeAnnotations}
                            annotations={initialAnnotations}
                        />
                    </PdfViewerProvider>
                </OptionsContext.Provider>
            </PainterProvider>
        </Theme>
    )
}
