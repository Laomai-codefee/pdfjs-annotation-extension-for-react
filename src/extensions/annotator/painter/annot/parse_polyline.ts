import { AnnotationParser } from './parse'
import { PDFName, PDFString, PDFNumber } from 'pdf-lib'
import { convertKonvaRectToPdfRect, rgbToPdfColor, stringToPDFHexString } from '../../utils/utils'
import { t } from 'i18next'

function quadBezier(p0: number[], p1: number[], p2: number[], segments = 12) {
    const pts: number[] = []
    for (let i = 1; i <= segments; i++) {
        const t = i / segments
        const x = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0]
        const y = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
        pts.push(x, y)
    }
    return pts
}

function cubicBezier(p0: number[], p1: number[], p2: number[], p3: number[], segments = 16) {
    const pts: number[] = []
    for (let i = 1; i <= segments; i++) {
        const t = i / segments
        const x = Math.pow(1 - t, 3) * p0[0] + 3 * Math.pow(1 - t, 2) * t * p1[0] + 3 * (1 - t) * t * t * p2[0] + t * t * t * p3[0]
        const y = Math.pow(1 - t, 3) * p0[1] + 3 * Math.pow(1 - t, 2) * t * p1[1] + 3 * (1 - t) * t * t * p2[1] + t * t * t * p3[1]
        pts.push(x, y)
    }
    return pts
}

function parseSvgPathToPoints(data: string): number[] {
    const commands = data.match(/[a-zA-Z][^a-zA-Z]*/g) || []
    const points: number[] = []

    let current: number[] = [0, 0]

    for (const cmd of commands) {
        const type = cmd[0]
        const nums = cmd
            .slice(1)
            .trim()
            .split(/[\s,]+/)
            .map(parseFloat)

        if (type === 'M') {
            current = [nums[0], nums[1]]
            points.push(...current)
        }

        if (type === 'L') {
            for (let i = 0; i < nums.length; i += 2) {
                current = [nums[i], nums[i + 1]]
                points.push(...current)
            }
        }

        if (type === 'Q') {
            const p0 = current
            const p1 = [nums[0], nums[1]]
            const p2 = [nums[2], nums[3]]
            points.push(...quadBezier(p0, p1, p2))
            current = p2
        }

        if (type === 'C') {
            const p0 = current
            const p1 = [nums[0], nums[1]]
            const p2 = [nums[2], nums[3]]
            const p3 = [nums[4], nums[5]]
            points.push(...cubicBezier(p0, p1, p2, p3))
            current = p3
        }
    }

    return points
}

export class PolylineParser extends AnnotationParser {
    async parse() {
        const { annotation, page, pdfDoc, pageView } = this
        const context = pdfDoc.context

        const konvaGroup = JSON.parse(annotation.konvaString)

        const lines = konvaGroup.children.filter((item: any) => item.className === 'Path')

        const { groupX, groupY, scaleX, scaleY } = this.extractGroupTransform(konvaGroup)

        const viewport = pageView.viewport

        const inkList = context.obj(
            lines.map((line: any) => {
                const points = parseSvgPathToPoints(line.attrs.data) as number[]
                const transformedPoints: number[] = []
                for (let i = 0; i < points.length; i += 2) {
                    const vx = groupX + points[i] * scaleX
                    const vy = groupY + points[i + 1] * scaleY
                    const viewportX = vx * viewport.scale
                    const viewportY = vy * viewport.scale
                    const [pdfX, pdfY] = viewport.convertToPdfPoint(viewportX, viewportY)
                    transformedPoints.push(pdfX, pdfY)
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

        const rect = convertKonvaRectToPdfRect(annotation.konvaClientRect, pageView)

        const mainAnn = context.obj({
            Type: PDFName.of('Annot'),
            Subtype: PDFName.of('Ink'),
            Rect: rect,
            InkList: inkList,
            C: context.obj([PDFNumber.of(r), PDFNumber.of(g), PDFNumber.of(b)]),
            T: stringToPDFHexString(annotation.title || t('normal.unknownUser')),
            Contents: stringToPDFHexString(annotation.contentsObj?.text || ''),
            M: PDFString.of(annotation.date || ''),
            NM: PDFString.of(annotation.id),
            Border: context.obj([0, 0, 0]),
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
                Rect: rect,
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
