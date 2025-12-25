import React, { useState, useEffect, useCallback } from 'react';
import { usePdfViewerContext } from '../context/pdf_viewer_context';
import { ToolbarButton } from './toolbar_button';
import { Flex, TextField, Text } from '@radix-ui/themes';
import { AiOutlineUp, AiOutlineDown } from 'react-icons/ai';

export const PageTool: React.FC = () => {
    const { pdfViewer, isReady } = usePdfViewerContext();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [inputPage, setInputPage] = useState<string>('1');
    const [isPageChanging, setIsPageChanging] = useState<boolean>(false);

    const updatePageInfo = useCallback((pageNumber: number) => {
        setCurrentPage(pageNumber);
        setInputPage(pageNumber.toString());
    }, []);

    const isValidPage = useCallback((page: number): boolean => {
        return !isNaN(page) && page >= 1 && page <= totalPages;
    }, [totalPages]);

    const handlePageChange = useCallback((page: number) => {
        if (!pdfViewer || !isValidPage(page)) return;

        setIsPageChanging(true);
        try {
            pdfViewer.currentPageNumber = page;
            setCurrentPage(page);
            setInputPage(page.toString());
        } catch (error) {
            console.error('Error changing page:', error);
        } finally {
            setIsPageChanging(false);
        }
    }, [pdfViewer, isValidPage]);

    const handleInputPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            setInputPage(value);
        }
    };

    const handleGoToPage = useCallback(() => {
        const page = parseInt(inputPage, 10);
        if (isValidPage(page)) {
            handlePageChange(page);
        } else {
            setInputPage(currentPage.toString());
        }
    }, [inputPage, currentPage, handlePageChange, isValidPage]);

    const handlePrevPage = useCallback(() => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    }, [currentPage, handlePageChange]);

    const handleNextPage = useCallback(() => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    }, [currentPage, totalPages, handlePageChange]);

    // 监听页面变化和文档加载事件
    useEffect(() => {
        if (!pdfViewer) return;

        const onPageChange = ({ pageNumber }: { pageNumber: number }) => {
            updatePageInfo(pageNumber);
            setIsPageChanging(false);
        };

        if (isReady) {
            const initialPage = pdfViewer.currentPageNumber || 1;
            const initialTotalPages = pdfViewer.pagesCount || 1;
            setCurrentPage(initialPage);
            setInputPage(initialPage.toString());
            setTotalPages(initialTotalPages);
        }

        pdfViewer.eventBus.on('pagechanging', onPageChange);

        return () => {
            pdfViewer.eventBus.off('pagechanging', onPageChange);
        };
    }, [pdfViewer, isReady, updatePageInfo]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleGoToPage();
        } else if (e.key === 'Escape') {
            setInputPage(currentPage.toString());
        }
    };

    const handleBlur = () => {
        handleGoToPage();
    };

    const isInputValid = inputPage === '' || isValidPage(parseInt(inputPage, 10));

    return (
        <Flex gap="2" align="center">
            <ToolbarButton
                buttonProps={{
                    size: '1',
                    disabled: currentPage <= 1 || isPageChanging
                }}
                icon={<AiOutlineUp />}
                onClick={handlePrevPage}
                title="Previous page"
            />
            <ToolbarButton
                buttonProps={{
                    size: '1',
                    disabled: currentPage >= totalPages || isPageChanging
                }}
                icon={<AiOutlineDown />}
                onClick={handleNextPage}
                title="Next page"
            />
            <Flex align="center" gap="2">
                <TextField.Root
                    size="1"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={inputPage}
                    onChange={handleInputPageChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder="Page"
                    disabled={isPageChanging}
                    style={{
                        width: 50,
                        textAlign: 'center',
                        borderColor: isInputValid ? undefined : 'red'
                    }}
                    aria-label="Enter page number"
                    title={`Enter page number (1-${totalPages})`}
                />
                <Text size="1" color="gray">
                    / {totalPages}
                </Text>
            </Flex>


        </Flex>
    );
};