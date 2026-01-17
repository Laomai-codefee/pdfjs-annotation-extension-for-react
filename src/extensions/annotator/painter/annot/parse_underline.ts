import { AnnotationParser } from './parse'
import { PDFName, PDFNumber, PDFString } from 'pdf-lib'
import { convertKonvaRectToPdfRect, rgbToPdfColor, stringToPDFHexString } from '../../utils/utils'
import { t } from 'i18next'

export class UnderlineParser extends AnnotationParser {
    async parse() {
        const { annotation, page, pdfDoc, pageView } = this
        const context = pdfDoc.context

        const konvaGroup = JSON.parse(annotation.konvaString)
        const rects = konvaGroup.children.filter((item: any) => item.className === 'Rect')

        const quadPoints: number[] = []

        for (const rect of rects) {
            const [x1, y2, x2, y1] = convertKonvaRectToPdfRect(rect.attrs, pageView)
            // QuadPoints: 每个矩形有 4 个点（左上、右上、左下、右下）
            quadPoints.push(
                x1,
                y1, // 左上
                x2,
                y1, // 右上
                x1,
                y2, // 左下
                x2,
                y2 // 右下
            )
        }

        const mainAnn = context.obj({
            Type: PDFName.of('Annot'),
            Subtype: PDFName.of('Underline'),
            Rect: convertKonvaRectToPdfRect(annotation.konvaClientRect, pageView),
            QuadPoints: quadPoints,
            C: rgbToPdfColor(annotation.color || '#000000'),
            T: stringToPDFHexString(annotation.title || t('normal.unknownUser')),
            // 这里如果置空，写入的批注中就不会出现内容，和 highlight 不一致
            Contents: stringToPDFHexString(annotation.contentsObj?.text || ''),
            M: PDFString.of(annotation.date || ''),
            NM: PDFString.of(annotation.id),
            F: PDFNumber.of(4)
        })
        const mainAnnRef = context.register(mainAnn)
        this.addAnnotationToPage(page, mainAnnRef)

        for (const comment of annotation.comments || []) {
            const replyAnn = context.obj({
                Type: PDFName.of('Annot'),
                Subtype: PDFName.of('Text'),
                Rect: convertKonvaRectToPdfRect(annotation.konvaClientRect, pageView),
                Contents: stringToPDFHexString(comment.content),
                T: stringToPDFHexString(comment.title || t('normal.unknownUser')),
                M: PDFString.of(comment.date || ''),
                C: rgbToPdfColor(annotation.color || '#000000'),
                IRT: mainAnnRef,
                RT: PDFName.of('R'),
                NM: PDFString.of(comment.id),
                Open: false
            })
            const replyAnnRef = context.register(replyAnn)
            this.addAnnotationToPage(page, replyAnnRef)
        }
    }
}
