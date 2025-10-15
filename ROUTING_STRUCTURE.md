# AI System Evaluation Results - Routing Structure

## URL Pattern

The evaluation results page now supports a comprehensive URL structure that tracks the current view state:

```
/ai-systems/:systemName/evaluation/:evaluationId/:view?mode=:mode&item=:itemId
```

### URL Parameters

#### Path Parameters

1. **`:systemName`** - URL-friendly slug of the AI system name
   - Example: `gpt-4o-mini`

2. **`:evaluationId`** - Unique identifier for the evaluation
   - Example: `123e4567-e89b-12d3-a456-426614174000`

3. **`:view`** - The main view type (optional, defaults to `summary`)
   - Values: `summary` | `data`
   - `summary` - Shows summary view with metrics and charts
   - `data` - Shows detailed data view with table or conversation mode

#### Query Parameters (only used when view = "data")

1. **`mode`** - The data view mode (optional, defaults to `table`)
   - Values: `table` | `conversation`
   - `table` - Shows data in table format with pagination
   - `conversation` - Shows conversations list with detail panel

2. **`item`** - The selected item ID (behavior varies by mode)
   - Example: `policy-id-123-0`
   - **In conversation mode**: MANDATORY - Always present, represents the currently selected conversation
   - **In table mode**: OPTIONAL - Only present when the side sheet is open, represents the conversation being viewed in the side sheet

## URL Examples

### Summary View (default)
```
/ai-systems/gpt-4o-mini/evaluation/abc-123-def/summary
/ai-systems/gpt-4o-mini/evaluation/abc-123-def
```

### Data View - Table Mode (default)
```
# Table view without side sheet
/ai-systems/gpt-4o-mini/evaluation/abc-123-def/data
/ai-systems/gpt-4o-mini/evaluation/abc-123-def/data?mode=table

# Table view with side sheet open (showing a specific conversation)
/ai-systems/gpt-4o-mini/evaluation/abc-123-def/data?item=policy-id-123-0
```

### Data View - Conversation Mode (item is mandatory)
```
# Conversation view always has an item selected
/ai-systems/gpt-4o-mini/evaluation/abc-123-def/data?mode=conversation&item=policy-id-123-0
```

## Implementation Details

### Components Updated

1. **App.tsx**
   - Updated route to accept `:view` parameter
   - Route: `/ai-systems/:systemName/evaluation/:evaluationId/:view`

2. **EvaluationResults Component**
   - Reads `view` from URL params
   - Syncs tab state with URL
   - Updates URL when user switches between summary/data views

3. **EvaluationDataView Component**
   - Reads `mode` and `item` from URL query parameters
   - Syncs view mode (table/conversation) with URL
   - Handles `item` parameter differently based on mode:
     - **Conversation mode**: Always maintains an `item` parameter (auto-selects first conversation if none provided)
     - **Table mode**: Only sets `item` when side sheet is open; removes it when closed
   - Updates URL when user:
     - Switches between table and conversation view
     - Selects a different conversation (in conversation mode)
     - Opens/closes side sheet (in table mode)
     - Navigates between items in side sheet

4. **AISystemEvaluationUnifiedPage**
   - Changed from `tab` parameter to `view` parameter
   - Passes `systemName` and `evaluationId` to child components for URL construction

### URL State Management

The URL serves as the single source of truth for:
- Current view (summary vs data)
- Data view mode (table vs conversation)
- Selected conversation item (mandatory in conversation mode, optional in table mode)

This enables:
- **Shareable URLs**: Users can copy and share exact view states
- **Browser navigation**: Back/forward buttons work correctly
- **Bookmarking**: Users can bookmark specific view states
- **Deep linking**: Direct navigation to specific conversations

### Behavior

- Changing tabs/views updates the URL immediately (using `replace: true` to avoid polluting history)
- URL changes are detected and sync back to component state
- Invalid URL params fall back to sensible defaults
- **Conversation mode**: Always has a selected item; if none in URL, auto-selects the first conversation
- **Table mode**:
  - Default state has no `item` parameter
  - Opening side sheet adds `item` parameter
  - Closing side sheet removes `item` parameter
  - Navigating between items in side sheet updates `item` parameter

## Testing

To test the routing implementation:

### Summary View
1. Navigate to summary view:
   ```
   /ai-systems/test-system/evaluation/test-id/summary
   ```

### Table View
2. Switch to data view (table mode) and verify URL updates to:
   ```
   /ai-systems/test-system/evaluation/test-id/data
   ```

3. Click on a row to open the side sheet and verify URL updates to:
   ```
   /ai-systems/test-system/evaluation/test-id/data?item=<conversation-id>
   ```

4. Navigate to next/previous item in side sheet and verify URL updates

5. Close the side sheet and verify URL reverts to:
   ```
   /ai-systems/test-system/evaluation/test-id/data
   ```

### Conversation View
6. Switch to conversation mode and verify URL updates to:
   ```
   /ai-systems/test-system/evaluation/test-id/data?mode=conversation&item=<first-conversation-id>
   ```
   (Note: `item` is automatically set to first conversation)

7. Select different conversations and verify URL updates to:
   ```
   /ai-systems/test-system/evaluation/test-id/data?mode=conversation&item=<selected-conversation-id>
   ```

### Navigation & Sharing
8. Test browser back/forward buttons - should restore correct view states
9. Test direct URL navigation - paste URL and verify correct state loads
10. Test URL sharing - copy URL, open in new tab, verify exact state is restored
11. Test bookmarking - bookmark a specific conversation, verify it opens correctly
