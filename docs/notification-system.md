# Global Notification System

## Overview

The application uses an event-based notification system that allows features to trigger notifications without App.tsx needing to know about feature-specific data or business logic. This creates a decoupled, scalable architecture where:

- **Features own their notification logic** - When to notify, what data to include
- **App.tsx handles only UI rendering** - Subscribes to events and displays toast notifications
- **Event service acts as mediator** - Pub/sub pattern for communication between features and UI

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                             │
│  - Mounts useGlobalEvaluationMonitor (evaluation feature)   │
│  - Mounts useGlobalNotifications (UI handler)               │
│  - Always active on all pages                               │
└─────────────────────────────────────────────────────────────┘
          │                                    │
          │ (evaluation monitoring)            │ (UI rendering)
          ▼                                    ▼
┌──────────────────────────┐    ┌────────────────────────────┐
│ useGlobalEvaluationMonitor│    │ useGlobalNotifications     │
│ (Evaluation Feature)      │    │ (UI Handler)               │
│  - Watches Supabase DB    │    │  - Subscribes to events    │
│  - Detects completions    │    │  - Renders toast UI        │
│  - Triggers events   ────────► │  - Plays sounds            │
└──────────────────────────┘    └────────────────────────────┘
          │
          │ (triggers events)
          ▼
┌─────────────────────────────────────────────────────────────┐
│              NotificationService (Singleton)                │
│  - Event-based pub/sub system using EventTarget            │
│  - Features publish notification events                     │
│  - UI handler subscribes to display toast                   │
│  - Type-safe event payloads                                 │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. NotificationService (`src/lib/notifications/notification-service.ts`)

**Purpose**: Central event bus for all notifications

**API**:
```typescript
// Trigger a notification (called by features)
notificationService.triggerEvaluationCompletion({
  evaluationId: string,
  evaluationName: string,
  systemName: string,
  title: string,
  description: string
})

// Subscribe to notifications (called by App.tsx)
const unsubscribe = notificationService.subscribe((event) => {
  // Handle notification event
})
```

**Features**:
- Singleton pattern - single global instance
- Type-safe event payloads
- Uses browser's native EventTarget API
- Returns cleanup function for subscriptions

### 2. useGlobalNotifications Hook (`src/hooks/useGlobalNotifications.ts`)

**Purpose**: Listens for notification events and renders toast UI

**Used by**: App.tsx only

**Responsibilities**:
- Subscribe to notification service events
- Render Sonner toast with appropriate styling
- Add action buttons (View Results, Close)
- Play notification sound
- Clean up subscription on unmount

**Toast Configuration**:
```typescript
toast.success(title, {
  description: string,
  duration: 10000, // 10 seconds
  classNames: {
    toast: 'border-green-200 bg-green-50',
    title: 'text-green-900 font-medium',
    description: 'text-green-700',
  },
  action: {
    label: 'View Results',
    onClick: () => navigate to results page
  },
  cancel: {
    label: 'Close',
    onClick: () => dismiss toast
  }
})
```

### 3. useGlobalEvaluationMonitor Hook (`src/features/ai-system-evaluation/hooks/useGlobalEvaluationMonitor.ts`)

**Purpose**: Monitor ALL evaluations globally and trigger notifications

**Used by**: App.tsx (mounted globally)

**Responsibilities**:
- Watch all evaluations across all AI systems via Supabase real-time
- Track evaluation status changes (pending → running → completed)
- Persist last seen status in localStorage (survives browser close)
- Track shown notifications in sessionStorage (prevents duplicates)
- Detect completions that happened while page was closed
- Trigger notification events via NotificationService

**Key Features**:
- **Initial Load Detection**: Shows notification for evaluations that completed while app was closed
- **Real-time Detection**: Shows notification immediately when evaluation completes
- **Global Monitoring**: Watches ALL evaluations, not just for one AI system
- **Page-Agnostic**: Works on any page since it's mounted in App.tsx
- **Duplicate Prevention**: Tracks shown notifications in session
- **Persistent State**: Remembers last seen status across sessions

**State Tracking**:
```typescript
// localStorage - persists across sessions
LAST_SEEN_STATUS_KEY = 'evaluation-last-seen-status'
// Stores: { [evaluationId]: 'pending' | 'running' | 'completed' }

// sessionStorage - prevents duplicates within session
SESSION_SHOWN_KEY = 'evaluation-session-shown'
// Stores: [evaluationId1, evaluationId2, ...]
```

## How It Works

### Flow for Evaluation Completion Notification

1. **User starts evaluation** on AI System Evaluation page
   ```
   Status: pending → running
   ```

2. **Global monitor is always watching** via `useGlobalEvaluationMonitor` (mounted in App.tsx)
   - Subscribes to ALL evaluations in Supabase via real-time
   - Tracks last seen status in localStorage
   - Works on any page the user navigates to

3. **Evaluation completes** (user may be on any page - Guardrails, Settings, etc.)
   ```
   Status: running → completed
   ```

4. **Global monitor detects completion**
   ```typescript
   // In useGlobalEvaluationMonitor.ts
   const justCompleted =
     lastSeenStatus === 'running' &&
     currentStatus === 'completed' &&
     !alreadyShownInSession
   ```

5. **Monitor triggers notification event**
   ```typescript
   notificationService.triggerEvaluationCompletion({
     evaluationId: evaluation.id,
     evaluationName: evaluation.name,
     systemName: aiSystem.name,
     title: 'Evaluation Completed',
     description: `${evaluation.name} has finished running`
   })
   ```

6. **App.tsx receives event** via `useGlobalNotifications`
   ```typescript
   // In useGlobalNotifications.ts
   notificationService.subscribe((event) => {
     if (event.type === 'evaluation-completed') {
       // Show toast UI
       toast.success(...)
       playNotificationSound()
     }
   })
   ```

7. **Toast appears on current page** with action buttons
   - User can click "View Results" → navigates to `/ai-systems/{systemName}/evaluation/{evaluationId}/summary`
   - User can click "Close" → dismisses toast
   - Auto-dismisses after 10 seconds

### "Completed While Away" Flow

1. **User leaves app** (closes tab or navigates away)
   - Last seen status saved: `{ evaluationId: 'running' }`

2. **Evaluation completes** while user is away
   - Backend updates status to 'completed'

3. **User returns to app**
   - Feature loads evaluation history
   - Detects: `lastSeenStatus === 'running' && currentStatus === 'completed'`
   - Triggers notification with title: "Completed while you were away"

4. **Toast appears** showing what completed during absence

## Page-Agnostic Design

The notification system works **on any page** because:

1. **App.tsx is always mounted** - Both the monitor and UI handler are always active
2. **Global monitor runs everywhere** - `useGlobalEvaluationMonitor` watches all evaluations regardless of current page
3. **Navigation uses window.location.href** - Works from any page without router context
4. **No assumptions about current route** - Event system doesn't care where user is
5. **Supabase real-time subscription** - Detects changes even when user is not on evaluation page

### Example Scenarios

**Scenario 1: User on Guardrails page**
- Evaluation completes on AI System "gpt-4o-demo"
- Toast appears on Guardrails page
- User clicks "View Results"
- Navigates to `/ai-systems/gpt-4o-demo/evaluation/{id}/summary`

**Scenario 2: User on Settings page**
- Evaluation completes
- Toast appears on Settings page
- User dismisses it
- Continues working on Settings

**Scenario 3: User navigates between pages**
- User starts evaluation on "gpt-4o-demo" system
- User navigates to Settings → Guardrails → AI Systems
- Evaluation completes while user is browsing
- Toast appears on whatever page user is currently on
- User clicks "View Results" and is taken to the evaluation results page

## Adding New Notification Types

To add a new notification type from another feature:

### Step 1: Update NotificationService types

```typescript
// src/lib/notifications/notification-service.ts

export interface GuardrailViolationNotification {
  guardrailId: string;
  violationType: string;
  message: string;
}

export type NotificationEvent =
  | { type: 'evaluation-completed'; payload: EvaluationCompletionNotification }
  | { type: 'guardrail-violation'; payload: GuardrailViolationNotification }
```

### Step 2: Add trigger method

```typescript
// In NotificationService class
triggerGuardrailViolation(notification: GuardrailViolationNotification) {
  const event = new CustomEvent<NotificationEvent>('notification', {
    detail: {
      type: 'guardrail-violation',
      payload: notification,
    },
  });
  this.eventTarget.dispatchEvent(event);
}
```

### Step 3: Create feature hook

```typescript
// src/features/guardrails/hooks/useGuardrailMonitor.ts
export function useGuardrailMonitor() {
  useEffect(() => {
    // Monitor guardrail violations
    // When violation detected:
    notificationService.triggerGuardrailViolation({
      guardrailId: '...',
      violationType: 'policy-violation',
      message: 'Policy XYZ was violated'
    })
  }, [])
}
```

### Step 4: Handle in useGlobalNotifications

```typescript
// src/hooks/useGlobalNotifications.ts
notificationService.subscribe((event) => {
  if (event.type === 'evaluation-completed') {
    // ... existing code
  } else if (event.type === 'guardrail-violation') {
    toast.error(event.payload.violationType, {
      description: event.payload.message,
      // ... toast config
    })
  }
})
```

## Benefits of This Architecture

### 1. **Separation of Concerns**
- Features manage when/what to notify
- App.tsx manages how to display
- NotificationService manages communication

### 2. **Scalability**
- Easy to add new notification types
- Multiple features can trigger notifications
- Single UI rendering point

### 3. **Testability**
- Features can be tested without UI
- UI can be tested with mock events
- Service can be tested independently

### 4. **Performance**
- App.tsx doesn't load feature-specific data
- No unnecessary data fetching
- Efficient event-based communication

### 5. **Maintainability**
- Clear responsibilities
- Type-safe event payloads
- Single source of truth for UI rendering

## Configuration

### Toast Duration
```typescript
// In useGlobalNotifications.ts
duration: 10000 // 10 seconds (extended to allow user interaction)
```

### Toast Styling
```typescript
// Using Tailwind CSS classes
classNames: {
  toast: 'border-green-200 bg-green-50',     // Green border and background
  title: 'text-green-900 font-medium',        // Dark green title
  description: 'text-green-700',              // Medium green description
}
```

### Notification Sound
```typescript
// In useGlobalNotifications.ts
playNotificationSound() // Plays audio/notification.mp3 or system sound
```

## Current Limitations

1. **Browser Notifications**: Does not support browser/OS notifications (only in-app toast)

2. **Requires Active Session**: Notifications only work when the app is open in a browser tab

3. **Single Notification Type**: Currently only supports evaluation completion notifications

## Future Enhancements

1. **Browser Notifications**: Add support for OS-level notifications when tab is not focused
2. **Notification History**: Show notification center with history of all notifications
3. **Notification Preferences**: Allow users to configure which notifications they want
4. **Multiple Channels**: Add support for email, Slack, etc.
5. **Additional Notification Types**: Guardrail violations, policy updates, system alerts, etc.

## Related Files

**Core Notification System**:
- `src/lib/notifications/notification-service.ts` - Event service (pub/sub system)
- `src/hooks/useGlobalNotifications.ts` - Global UI handler (subscribes and renders toasts)
- `src/features/ai-system-evaluation/hooks/useGlobalEvaluationMonitor.ts` - Global evaluation monitor (watches all evaluations)
- `src/App.tsx` - Mounts both monitor and UI handler

**UI Components**:
- `src/components/ui/sonner.tsx` - Toast component configuration
- `src/lib/audio/notification-sound.ts` - Sound playback

**Feature-Specific (Still Used)**:
- `src/features/ai-system-evaluation/hooks/useEvaluationHistory.ts` - Loads evaluations for specific AI system (used in unified page)
- `src/features/ai-system-evaluation/hooks/useAISystemLoader.ts` - Loads AI system details (used in unified page)
