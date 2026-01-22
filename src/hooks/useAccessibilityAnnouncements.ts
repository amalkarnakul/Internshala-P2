import React, { useRef, useCallback } from 'react';
import { AccessibilityConfig } from '../types/tree';

export function useAccessibilityAnnouncements(
  config: AccessibilityConfig
): {
  announceSelection: (label: string, isSelected: boolean, count?: number) => void;
  announceExpansion: (label: string, isExpanded: boolean, childCount?: number) => void;
  announceLoading: (message: string) => void;
  announceError: (message: string) => void;
  LiveRegion: React.ComponentType;
} {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      // Clear previous message
      liveRegionRef.current.textContent = '';
      
      // Set new message after a brief delay to ensure screen readers pick it up
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = message;
          liveRegionRef.current.setAttribute('aria-live', priority);
        }
      }, 100);
    }
  }, []);

  const announceSelection = useCallback(
    (label: string, isSelected: boolean, count?: number) => {
      if (!config.announceSelections) return;

      let message = `${label} ${isSelected ? 'selected' : 'deselected'}`;
      if (count !== undefined && count > 0) {
        message += `. ${count} item${count === 1 ? '' : 's'} selected`;
      }
      announce(message);
    },
    [config.announceSelections, announce]
  );

  const announceExpansion = useCallback(
    (label: string, isExpanded: boolean, childCount?: number) => {
      if (!config.announceExpansions) return;

      let message = `${label} ${isExpanded ? 'expanded' : 'collapsed'}`;
      if (isExpanded && childCount !== undefined) {
        message += `. ${childCount} child item${childCount === 1 ? '' : 's'} available`;
      }
      announce(message);
    },
    [config.announceExpansions, announce]
  );

  const announceLoading = useCallback(
    (message: string) => {
      if (!config.announceLoading) return;
      announce(message, 'polite');
    },
    [config.announceLoading, announce]
  );

  const announceError = useCallback(
    (message: string) => {
      announce(`Error: ${message}`, 'assertive');
    },
    [announce]
  );

  const LiveRegion: React.ComponentType = useCallback(() => {
    return React.createElement('div', {
      ref: liveRegionRef,
      'aria-live': 'polite',
      'aria-atomic': 'true',
      className: 'sr-only',
    });
  }, []);

  return {
    announceSelection,
    announceExpansion,
    announceLoading,
    announceError,
    LiveRegion,
  };
}