import { useState, useCallback, useMemo } from 'react';
import { VirtualizationConfig } from '../types/tree';

interface VirtualItem {
  index: number;
  start: number;
  size: number;
}

interface VirtualizationState {
  scrollTop: number;
  containerHeight: number;
  totalHeight: number;
  visibleRange: { start: number; end: number };
  virtualItems: VirtualItem[];
}

export function useVirtualization(
  itemCount: number,
  config: VirtualizationConfig
): {
  state: VirtualizationState;
  scrollElementProps: {
    onScroll: (event: React.UIEvent<HTMLElement>) => void;
    style: React.CSSProperties;
  };
  getItemProps: (index: number) => {
    style: React.CSSProperties;
    'data-index': number;
  };
} {
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = itemCount * config.itemHeight;

  const visibleRange = useMemo(() => {
    const start = Math.max(
      0,
      Math.floor(scrollTop / config.itemHeight) - config.overscan
    );
    const visibleCount = Math.ceil(config.containerHeight / config.itemHeight);
    const end = Math.min(
      itemCount - 1,
      start + visibleCount + config.overscan * 2
    );

    return { start, end };
  }, [scrollTop, config, itemCount]);

  const virtualItems = useMemo(() => {
    const items: VirtualItem[] = [];
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      items.push({
        index: i,
        start: i * config.itemHeight,
        size: config.itemHeight,
      });
    }
    return items;
  }, [visibleRange, config.itemHeight]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    const target = event.currentTarget;
    setScrollTop(target.scrollTop);
  }, []);

  const scrollElementProps = useMemo(
    () => ({
      onScroll: handleScroll,
      style: {
        height: config.containerHeight,
        overflow: 'auto',
      } as React.CSSProperties,
    }),
    [handleScroll, config.containerHeight]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      style: {
        position: 'absolute' as const,
        top: index * config.itemHeight,
        left: 0,
        right: 0,
        height: config.itemHeight,
      },
      'data-index': index,
    }),
    [config.itemHeight]
  );

  const state: VirtualizationState = {
    scrollTop,
    containerHeight: config.containerHeight,
    totalHeight,
    visibleRange,
    virtualItems,
  };

  return {
    state,
    scrollElementProps,
    getItemProps,
  };
}