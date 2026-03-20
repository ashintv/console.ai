'use client';

import { Badge } from '@/components/ui/badge';
import { FileText, AlertCircle } from 'lucide-react';
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

interface ErrorDetailsContentProps {
  error: Error;
}

export function ErrorDetailsContent({ error }: ErrorDetailsContentProps) {
  return (
    <>
      {/* Raw Error Log */}
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

      {/* Error Message */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-bold">Error Message</h3>
        </div>
        <div className="bg-destructive/5 border-l-4 border-destructive p-4 rounded-sm">
          <p className="text-base font-mono text-foreground break-words">
            {error.message}
          </p>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4">
        {error.severity && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              SEVERITY
            </p>
            <Badge variant="outline" className="capitalize w-fit">
              {error.severity}
            </Badge>
          </div>
        )}
        {error.language && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              LANGUAGE
            </p>
            <Badge variant="secondary">{error.language}</Badge>
          </div>
        )}
        {error.framework && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              FRAMEWORK
            </p>
            <Badge variant="secondary">{error.framework}</Badge>
          </div>
        )}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            TIMESTAMP
          </p>
          <p className="text-sm">
            {new Date(error.createdAt).toLocaleString()}
          </p>
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
    </>
  );
}
