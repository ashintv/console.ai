'use client';

import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, FileText, X } from 'lucide-react';
import { MarkdownRenderer } from '@/components/markdown-renderer';

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

interface ErrorDetailsDrawerProps {
  error: Error | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ErrorDetailsDrawer({
  error,
  isOpen,
  onOpenChange,
}: ErrorDetailsDrawerProps) {
  if (!error) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-[600px] flex flex-col p-0 gap-0 overflow-hidden"
      >
        {/* Fixed Header */}
        <div className="shrink-0 border-b px-6 py-4 bg-gradient-to-r from-background to-muted/30 flex items-center justify-between">
          <h2 className="text-xl font-bold">Error Details</h2>
            <button
            onClick={() => onOpenChange(false)}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6 space-y-6">
            {/* Raw Error Log - At Top */}
            <div className="space-y-2">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Raw Error Log
              </h3>
              <div className="bg-slate-950 dark:bg-slate-900 border border-slate-700 dark:border-slate-600 rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <pre className="p-4 text-xs font-mono text-slate-50 whitespace-pre-wrap break-words">
                    <code>{JSON.stringify(error, null, 2)}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Error Message - Prominent */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <h3 className="text-lg font-bold">Error Message</h3>
              </div>
              <div className="bg-destructive/5 border-l-4 border-destructive p-4 rounded-sm">
                <p className="text-base font-mono text-foreground break-words">{error.message}</p>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              {error.severity && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">SEVERITY</p>
                  <Badge variant="outline" className="capitalize w-fit">
                    {error.severity}
                  </Badge>
                </div>
              )}
              {error.language && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">LANGUAGE</p>
                  <Badge variant="secondary">{error.language}</Badge>
                </div>
              )}
              {error.framework && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">FRAMEWORK</p>
                  <Badge variant="secondary">{error.framework}</Badge>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">TIMESTAMP</p>
                <p className="text-sm">{new Date(error.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Source File */}
            {error.source && (
              <div className="space-y-2">
                <h3 className="font-bold text-sm">Source File</h3>
                <div className="bg-muted border rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-words">
                      <code>{error.source}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* AI Analysis */}
            {error.aiAnalysis && (
              <div className="space-y-2">
                <h3 className="font-bold text-sm">AI Analysis</h3>
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-4 text-sm">
                  <MarkdownRenderer content={error.aiAnalysis} />
                </div>
              </div>
            )}

            {/* Bottom Padding */}
            <div className="h-4" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
