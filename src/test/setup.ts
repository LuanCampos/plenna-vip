import React from 'react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Lightweight framer-motion mock so tests don't load the real library (faster).
// Files that need motion props (e.g. MotionComponents.test) override with their own vi.mock.
vi.mock('framer-motion', () => {
  const createMotionTag = (tag: keyof JSX.IntrinsicElements) =>
    React.forwardRef<HTMLElement, Record<string, unknown>>((props, ref) =>
      React.createElement(tag, { ...props, ref })
    );
  return {
    motion: new Proxy({} as Record<string, React.ComponentType<Record<string, unknown>>>, {
      get: (_, key: string) => createMotionTag(key as keyof JSX.IntrinsicElements),
    }),
  };
});
