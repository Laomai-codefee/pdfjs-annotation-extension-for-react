import React, { useState, useEffect } from 'react';
import { PdfViewer } from '../features/viewer';

const PdfViewerWithData: React.FC = () => {
    const [pdfData, setPdfData] = useState<ArrayBuffer | Uint8Array | null>(null);
    const pdfUrl = './compressed.tracemonkey-pldi-09.pdf';

    useEffect(() => {
        const fetchPdfAsData = async () => {
            try {
                const response = await fetch(pdfUrl);
                const arrayBuffer = await response.arrayBuffer();
                setPdfData(arrayBuffer);
                console.log('PDF data:', arrayBuffer);
            } catch (error) {
                console.error('Failed to fetch PDF:', error);
            }
        };

        fetchPdfAsData();
    }, []);

    if (!pdfData) {
        return <div>Loading PDF...</div>;
    }

    return (
        <PdfViewer
            title="PDF Viewer with Data"
            data={pdfData}
            appearance="light"
            locale="en-US"
            layoutStyle={{ width: '100vw', height: '96vh' }}
        />
    );
}

export default PdfViewerWithData;