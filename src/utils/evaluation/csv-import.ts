import type { EvaluationPrompt } from '@/types/evaluation';

export interface ImportResult {
  filledRows: number;
  newRows: number;
  message: string;
}

export const processCSVImport = (
  rows: any[],
  existingPrompts: EvaluationPrompt[],
  importType: "valid" | "invalid" | "all"
): {
  updatedPrompts: EvaluationPrompt[];
  result: ImportResult;
} => {
  // Find empty rows (rows where prompt is empty)
  const emptyRows = existingPrompts.filter(
    (prompt) =>
      !prompt.prompt.trim() &&
      !prompt.topic.trim() &&
      !prompt.userMarkedAdversarial.trim()
  );

  // Find non-empty rows
  const nonEmptyRows = existingPrompts.filter(
    (prompt) =>
      prompt.prompt.trim() ||
      prompt.topic.trim() ||
      prompt.userMarkedAdversarial.trim()
  );

  // Create updated prompts array
  let updatedPrompts = [...nonEmptyRows];
  let remainingCSVRows = [...rows];

  // Fill empty rows first
  for (
    let i = 0;
    i < emptyRows.length && remainingCSVRows.length > 0;
    i++
  ) {
    const csvRow = remainingCSVRows.shift();
    updatedPrompts.push({
      id: emptyRows[i].id, // Keep the original ID
      prompt: csvRow.prompt || "",
      topic: csvRow.topic || "",
      userMarkedAdversarial: csvRow.userMarkedAdversarial || "",
    });
  }

  // Add remaining CSV rows as new rows
  const newRows = remainingCSVRows.map((csvRow) => ({
    id: crypto.randomUUID(),
    prompt: csvRow.prompt || "",
    topic: csvRow.topic || "",
    userMarkedAdversarial: csvRow.userMarkedAdversarial || "",
  }));

  updatedPrompts.push(...newRows);

  // Calculate results
  const filledRows = Math.min(emptyRows.length, rows.length);
  const addedNewRows = Math.max(0, rows.length - emptyRows.length);

  let message = "";
  if (importType === "valid") {
    message = `Successfully imported ${rows.length} valid rows`;
  } else if (importType === "invalid") {
    message = `Imported ${rows.length} invalid rows for manual correction`;
  } else {
    message = `Imported ${rows.length} rows (includes both valid and invalid)`;
  }

  if (filledRows > 0 && addedNewRows > 0) {
    message += ` - Filled ${filledRows} empty rows and added ${addedNewRows} new rows`;
  } else if (filledRows > 0) {
    message += ` - Filled ${filledRows} empty rows`;
  } else if (addedNewRows > 0) {
    message += ` - Added ${addedNewRows} new rows`;
  }

  return {
    updatedPrompts,
    result: {
      filledRows,
      newRows: addedNewRows,
      message,
    },
  };
};
