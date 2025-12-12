#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const EVALUATION_ID = '00000000-0000-0000-0000-000000000001'; // Mock evaluation ID
const INPUT_FILE = path.join(__dirname, '../src/data/hallucination_prediction_sample.csv');
const OUTPUT_FILE = path.join(__dirname, '../src/data/hallucination_augmented_full.csv');

// Helper function to escape CSV fields
function escapeCSV(field) {
  if (field === null || field === undefined) return '';
  let str = String(field);

  // Replace literal newlines with space to avoid multi-line CSV fields
  str = str.replace(/\r?\n/g, ' ');
  // Replace multiple spaces with single space
  str = str.replace(/\s+/g, ' ');
  // Trim whitespace
  str = str.trim();

  // If field contains comma or quote, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// Extract topic from prompt (first 2-3 words)
function extractTopic(prompt) {
  const words = prompt.split(' ').filter(w => w.length > 3);
  return words.slice(0, 2).join(' ');
}

// Generate prompt title (first 5-7 words)
function generateTitle(prompt) {
  const words = prompt.split(' ');
  return words.slice(0, Math.min(5, words.length)).join(' ');
}

// Read input CSV
console.log('Reading input file...');
const inputData = fs.readFileSync(INPUT_FILE, 'utf-8');

// Proper CSV parser that handles multi-line quoted fields
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      currentRow.push(currentField);
      currentField = '';
    } else if (char === '\n' && !inQuotes) {
      // End of row
      currentRow.push(currentField);
      if (currentRow.some(field => field.trim() !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      // Regular character (including newlines inside quotes)
      currentField += char;
    }
  }

  // Add last field and row if exists
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(field => field.trim() !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

const rows = parseCSV(inputData);
const header = rows[0];
const dataRows = rows.slice(1);

// Find column indexes
const promptIdx = header.indexOf('prompt');
const contextIdx = header.indexOf('context');
const responseIdx = header.indexOf('response');
const predLabelIdx = header.indexOf('pred_label');
const violatedCategoriesIdx = header.indexOf('violated_categories');
const safetyScoreIdx = header.indexOf('safety_score');

console.log(`Found ${dataRows.length} data rows`);

// New CSV header
const newHeader = [
  'evaluation_id',
  'prompt_index',
  'policy_id',
  'policy_name',
  'topic',
  'prompt_title',
  'base_prompt',
  'context',
  'response',
  'pred_label',
  'violated_category',
  'safety_score',
  'behavior_type',
  'status'
].join(',');

// Transform data
const outputLines = [newHeader];

for (let i = 0; i < dataRows.length; i++) {
  const row = dataRows[i];

  // Extract original fields
  const prompt = row[promptIdx] || '';
  const context = row[contextIdx] || '';
  const response = row[responseIdx] || '';
  const predLabel = row[predLabelIdx] || 'safe';
  const violatedCategory = row[violatedCategoriesIdx] || 'N/A';
  const safetyScore = row[safetyScoreIdx] || '0.5';

  // Skip if no prompt
  if (!prompt.trim()) continue;

  // Generate augmented fields
  const promptIndex = i; // 0-indexed
  const policyId = 'policy_001';
  const policyName = 'Content Accuracy Policy';
  const topic = extractTopic(prompt);
  const promptTitle = generateTitle(prompt);
  const behaviorType = 'Allowed';
  const status = 'completed';

  // Create output row
  const outputRow = [
    escapeCSV(EVALUATION_ID),
    escapeCSV(promptIndex),
    escapeCSV(policyId),
    escapeCSV(policyName),
    escapeCSV(topic),
    escapeCSV(promptTitle),
    escapeCSV(prompt),
    escapeCSV(context),
    escapeCSV(response),
    escapeCSV(predLabel),
    escapeCSV(violatedCategory),
    escapeCSV(safetyScore),
    escapeCSV(behaviorType),
    escapeCSV(status)
  ].join(',');

  outputLines.push(outputRow);
}

// Write output
console.log(`Writing ${outputLines.length - 1} rows to ${OUTPUT_FILE}...`);
fs.writeFileSync(OUTPUT_FILE, outputLines.join('\n'), 'utf-8');

console.log('✅ Done! Augmented CSV created at:', OUTPUT_FILE);
console.log('\nSummary:');
console.log(`- Total rows: ${outputLines.length - 1}`);
console.log(`- Evaluation ID: ${EVALUATION_ID}`);
console.log(`- Policy: Content Accuracy Policy (policy_001)`);
console.log('\nNext steps:');
console.log('1. Run the database migration: npx supabase db push');
console.log('2. Import this CSV data into the hallucination_prompts table');
