# ACS Knowledge Extractor Components

A comprehensive UI component system for the ACS Knowledge Extractor feature, designed to integrate seamlessly with the CFI Handbook dashboard.

## Component Architecture

### Main Container

- **`ACSExtractorPage`** - Main orchestrator component that manages state and coordinates all child components

### Core Components

#### 1. File Upload Interface

- **`FileUploadZone`** - Drag & drop file upload with validation
  - Supports PDF, images, and text files
  - Visual file previews for images
  - File validation and error handling
  - Progress tracking during upload
  - Free tier limitations (3 files per session)

#### 2. Processing States

- **`ProcessingStatus`** - Real-time processing feedback
  - Step-by-step progress visualization
  - Upload and processing progress bars
  - Estimated time remaining
  - Cancelable operations

#### 3. Analytics & Results

- **`AnalyticsDashboard`** - Performance metrics visualization
  - Overall score and statistics
  - Knowledge area breakdown
  - Performance distribution charts
  - Strengths and improvement areas

- **`ResultsDisplay`** - Detailed ACS code results
  - Filterable ACS code list
  - Expandable details for each code
  - Performance indicators
  - Export functionality
  - Personalized recommendations

#### 4. Feature Management

- **`FeatureLimitsNotice`** - Free tier limitations and upgrade prompts
  - Clear feature comparison
  - Premium feature preview
  - Usage tracking
  - Call-to-action for upgrades

## Design System Integration

### Design Tokens

- Uses existing CFI Handbook design system
- Consistent color palette with aviation theme
- Professional typography (DM Sans)
- Standardized spacing and layout

### Component Patterns

- Card-based layouts for content organization
- Consistent button styles and variants
- Accessible color coding for performance levels
- Mobile-first responsive design

### Performance Indicators

```typescript
const PERFORMANCE_LEVELS = {
  excellent: 'green' (90%+),
  proficient: 'blue' (80-89%),
  'needs-improvement': 'yellow' (70-79%),
  unsatisfactory: 'red' (<70%)
}
```

## Accessibility Features

### WCAG 2.1 AA Compliance

- Proper color contrast ratios
- Keyboard navigation support
- Screen reader friendly labels
- Focus management for modals
- Alternative text for icons

### Interactive Elements

- Clear focus indicators
- Descriptive button labels
- Progress announcements
- Error message accessibility

## Mobile Responsiveness

### Breakpoint Strategy

- **Mobile First**: Base styles for mobile devices
- **Tablet (md)**: 768px+ adjustments
- **Desktop (lg)**: 1024px+ full layout
- **Large (xl)**: 1280px+ optimal spacing

### Mobile Optimizations

- Touch-friendly interactive areas
- Simplified navigation
- Stacked layouts for narrow screens
- Optimized file upload interface

## State Management

### Component State

```typescript
type ProcessingState = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

type ExtractedData = {
  acsCodes: ACSCode[];
  performance: PerformanceMetrics;
  recommendations: string[];
  timestamp: Date;
};
```

### Error Handling

- Comprehensive error boundaries
- User-friendly error messages
- Retry mechanisms
- Graceful degradation

## Integration Points

### Dashboard Integration

- Uses `DashboardLayout` wrapper
- Consistent navigation
- Shared footer and header

### Route Structure

```
/dashboard/acs-extractor
├── page.tsx (main page)
├── loading.tsx (loading state)
└── components/
    ├── ACSExtractorPage.tsx
    ├── FileUploadZone.tsx
    ├── ProcessingStatus.tsx
    ├── AnalyticsDashboard.tsx
    ├── ResultsDisplay.tsx
    └── FeatureLimitsNotice.tsx
```

## Future Enhancements

### Phase 2 Features

- Real-time processing API integration
- Historical data persistence
- Advanced analytics charts
- Batch processing capabilities

### Performance Optimizations

- Lazy loading for large result sets
- Virtual scrolling for extensive lists
- Image optimization for previews
- Progressive data loading

## Usage Example

```tsx
import { ACSExtractorPage } from '@/components/acs-extractor';

export default function Page() {
  return (
    <DashboardLayout locale="en">
      <ACSExtractorPage />
    </DashboardLayout>
  );
}
```

## Testing Strategy

### Component Tests

- File upload validation
- Processing state transitions
- Results filtering and display
- Accessibility compliance

### Integration Tests

- End-to-end upload workflow
- Dashboard navigation
- Error scenarios
- Performance benchmarks
