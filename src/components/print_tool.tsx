import React from 'react'
import { usePdfViewerContext } from '../context/pdf_viewer_context'
import { useTranslation } from 'react-i18next'
import { Button, Tooltip } from '@radix-ui/themes'
import { AiOutlinePrinter } from 'react-icons/ai'
import { usePdfTool } from '@/hooks/usePdfTool'

export const PrintTool: React.FC = () => {
    const { t } = useTranslation('common', { useSuspense: false })

    const { pdfDocument } = usePdfViewerContext()

    const { printClean } = usePdfTool(pdfDocument);

    return (
        <Tooltip content={t('common:print')}>
            <Button
                variant="outline"
                size="2"
                color="gray"
                highContrast
                style={{
                    boxShadow: 'none',
                }}
                onClick={() => printClean()}
            >
                <AiOutlinePrinter style={{ width: 18, height: 18 }} />
            </Button>
        </Tooltip>
    )
}