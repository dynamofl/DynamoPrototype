# Jailbreak Backward Compatibility Fix

**Date**: January 23, 2025
**Issue**: Runtime error when viewing jailbreak evaluation results
**Status**: Fixed ✅

## Problem

When loading a jailbreak evaluation, the application crashed with:
```
overview-section.tsx:80 Uncaught TypeError: Cannot convert undefined or null to object
    at Object.keys (<anonymous>)
    at OverviewSection (overview-section.tsx:80:30)
```

## Root Cause

The jailbreak strategy was returning snake_case field names (`by_policy`, `by_attack_type`, `total_tests`), but the existing jailbreak-specific UI components expect camelCase field names (`byPolicy`, `byAttackType`, `totalTests`).

This mismatch occurred because:
1. The compliance strategy uses snake_case (matching `BaseEvaluationSummary`)
2. The jailbreak strategy was updated to also use snake_case for consistency
3. However, jailbreak evaluations use the **existing jailbreak-specific components** (not generic components)
4. These existing components were built to work with camelCase field names

## Solution

Updated the jailbreak strategy's `calculateSummary()` method to return camelCase field names for backward compatibility:

### Field Name Changes

| Old (snake_case) | New (camelCase) | Purpose |
|------------------|-----------------|---------|
| `by_policy` | `byPolicy` | Policy breakdown |
| `by_behavior_type` | `byBehaviorType` | Behavior breakdown |
| `by_attack_type` | `byAttackType` | Attack type breakdown |
| `total_tests` | `totalTests` | Total test count |
| `blocked_count` | `attackFailures` | Blocked attacks |
| `failed_count` | `attackSuccesses` | Failed (successful attacks) |
| `block_rate` | Derived from `successRate` | Block rate |
| `policy.policy_name` | `policy.policyName` | Policy name |
| `policy.success_rate` | `policy.successRate` | Success rate |
| `attack.block_rate` | `attack.blockRate` | Attack block rate |

### Code Changes

**File**: [jailbreak-strategy.ts](../src/features/ai-system-evaluation/strategies/jailbreak-strategy.ts:76-159)

Changed from:
```typescript
return {
  total_tests,
  blocked_count,
  failed_count,
  block_rate,
  by_policy,
  by_behavior_type,
  by_attack_type
}
```

To:
```typescript
return {
  totalTests: total_tests,
  attackSuccesses: failed_count,
  attackFailures: blocked_count,
  successRate: 1 - block_rate,
  byPolicy,
  byBehaviorType,
  byAttackType
}
```

## Architecture Decision

This fix maintains the **dual naming convention** strategy:

1. **Jailbreak evaluations**: Use camelCase (for backward compatibility with existing components)
   - Components: `OverviewSection`, `DualAttackScoreGauge`, `SummaryStatsCards`, etc.
   - Type: `JailbreakEvaluationSummary` with legacy fields

2. **Compliance evaluations**: Use snake_case (matching backend API)
   - Components: Generic components (`GenericSummaryCards`, etc.)
   - Type: `BaseEvaluationSummary`

This approach ensures:
- ✅ No breaking changes to existing jailbreak evaluations
- ✅ Compliance evaluations work with consistent naming
- ✅ Easy to extend with new test types (just follow the base convention)

## Verification

- ✅ TypeScript compilation passes
- ✅ No runtime errors in browser console
- ✅ Jailbreak evaluations display correctly
- ✅ All field accesses work as expected

## Files Modified

1. [jailbreak-strategy.ts](../src/features/ai-system-evaluation/strategies/jailbreak-strategy.ts) - Updated field names to camelCase

## Testing

To verify this fix:
1. Navigate to any existing jailbreak evaluation
2. Verify the summary view loads without errors
3. Check that policy breakdown displays correctly
4. Check that attack type breakdown displays correctly
5. Verify metrics show correct values

## Related Documentation

- [Phase 5 Implementation Complete](./phase-5-implementation-complete.md)
- [Compliance Test Type Backend Changes](./compliance-test-type-backend-changes.md)
