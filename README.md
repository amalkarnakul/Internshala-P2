# Hierarchical Combobox

A scalable hierarchical selection component built from scratch with async loading, virtualization, and multi-select capabilities. Fully compliant with WCAG 2.1 AA accessibility standards.

## ✅ Features

- **Async Tree Loading**: Load tree data on-demand with error handling
- **Virtualized Rendering**: Handle large datasets (1000+ items) with smooth scrolling
- **Search with Context**: Search with ancestry context preservation
- **Multi-Select Support**: Indeterminate states and tag rendering
- **Keyboard-First UX**: Complete keyboard navigation contract
- **Screen Reader Parity**: Full accessibility with live announcements
- **High Contrast Support**: Optimized for accessibility preferences
- **Performance Optimized**: Intentional memoization and minimal re-renders

## 🚀 Tech Stack

Built with the mandatory tech stack requirements:

- **React 18+** with TypeScript (strict mode)
- **Vite** for build tooling
- **Tailwind CSS** with design token abstractions
- **Storybook** for component development
- **Testing Library** for interaction tests
- **axe-core** for accessibility validation

## 🚀 Live Demo

- **🌐 Storybook Preview**: [Deploy on Vercel](https://vercel.com/new/clone?repository-url=https://github.com/amalkarnakul/Internshala-P2&build-command=npm%20run%20build-storybook&output-directory=storybook-static)
- **📖 Documentation**: Complete component library with interactive examples
- **♿ Accessibility Testing**: Built-in a11y validation tools

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

```bash
# Start development server
npm run dev

# Run Storybook
npm run storybook

# Run tests
npm test

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📖 Usage

### Basic Example

```tsx
import { HierarchicalCombobox, TreeDataLoader } from 'hierarchical-combobox';

const loader: TreeDataLoader = {
  loadChildren: async (nodeId: string | null) => {
    // Load children for the given node
    const response = await fetch(`/api/nodes/${nodeId || 'root'}`);
    return response.json();
  },
  searchNodes: async (searchTerm: string) => {
    // Search nodes by term
    const response = await fetch(`/api/search?q=${searchTerm}`);
    return response.json();
  },
};

function MyComponent() {
  return (
    <HierarchicalCombobox
      loader={loader}
      placeholder="Search items..."
      onSelectionChange={(selectedIds, selectedNodes) => {
        console.log('Selection changed:', { selectedIds, selectedNodes });
      }}
    />
  );
}
```

### Multi-Select with Tags

```tsx
<HierarchicalCombobox
  loader={loader}
  isMultiSelect={true}
  placeholder="Select multiple items..."
  onSelectionChange={(selectedIds, selectedNodes) => {
    // Handle multi-selection
  }}
/>
```

### Large Dataset with Virtualization

```tsx
<HierarchicalCombobox
  loader={loader}
  virtualization={{
    itemHeight: 32,
    containerHeight: 400,
    overscan: 10,
  }}
  placeholder="Search 1000+ items..."
/>
```

## 🎯 API Reference

### HierarchicalComboboxProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loader` | `TreeDataLoader<T>` | **Required** | Data loader for async tree operations |
| `placeholder` | `string` | `"Search..."` | Placeholder text for search input |
| `isMultiSelect` | `boolean` | `false` | Enable multi-selection mode |
| `virtualization` | `Partial<VirtualizationConfig>` | `{}` | Virtualization settings |
| `accessibility` | `Partial<AccessibilityConfig>` | `{}` | Accessibility settings |
| `onSelectionChange` | `(ids: string[], nodes: T[]) => void` | - | Selection change callback |
| `onOpenChange` | `(isOpen: boolean) => void` | - | Open state change callback |
| `disabled` | `boolean` | `false` | Disable the combobox |
| `className` | `string` | `""` | Additional CSS classes |
| `aria-label` | `string` | - | ARIA label for accessibility |
| `aria-labelledby` | `string` | - | ARIA labelledby reference |

### TreeDataLoader Interface

```tsx
interface TreeDataLoader<T = any> {
  loadChildren: (nodeId: string | null, searchTerm?: string) => Promise<TreeNode<T>[]>;
  searchNodes?: (searchTerm: string, maxResults?: number) => Promise<TreeNode<T>[]>;
}
```

### TreeNode Interface

```tsx
interface TreeNode<T = any> {
  id: string;
  label: string;
  value: T;
  children?: TreeNode<T>[];
  hasChildren?: boolean;
  isLoading?: boolean;
  isExpanded?: boolean;
  level: number;
  parentId?: string;
  path: string[];
}
```

## ⌨️ Keyboard Navigation

| Key | Action |
|-----|--------|
| `Arrow Down/Up` | Navigate through items |
| `Arrow Right` | Expand focused item (if has children) |
| `Arrow Left` | Collapse focused item or move to parent |
| `Home/End` | Jump to first/last item |
| `Enter/Space` | Select focused item |
| `Escape` | Close combobox |
| `Tab` | Move focus out of component |
| `Type letters` | Typeahead search within items |

## ♿ Accessibility Features

- **WCAG 2.1 AA Compliant**: Meets all accessibility guidelines
- **Keyboard Navigation**: Full keyboard support without mouse dependency
- **Screen Reader Support**: Proper ARIA roles and live announcements
- **Focus Management**: Stable focus during virtualization
- **High Contrast Mode**: Optimized for high contrast preferences
- **Reduced Motion**: Respects user motion preferences

## 🧪 Testing

The component includes comprehensive tests covering:

- **Keyboard Interactions**: All navigation patterns
- **Accessibility Constraints**: ARIA compliance and screen reader support
- **Error Handling**: Network failures and edge cases
- **Performance**: Virtualization with large datasets
- **Multi-select Logic**: Indeterminate states and tag management

Run tests:
```bash
npm test
```

## 📚 Storybook

View all component variations and edge cases in Storybook:

```bash
npm run storybook
```

Stories include:
- Basic usage examples
- Error states and loading states
- Large dataset performance
- Keyboard navigation demos
- High contrast mode
- Screen reader optimization

## 🏗️ Architecture

### Custom Hooks

- **`useTreeData`**: Manages tree state, loading, and selection
- **`useVirtualization`**: Handles virtual scrolling for performance
- **`useKeyboardNavigation`**: Implements keyboard interaction patterns
- **`useAccessibilityAnnouncements`**: Manages screen reader announcements

### Performance Optimizations

- **Virtualization**: Only renders visible items
- **Intentional Memoization**: Strategic use of `useMemo` and `useCallback`
- **Minimal Re-renders**: Optimized state updates
- **Async Loading**: On-demand data fetching

### Accessibility Implementation

- **Proper ARIA Roles**: `combobox`, `listbox`, `option`
- **Live Regions**: Announcements for state changes
- **Focus Management**: Maintains focus during virtual scrolling
- **Keyboard Contracts**: Standard combobox interaction patterns

## 🎨 Styling

Built with Tailwind CSS using design token abstractions:

```css
/* Design tokens in CSS variables */
:root {
  --color-primary-500: #3b82f6;
  --spacing-md: 1rem;
  --radius-md: 0.375rem;
  /* ... */
}
```

Supports:
- Light/dark themes
- High contrast mode
- Custom color schemes
- Responsive design

## 🚫 What's NOT Used

This component is built entirely from scratch without:

- ❌ Component libraries (MUI, Ant Design, Radix, etc.)
- ❌ Virtualization libraries (react-window, tanstack/virtual)
- ❌ Selection libraries (downshift, react-select)
- ❌ Utility libraries for core functionality
- ❌ AI-generated code patterns

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure accessibility compliance
6. Submit a pull request

## 📞 Support

For questions or issues, please open a GitHub issue with:
- Component version
- Browser and OS information
- Minimal reproduction example
- Expected vs actual behavior
