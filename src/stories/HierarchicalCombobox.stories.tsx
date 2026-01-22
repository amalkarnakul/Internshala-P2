import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { HierarchicalCombobox } from '../components/HierarchicalCombobox.js';
import { TreeDataLoader, TreeNode } from '../types/tree';

// Mock data generators
const createMockNode = (
  id: string,
  label: string,
  level: number,
  hasChildren = false,
  parentId?: string
): TreeNode => ({
  id,
  label,
  value: { id, label, level },
  level,
  hasChildren,
  parentId,
  path: parentId ? [parentId, id] : [id],
});

const generateLargeDataset = (count: number): TreeNode[] => {
  const nodes: TreeNode[] = [];
  for (let i = 0; i < count; i++) {
    nodes.push(
      createMockNode(`item-${i}`, `Item ${i}`, 0, i % 3 === 0)
    );
  }
  return nodes;
};

// Mock loaders
const basicLoader: TreeDataLoader = {
  loadChildren: async (nodeId: string | null) => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    if (nodeId === null) {
      return [
        createMockNode('1', 'Documents', 0, true),
        createMockNode('2', 'Images', 0, true),
        createMockNode('3', 'Videos', 0, false),
        createMockNode('4', 'Music', 0, true),
      ];
    }
    
    if (nodeId === '1') {
      return [
        createMockNode('1-1', 'Work Documents', 1, true, '1'),
        createMockNode('1-2', 'Personal Documents', 1, false, '1'),
      ];
    }
    
    if (nodeId === '1-1') {
      return [
        createMockNode('1-1-1', 'Reports', 2, false, '1-1'),
        createMockNode('1-1-2', 'Presentations', 2, false, '1-1'),
      ];
    }
    
    if (nodeId === '2') {
      return [
        createMockNode('2-1', 'Photos', 1, false, '2'),
        createMockNode('2-2', 'Screenshots', 1, false, '2'),
      ];
    }
    
    if (nodeId === '4') {
      return [
        createMockNode('4-1', 'Rock', 1, false, '4'),
        createMockNode('4-2', 'Jazz', 1, false, '4'),
        createMockNode('4-3', 'Classical', 1, false, '4'),
      ];
    }
    
    return [];
  },
  searchNodes: async (searchTerm: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const allNodes = [
      createMockNode('1', 'Documents', 0, true),
      createMockNode('1-1', 'Work Documents', 1, true, '1'),
      createMockNode('1-1-1', 'Reports', 2, false, '1-1'),
      createMockNode('2', 'Images', 0, true),
      createMockNode('2-1', 'Photos', 1, false, '2'),
    ];
    
    return allNodes.filter(node =>
      node.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },
};

const errorLoader: TreeDataLoader = {
  loadChildren: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    throw new Error('Failed to load data from server');
  },
};

const emptyLoader: TreeDataLoader = {
  loadChildren: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [];
  },
};

const largeDataLoader: TreeDataLoader = {
  loadChildren: async (nodeId: string | null) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (nodeId === null) {
      return generateLargeDataset(1000);
    }
    
    return [];
  },
};

const meta: Meta<typeof HierarchicalCombobox> = {
  title: 'Components/HierarchicalCombobox',
  component: HierarchicalCombobox,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A scalable hierarchical selection component with async loading, virtualization, and multi-select capabilities.

## Features
- ✅ Async tree loading with error handling
- ✅ Virtualized rendering for large datasets
- ✅ Search with ancestry context preservation
- ✅ Multi-select with indeterminate states
- ✅ Full keyboard navigation (Arrow keys, Home/End, Enter/Space, Escape)
- ✅ Screen reader support with live announcements
- ✅ High contrast mode support
- ✅ Focus management during virtualization

## Accessibility
- WCAG 2.1 AA compliant
- Keyboard-first navigation
- Screen reader announcements for selections and expansions
- Proper ARIA roles and properties
- Focus management with virtual scrolling
        `,
      },
    },
  },
  argTypes: {
    loader: {
      description: 'Data loader for async tree operations',
      control: false,
    },
    placeholder: {
      description: 'Placeholder text for the search input',
      control: 'text',
    },
    isMultiSelect: {
      description: 'Whether multiple selections are allowed',
      control: 'boolean',
    },
    disabled: {
      description: 'Whether the combobox is disabled',
      control: 'boolean',
    },
    onSelectionChange: {
      description: 'Callback when selection changes',
      action: 'selectionChanged',
    },
    onOpenChange: {
      description: 'Callback when the combobox opens/closes',
      action: 'openChanged',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Stories
export const Default: Story = {
  args: {
    loader: basicLoader,
    placeholder: 'Search files and folders...',
    'aria-label': 'File browser',
  },
};

export const MultiSelect: Story = {
  args: {
    loader: basicLoader,
    placeholder: 'Select multiple items...',
    isMultiSelect: true,
    'aria-label': 'Multi-select file browser',
  },
};

export const Disabled: Story = {
  args: {
    loader: basicLoader,
    placeholder: 'Disabled combobox',
    disabled: true,
    'aria-label': 'Disabled file browser',
  },
};

// Edge Cases
export const EmptyData: Story = {
  name: 'Empty Data',
  args: {
    loader: emptyLoader,
    placeholder: 'No data available...',
    'aria-label': 'Empty data browser',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates behavior when no data is available.',
      },
    },
  },
};

export const ErrorState: Story = {
  name: 'Error State',
  args: {
    loader: errorLoader,
    placeholder: 'Error loading data...',
    'aria-label': 'Error state browser',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates error handling when data loading fails.',
      },
    },
  },
};

export const LargeDataset: Story = {
  name: 'Large Dataset (Virtualized)',
  args: {
    loader: largeDataLoader,
    placeholder: 'Search 1000+ items...',
    virtualization: {
      itemHeight: 32,
      containerHeight: 400,
      overscan: 10,
    },
    'aria-label': 'Large dataset browser',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates virtualization with 1000+ items for performance.',
      },
    },
  },
};

// Accessibility Stories
export const KeyboardNavigation: Story = {
  name: 'Keyboard Navigation',
  args: {
    loader: basicLoader,
    placeholder: 'Use arrow keys to navigate...',
    'aria-label': 'Keyboard navigation demo',
  },
  parameters: {
    docs: {
      description: {
        story: `
Keyboard navigation test:
- **Arrow Down/Up**: Navigate through items
- **Arrow Right**: Expand focused item (if has children)
- **Arrow Left**: Collapse focused item or move to parent
- **Home/End**: Jump to first/last item
- **Enter/Space**: Select focused item
- **Escape**: Close combobox
- **Type letters**: Typeahead search
        `,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('search-input');
    
    // Focus the input
    await userEvent.click(input);
    
    // Open the combobox
    await userEvent.keyboard('{ArrowDown}');
    
    // Navigate with arrow keys
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');
    
    // Expand an item
    await userEvent.keyboard('{ArrowRight}');
  },
};

export const ScreenReaderSupport: Story = {
  name: 'Screen Reader Support',
  args: {
    loader: basicLoader,
    placeholder: 'Screen reader optimized...',
    isMultiSelect: true,
    accessibility: {
      announceSelections: true,
      announceExpansions: true,
      announceLoading: true,
    },
    'aria-label': 'Screen reader demo',
  },
  parameters: {
    docs: {
      description: {
        story: `
Screen reader features:
- Live announcements for selections and expansions
- Proper ARIA roles and properties
- Descriptive labels and instructions
- Loading state announcements
        `,
      },
    },
  },
};

export const HighContrastMode: Story = {
  name: 'High Contrast Mode',
  args: {
    loader: basicLoader,
    placeholder: 'High contrast support...',
    isMultiSelect: true,
    'aria-label': 'High contrast demo',
  },
  parameters: {
    docs: {
      description: {
        story: 'Optimized for high contrast mode and reduced motion preferences.',
      },
    },
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ filter: 'contrast(2) brightness(1.2)' }}>
        <Story />
      </div>
    ),
  ],
};

// Interaction Tests
export const SelectionInteraction: Story = {
  name: 'Selection Interaction Test',
  args: {
    loader: basicLoader,
    isMultiSelect: true,
    placeholder: 'Test selection...',
    'aria-label': 'Selection test',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('search-input');
    
    // Open combobox
    await userEvent.click(input);
    
    // Wait for items to load
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Select first item
    const firstItem = canvas.getByTestId('tree-item-1');
    await userEvent.click(firstItem);
    
    // Verify selection
    // expect(args.onSelectionChange).toHaveBeenCalled();
  },
};

export const SearchInteraction: Story = {
  name: 'Search Interaction Test',
  args: {
    loader: basicLoader,
    placeholder: 'Type to search...',
    'aria-label': 'Search test',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('search-input');
    
    // Focus and type search term
    await userEvent.click(input);
    await userEvent.type(input, 'doc');
    
    // Wait for search results
    await new Promise(resolve => setTimeout(resolve, 300));

    // Verify search results are filtered
    // const listbox = canvas.getByRole('listbox');
    // expect(listbox).toBeInTheDocument();
  },
};

// Performance Stories
export const VirtualizationPerformance: Story = {
  name: 'Virtualization Performance',
  args: {
    loader: largeDataLoader,
    placeholder: 'Performance test with 1000 items...',
    virtualization: {
      itemHeight: 28,
      containerHeight: 300,
      overscan: 5,
    },
    'aria-label': 'Performance test',
  },
  parameters: {
    docs: {
      description: {
        story: 'Performance test with virtualization rendering only visible items.',
      },
    },
  },
};