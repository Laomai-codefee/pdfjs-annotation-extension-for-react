import React, { useState, useEffect } from 'react'
import { usePdfViewerContext } from '../context/pdf_viewer_context'
import { useTranslation } from 'react-i18next'
import { ToolbarButton } from './toolbar_button'
import { Button, DropdownMenu, Flex } from '@radix-ui/themes'
import { AiOutlineLine, AiOutlinePlus } from 'react-icons/ai'

export const ZoomTool: React.FC = () => {
    const { t } = useTranslation('viewer', { useSuspense: false })
    const ZOOM_CONFIG = {
        MIN_SCALE: 0.1,
        MAX_SCALE: 4,
        ZOOM_STEP: 0.1,
        ZOOM_OPTIONS: [
            { key: 'auto', label: t('viewer:zoom.auto'), value: 'auto' },
            { key: 'page-actual', label: t('viewer:zoom.actual'), value: 'page-actual' },
            { key: 'page-fit', label: t('viewer:zoom.fit'), value: 'page-fit' },
            { key: 'page-width', label: t('viewer:zoom.width'), value: 'page-width' },
            { key: '0.5', label: '50%', value: '0.5' },
            { key: '0.75', label: '75%', value: '0.75' },
            { key: '1', label: '100%', value: '1' },
            { key: '1.25', label: '125%', value: '1.25' },
            { key: '1.5', label: '150%', value: '1.5' },
            { key: '2', label: '200%', value: '2' },
            { key: '3', label: '300%', value: '3' },
            { key: '4', label: '400%', value: '4' }
        ]
    } as const;
    const { pdfViewer } = usePdfViewerContext()
    const [currentScale, setCurrentScale] = useState<string>('auto')

    useEffect(() => {
        if (pdfViewer) {
            const scale = pdfViewer.currentScaleValue || 'auto'
            setCurrentScale(scale)
        }
    }, [pdfViewer])

    const getNumericScale = (scale: string): number | null => {
        if (['auto', 'page-actual', 'page-fit', 'page-width'].includes(scale)) {
            return null
        }
        const num = parseFloat(scale)
        return isNaN(num) ? null : num
    }

    const handleZoomChange = (newScale: string) => {
        setCurrentScale(newScale)
        if (pdfViewer) {
            pdfViewer.currentScaleValue = newScale
        }
    }

    const zoomIn = () => {
        let scale = getNumericScale(currentScale)
        if (scale === null) {
            scale = pdfViewer ? pdfViewer.currentScale : 1
        }
        const newScale = Math.min(scale + ZOOM_CONFIG.ZOOM_STEP, ZOOM_CONFIG.MAX_SCALE)
        const rounded = Math.round(newScale * 100) / 100
        handleZoomChange(rounded.toString())
    }

    const zoomOut = () => {
        let scale = getNumericScale(currentScale)
        if (scale === null) {
            scale = pdfViewer ? pdfViewer.currentScale : 1
        }
        const newScale = Math.max(scale - ZOOM_CONFIG.ZOOM_STEP, ZOOM_CONFIG.MIN_SCALE)
        const rounded = Math.round(newScale * 100) / 100
        handleZoomChange(rounded.toString())
    }

    const isZoomInDisabled = () => {
        const scale = getNumericScale(currentScale) ?? (pdfViewer?.currentScale || 1)
        return scale >= ZOOM_CONFIG.MAX_SCALE
    }

    const isZoomOutDisabled = () => {
        const scale = getNumericScale(currentScale) ?? (pdfViewer?.currentScale || 1)
        return scale <= ZOOM_CONFIG.MIN_SCALE
    }

    const currentScaleLabel = (() => {
        const matchedOption = ZOOM_CONFIG.ZOOM_OPTIONS.find((opt) => opt.value === currentScale)
        if (matchedOption) {
            return matchedOption.label
        }
        const num = parseFloat(currentScale)
        if (!isNaN(num)) {
            return `${Math.round(num * 100)}%`
        }
        return t('viewer:zoom.auto')
    })()

    return (
        <Flex gap="2" align="center">
            <ToolbarButton
                buttonProps={{ 
                    size: '1',
                    disabled: isZoomOutDisabled()
                }}
                icon={<AiOutlineLine />}
                onClick={zoomOut}
            />
            <ToolbarButton
                buttonProps={{ 
                    size: '1',
                    disabled: isZoomInDisabled()
                }}
                icon={<AiOutlinePlus />}
                onClick={zoomIn}
            />
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <Button variant="ghost" size="2" color="gray" style={{ width: 80 }}>
                        {currentScaleLabel}
                        <DropdownMenu.TriggerIcon />
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    {ZOOM_CONFIG.ZOOM_OPTIONS.map((option) => (
                        <DropdownMenu.Item 
                            key={option.key} 
                            onSelect={() => handleZoomChange(option.value)}
                        >
                            {option.label}
                        </DropdownMenu.Item>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </Flex>
    )
}