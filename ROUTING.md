# Routing Structure

This document describes the routing implementation for the DynamoPrototype application.

## Overview

The application now uses React Router DOM for client-side routing, providing separate URLs for each major section of the application.

## Routes

### 1. **AI Systems** - `/ai-systems`
- **Component**: `AISystemsTable`
- **Description**: Main dashboard showing AI systems, statistics, and management interface
- **Features**: 
  - Header with "Connect Your AI System" button
  - Statistics cards showing system counts
  - Data table with AI system information
- **Default Route**: Automatically redirects from `/` to `/ai-systems`

### 2. **Evaluation Sandbox** - `/evaluation-sandbox`
- **Component**: `EvaluationSandbox`
- **Description**: Interface for testing and evaluating AI models
- **Features**:
  - Model configuration (candidate model selection)
  - Fixed judge model (gpt-4o-mini)
  - Guardrail selection
  - Prompt input and evaluation execution
  - Results display and metrics

### 3. **AI Providers** - `/ai-providers`
- **Component**: `AIProviders`
- **Description**: Management interface for AI service providers
- **Features**:
  - Add/remove AI providers
  - API key management
  - Model fetching and configuration
  - Provider status monitoring

### 4. **Guardrails** - `/guardrails`
- **Component**: `Guardrails`
- **Description**: Management interface for safety guardrails
- **Features**:
  - Create/edit guardrail policies
  - Guardrail status management
  - Policy configuration

### 5. **404 Page** - `/*` (catch-all)
- **Description**: Handles any unmatched routes
- **Features**:
  - User-friendly error message
  - Button to return to main dashboard

## Navigation

### AppBar Navigation
The top navigation bar provides easy access to all routes:
- **AI Systems**: Main dashboard
- **Evaluation Sandbox**: Model evaluation interface
- **AI Providers**: Provider management
- **Guardrails**: Safety policy management

### Active State
- Current route is highlighted in the navigation
- Uses React Router's `isActive` prop for styling
- Smooth transitions between routes

## Implementation Details

### Router Setup
```tsx
// main.tsx
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="dynamo-ui-theme">
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

### Route Configuration
```tsx
// App.tsx
<Routes>
  <Route path="/" element={<Navigate to="/ai-systems" replace />} />
  <Route path="/ai-systems" element={<AISystemsDashboard />} />
  <Route path="/evaluation-sandbox" element={<EvaluationSandbox />} />
  <Route path="/ai-providers" element={<AIProviders />} />
  <Route path="/guardrails" element={<Guardrails />} />
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

### Navigation Component
```tsx
// app-bar.tsx
const navigationItems = [
  { name: "AI Systems", path: "/ai-systems" },
  { name: "Evaluation Sandbox", path: "/evaluation-sandbox" },
  { name: "AI Providers", path: "/ai-providers" },
  { name: "Guardrails", path: "/guardrails" },
]

<NavLink
  to={item.path}
  className={({ isActive }) => cn(
    "navigation-styles",
    isActive ? "active-styles" : "inactive-styles"
  )}
>
  {item.name}
</NavLink>
```

## Benefits

### 1. **SEO Friendly**
- Each section has its own URL
- Better for search engine indexing
- Shareable links for specific sections

### 2. **User Experience**
- Browser back/forward buttons work correctly
- Bookmarkable pages
- Direct navigation to specific sections

### 3. **Development**
- Cleaner component organization
- Easier to maintain and extend
- Better separation of concerns

### 4. **Analytics**
- Track user navigation patterns
- Monitor section usage
- Better user behavior insights

## Usage Examples

### Direct Navigation
Users can navigate directly to any section:
- `https://yourapp.com/ai-systems` - AI Systems dashboard
- `https://yourapp.com/evaluation-sandbox` - Evaluation interface
- `https://yourapp.com/ai-providers` - Provider management
- `https://yourapp.com/guardrails` - Guardrail management

### Programmatic Navigation
```tsx
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()

// Navigate to evaluation sandbox
navigate('/evaluation-sandbox')

// Navigate with state
navigate('/ai-systems', { state: { highlightSystem: 'system-id' } })
```

### Link Generation
```tsx
import { Link } from 'react-router-dom'

<Link to="/evaluation-sandbox" className="button">
  Go to Evaluation
</Link>
```

## Backend Integration

All backend calls remain unchanged:
- **Evaluation requests**: Still use the same API endpoints
- **Provider management**: Same backend integration
- **Guardrail operations**: Unchanged backend communication
- **Data fetching**: Same data sources and APIs

The routing only affects the frontend navigation and URL structure, not the backend communication.

## Future Enhancements

### 1. **Route Guards**
- Authentication-based route protection
- Role-based access control
- Feature flag routing

### 2. **Deep Linking**
- Direct navigation to specific evaluations
- Shareable evaluation results
- Deep links to specific AI systems

### 3. **Route History**
- Breadcrumb navigation
- Recent pages tracking
- Navigation analytics

### 4. **Lazy Loading**
- Code splitting by route
- Dynamic imports for better performance
- Progressive loading of components

## Troubleshooting

### Common Issues

1. **404 Errors**
   - Ensure all routes are properly defined
   - Check for typos in route paths
   - Verify component imports

2. **Navigation Not Working**
   - Check BrowserRouter is properly configured
   - Verify NavLink components are used correctly
   - Ensure route paths match exactly

3. **Active State Issues**
   - Verify `isActive` prop usage in NavLink
   - Check CSS classes for active states
   - Ensure proper route matching

### Debug Mode
Enable React Router debugging:
```tsx
// Add to your development environment
window.__REACT_ROUTER_DEBUG__ = true
```

## Conclusion

The new routing structure provides a more professional and user-friendly navigation experience while maintaining all existing functionality. Each section now has its own URL, making the application more accessible and easier to use.
