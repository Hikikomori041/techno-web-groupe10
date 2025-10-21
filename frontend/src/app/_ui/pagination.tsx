import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {Button} from "@/components/ui/button"

const Pagination = ({
                        currentPage,
                        totalPages,
                        onPageChange,
                        maxVisible = 5
                    }: any) => {
    const getPageNumbers = () => {
        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages = [];
        const halfVisible = Math.floor(maxVisible / 2);

        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, currentPage + halfVisible);

        // Adjust if we're near the start or end
        if (currentPage <= halfVisible) {
            endPage = maxVisible;
        } else if (currentPage >= totalPages - halfVisible) {
            startPage = totalPages - maxVisible + 1;
        }

        // Always show first page
        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) pages.push('ellipsis-start');
        }

        // Show middle pages
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Always show last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push('ellipsis-end');
            pages.push(totalPages);
        }

        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="flex items-center justify-center gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {pages.map((page, idx) => {
                if (typeof page === 'string') {
                    return (
                        <span key={page} className="px-2 text-gray-500">
              ...
            </span>
                    );
                }

                return (
                    <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => onPageChange(page)}
                        className={currentPage === page ? "bg-gray-900 text-white" : ""}
                    >
                        {page}
                    </Button>
                );
            })}

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
};