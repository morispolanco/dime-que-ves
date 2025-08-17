
import React from 'react';

export const Spinner = (): React.ReactNode => {
  return (
    <div
      className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
