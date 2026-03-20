
'use client';

import { ReactNode } from 'react';
import { ErrorDetailsContent } from '@/components/error-details-content';

interface Error {
  id: string;
  message: string;
  source?: string;
  language?: string;
  framework?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  aiAnalysis?: string;
}

interface SplitPanelLayoutProps {
  leftContent: ReactNode;
  selectedError: Error | null;
  isDetailDialogOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SplitPanelLayout({
  leftContent,
  selectedError,
  isDetailDialogOpen,
  onOpenChange,
}: SplitPanelLayoutProps) {
  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* Left Panel - Independently Scrollable */}
      <main
        className={`flex flex-col overflow-hidden transition-all duration-300 ${
          isDetailDialogOpen ? 'w-1/2 border-r' : 'w-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {leftContent}
        </div>
      </main>

      {/* Right Panel - Independently Scrollable */}
      {isDetailDialogOpen && selectedError && (
        <aside className="w-1/2 border-l bg-background flex flex-col overflow-hidden">
          {/* Fixed Header - Never Scrolls */}
          <div className="shrink-0 border-b px-6 py-3 bg-gradient-to-r from-background to-muted/30 flex items-center justify-between">
            <h2 className="text-lg font-bold">Error Details</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              title="Close error details"
              aria-label="Close error details"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-destructive"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m15 9-6 6M9 9l6 6"></path>
              </svg>
              <span className="sr-only">Close</span>
            </button>
          </div>

          {/* Scrollable Content Area - Independent from Left */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-6 space-y-6">
              <ErrorDetailsContent error={selectedError} />
              <div className="h-4" />
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
