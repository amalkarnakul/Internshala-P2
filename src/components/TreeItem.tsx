import React, { useCallback } from 'react';
import { FlatTreeNode } from '../types/tree';

interface TreeItemProps<T = any> {
  node: FlatTreeNode<T>;
  isSelected: boolean;
  isIndeterminate: boolean;
  isFocused: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpansion: () => void;
  isMultiSelect: boolean;
  comboboxId: string;
  style: React.CSSProperties;
  'data-index': number;
}

export function TreeItem<T = any>({
  node,
  isSelected,
  isIndeterminate,
  isFocused,
  isExpanded,
  onSelect,
  onToggleExpansion,
  isMultiSelect,
  comboboxId,
  style,
  'data-index': dataIndex,
}: TreeItemProps<T>): JSX.Element {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      onSelect();
    },
    [onSelect]
  );

  const handleExpanderClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onToggleExpansion();
    },
    [onToggleExpansion]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect();
      }
    },
    [onSelect]
  );

  const paddingLeft = node.level * 20 + 8; // 20px per level + base padding

  return (
    <div
      id={`${comboboxId}-option-${node.id}`}
      role="option"
      aria-selected={isSelected}
      aria-expanded={node.hasChildren ? isExpanded : undefined}
      aria-level={node.level + 1}
      aria-posinset={dataIndex + 1}
      tabIndex={-1}
      className={`
        flex items-center cursor-pointer transition-colors duration-150
        ${isFocused ? 'bg-primary-100 focus-visible' : 'hover:bg-neutral-50'}
        ${isSelected ? 'bg-primary-50' : ''}
      `}
      style={style}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-testid={`tree-item-${node.id}`}
    >
      <div
        className="flex items-center w-full h-full"
        style={{ paddingLeft }}
      >
        {/* Expander button */}
        {node.hasChildren ? (
          <button
            type="button"
            className="flex-shrink-0 w-4 h-4 mr-2 flex items-center justify-center rounded-xs hover:bg-neutral-200 focus-visible"
            onClick={handleExpanderClick}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.label}`}
            tabIndex={-1}
          >
            <svg
              className={`w-3 h-3 transition-transform duration-150 ${
                isExpanded ? 'rotate-90' : ''
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ) : (
          <div className="w-4 h-4 mr-2 flex-shrink-0" />
        )}

        {/* Checkbox for multi-select */}
        {isMultiSelect && (
          <div className="flex-shrink-0 mr-2">
            <div
              className={`
                w-4 h-4 border-2 rounded-xs flex items-center justify-center
                ${
                  isSelected
                    ? 'bg-primary-600 border-primary-600'
                    : isIndeterminate
                    ? 'bg-primary-100 border-primary-600'
                    : 'border-neutral-400 bg-white'
                }
              `}
              aria-hidden="true"
            >
              {isSelected && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {isIndeterminate && !isSelected && (
                <div className="w-2 h-0.5 bg-primary-600 rounded-full" />
              )}
            </div>
          </div>
        )}

        {/* Node label */}
        <span
          className={`
            flex-1 text-sm truncate
            ${isSelected ? 'font-medium text-primary-900' : 'text-neutral-900'}
          `}
        >
          {node.label}
        </span>

        {/* Loading indicator */}
        {node.isLoading && (
          <div className="flex-shrink-0 ml-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-primary-600" />
          </div>
        )}
      </div>
    </div>
  );
}