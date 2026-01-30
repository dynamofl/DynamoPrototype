# Test Scenarios for TestProgressDialog & AttackProgressSection

## Overview
This document outlines comprehensive test scenarios for the Test Progress Dialog system, including the main dialog, AttackProgressSection, and all associated subcomponents.

---

## 1. TestProgressDialog Component

### 1.1 Rendering & Display
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| TPD-001 | Dialog renders when `open=true` | Dialog is visible with title "Test Progress" |
| TPD-002 | Dialog does not render when `open=false` | Dialog is not in DOM |
| TPD-003 | Display test name from `test.name` | Test name appears in details section |
| TPD-004 | Display test category from `test.category` | Category appears in details section |
| TPD-005 | Display test type from `test.type` | Test type appears in details section |
| TPD-006 | Handle missing test data (`test=null`) | Dialog renders gracefully without crashing |

### 1.2 Status Display
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| TPD-007 | RUNNING status displays correct tag | Green "Running" tag with pulse animation |
| TPD-008 | QUEUED status displays "Preparing" | Yellow/orange "Preparing" tag |
| TPD-009 | COMPLETED status displays correct tag | Gray "Completed" tag |
| TPD-010 | FAILED status displays correct tag | Red "Failed" tag |
| TPD-011 | CANCELLED status displays correct tag | Gray "Cancelled" tag |

### 1.3 Progress Bar
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| TPD-012 | QUEUED status shows animated stripe bar | StripeProgressBar with animation |
| TPD-013 | RUNNING with 0% progress shows stripe animation | Animated stripes visible |
| TPD-014 | RUNNING with >0% progress shows solid bar | Standard progress bar, no stripes |
| TPD-015 | Progress percentage displays correctly | "50% Completed" text format |
| TPD-016 | 100% progress shows completed state | Full progress bar |

### 1.4 Elapsed Time
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| TPD-017 | Elapsed time updates every second | Timer increments in HH:MM:SS format |
| TPD-018 | Elapsed time calculated from `test.created_at` | Correct duration displayed |
| TPD-019 | Timer cleanup on unmount | No memory leaks, interval cleared |
| TPD-020 | Timer cleanup on dialog close | Interval stops when `open=false` |

### 1.5 Cancel Functionality
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| TPD-021 | Cancel button visible for RUNNING tests | Button appears when `onCancel` provided |
| TPD-022 | Cancel button visible for QUEUED tests | Button appears when `onCancel` provided |
| TPD-023 | Cancel button hidden for COMPLETED tests | No cancel button shown |
| TPD-024 | Cancel button hidden for FAILED tests | No cancel button shown |
| TPD-025 | Cancel button hidden when no `onCancel` handler | Button not rendered |
| TPD-026 | Cancel button shows loading state | Spinner/loading indicator during cancel |
| TPD-027 | Successful cancel closes dialog | Dialog closes after `onCancel` resolves |
| TPD-028 | Failed cancel shows error | Error logged, dialog remains open |
| TPD-029 | Cancel button disabled while cancelling | Prevent double-clicks |

### 1.6 Attacks Section
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| TPD-030 | Render AttackProgressSection for each attack | Correct number of attack sections |
| TPD-031 | Pass correct `attackProgress` to each attack | Progress data matched by attack ID |
| TPD-032 | Handle attacks with no progress data | AttackProgressSection renders with defaults |
| TPD-033 | Empty attacks array | "No attacks" or empty section |
| TPD-034 | First attack has `defaultExpanded=true` | First attack section is expanded |

---

## 2. AttackProgressSection Component

### 2.1 Rendering Modes
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| APS-001 | Render with progress data | Full attack section with stages |
| APS-002 | Render without progress data | Basic attack header with parameters only |
| APS-003 | Display attack index (1-based) | "Attack 1", "Attack 2", etc. |
| APS-004 | Display attack parameters | Formatted params: "Temp: 1 • Seq Length: 256" |

### 2.2 Status Icons
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| APS-005 | 100% progress shows CheckCircle icon | Green check icon |
| APS-006 | QUEUED with 0% shows CircleDashed | Gray dashed circle icon |
| APS-007 | In-progress shows CircularProgressBar | Animated circular progress with percentage |
| APS-008 | FAILED status shows appropriate indicator | Error/failed icon |

### 2.3 Expand/Collapse Functionality
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| APS-009 | Click header to expand | Stages section becomes visible |
| APS-010 | Click header to collapse | Stages section hides with animation |
| APS-011 | QUEUED attacks always show stages | Cannot collapse QUEUED attacks |
| APS-012 | Attack with no stages - no toggle | Chevron hidden, not clickable |
| APS-013 | Chevron rotates on expand | 90° rotation animation |
| APS-014 | `defaultExpanded=true` starts expanded | Initial state is expanded |
| APS-015 | `defaultExpanded=false` starts collapsed | Initial state is collapsed |

### 2.4 Status Text Display
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| APS-016 | Show current stage title when collapsed | "50% Completed • Generating prompts" |
| APS-017 | Show only percentage when expanded | "50% Completed" without stage title |
| APS-018 | QUEUED shows "Preparing" or similar | Appropriate queued status text |
| APS-019 | 100% shows "Completed" | Completed status text |
| APS-020 | 0% RUNNING shows "Starting..." | Initial running state text |

### 2.5 Stages Rendering
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| APS-021 | Stages sorted by `order` property | Correct stage ordering |
| APS-022 | Each stage rendered as StageItem | StageItem components for all stages |
| APS-023 | Nested substages passed correctly | Substages data propagated to StageItem |
| APS-024 | Empty stages object | No stages rendered, graceful handling |

---

## 3. StageItem Component

### 3.1 Status Display
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| SI-001 | Completed stage (100%) shows check icon | Green/gray check circle |
| SI-002 | In-progress stage shows spinner | Animated progress icon |
| SI-003 | Queued stage shows loader | Spinning loader icon |
| SI-004 | Pending stage shows dashed circle | CircleDashed icon |
| SI-005 | Failed stage shows X icon | Red XCircle icon |

### 3.2 Title Display
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| SI-006 | Completed stage shows `title.finished` | "Generated prompts" text |
| SI-007 | In-progress stage shows `title.active` | "Generating prompts" text |
| SI-008 | Pending stage shows `title.yetToStart` | "Generate prompts" text |
| SI-009 | Queued stage shows `title.yetToStart` | "Generate prompts" text |

### 3.3 Progress Information
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| SI-010 | Show items count when available | "50/100 items" format |
| SI-011 | Handle null `totalNoOfItems` | No items count displayed |
| SI-012 | Handle null `noOfItemsProcessed` | Graceful fallback |

### 3.4 Substages
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| SI-013 | Render substages when present | SubStageItem for each substage |
| SI-014 | Substages sorted by order | Correct ordering |
| SI-015 | Deep nesting (3+ levels) | Recursive rendering works |
| SI-016 | No substages | Clean rendering without substages section |

### 3.5 Error Handling
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| SI-017 | Stage with error shows error message | Error text displayed inline |
| SI-018 | Substage with error propagates | Error indicated at parent level |

### 3.6 Expand/Collapse Substages
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| SI-019 | Click to expand substages | Substages become visible |
| SI-020 | Click to collapse substages | Substages hide with animation |
| SI-021 | Animation smooth | max-h and opacity transitions |

---

## 4. SubStageItem Component

### 4.1 Display
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| SSI-001 | Render substage title based on status | Correct title variant used |
| SSI-002 | In-progress shows TextShimmer effect | Animated shimmer on text |
| SSI-003 | Completed shows static text | No shimmer animation |
| SSI-004 | Nested substages render recursively | Deep nesting supported |

### 4.2 Error Display
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| SSI-005 | Error message displayed inline | Error text visible |
| SSI-006 | Error styling applied | Red/error color styling |

---

## 5. StripeProgressBar Component

### 5.1 Stripe Animation
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| SPB-001 | `animated=true` shows moving stripes | CSS keyframe animation active |
| SPB-002 | `animated=false` shows static bar | No animation |
| SPB-003 | Progress value reflected in width | Correct percentage width |

### 5.2 Progress States
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| SPB-004 | 0% progress | Empty or minimal bar |
| SPB-005 | 50% progress | Half-filled bar |
| SPB-006 | 100% progress | Full bar |
| SPB-007 | Transition between states | Smooth width transition |

---

## 6. CircularProgressBar Component

### 6.1 Display
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| CPB-001 | Render SVG circle | Correct SVG structure |
| CPB-002 | Show percentage in center | "50%" text visible |
| CPB-003 | Progress arc reflects value | stroke-dashoffset calculated correctly |
| CPB-004 | Customizable size | Size prop affects dimensions |
| CPB-005 | Customizable stroke width | Stroke width prop works |

### 6.2 Animation
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| CPB-006 | Smooth progress updates | Transition animation on value change |
| CPB-007 | 0% shows empty circle | No progress arc visible |
| CPB-008 | 100% shows full circle | Complete progress arc |

---

## 7. StageIcon Component

### 7.1 Icon Mapping
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| SIC-001 | `status='completed'` | CheckCircle2 icon (gray) |
| SIC-002 | `status='in-progress'` | CircularProgress SVG (animated) |
| SIC-003 | `status='queued'` | Loader2 icon (animated spin) |
| SIC-004 | `status='pending'` | CircleDashed icon (gray) |
| SIC-005 | `status='failed'` | XCircle icon (red) |
| SIC-006 | Invalid status | Fallback/default icon |

---

## 8. Integration Tests

### 8.1 Data Flow
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| INT-001 | Progress data flows from dialog to attacks | Correct data passed through props |
| INT-002 | Attack progress matched by ID | Correct progress for each attack |
| INT-003 | Stage data flows to StageItem | All stage properties passed correctly |

### 8.2 Real-time Updates
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| INT-004 | Progress update triggers re-render | UI reflects new progress |
| INT-005 | Status change updates all components | Status-dependent UI updates |
| INT-006 | Stage completion updates parent | Attack progress reflects stage completion |

### 8.3 API Integration
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| INT-007 | Polling fetches updated progress | 60-second interval fetch |
| INT-008 | Error in API call handled gracefully | Error state displayed or retry |
| INT-009 | Completed test stops polling | No unnecessary API calls |

---

## 9. Edge Cases & Error Handling

### 9.1 Missing Data
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EDGE-001 | `progressData=undefined` | Fallback UI, no crash |
| EDGE-002 | `test.attacks=[]` (empty) | Empty attacks section |
| EDGE-003 | Attack with no `progressStages` | Basic attack header only |
| EDGE-004 | Stage with `null` timestamps | Graceful handling |
| EDGE-005 | Missing `hyper_parameters` | No parameters displayed |

### 9.2 Extreme Values
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EDGE-006 | Progress > 100 | Clamped to 100% |
| EDGE-007 | Progress < 0 | Treated as 0% |
| EDGE-008 | Very long attack name | Text truncated/wrapped |
| EDGE-009 | Many attacks (50+) | Scrollable, performant |
| EDGE-010 | Deep stage nesting (5+ levels) | Renders correctly |

### 9.3 Concurrent Operations
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EDGE-011 | Cancel while progress updating | No race condition |
| EDGE-012 | Close dialog during cancel | Cleanup handled properly |
| EDGE-013 | Multiple rapid expand/collapse | UI remains stable |

### 9.4 Browser/Environment
| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EDGE-014 | Dialog resize | Responsive layout |
| EDGE-015 | Long elapsed time (24+ hours) | Format handles correctly |
| EDGE-016 | Timezone differences | `created_at` parsed correctly |

---

## 10. Accessibility Tests

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| A11Y-001 | Dialog has proper ARIA attributes | `role="dialog"`, `aria-modal`, etc. |
| A11Y-002 | Cancel button accessible | Proper label, keyboard accessible |
| A11Y-003 | Progress bar has ARIA | `role="progressbar"`, `aria-valuenow` |
| A11Y-004 | Expand/collapse keyboard accessible | Enter/Space triggers toggle |
| A11Y-005 | Screen reader announces status changes | Live regions for updates |
| A11Y-006 | Focus management on open/close | Focus trapped in dialog |

---

## 11. Visual/Animation Tests

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| VIS-001 | TextShimmer animation runs | 4-second gradient animation |
| VIS-002 | Stripe animation runs | CSS keyframe diagonal stripes |
| VIS-003 | Expand/collapse smooth | max-h transition works |
| VIS-004 | Chevron rotation smooth | 90° rotation animation |
| VIS-005 | Loader2 icon spins | Continuous rotation animation |

---

## Summary

**Total Test Scenarios: 100+**

| Component | Count |
|-----------|-------|
| TestProgressDialog | 34 |
| AttackProgressSection | 25 |
| StageItem | 21 |
| SubStageItem | 6 |
| StripeProgressBar | 7 |
| CircularProgressBar | 8 |
| StageIcon | 6 |
| Integration | 9 |
| Edge Cases | 16 |
| Accessibility | 6 |
| Visual/Animation | 5 |

### Priority Testing Areas
1. **High Priority**: Status transitions, progress calculations, cancel functionality
2. **Medium Priority**: Expand/collapse behavior, stage rendering, data flow
3. **Lower Priority**: Animations, edge cases with extreme values

### Recommended Testing Tools
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Jest + MSW for API mocking
- **Visual Tests**: Storybook + Chromatic
- **E2E Tests**: Playwright or Cypress
