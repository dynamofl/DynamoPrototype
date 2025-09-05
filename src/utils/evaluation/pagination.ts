import type { EvaluationPrompt } from '@/types/evaluation';

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

export interface PaginationResult {
  currentPagePrompts: EvaluationPrompt[];
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

export const getPaginationHelpers = (
  prompts: EvaluationPrompt[],
  paginationState: PaginationState
): PaginationResult => {
  const { currentPage, itemsPerPage } = paginationState;
  const totalPages = Math.ceil(prompts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPagePrompts = prompts.slice(startIndex, endIndex);

  return {
    currentPagePrompts,
    totalPages,
    startIndex,
    endIndex,
  };
};

export const getPageNumbers = (currentPage: number, totalPages: number): number[] => {
  const maxVisiblePages = 5;
  const pageNumbers: number[] = [];

  if (totalPages <= maxVisiblePages) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Show smart pagination with ellipsis
    if (currentPage <= 3) {
      // Near the beginning
      for (let i = 1; i <= 3; i++) {
        pageNumbers.push(i);
      }
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      for (let i = totalPages - 2; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // In the middle
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pageNumbers.push(i);
      }
    }
  }

  return pageNumbers;
};

export const validatePageBounds = (page: number, totalPages: number): number => {
  return Math.max(1, Math.min(page, totalPages));
};
