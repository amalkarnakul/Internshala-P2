import { useState, useCallback, useRef, useEffect } from 'react';
import { TreeNode, FlatTreeNode, TreeDataLoader, ComboboxState } from '../types/tree';

export function useTreeData<T = any>(loader: TreeDataLoader<T>) {
  const [state, setState] = useState<ComboboxState<T>>({
    isOpen: false,
    searchTerm: '',
    focusedIndex: -1,
    expandedNodes: new Set(),
    selection: { selected: new Set(), indeterminate: new Set() },
    flatNodes: [],
    isLoading: false,
  });

  const loadingNodes = useRef<Set<string>>(new Set());
  const nodeCache = useRef<Map<string, TreeNode<T>[]>>(new Map());

  const flattenTree = useCallback((nodes: TreeNode<T>[], searchTerm?: string): FlatTreeNode<T>[] => {
    const result: FlatTreeNode<T>[] = [];
    let index = 0;

    const traverse = (nodes: TreeNode<T>[], level = 0, parentPath: string[] = []): void => {
      for (const node of nodes) {
        const currentPath = [...parentPath, node.id];
        const isVisible = !searchTerm || 
          node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          currentPath.some(id => {
            const foundNode = result.find(n => n.id === id);
            return foundNode?.label.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
          });

        if (isVisible) {
          result.push({
            ...node,
            index: index++,
            isVisible: true,
            level,
            path: currentPath,
          });
        }

        if (node.children && (state.expandedNodes.has(node.id) || searchTerm)) {
          traverse(node.children, level + 1, currentPath);
        }
      }
    };

    traverse(nodes);
    return result;
  }, [state.expandedNodes]);

  const loadChildren = useCallback(async (nodeId: string | null, searchTerm?: string) => {
    if (loadingNodes.current.has(nodeId || 'root')) return;

    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    loadingNodes.current.add(nodeId || 'root');

    try {
      const children = await loader.loadChildren(nodeId, searchTerm);
      nodeCache.current.set(nodeId || 'root', children);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        flatNodes: flattenTree(nodeId ? prev.flatNodes : children, searchTerm),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data',
      }));
    } finally {
      loadingNodes.current.delete(nodeId || 'root');
    }
  }, [loader, flattenTree]);

  const expandNode = useCallback(async (nodeId: string) => {
    const node = state.flatNodes.find(n => n.id === nodeId);
    if (!node || state.expandedNodes.has(nodeId)) return;

    setState(prev => ({
      ...prev,
      expandedNodes: new Set([...prev.expandedNodes, nodeId]),
    }));

    if (node.hasChildren && !node.children?.length) {
      await loadChildren(nodeId);
    }
  }, [state.flatNodes, state.expandedNodes, loadChildren]);

  const collapseNode = useCallback((nodeId: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedNodes);
      newExpanded.delete(nodeId);
      return {
        ...prev,
        expandedNodes: newExpanded,
        flatNodes: flattenTree(prev.flatNodes, prev.searchTerm),
      };
    });
  }, [flattenTree]);

  const updateSelection = useCallback((nodeId: string, selected: boolean) => {
    setState(prev => {
      const newSelected = new Set(prev.selection.selected);
      const newIndeterminate = new Set(prev.selection.indeterminate);

      if (selected) {
        newSelected.add(nodeId);
      } else {
        newSelected.delete(nodeId);
      }

      // Update parent indeterminate states
      const node = prev.flatNodes.find(n => n.id === nodeId);
      if (node?.parentId) {
        const siblings = prev.flatNodes.filter(n => n.parentId === node.parentId);
        const selectedSiblings = siblings.filter(s => newSelected.has(s.id));
        
        if (selectedSiblings.length === 0) {
          newIndeterminate.delete(node.parentId);
        } else if (selectedSiblings.length === siblings.length) {
          newSelected.add(node.parentId);
          newIndeterminate.delete(node.parentId);
        } else {
          newIndeterminate.add(node.parentId);
          newSelected.delete(node.parentId);
        }
      }

      return {
        ...prev,
        selection: { selected: newSelected, indeterminate: newIndeterminate },
      };
    });
  }, []);

  const search = useCallback(async (searchTerm: string) => {
    setState(prev => ({ ...prev, searchTerm, isLoading: true }));

    try {
      if (loader.searchNodes && searchTerm.trim()) {
        const results = await loader.searchNodes(searchTerm);
        setState(prev => ({
          ...prev,
          flatNodes: flattenTree(results, searchTerm),
          isLoading: false,
        }));
      } else {
        const rootNodes = nodeCache.current.get('root') || [];
        setState(prev => ({
          ...prev,
          flatNodes: flattenTree(rootNodes, searchTerm),
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Search failed',
      }));
    }
  }, [loader, flattenTree]);

  // Initialize with root data
  useEffect(() => {
    loadChildren(null);
  }, [loadChildren]);

  return {
    state,
    actions: {
      expandNode,
      collapseNode,
      updateSelection,
      search,
      loadChildren,
      setState,
    },
  };
}