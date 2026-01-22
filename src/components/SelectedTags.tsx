import React, { useCallback } from 'react';
import { FlatTreeNode } from '../types/tree';

interface SelectedTagsProps<T = any> {
  nodes: FlatTreeNode<T>[];
  onRemove: (nodeId: string) => void;
  disabled: boolean;
}

export function SelectedTags<T = any>({
  nodes,
  onRemove,
  disabled,
}: SelectedTagsProps<T>): JSX.Element {
  if (nodes.length === 0) {
    return <></>;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1" data-testid="selected-tags">
      {nodes.map((node) => (
        <SelectedTag
          key={node.id}
          node={node}
          onRemove={onRemove}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

interface SelectedTagProps<T = any> {
  node: FlatTreeNode<T>;
  onRemove: (nodeId: string) => void;
  disabled: boolean;
}

function SelectedTag<T = any>({
  node,
  onRemove,
  disabled,
}: SelectedTagProps<T>): JSX.Element {
  const handleRemove = useCallback(() => {
    if (!disabled) {
      onRemove(node.id);
    }
  }, [disabled, onRemove, node.id]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
        event.preventDefault();
        onRemove(node.id);
      }
    },
    [disabled, onRemove, node.id]
  );

  return (
    <span
      className={`
        inline-flex items-center px-2 py-1 text-xs font-medium rounded-md
        ${
          disabled
            ? 'bg-neutral-100 text-neutral-500'
            : 'bg-primary-100 text-primary-800'
        }
      `}
      data-testid={`selected-tag-${node.id}`}
    >
      <span className="truncate max-w-32">{node.label}</span>
      {!disabled && (
        <button
          type="button"
          onClick={handleRemove}
          onKeyDown={handleKeyDown}
          className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-200 focus-visible"
          aria-label={`Remove ${node.label}`}
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}