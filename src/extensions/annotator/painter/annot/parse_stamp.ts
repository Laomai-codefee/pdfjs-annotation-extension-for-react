import { PDFName, PDFNumber, PDFString, PDFRawStream } from 'pdf-lib'
import { AnnotationParser } from './parse'
import { convertKonvaRectToPdfRect, stringToPDFHexString } from '../../utils/utils'
import { t } from 'i18next'

function getCounterRotateMatrix(rotation: number, w: number, h: number) {
    switch (rotation % 360) {
        case 0:
            return `1 0 0 1 0 0 cm`

        case 90: // 页面逆时针 90° → AP 顺时针 90°
            return `0 1 -1 0 ${h} 0 cm`

        case 180:
            return `-1 0 0 -1 ${w} ${h} cm`

        case 270: // 页面逆时针 270° → AP 逆时针 90°
            return `0 -1 1 0 0 ${w} cm`

        default:
            return `1 0 0 1 0 0 cm`
    }
}

function getAppearanceBBox(rotation: number, w: number, h: number) {
    const r = rotation % 360
    if (r === 90 || r === 270) {
        return [0, 0, h, w] // 交换
    }
    return [0, 0, w, h]
}

export class StampParser extends AnnotationParser {
    async parse() {
        const { annotation, page, pdfDoc, pageView } = this
        const context = pdfDoc.context

        const [x1, y1, x2, y2] = convertKonvaRectToPdfRect(annotation.konvaClientRect, pageView)
        const rectWidth = x2 - x1
        const rectHeight = y2 - y1

        const rect = [PDFNumber.of(x1), PDFNumber.of(y1), PDFNumber.of(x2), PDFNumber.of(y2)]

        const rotation = pageView.pdfPageRotate || 0
        let apDict

        if (annotation.contentsObj?.image) {
            const base64Str = annotation.contentsObj.image.replace(/^data:image\/png;base64,/, '')
            const pngImage = await pdfDoc.embedPng(base64Str)
            const bbox = getAppearanceBBox(rotation, rectWidth, rectHeight)

            // Appearance Stream BBox = Rect 尺寸
            const appearanceDict = context.obj({
                Type: 'XObject',
                Subtype: 'Form',
                BBox: bbox,
                Resources: context.obj({
                    XObject: {
                        Im1: pngImage.ref
                    }
                })
            })

            const contentStream = `q ${getCounterRotateMatrix(rotation, rectWidth, rectHeight)} ${rectWidth} 0 0 ${rectHeight} 0 0 cm /Im1 Do Q`
            const appearanceStream = PDFRawStream.of(appearanceDict, new TextEncoder().encode(contentStream))
            const appearanceStreamRef = context.register(appearanceStream)

            apDict = context.obj({
                N: appearanceStreamRef
            })
        }

        const stampAnnDict: any = {
            Type: PDFName.of('Annot'),
            Subtype: PDFName.of('Stamp'),
            Rect: rect,
            NM: PDFString.of(annotation.id),
            Contents: stringToPDFHexString(annotation.contentsObj?.text || ''),
            T: stringToPDFHexString(annotation.title || t('normal.unknownUser')),
            M: PDFString.of(annotation.date || ''),
            Open: false,
            P: page.ref,
            F: PDFNumber.of(4 | 128)
        }

        if (apDict) stampAnnDict.AP = apDict

        const stampAnn = context.obj(stampAnnDict)
        const stampAnnRef = context.register(stampAnn)
        this.addAnnotationToPage(page, stampAnnRef)

        // 回复评论
        for (const comment of annotation.comments || []) {
            const replyAnn = context.obj({
                Type: PDFName.of('Annot'),
                Subtype: PDFName.of('Text'),
                Rect: rect,
                Contents: stringToPDFHexString(comment.content),
                T: stringToPDFHexString(comment.title || t('normal.unknownUser')),
                M: PDFString.of(comment.date || ''),
                IRT: stampAnnRef,
                RT: PDFName.of('R'),
                NM: PDFString.of(comment.id),
                Open: false
            })
            const replyAnnRef = context.register(replyAnn)
            this.addAnnotationToPage(page, replyAnnRef)
        }
    }
}
