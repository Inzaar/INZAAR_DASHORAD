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
      className={cn("flex w-full justify-center sm:justify-end items-center mt-auto pt-4 pb-2", className)}
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
      className={cn("flex flex-row items-center justify-center sm:justify-end gap-1 sm:gap-1.5 p-0 m-0 list-none", className)}
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
      className={cn("gap-1 px-2 sm:px-2.5 h-8 sm:h-9 hover:bg-transparent text-[#94A3B8] hover:text-gray-700 transition-colors duration-200", className)}
      {...props}>
      <ChevronLeftIcon className="size-4 shrink-0" />
      <span className="hidden sm:inline font-medium text-xs sm:text-sm">{t('previous', 'Previous')}</span>
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
      className={cn("gap-1 px-2 sm:px-2.5 h-8 sm:h-9 hover:bg-transparent text-[#94A3B8] hover:text-gray-700 transition-colors duration-200", className)}
      {...props}>
      <span className="hidden sm:inline font-medium text-xs sm:text-sm">{t('next', 'Next')}</span>
      <ChevronRightIcon className="size-4 shrink-0" />
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
      className={cn("flex size-7 sm:size-8 items-center justify-center text-gray-400", className)}
      {...props}>
      <MoreHorizontalIcon className="size-3.5 sm:size-4" />
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

export function CustomPagination({ currentPage, totalPages, onPageChange, className }) {
  if (!totalPages || totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        startPage = 2;
        endPage = 3;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2;
        endPage = totalPages - 1;
      }

      if (startPage > 2) {
        if (startPage === 3) {
          pages.push(2);
        } else {
          pages.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        if (endPage === totalPages - 2) {
          pages.push(totalPages - 1);
        } else {
          pages.push('...');
        }
      }

      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <Pagination className={cn("w-full flex justify-center sm:justify-end items-center !mt-0 !pt-0 !pb-0", className)}>
      <PaginationContent className="flex flex-row items-center justify-center sm:justify-end gap-1 sm:gap-1.5 p-0 m-0 list-none">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => { e.preventDefault(); if (currentPage > 1) onPageChange(currentPage - 1); }}
            className={currentPage <= 1 ? "opacity-40 pointer-events-none" : "cursor-pointer"}
          />
        </PaginationItem>
        {getPageNumbers().map((p, index) => (
          <PaginationItem key={index}>
            {p === '...' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                isActive={p === currentPage}
                onClick={(e) => { e.preventDefault(); onPageChange(p); }}
                className="font-semibold text-xs sm:text-sm w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center p-0"
              >
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) onPageChange(currentPage + 1); }}
            className={currentPage >= totalPages ? "opacity-40 pointer-events-none" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
