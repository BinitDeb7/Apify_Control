import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3, 
  Download, 
  Table, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Image,
  Star,
  AlertCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ExecutionResultsProps {
  executionId: string | null;
}

export function ExecutionResults({ executionId }: ExecutionResultsProps) {
  const [progressValue, setProgressValue] = useState(0);

  const { data: execution, isLoading } = useQuery({
    queryKey: ['/api/executions', executionId, 'status'],
    enabled: !!executionId,
    refetchInterval: (data) => {
      // Stop refetching if execution is completed or failed
      return (data as any)?.status === 'SUCCEEDED' || (data as any)?.status === 'FAILED' ? false : 2000;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const executionData = execution as any;
    if (executionData?.status === 'RUNNING') {
      const interval = setInterval(() => {
        setProgressValue(prev => Math.min(prev + Math.random() * 10, 85));
      }, 1000);
      return () => clearInterval(interval);
    } else if (executionData?.status === 'SUCCEEDED') {
      setProgressValue(100);
    }
  }, [(execution as any)?.status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCEEDED': return 'text-green-600';
      case 'FAILED': return 'text-red-600';
      case 'RUNNING': return 'text-blue-600';
      default: return 'text-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCEEDED': return CheckCircle;
      case 'FAILED': return XCircle;
      case 'RUNNING': return Loader2;
      default: return Clock;
    }
  };

  const formatDuration = (startedAt?: string, finishedAt?: string) => {
    if (!startedAt) return '00:00';
    
    const start = new Date(startedAt);
    const end = finishedAt ? new Date(finishedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadResults = () => {
    const executionData = execution as any;
    if (executionData?.results) {
      const dataStr = JSON.stringify(executionData.results, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `actor-results-${executionData.id}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!executionId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Execution Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <BarChart3 className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p>Execute an actor to see results here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && !execution) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Execution Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-slate-500">Initializing execution...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const executionData = execution as any;
  const StatusIcon = getStatusIcon(executionData?.status || 'READY');
  const results = executionData?.results || [];
  const stats = executionData?.stats || {};

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Execution Results</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className={cn(
                "w-2 h-2 rounded-full",
                executionData?.status === 'RUNNING' && "bg-blue-500 animate-pulse",
                executionData?.status === 'SUCCEEDED' && "bg-green-500",
                executionData?.status === 'FAILED' && "bg-red-500"
              )}></div>
              <span className={cn("font-medium", getStatusColor(executionData?.status || ''))}>
                {executionData?.status || 'READY'}
              </span>
              <span className="text-slate-500">
                • {formatDuration(executionData?.startedAt, executionData?.finishedAt)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        {executionData?.status === 'RUNNING' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Processing...</span>
              <span>{Math.round(progressValue)}% completed</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        )}

        {/* Status Alert */}
        {executionData?.status === 'FAILED' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Actor execution failed. Please check your inputs and try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Live Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">
              {results.length || stats.outputBodyLen || 0}
            </div>
            <div className="text-sm text-slate-600">Items Scraped</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">
              {stats.requestsFinished || 0}
            </div>
            <div className="text-sm text-slate-600">Requests Made</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">
              {stats.inputBodyLen ? (stats.inputBodyLen / 1024 / 1024).toFixed(1) : '0.0'}
            </div>
            <div className="text-sm text-slate-600">Data Size (MB)</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.requestsFinished && stats.requestsFailed 
                ? Math.round((stats.requestsFinished / (stats.requestsFinished + stats.requestsFailed)) * 100)
                : 100}%
            </div>
            <div className="text-sm text-slate-600">Success Rate</div>
          </div>
        </div>

        {/* Results Preview */}
        {results.length > 0 && (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-medium text-slate-800">Preview Results</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadResults}
                  className="text-primary hover:text-blue-700"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Download JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-primary hover:text-blue-700"
                >
                  <Table className="mr-1 h-4 w-4" />
                  View in Table
                </Button>
              </div>
            </div>

            <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
              {results.slice(0, 10).map((item: any, index: number) => (
                <div key={index} className="p-4 hover:bg-slate-50">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                      {item.image || item.imageUrl ? (
                        <img 
                          src={item.image || item.imageUrl} 
                          alt={item.title || item.name || 'Item'} 
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <Image className="h-6 w-6 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 truncate">
                        {item.title || item.name || item.text || `Item ${index + 1}`}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
                        {item.price && (
                          <span className="font-semibold text-lg text-green-600">
                            {typeof item.price === 'string' ? item.price : `$${item.price}`}
                          </span>
                        )}
                        {item.rating && (
                          <span className="flex items-center">
                            <Star className="text-yellow-400 mr-1 h-4 w-4 fill-current" />
                            <span>{item.rating}</span>
                            {item.reviewCount && (
                              <span className="text-slate-400 ml-1">({item.reviewCount} reviews)</span>
                            )}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      {(item.url || item.link) && (
                        <a 
                          href={item.url || item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mt-1 block truncate"
                        >
                          {item.url || item.link}
                        </a>
                      )}
                    </div>
                    {item.availability && (
                      <div className="flex-shrink-0">
                        <Badge 
                          variant={item.availability.toLowerCase().includes('stock') ? 'default' : 'secondary'}
                          className={cn(
                            item.availability.toLowerCase().includes('stock') && "bg-green-100 text-green-800",
                            item.availability.toLowerCase().includes('limited') && "bg-yellow-100 text-yellow-800"
                          )}
                        >
                          {item.availability}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {results.length > 10 && (
                <div className="p-4 text-center text-sm text-slate-500 bg-slate-50">
                  ... and {results.length - 10} more items. Download the full results to see all data.
                </div>
              )}
            </div>
          </div>
        )}

        {executionData?.status === 'SUCCEEDED' && results.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Actor completed successfully but returned no results. This might be expected for the given inputs.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
