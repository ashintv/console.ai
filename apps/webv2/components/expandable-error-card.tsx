'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
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

interface ExpandableErrorCardProps {
  error: Error;
  onDelete?: (errorId: string) => void;
  showDivider?: boolean;
}

export function ExpandableErrorCard({
  error,
  onDelete,
  showDivider = true,
}: ExpandableErrorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          isExpanded ? 'ring-2 ring-primary' : ''
        }`}
      >
        <CardHeader
          onClick={() => setIsExpanded(!isExpanded)}
          className="pb-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
                <CardTitle className="text-base">{error.message}</CardTitle>
              </div>
              <CardDescription className="mt-2">
                {new Date(error.createdAt).toLocaleString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {error.severity && (
                <Badge variant="outline" className="capitalize text-xs">
                  {error.severity}
                </Badge>
              )}
              {error.language && (
                <Badge variant="secondary" className="text-xs">
                  {error.language}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4 pt-4 border-t">
            {/* Raw Error Log */}
            {true && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm">Raw Error Log</h4>
                <div className="bg-slate-950 dark:bg-slate-900 border border-slate-700 dark:border-slate-600 rounded-md overflow-hidden">
                  <div className="overflow-x-auto max-h-40">
                    <pre className="p-3 text-xs font-mono text-slate-50 whitespace-pre-wrap break-words">
                      <code>{JSON.stringify(error, null, 2)}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
              {error.severity && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    SEVERITY
                  </p>
                  <Badge variant="outline" className="capitalize w-fit text-xs">
                    {error.severity}
                  </Badge>
                </div>
              )}
              {error.language && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    LANGUAGE
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {error.language}
                  </Badge>
                </div>
              )}
              {error.framework && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    FRAMEWORK
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {error.framework}
                  </Badge>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  TIMESTAMP
                </p>
                <p className="text-xs">
                  {new Date(error.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Source File */}
            {error.source && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm">Source File</h4>
                <div className="bg-muted border rounded-md overflow-hidden">
                  <div className="overflow-x-auto max-h-40">
                    <pre className="p-3 text-xs font-mono whitespace-pre-wrap break-words">
                      <code>{error.source}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* AI Analysis */}
            {error.aiAnalysis && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm">AI Analysis</h4>
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-4 text-xs">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <MarkdownRenderer content={error.aiAnalysis} />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(error.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                Collapse
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
      {showDivider && !isExpanded && <div className="border-b" />}
    </>
  );
}
