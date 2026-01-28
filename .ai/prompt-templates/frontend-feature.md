# Frontend Feature Template

When creating a new feature:

1. **Create feature directory**: `features/[feature-name]/`
2. **Structure**:
   - `components/` - React components
   - `lib/` - Feature-specific utilities
   - `types/` - TypeScript types
   - `index.ts` - Public exports

3. **Component Guidelines**:
   - Prefer Server Components
   - Use Client Components only for interactivity
   - Use shadcn/ui components from `components/ui/`

4. **Example**:
```typescript
// features/my-feature/index.ts
export { MyFeatureComponent } from './components/MyFeatureComponent';
export type { MyFeatureType } from './types';

// features/my-feature/components/MyFeatureComponent.tsx
'use client'; // Only if needed
export function MyFeatureComponent() { ... }
```
