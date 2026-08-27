import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

function Pagination({
  className,
  totalPages,
  ...props
}) {
  if (totalPages !== undefined && totalPages <= 1) return null;
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-end mt-auto pt-6 pb-2", className)}
      {...props} />
  );
}

function PaginationContent({
  className,
  ...props
}) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props} />
  );
}

function PaginationItem({
  ...props
}) {
  return <li data-slot="pagination-item" {...props} />;
}

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: "ghost",
          size,
        }),
        isActive 
          ? "bg-gradient-to-r from-[#5D6AF7] to-[#A15DF6] text-white shadow-[0_4px_10px_rgba(93,106,247,0.3)] hover:text-white"
          : "hover:bg-gray-100 text-gray-500",
        "border-none cursor-pointer rounded-[8px]",
        className
      )}
      {...props} />
  );
}

function PaginationPrevious({
  className,
  ...props
}) {
  const { t } = useTranslation();
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1.5 px-3 hover:bg-transparent text-[#94A3B8] transition-colors duration-200", className)}
      {...props}>
      <ChevronLeftIcon className="size-4" />
      <span className="hidden sm:inline font-medium">{t('previous', 'Previous')}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}) {
  const { t } = useTranslation();
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1.5 px-3 hover:bg-transparent text-[#94A3B8] transition-colors duration-200", className)}
      {...props}>
      <span className="hidden sm:inline font-medium">{t('next', 'Next')}</span>
      <ChevronRightIcon className="size-4" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}>
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}

export function CustomPagination({ currentPage, totalPages, onPageChange }) {
    if (!totalPages || totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); if (currentPage > 1) onPageChange(currentPage - 1); }}
                        className={currentPage <= 1 ? "opacity-50 pointer-events-none" : ""}
                    />
                </PaginationItem>
                {getPageNumbers().map(p => (
                    <PaginationItem key={p}>
                        <PaginationLink 
                            href="#"
                            isActive={p === currentPage}
                            onClick={(e) => { e.preventDefault(); onPageChange(p); }}
                            className="font-semibold w-9 h-9"
                        >
                            {p}
                        </PaginationLink>
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) onPageChange(currentPage + 1); }}
                        className={currentPage >= totalPages ? "opacity-50 pointer-events-none" : ""}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
