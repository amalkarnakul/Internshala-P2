import { useCallback, useRef, useEffect } from 'react';
import { FlatTreeNode } from '../types/tree';

interface KeyboardNavigationConfig {
  onSelect: (nodeId: string) => void;
  onToggleExpansion: (nodeId: string) => void;
  onClose: () => void;
  onSearch: (term: string) => void;
  isMultiSelect: boolean;
}

export function useKeyboardNavigation<T>(
  nodes: FlatTreeNode<T>[],
  focusedIndex: number,
  setFocusedIndex: (index: number) => void,
  config: KeyboardNavigationConfig
): {
  handleKeyDown: (event: React.KeyboardEvent) => void;
  focusedNodeId: string | null;
} {
  const searchBuffer = useRef('');
  const searchTimeout = useRef<NodeJS.Timeout>();

  const focusedNodeId = nodes[focusedIndex]?.id ?? null;

  const moveFocus = useCallback(
    (direction: 'up' | 'down' | 'first' | 'last') => {
      if (nodes.length === 0) return;

      let newIndex = focusedIndex;

      switch (direction) {
        case 'up':
          newIndex = Math.max(0, focusedIndex - 1);
          break;
        case 'down':
          newIndex = Math.min(nodes.length - 1, focusedIndex + 1);
          break;
        case 'first':
          newIndex = 0;
          break;
        case 'last':
          newIndex = nodes.length - 1;
          break;
      }

      setFocusedIndex(newIndex);
    },
    [nodes.length, focusedIndex, setFocusedIndex]
  );

  const handleTypeahead = useCallback(
    (char: string) => {
      // Clear previous timeout
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      // Add character to search buffer
      searchBuffer.current += char.toLowerCase();

      // Find matching node
      const matchingIndex = nodes.findIndex((node, index) =>
        index > focusedIndex &&
        node.label.toLowerCase().startsWith(searchBuffer.current)
      );

      if (matchingIndex !== -1) {
        setFocusedIndex(matchingIndex);
      } else {
        // Search from beginning if no match found after current position
        const matchingFromStart = nodes.findIndex((node) =>
          node.label.toLowerCase().startsWith(searchBuffer.current)
        );
        if (matchingFromStart !== -1) {
          setFocusedIndex(matchingFromStart);
        }
      }

      // Clear search buffer after delay
      searchTimeout.current = setTimeout(() => {
        searchBuffer.current = '';
      }, 1000);
    },
    [nodes, focusedIndex, setFocusedIndex]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const focusedNode = nodes[focusedIndex];

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          moveFocus('down');
          break;

        case 'ArrowUp':
          event.preventDefault();
          moveFocus('up');
          break;

        case 'Home':
          event.preventDefault();
          moveFocus('first');
          break;

        case 'End':
          event.preventDefault();
          moveFocus('last');
          break;

        case 'ArrowRight':
          event.preventDefault();
          if (focusedNode && focusedNode.hasChildren) {
            config.onToggleExpansion(focusedNode.id);
          }
          break;

        case 'ArrowLeft':
          event.preventDefault();
          if (focusedNode) {
            if (focusedNode.isExpanded) {
              config.onToggleExpansion(focusedNode.id);
            } else if (focusedNode.parentId) {
              // Move focus to parent
              const parentIndex = nodes.findIndex(
                (node) => node.id === focusedNode.parentId
              );
              if (parentIndex !== -1) {
                setFocusedIndex(parentIndex);
              }
            }
          }
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedNode) {
            config.onSelect(focusedNode.id);
          }
          break;

        case 'Escape':
          event.preventDefault();
          config.onClose();
          break;

        case 'Tab':
          // Allow default tab behavior to move focus out of component
          config.onClose();
          break;

        default:
          // Handle typeahead search
          if (
            event.key.length === 1 &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.metaKey
          ) {
            event.preventDefault();
            handleTypeahead(event.key);
          }
          break;
      }
    },
    [nodes, focusedIndex, moveFocus, config, handleTypeahead, setFocusedIndex]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  return {
    handleKeyDown,
    focusedNodeId,
  };
}