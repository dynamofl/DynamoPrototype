#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const EVALUATION_ID_1 = '00000000-0000-0000-0000-000000000001'; // First 400 prompts
const EVALUATION_ID_2 = '00000000-0000-0000-0000-000000000002'; // Remaining prompts
const INPUT_FILE = path.join(__dirname, '../src/data/hallucination_augmented_full.csv');
const OUTPUT_FILE_1 = path.join(__dirname, '../src/data/hallucination_augmented_part1.csv');
const OUTPUT_FILE_2 = path.join(__dirname, '../src/data/hallucination_augmented_part2.csv');
const SPLIT_AT = 400; // First file gets 400 rows, second gets the rest

console.log('Reading input file...');
const inputData = fs.readFileSync(INPUT_FILE, 'utf-8');
const lines = inputData.split('\n').filter(l => l.trim());

const header = lines[0];
const dataRows = lines.slice(1);

console.log(`Total data rows: ${dataRows.length}`);
console.log(`Splitting at: ${SPLIT_AT}`);

// Part 1: First 400 rows
const part1Rows = dataRows.slice(0, SPLIT_AT);
console.log(`\nPart 1: ${part1Rows.length} rows`);

// Update evaluation_id for part 1 rows (already has the correct ID)
const part1Lines = [header, ...part1Rows];
fs.writeFileSync(OUTPUT_FILE_1, part1Lines.join('\n'), 'utf-8');
console.log(`✅ Written to: ${OUTPUT_FILE_1}`);

// Part 2: Remaining rows
const part2Rows = dataRows.slice(SPLIT_AT);
console.log(`\nPart 2: ${part2Rows.length} rows`);

// Update evaluation_id and prompt_index for part 2 rows
const part2UpdatedRows = part2Rows.map((row, index) => {
  // Replace the evaluation_id (first field) and prompt_index (second field)
  const firstComma = row.indexOf(',');
  const secondComma = row.indexOf(',', firstComma + 1);

  // Keep everything after the second comma
  const restOfRow = row.substring(secondComma + 1);

  // Rebuild with new evaluation_id and reset prompt_index to start from 0
  return `${EVALUATION_ID_2},${index},${restOfRow}`;
});

const part2Lines = [header, ...part2UpdatedRows];
fs.writeFileSync(OUTPUT_FILE_2, part2Lines.join('\n'), 'utf-8');
console.log(`✅ Written to: ${OUTPUT_FILE_2}`);

console.log('\n📊 Summary:');
console.log(`Part 1: ${part1Rows.length} rows with evaluation_id: ${EVALUATION_ID_1}`);
console.log(`Part 2: ${part2UpdatedRows.length} rows with evaluation_id: ${EVALUATION_ID_2}`);
console.log(`Total: ${part1Rows.length + part2UpdatedRows.length} rows`);
