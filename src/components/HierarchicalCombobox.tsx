import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { TreeDataLoader, VirtualizationConfig, AccessibilityConfig } from '../types/tree';
import { useTreeData } from '../hooks/useTreeData';
import { useVirtualization } from '../hooks/useVirtualization';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useAccessibilityAnnouncements } from '../hooks/useAccessibilityAnnouncements';
import { TreeItem } from './TreeItem.js';
import { SearchInput } from './SearchInput.js';
import { SelectedTags } from './SelectedTags.js';
import '../styles/globals.css';

export interface HierarchicalComboboxProps<T = any> {
  /** Data loader for async tree operations */
  loader: TreeDataLoader<T>;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Whether multiple selections are allowed */
  isMultiSelect?: boolean;
  /** Virtualization configuration */
  virtualization?: Partial<VirtualizationConfig>;
  /** Accessibility configuration */
  accessibility?: Partial<AccessibilityConfig>;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[], selectedNodes: any[]) => void;
  /** Callback when the combobox opens/closes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Custom class name for the container */
  className?: string;
  /** Whether the combobox is disabled */
  disabled?: boolean;
  /** ARIA label for the combobox */
  'aria-label'?: string;
  /** ARIA labelledby for the combobox */
  'aria-labelledby'?: string;
}

const DEFAULT_VIRTUALIZATION: VirtualizationConfig = {
  itemHeight: 32,
  containerHeight: 300,
  overscan: 5,
};

const DEFAULT_ACCESSIBILITY: AccessibilityConfig = {
  announceSelections: true,
  announceExpansions: true,
  announceLoading: true,
};

export function HierarchicalCombobox<T = any>({
  loader,
  placeholder = 'Search...',
  isMultiSelect = false,
  virtualization = {},
  accessibility = {},
  onSelectionChange,
  onOpenChange,
  className = '',
  disabled = false,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: HierarchicalComboboxProps<T>): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const comboboxId = useRef(`combobox-${Math.random().toString(36).substr(2, 9)}`);

  const virtualizationConfig = useMemo(
    () => ({ ...DEFAULT_VIRTUALIZATION, ...virtualization }),
    [virtualization]
  );

  const accessibilityConfig = useMemo(
    () => ({ ...DEFAULT_ACCESSIBILITY, ...accessibility }),
    [accessibility]
  );

  const { state, actions } = useTreeData(loader);
  const { scrollElementProps, getItemProps } = useVirtualization(
    state.flatNodes.length,
    virtualizationConfig
  );

  const {
    announceSelection,
    announceExpansion,
    announceLoading,
    announceError,
    LiveRegion,
  } = useAccessibilityAnnouncements(accessibilityConfig);

  const handleToggleOpen = useCallback(() => {
    if (disabled) return;
    
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    onOpenChange?.(newIsOpen);

    if (newIsOpen) {
      // Focus the input when opening
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen, disabled, onOpenChange]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
    inputRef.current?.focus();
  }, [onOpenChange]);

  const handleSelect = useCallback(
    (nodeId: string) => {
      const node = state.flatNodes.find((n) => n.id === nodeId);
      if (!node) return;

      const isCurrentlySelected = state.selection.selected.has(nodeId);
      actions.updateSelection(nodeId, !isCurrentlySelected);

      // Announce selection
      announceSelection(
        node.label,
        !isCurrentlySelected,
        state.selection.selected.size + (isCurrentlySelected ? -1 : 1)
      );

      // Notify parent component
      const selectedNodes = state.flatNodes.filter((n) =>
        state.selection.selected.has(n.id)
      );
      onSelectionChange?.(Array.from(state.selection.selected), selectedNodes);

      // Close if single select
      if (!isMultiSelect) {
        handleClose();
      }
    },
    [
      state.flatNodes,
      state.selection.selected,
      actions,
      announceSelection,
      onSelectionChange,
      isMultiSelect,
      handleClose,
    ]
  );

  const handleToggleExpansion = useCallback(
    async (nodeId: string) => {
      const node = state.flatNodes.find((n) => n.id === nodeId);
      if (!node) return;

      const isExpanded = state.expandedNodes.has(nodeId);

      if (isExpanded) {
        actions.collapseNode(nodeId);
        announceExpansion(node.label, false);
      } else {
        await actions.expandNode(nodeId);
        announceExpansion(node.label, true, node.children?.length);
      }
    },
    [state.flatNodes, state.expandedNodes, actions, announceExpansion]
  );

  const { handleKeyDown, focusedNodeId } = useKeyboardNavigation(
    state.flatNodes,
    state.focusedIndex,
    (index) => actions.setState((prev) => ({ ...prev, focusedIndex: index })),
    {
      onSelect: handleSelect,
      onToggleExpansion: handleToggleExpansion,
      onClose: handleClose,
      onSearch: actions.search,
      isMultiSelect,
    }
  );

  const handleSearch = useCallback(
    (searchTerm: string) => {
      actions.search(searchTerm);
      actions.setState((prev) => ({ ...prev, focusedIndex: 0 }));
    },
    [actions]
  );

  const handleRemoveTag = useCallback(
    (nodeId: string) => {
      handleSelect(nodeId);
    },
    [handleSelect]
  );

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, handleClose]);

  // Announce loading and error states
  useEffect(() => {
    if (state.isLoading) {
      announceLoading('Loading data...');
    }
  }, [state.isLoading, announceLoading]);

  useEffect(() => {
    if (state.error) {
      announceError(state.error);
    }
  }, [state.error, announceError]);

  const selectedNodes = useMemo(
    () => state.flatNodes.filter((node) => state.selection.selected.has(node.id)),
    [state.flatNodes, state.selection.selected]
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      data-testid="hierarchical-combobox"
    >
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-owns={isOpen ? `${comboboxId.current}-listbox` : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className="relative"
      >
        <SearchInput
          ref={inputRef}
          value={state.searchTerm}
          onChange={handleSearch}
          onToggle={handleToggleOpen}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          isOpen={isOpen}
          isLoading={state.isLoading}
          aria-activedescendant={
            focusedNodeId ? `${comboboxId.current}-option-${focusedNodeId}` : undefined
          }
        />

        {isMultiSelect && selectedNodes.length > 0 && (
          <SelectedTags
            nodes={selectedNodes}
            onRemove={handleRemoveTag}
            disabled={disabled}
          />
        )}

        {isOpen && (
          <div
            ref={listboxRef}
            id={`${comboboxId.current}-listbox`}
            role="listbox"
            aria-multiselectable={isMultiSelect}
            className="absolute z-50 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg"
            style={scrollElementProps.style}
            onScroll={scrollElementProps.onScroll}
          >
            {state.error ? (
              <div
                role="alert"
                className="p-md text-error-700 bg-error-50 border-l-4 border-error-500"
              >
                {state.error}
              </div>
            ) : state.flatNodes.length === 0 && !state.isLoading ? (
              <div className="p-md text-neutral-500 text-center">
                {state.searchTerm ? 'No results found' : 'No data available'}
              </div>
            ) : (
              <div
                style={{
                  height: state.flatNodes.length * virtualizationConfig.itemHeight,
                  position: 'relative',
                }}
              >
                {state.flatNodes.map((node, index) => (
                  <TreeItem
                    key={node.id}
                    node={node}
                    isSelected={state.selection.selected.has(node.id)}
                    isIndeterminate={state.selection.indeterminate.has(node.id)}
                    isFocused={focusedNodeId === node.id}
                    isExpanded={state.expandedNodes.has(node.id)}
                    onSelect={() => handleSelect(node.id)}
                    onToggleExpansion={() => handleToggleExpansion(node.id)}
                    isMultiSelect={isMultiSelect}
                    comboboxId={comboboxId.current}
                    {...getItemProps(index)}
                  />
                ))}
              </div>
            )}

            {state.isLoading && (
              <div className="p-md text-center text-neutral-600">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                  Loading...
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <LiveRegion />
    </div>
  );
}