import { AnnotationParser } from './parse'
import { PDFName, PDFString, PDFNumber } from 'pdf-lib'
import { convertKonvaRectToPdfRect, rgbToPdfColor, stringToPDFHexString } from '../../utils/utils'
import { t } from 'i18next'

function buildArrowHeadPoints(x1: number, y1: number, x2: number, y2: number, pointerLength = 10, pointerWidth = 10): number[] {
    const dx = x2 - x1
    const dy = y2 - y1
    const len = Math.hypot(dx, dy) || 1

    const ux = dx / len
    const uy = dy / len

    const px = -uy
    const py = ux

    const leftX = x2 - ux * pointerLength + px * (pointerWidth / 2)
    const leftY = y2 - uy * pointerLength + py * (pointerWidth / 2)

    const rightX = x2 - ux * pointerLength - px * (pointerWidth / 2)
    const rightY = y2 - uy * pointerLength - py * (pointerWidth / 2)

    return [x2, y2, leftX, leftY, rightX, rightY, x2, y2]
}

export class LineParser extends AnnotationParser {
    async parse() {
        const { annotation, page, pdfDoc, pageView } = this
        const context = pdfDoc.context
        const pageHeight = page.getHeight()

        const konvaGroup = JSON.parse(annotation.konvaString)

        const lines = konvaGroup.children.filter((item: any) => item.className === 'Arrow')

        const { groupX, groupY, scaleX, scaleY } = this.extractGroupTransform(konvaGroup)

        const viewport = pageView.viewport

        const inkList = context.obj(
            lines.map((line: any) => {
                const points = line.attrs.points as number[]
                const transformedPoints: number[] = []

                // ① 主线
                for (let i = 0; i < points.length; i += 2) {
                    const vx = groupX + points[i] * scaleX
                    const vy = groupY + points[i + 1] * scaleY
                    const viewportX = vx * viewport.scale
                    const viewportY = vy * viewport.scale
                    const [pdfX, pdfY] = viewport.convertToPdfPoint(viewportX, viewportY)
                    transformedPoints.push(pdfX, pdfY)
                }

                // ② 箭头头部（新增）
                if (points.length >= 4) {
                    const len = points.length
                    const x1 = groupX + points[len - 4] * scaleX * viewport.scale
                    const y1 = groupY + points[len - 3] * scaleY * viewport.scale
                    const x2 = groupX + points[len - 2] * scaleX * viewport.scale
                    const y2 = groupY + points[len - 1] * scaleY * viewport.scale

                    const pointerLength = line.attrs.pointerLength ?? 10
                    const pointerWidth = line.attrs.pointerWidth ?? 10

                    const [x1_1, y1_1] = viewport.convertToPdfPoint(x1, y1)
                    const [x2_1, y2_1] = viewport.convertToPdfPoint(x2, y2)

                    const head = buildArrowHeadPoints(x1_1, y1_1, x2_1, y2_1, pointerLength, pointerWidth)

                    transformedPoints.push(...head)
                }

                return context.obj(transformedPoints)
            })
        )

        const firstLine = lines[0]?.attrs || {}
        const strokeWidth = firstLine.strokeWidth ?? 1
        const opacity = firstLine.opacity ?? 1
        const color = firstLine.stroke ?? annotation.color ?? 'rgb(255, 0, 0)'
        const [r, g, b] = rgbToPdfColor(color)

        const bs = context.obj({
            W: PDFNumber.of(strokeWidth),
            S: PDFName.of('S') // Solid border style
        })

        const mainAnn = context.obj({
            Type: PDFName.of('Annot'),
            // 注意：PDF 的 Ink 注解不支持箭头样式，导出后将仅保留线条
            Subtype: PDFName.of('Ink'),
            Rect: convertKonvaRectToPdfRect(annotation.konvaClientRect, pageView),
            InkList: inkList,
            C: context.obj([PDFNumber.of(r), PDFNumber.of(g), PDFNumber.of(b)]),
            T: stringToPDFHexString(annotation.title || t('normal.unknownUser')),
            Contents: stringToPDFHexString(annotation.contentsObj?.text || ''),
            M: PDFString.of(annotation.date || ''),
            NM: PDFString.of(annotation.id),
            LE: [PDFName.of('ClosedArrow'), PDFName.of('None')],
            BS: bs,
            F: PDFNumber.of(4),
            P: page.ref,
            CA: PDFNumber.of(opacity) // Non-stroking opacity (used for drawing)
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
                C: context.obj([PDFNumber.of(r), PDFNumber.of(g), PDFNumber.of(b)]),
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
