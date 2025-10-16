# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production (TypeScript check + Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Storybook
- `npm run storybook` - Start Storybook development server on port 6006
- `npm run build-storybook` - Build static Storybook

### Story Generation
- `npm run generate-story <ComponentName>` - Generate Storybook story for specific component
- `npm run generate-all-stories` - Generate stories for all UI pattern components
- `npm run watch-stories` - Watch for new components and auto-generate stories

## Architecture Overview

### Core Structure
This is a React-based AI systems management application with the following key architectural patterns:

**Feature-Based Organization**: Components are organized by domain (ai-systems, ai-providers, evaluation, guardrails, settings) under `src/features/`

**Pattern Components**: Reusable UI patterns in `src/components/patterns/` with two categories:
- `ui-patterns/` - Visual components suitable for Storybook
- General patterns including context providers and routing utilities

**Storage Architecture**: Layered storage system in `src/lib/storage/` supporting:
- Persistent storage (localStorage with encryption)
- Session storage
- Static storage
- Secure storage for API keys

### Key Technologies
- **React 19** with TypeScript
- **React Router DOM** for client-side routing
- **Tailwind CSS** + **shadcn/ui** for styling
- **Radix UI** primitives for accessibility
- **Storybook** for component development and documentation
- **Vite** for build tooling

### Routing Structure
The application uses React Router with these main routes:
- `/ai-systems` - Main dashboard (default route)
- `/evaluation-sandbox` - AI model evaluation interface
- `/ai-providers` - Provider management with secure API key storage
- `/guardrails` - Safety guardrail management
- `/settings` - Application settings with access tokens and team management

### Data Management Patterns
- **Local Storage**: All data persisted locally with encryption for sensitive information
- **Factory Pattern**: Storage factory creates appropriate storage instances
- **Type Safety**: Comprehensive TypeScript definitions in `src/types/`

### Notification System
The application uses an event-based notification system that enables page-agnostic notifications:

- **Global Monitoring**: `useGlobalEvaluationMonitor` hook (evaluation feature) mounted in App.tsx watches all evaluations via Supabase real-time
- **Event Service**: `NotificationService` provides pub/sub pattern for decoupled communication between features and UI
- **UI Rendering**: `useGlobalNotifications` hook mounted in App.tsx subscribes to events and renders Sonner toast notifications
- **Page-Agnostic**: Notifications appear on any page when evaluations complete (works on Guardrails, Settings, AI Systems, etc.)
- **Action Buttons**: Toast includes "View Results" button (navigates to evaluation) and "Close" button
- **Persistent State**: Tracks last seen status in localStorage, prevents duplicates in sessionStorage
- **Completed While Away**: Detects and notifies about evaluations that completed while app was closed

**Key Files**:
- `src/lib/notifications/notification-service.ts` - Event bus for pub/sub
- `src/hooks/useGlobalNotifications.ts` - UI handler (subscribes and renders)
- `src/features/ai-system-evaluation/hooks/useGlobalEvaluationMonitor.ts` - Evaluation monitor
- `src/App.tsx` - Mounts both monitor and UI handler globally

**Adding New Notification Types**:
1. Update `NotificationService` with new event type and payload interface
2. Add trigger method to `NotificationService`
3. Create feature hook to monitor and trigger events
4. Handle new event type in `useGlobalNotifications` to render appropriate toast

See [docs/notification-system.md](docs/notification-system.md) for comprehensive documentation and examples

## Important Development Patterns

### Component Organization
- UI components in `src/components/ui/` (shadcn/ui based)
- Pattern components in `src/components/patterns/` with clear UI/non-UI separation
- Feature components under `src/features/{feature}/components/`
- Each feature has its own `lib/`, `types/`, and `constants/` directories

### Icon and Asset Handling
Icons are organized in `src/assets/icons/` with AI system provider icons in `AISystem/` subdirectory. The `AISystemIcon` component handles provider icon rendering with proper fallbacks.

### Table Patterns
The application uses a sophisticated table system:
- `DynamoTable` component for base table functionality
- Column factory pattern for dynamic column generation
- Editable cells with inline editing capabilities
- Built-in pagination, sorting, and filtering

### Story Generation
Automated Storybook story generation via scripts in `scripts/`:
- Detects component types automatically
- Generates appropriate story templates
- Maintains separation between UI and non-UI patterns

## MCP Servers
### Figma Dev Mode MCP Rules
- The Figma Dev Mode MCP Server provides an assets endpoint which can serve image and SVG assets
- IMPORTANT: If the Figma Dev Mode MCP Server returns a localhost source for an image or an SVG, use that image or SVG source directly
- IMPORTANT: DO NOT import/add new icon packages, all the assets should be in the Figma payload
- IMPORTANT: do NOT use or create placeholders if a localhost source is provided

## Security Considerations
- API keys are encrypted before localStorage storage using the secure storage system
- Never commit sensitive information
- All provider integrations use secure validation before storage
- Proper input sanitization for all user-provided data

## Visual Design (Human Added)
- Ensure UI component uses the tailwind classes
- For the colors, use only tailwind colors gray, red, green, amber
- For title case for Heading, title, labels
- Don't use bg-white. In cases where bg-white is necessary, use bg-gray-0 there.
