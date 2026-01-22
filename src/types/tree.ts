export interface TreeNode<T = any> {
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

export interface FlatTreeNode<T = any> extends TreeNode<T> {
  index: number;
  isVisible: boolean;
}

export interface TreeDataLoader<T = any> {
  loadChildren: (nodeId: string | null, searchTerm?: string) => Promise<TreeNode<T>[]>;
  searchNodes?: (searchTerm: string, maxResults?: number) => Promise<TreeNode<T>[]>;
}

export interface SelectionState {
  selected: Set<string>;
  indeterminate: Set<string>;
}

export interface ComboboxState<T = any> {
  isOpen: boolean;
  searchTerm: string;
  focusedIndex: number;
  expandedNodes: Set<string>;
  selection: SelectionState;
  flatNodes: FlatTreeNode<T>[];
  isLoading: boolean;
  error?: string;
}

export interface VirtualizationConfig {
  itemHeight: number;
  containerHeight: number;
  overscan: number;
}

export interface AccessibilityConfig {
  announceSelections: boolean;
  announceExpansions: boolean;
  announceLoading: boolean;
}