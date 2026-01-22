# API Documentation - Hierarchical Combobox

## Table of Contents
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Component API](#component-api)
- [Data Loader Interface](#data-loader-interface)
- [Type Definitions](#type-definitions)
- [Hooks API](#hooks-api)
- [Examples](#examples)
- [Migration Guide](#migration-guide)

## Installation

```bash
npm install hierarchical-combobox
```

## Quick Start

```tsx
import { HierarchicalCombobox, TreeDataLoader } from 'hierarchical-combobox';

const loader: TreeDataLoader = {
  loadChildren: async (nodeId) => {
    const response = await fetch(`/api/nodes/${nodeId || 'root'}`);
    return response.json();
  }
};

function App() {
  return (
    <HierarchicalCombobox
      loader={loader}
      placeholder="Search items..."
      onSelectionChange={(ids, nodes) => console.log(ids, nodes)}
    />
  );
}
```

## Component API

### HierarchicalCombobox

The main component for hierarchical selection with async loading and virtualization.

#### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `loader` | `TreeDataLoader<T>` | - | ✅ | Data loader for async tree operations |
| `placeholder` | `string` | `"Search..."` | ❌ | Placeholder text for search input |
| `isMultiSelect` | `boolean` | `false` | ❌ | Enable multi-selection mode |
| `virtualization` | `Partial<VirtualizationConfig>` | `{}` | ❌ | Virtualization configuration |
| `accessibility` | `Partial<AccessibilityConfig>` | `{}` | ❌ | Accessibility settings |
| `onSelectionChange` | `(ids: string[], nodes: T[]) => void` | - | ❌ | Selection change callback |
| `onOpenChange` | `(isOpen: boolean) => void` | - | ❌ | Open state change callback |
| `disabled` | `boolean` | `false` | ❌ | Disable the combobox |
| `className` | `string` | `""` | ❌ | Additional CSS classes |
| `aria-label` | `string` | - | ❌ | ARIA label for accessibility |
| `aria-labelledby` | `string` | - | ❌ | ARIA labelledby reference |

#### Example

```tsx
<HierarchicalCombobox
  loader={myDataLoader}
  placeholder="Select files..."
  isMultiSelect={true}
  virtualization={{
    itemHeight: 32,
    containerHeight: 400,
    overscan: 10
  }}
  accessibility={{
    announceSelections: true,
    announceExpansions: true,
    announceLoading: true
  }}
  onSelectionChange={(selectedIds, selectedNodes) => {
    console.log('Selected:', selectedIds);
    setSelection(selectedNodes);
  }}
  onOpenChange={(isOpen) => {
    console.log('Dropdown is', isOpen ? 'open' : 'closed');
  }}
  className="w-full max-w-md"
  aria-label="File browser"
/>
```

## Data Loader Interface

### TreeDataLoader<T>

Interface for loading tree data asynchronously.

```tsx
interface TreeDataLoader<T = any> {
  loadChildren: (nodeId: string | null, searchTerm?: string) => Promise<TreeNode<T>[]>;
  searchNodes?: (searchTerm: string, maxResults?: number) => Promise<TreeNode<T>[]>;
}
```

#### Methods

##### loadChildren(nodeId, searchTerm?)

Loads children for a given node.

**Parameters:**
- `nodeId: string | null` - Parent node ID, `null` for root nodes
- `searchTerm?: string` - Optional search term for filtering

**Returns:** `Promise<TreeNode<T>[]>` - Array of child nodes

**Example:**
```tsx
const loader: TreeDataLoader = {
  loadChildren: async (nodeId, searchTerm) => {
    const url = `/api/nodes/${nodeId || 'root'}`;
    const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
    
    const response = await fetch(url + params);
    if (!response.ok) {
      throw new Error(`Failed to load: ${response.statusText}`);
    }
    
    return response.json();
  }
};
```

##### searchNodes(searchTerm, maxResults?)

Optional method for global search across all nodes.

**Parameters:**
- `searchTerm: string` - Search query
- `maxResults?: number` - Maximum number of results

**Returns:** `Promise<TreeNode<T>[]>` - Array of matching nodes

**Example:**
```tsx
const loader: TreeDataLoader = {
  loadChildren: async (nodeId) => { /* ... */ },
  searchNodes: async (searchTerm, maxResults = 50) => {
    const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}&limit=${maxResults}`);
    return response.json();
  }
};
```

## Type Definitions

### TreeNode<T>

Represents a node in the tree structure.

```tsx
interface TreeNode<T = any> {
  id: string;                    // Unique identifier
  label: string;                 // Display text
  value: T;                      // Associated data
  children?: TreeNode<T>[];      // Child nodes (if loaded)
  hasChildren?: boolean;         // Whether node has children
  isLoading?: boolean;           // Loading state
  isExpanded?: boolean;          // Expansion state
  level: number;                 // Hierarchy level (0-based)
  parentId?: string;             // Parent node ID
  path: string[];                // Path from root to this node
}
```

### VirtualizationConfig

Configuration for virtual scrolling performance.

```tsx
interface VirtualizationConfig {
  itemHeight: number;            // Height of each item in pixels
  containerHeight: number;       // Height of scrollable container
  overscan: number;              // Number of items to render outside viewport
}
```

**Default values:**
```tsx
{
  itemHeight: 32,
  containerHeight: 300,
  overscan: 5
}
```

### AccessibilityConfig

Configuration for accessibility features.

```tsx
interface AccessibilityConfig {
  announceSelections: boolean;   // Announce selection changes
  announceExpansions: boolean;   // Announce expand/collapse
  announceLoading: boolean;      // Announce loading states
}
```

**Default values:**
```tsx
{
  announceSelections: true,
  announceExpansions: true,
  announceLoading: true
}
```

### SelectionState

Represents the current selection state.

```tsx
interface SelectionState {
  selected: Set<string>;         // Selected node IDs
  indeterminate: Set<string>;    // Indeterminate node IDs (partial selection)
}
```

## Hooks API

### useTreeData<T>(loader)

Custom hook for managing tree data state.

**Parameters:**
- `loader: TreeDataLoader<T>` - Data loader instance

**Returns:**
```tsx
{
  state: ComboboxState<T>;
  actions: {
    expandNode: (nodeId: string) => Promise<void>;
    collapseNode: (nodeId: string) => void;
    updateSelection: (nodeId: string, selected: boolean) => void;
    search: (searchTerm: string) => Promise<void>;
    loadChildren: (nodeId: string | null, searchTerm?: string) => Promise<void>;
    setState: React.Dispatch<React.SetStateAction<ComboboxState<T>>>;
  };
}
```

### useVirtualization(itemCount, config)

Custom hook for virtual scrolling.

**Parameters:**
- `itemCount: number` - Total number of items
- `config: VirtualizationConfig` - Virtualization settings

**Returns:**
```tsx
{
  state: VirtualizationState;
  scrollElementProps: {
    onScroll: (event: React.UIEvent<HTMLElement>) => void;
    style: React.CSSProperties;
  };
  getItemProps: (index: number) => {
    style: React.CSSProperties;
    'data-index': number;
  };
}
```

### useKeyboardNavigation(nodes, focusedIndex, setFocusedIndex, config)

Custom hook for keyboard navigation.

**Parameters:**
- `nodes: FlatTreeNode<T>[]` - Flattened tree nodes
- `focusedIndex: number` - Currently focused item index
- `setFocusedIndex: (index: number) => void` - Focus setter
- `config: KeyboardNavigationConfig` - Navigation configuration

**Returns:**
```tsx
{
  handleKeyDown: (event: React.KeyboardEvent) => void;
  focusedNodeId: string | null;
}
```

## Examples

### Basic File Browser

```tsx
import { HierarchicalCombobox, TreeDataLoader, TreeNode } from 'hierarchical-combobox';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: Date;
}

const fileLoader: TreeDataLoader<FileNode> = {
  loadChildren: async (nodeId) => {
    const response = await fetch(`/api/files/${nodeId || ''}`);
    const files = await response.json();
    
    return files.map((file: any): TreeNode<FileNode> => ({
      id: file.id,
      label: file.name,
      value: {
        name: file.name,
        type: file.type,
        size: file.size,
        modified: new Date(file.modified)
      },
      level: file.level,
      hasChildren: file.type === 'folder' && file.childCount > 0,
      path: file.path.split('/'),
      parentId: nodeId
    }));
  }
};

function FileBrowser() {
  const [selectedFiles, setSelectedFiles] = useState<FileNode[]>([]);

  return (
    <HierarchicalCombobox
      loader={fileLoader}
      placeholder="Browse files and folders..."
      isMultiSelect={true}
      onSelectionChange={(ids, nodes) => {
        setSelectedFiles(nodes.map(node => node.value));
      }}
      aria-label="File browser"
    />
  );
}
```

### Organization Chart

```tsx
interface Employee {
  name: string;
  title: string;
  department: string;
  email: string;
}

const orgLoader: TreeDataLoader<Employee> = {
  loadChildren: async (nodeId) => {
    const response = await fetch(`/api/org/${nodeId || 'ceo'}`);
    const employees = await response.json();
    
    return employees.map((emp: any): TreeNode<Employee> => ({
      id: emp.id,
      label: `${emp.name} - ${emp.title}`,
      value: {
        name: emp.name,
        title: emp.title,
        department: emp.department,
        email: emp.email
      },
      level: emp.level,
      hasChildren: emp.directReports > 0,
      path: emp.hierarchy,
      parentId: nodeId
    }));
  },
  
  searchNodes: async (searchTerm) => {
    const response = await fetch(`/api/org/search?q=${encodeURIComponent(searchTerm)}`);
    return response.json();
  }
};

function OrgChart() {
  return (
    <HierarchicalCombobox
      loader={orgLoader}
      placeholder="Search employees..."
      virtualization={{ containerHeight: 500 }}
      onSelectionChange={(ids, nodes) => {
        console.log('Selected employees:', nodes.map(n => n.value));
      }}
    />
  );
}
```

### Large Dataset with Performance Optimization

```tsx
const bigDataLoader: TreeDataLoader = {
  loadChildren: async (nodeId) => {
    // Simulate large dataset
    const response = await fetch(`/api/big-data/${nodeId || 'root'}?limit=1000`);
    return response.json();
  }
};

function BigDataBrowser() {
  return (
    <HierarchicalCombobox
      loader={bigDataLoader}
      placeholder="Search 10,000+ items..."
      virtualization={{
        itemHeight: 28,        // Smaller items for more density
        containerHeight: 600,  // Larger container
        overscan: 20          // More overscan for smooth scrolling
      }}
      accessibility={{
        announceSelections: true,
        announceExpansions: false,  // Reduce announcements for performance
        announceLoading: true
      }}
    />
  );
}
```

### Custom Error Handling

```tsx
const robustLoader: TreeDataLoader = {
  loadChildren: async (nodeId) => {
    try {
      const response = await fetch(`/api/nodes/${nodeId || 'root'}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Network error: Please check your connection');
      }
      throw error;
    }
  }
};

function RobustBrowser() {
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-red-600 underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <HierarchicalCombobox
        loader={robustLoader}
        placeholder="Browse with error handling..."
        onOpenChange={(isOpen) => {
          if (isOpen) setError(null); // Clear errors when opening
        }}
      />
    </div>
  );
}
```

## Migration Guide

### From v1.x to v2.x

#### Breaking Changes

1. **TreeNode interface changes:**
   ```tsx
   // v1.x
   interface TreeNode {
     id: string;
     name: string;  // ❌ Removed
     data: any;     // ❌ Removed
   }
   
   // v2.x
   interface TreeNode<T> {
     id: string;
     label: string; // ✅ Renamed from 'name'
     value: T;      // ✅ Renamed from 'data', now typed
   }
   ```

2. **Loader interface changes:**
   ```tsx
   // v1.x
   loadChildren(nodeId: string): Promise<TreeNode[]>
   
   // v2.x
   loadChildren(nodeId: string | null, searchTerm?: string): Promise<TreeNode<T>[]>
   ```

#### Migration Steps

1. **Update TreeNode properties:**
   ```tsx
   // Before
   const node = { id: '1', name: 'Item', data: { foo: 'bar' } };
   
   // After
   const node = { id: '1', label: 'Item', value: { foo: 'bar' } };
   ```

2. **Update loader implementation:**
   ```tsx
   // Before
   const loader = {
     loadChildren: async (nodeId: string) => { /* ... */ }
   };
   
   // After
   const loader = {
     loadChildren: async (nodeId: string | null, searchTerm?: string) => { /* ... */ }
   };
   ```

3. **Add TypeScript generics:**
   ```tsx
   // Before
   const loader: TreeDataLoader = { /* ... */ };
   
   // After
   interface MyData { name: string; type: string; }
   const loader: TreeDataLoader<MyData> = { /* ... */ };
   ```

---

**Version**: 2.0.0  
**Last Updated**: January 2026  
**License**: MIT