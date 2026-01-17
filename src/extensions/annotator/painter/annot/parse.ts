import { PDFArray, PDFDocument, PDFName, PDFPage, PDFRef } from 'pdf-lib'
import { IAnnotationStore } from '../../const/definitions'
import { PDFPageView } from 'pdfjs-dist/types/web/pdf_page_view'

export abstract class AnnotationParser {
    protected annotation: IAnnotationStore
    protected page: PDFPage
    protected pdfDoc: PDFDocument

    protected pageView: PDFPageView

    constructor(pdfDoc: PDFDocument, page: PDFPage, annotation: IAnnotationStore, pageView: PDFPageView) {
        this.pdfDoc = pdfDoc
        this.page = page
        this.annotation = annotation
        this.pageView = pageView
    }

    protected addAnnotationToPage(page: PDFPage, annotRef: PDFRef) {
        const annots = page.node.lookup(PDFName.of('Annots')) as PDFArray | undefined
        if (annots) {
            annots.push(annotRef)
        } else {
            page.node.set(PDFName.of('Annots'), page.doc.context.obj([annotRef]))
        }
    }

    protected extractGroupTransform(konvaGroup: any): { groupX: number; groupY: number; scaleX: number; scaleY: number } {
        return {
            groupX: konvaGroup.attrs.x || 0,
            groupY: konvaGroup.attrs.y || 0,
            scaleX: konvaGroup.attrs.scaleX || 1,
            scaleY: konvaGroup.attrs.scaleY || 1
        }
    }

    abstract parse(): Promise<void>
}
