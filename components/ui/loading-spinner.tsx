'use client';

import React from 'react';

export const LoadingSpinner = ({ className = "" }: { className?: string }) => (
  <div className={`inline-block ${className}`}>
    <div 
      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  </div>
); 