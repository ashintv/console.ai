'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Clock, FileText } from 'lucide-react';

interface ErrorEvent {
  id: string;
  message: string;
  source?: string;
  language?: string;
  framework?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  aiAnalysis?: string;
}

interface ErrorCardProps {
  error: ErrorEvent;
  onViewDetails?: (error: ErrorEvent) => void;
  onDelete?: (errorId: string) => void;
  showDivider?: boolean;
}

export function ErrorCard({
  error,
  onViewDetails,
  onDelete,
  showDivider = false,
}: ErrorCardProps) {
  const severityColor = {
    low: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    high: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    critical: 'bg-red-500/10 text-red-700 dark:text-red-400',
  };

  // Format timestamp
  const timestamp = new Date(error.createdAt);
  const timeAgo = getTimeAgo(timestamp);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
        <div className="flex-1 min-w-0 space-y-2 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="destructive" className="shrink-0">
              <AlertCircle className="h-3 w-3 mr-1" />
              Error
            </Badge>
            {error.severity && (
              <Badge
                variant="outline"
                className={`shrink-0 ${severityColor[error.severity]}`}
              >
                {error.severity}
              </Badge>
            )}
            <span className="text-sm font-medium truncate">{error.message}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 text-xs text-muted-foreground">
            {error.source && (
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {error.source}
              </div>
            )}
            {error.language && <span className="px-2 py-1 bg-muted rounded">{error.language}</span>}
            {error.framework && <span className="px-2 py-1 bg-muted rounded">{error.framework}</span>}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => onViewDetails?.(error)}>
            View Details
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(error.id)}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
      {showDivider && <Separator />}
    </>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
