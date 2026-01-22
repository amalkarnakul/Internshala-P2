import '@testing-library/jest-dom';

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  
  constructor() {}
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

global.IntersectionObserver = MockIntersectionObserver as any;

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  constructor() {}
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
}

global.ResizeObserver = MockResizeObserver as any;

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});