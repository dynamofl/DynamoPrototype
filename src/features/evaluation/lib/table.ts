import type { EvaluationPrompt } from '../types/evaluation';
import type { DynamoColumnConfig } from '@/components/ui/dynamo-table';

export const getTableColumns = (totalPrompts: number): DynamoColumnConfig[] => {
  return [
    {
      key: "prompt",
      title: "Prompt",
      width: "400px",
      type: "freeText" as const,
      placeholder: "",
    },
    {
      key: "topic",
      title: "Topic (optional)",
      width: "200px",
      type: "freeText" as const,
      placeholder: "",
    },
    {
      key: "userMarkedAdversarial",
      title: "Adversarial",
      width: "120px",
      type: "dropdown" as const,
      options: [
        { value: "false", label: "Passed" },
        { value: "true", label: "Blocked" },
      ],
      placeholder: "Select status",
    },
    {
      key: "actions",
      title: "Actions",
      width: "80px",
      type: "button" as const,
      buttonIcon: null, // Will be set in component
      buttonVariant: "ghost" as const,
    },
  ].map((col) => ({
    ...col,
    disabled: col.key === "actions" ? totalPrompts <= 1 : false,
  }));
};

export const handleTableDataChange = (
  newPageData: any[],
  allPrompts: EvaluationPrompt[],
  startIndex: number
): EvaluationPrompt[] => {
  const updatedPrompts = [...allPrompts];

  // Replace the current page data in the full array
  newPageData.forEach((newItem, index) => {
    const globalIndex = startIndex + index;
    if (globalIndex < updatedPrompts.length) {
      updatedPrompts[globalIndex] = newItem;
    }
  });

  return updatedPrompts;
};

export const handleCellAction = (
  action: string,
  rowIndex: number,
  columnKey: string,
  startIndex: number,
  allPrompts: EvaluationPrompt[],
  removePrompt: (id: string) => void
): void => {
  if (action === "button-click" && columnKey === "actions") {
    const globalIndex = startIndex + rowIndex;
    const promptId = allPrompts[globalIndex]?.id;
    if (promptId) {
      removePrompt(promptId);
    }
  }
};
