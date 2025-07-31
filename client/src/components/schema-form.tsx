import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Play, Info, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Actor {
  id: string;
  actorId: string;
  name: string;
}

interface SchemaFormProps {
  selectedActor: Actor | null;
  onExecute: (executionId: string) => void;
}

export function SchemaForm({ selectedActor, onExecute }: SchemaFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const { data: schemaData, isLoading: schemaLoading } = useQuery({
    queryKey: ['/api/actors', selectedActor?.actorId, 'schema'],
    enabled: !!selectedActor,
    refetchOnWindowFocus: false,
  });

  const executeMutation = useMutation({
    mutationFn: async (inputs: any) => {
      if (!selectedActor) throw new Error("No actor selected");
      return api.executeActor(selectedActor.actorId, inputs);
    },
    onSuccess: (data) => {
      onExecute(data.executionId);
      toast({
        title: "Actor execution started!",
        description: "Your actor is now running. Check the results below.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Execution failed",
        description: error.message || "Failed to execute actor",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Reset form when actor changes
    setFormData({});
  }, [selectedActor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeMutation.mutate(formData);
  };

  const renderFormField = (key: string, field: any) => {
    const fieldId = `field-${key}`;
    const isRequired = field.required || false;
    
    switch (field.type) {
      case 'string':
        if (field.enum) {
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={fieldId}>
                {field.title || key}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Select
                value={formData[key] || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, [key]: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${field.title || key}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.enum.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}
            </div>
          );
        }
        
        if (field.format === 'textarea' || field.maxLength > 100) {
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={fieldId}>
                {field.title || key}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Textarea
                id={fieldId}
                placeholder={field.description || field.example || `Enter ${field.title || key}`}
                value={formData[key] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                rows={4}
                className={key.includes('url') ? 'font-mono text-sm' : ''}
              />
              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}
            </div>
          );
        }
        
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.title || key}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={fieldId}
              type="text"
              placeholder={field.description || field.example || `Enter ${field.title || key}`}
              value={formData[key] || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
              className={key.includes('url') ? 'font-mono text-sm' : ''}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case 'number':
      case 'integer':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.title || key}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={fieldId}
              type="number"
              min={field.minimum}
              max={field.maximum}
              placeholder={field.description || `Enter ${field.title || key}`}
              value={formData[key] || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                [key]: e.target.value ? (field.type === 'integer' ? parseInt(e.target.value) : parseFloat(e.target.value)) : '' 
              }))}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={key} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={fieldId}
                checked={formData[key] || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [key]: checked }))}
              />
              <Label htmlFor={fieldId} className="text-sm font-medium">
                {field.title || key}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {field.description && (
              <p className="text-xs text-muted-foreground ml-6">{field.description}</p>
            )}
          </div>
        );

      case 'array':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.title || key}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={fieldId}
              placeholder={field.description || `Enter ${field.title || key}, one per line`}
              value={Array.isArray(formData[key]) ? formData[key].join('\n') : (formData[key] || '')}
              onChange={(e) => {
                const lines = e.target.value.split('\n').filter(line => line.trim());
                setFormData(prev => ({ ...prev, [key]: lines }));
              }}
              rows={4}
              className="font-mono text-sm"
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.title || key}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={fieldId}
              type="text"
              placeholder={field.description || `Enter ${field.title || key}`}
              value={formData[key] || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
    }
  };

  if (!selectedActor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <span>Actor Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Settings className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p>Please select an actor to configure its parameters.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (schemaLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <span>Actor Configuration</span>
            <span className="text-sm text-slate-500">{selectedActor.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-slate-500">Loading actor schema...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const schema = (schemaData as any)?.schema || {};
  const properties = schema?.properties || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-primary" />
          <span>Actor Configuration</span>
          <span className="text-sm text-slate-500">{selectedActor.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {Object.keys(properties).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(properties).map(([key, field]: [string, any]) => (
                <div key={key} className={field.type === 'array' || (field.type === 'string' && (field.format === 'textarea' || field.maxLength > 100)) ? 'md:col-span-2' : ''}>
                  {renderFormField(key, field)}
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This actor has no configurable parameters. You can execute it directly.
              </AlertDescription>
            </Alert>
          )}

          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 flex items-center">
                <Info className="text-blue-500 mr-1 h-4 w-4" />
                Estimated cost: $0.05 - $0.20 per run
              </div>
              <Button
                type="submit"
                disabled={executeMutation.isPending}
                className="flex items-center space-x-2"
              >
                {executeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Execute Actor</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
