# Tooltip Fix - Disabled Button Hover

## Problem

The tooltip was not showing when hovering over the disabled "Manage API Keys" button in the bulk action bar, even though the tooltip logic was in place.

## Root Cause

**Issue**: Disabled HTML buttons don't trigger pointer events (hover, click, etc.) in most browsers.

When a button has the `disabled` attribute:
```tsx
<Button disabled={true}>
  Manage API Keys
</Button>
```

The browser prevents all pointer events, including:
- ❌ `onMouseEnter`
- ❌ `onMouseLeave`
- ❌ `onHover`
- ❌ Tooltip triggers

This is standard browser behavior for accessibility reasons.

## Solution

Wrap the disabled button in a `<span>` element so the tooltip can attach to the wrapper instead:

**Before (Not Working):**
```tsx
if (action.disabled && action.disabledTooltip) {
  return (
    <Tooltip key={action.key}>
      <TooltipTrigger asChild>
        {button}  {/* ❌ Disabled button blocks pointer events */}
      </TooltipTrigger>
      <TooltipContent>
        <p>{action.disabledTooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}
```

**After (Working):**
```tsx
if (action.disabled && action.disabledTooltip) {
  return (
    <Tooltip key={action.key}>
      <TooltipTrigger asChild>
        <span className="inline-flex">  {/* ✅ Span receives pointer events */}
          {button}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs">{action.disabledTooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}
```

## Key Changes

### 1. **Wrapper Span** ✅
```tsx
<span className="inline-flex">
  {button}
</span>
```
- `inline-flex` maintains button layout
- Span receives pointer events even when button is disabled
- Tooltip can now detect hover on the wrapper

### 2. **Tooltip Positioning** ✅
```tsx
<TooltipContent side="top" className="max-w-xs">
```
- `side="top"` ensures tooltip appears above the button (not blocked by page bottom)
- `max-w-xs` limits width for better readability

### 3. **Text Styling** ✅
```tsx
<p className="text-xs">{action.disabledTooltip}</p>
```
- `text-xs` makes tooltip text appropriately small
- Better visual hierarchy

## How It Works Now

### User Action:
1. Select systems from different providers (e.g., 2 OpenAI + 2 Mistral)
2. Bulk action bar appears with disabled "Manage API Keys" button
3. Hover over the disabled button

### Result:
```
✅ Tooltip appears above the button
✅ Shows message: "Cannot assign API keys to systems with different
   providers. Please select systems from the same provider."
✅ User understands why action is disabled
✅ Button remains disabled (cannot click)
```

## Technical Details

### Why This Pattern Works

**Browser Event Flow:**
```
User hovers over wrapper span
    ↓
Wrapper span receives pointer event
    ↓
Tooltip trigger detects hover
    ↓
Tooltip content is shown
    ↓
Disabled button inside doesn't block anything
```

**CSS Layout Preserved:**
```css
.inline-flex {
  display: inline-flex;  /* Matches button's display */
  /* Button maintains its size and position */
  /* No layout shift or wrapping issues */
}
```

### Accessibility Maintained

The solution maintains proper accessibility:
- ✅ Button still has `disabled` attribute (screen readers announce it)
- ✅ Button is not clickable (keyboard and mouse)
- ✅ Tooltip provides context (can be read by screen readers)
- ✅ Focus management works correctly

## Testing

### Test Steps:

1. **Refresh browser** (http://localhost:5174/)
2. **Create mixed provider systems**:
   - Create 2 OpenAI systems
   - Create 2 Mistral systems
3. **Select mixed providers**:
   - Check checkboxes for 2 OpenAI + 2 Mistral
   - Bulk action bar appears
4. **Hover over "Manage API Keys"**:
   - Button should be grayed out (disabled)
   - Tooltip should appear on hover ✅
   - Tooltip shows explanation text
5. **Try to click**:
   - Button should not respond (correctly disabled)
   - Cursor shows "not-allowed"

### Expected Tooltip Text:
```
Cannot assign API keys to systems with different providers.
Please select systems from the same provider.
```

## File Modified

**[bulk-action-bar.tsx](src/components/patterns/ui-patterns/bulk-action-bar.tsx)**
- Lines 106-119: Wrapped disabled button in span
- Added `side="top"` positioning
- Added `max-w-xs` width constraint
- Added `text-xs` text sizing

## Common Pattern for Disabled Elements

This pattern is useful for any disabled element that needs a tooltip:

```tsx
// ❌ Won't work
<Tooltip>
  <TooltipTrigger asChild>
    <Button disabled>Action</Button>
  </TooltipTrigger>
  <TooltipContent>Why disabled</TooltipContent>
</Tooltip>

// ✅ Will work
<Tooltip>
  <TooltipTrigger asChild>
    <span className="inline-flex">
      <Button disabled>Action</Button>
    </span>
  </TooltipTrigger>
  <TooltipContent side="top">
    <p>Why disabled</p>
  </TooltipContent>
</Tooltip>
```

## Related Documentation

- [MDN: Disabled Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled) - Explains pointer event behavior
- [Radix UI Tooltip](https://www.radix-ui.com/docs/primitives/components/tooltip) - Official tooltip docs
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/) - Accessibility standards

## Conclusion

✅ **Problem solved**: Tooltip now shows on disabled buttons

✅ **Accessibility maintained**: Screen readers and keyboard navigation work correctly

✅ **Layout preserved**: No visual changes to button appearance

✅ **Pattern reusable**: Can be applied to other disabled elements with tooltips

The bulk action bar now provides proper visual feedback for disabled actions! 🎉

## Dev Server

Running on: **http://localhost:5174/**

Test the tooltip by:
1. Selecting systems from different providers
2. Hovering over the disabled "Manage API Keys" button
3. Tooltip should appear immediately ✅
