import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Key, Shield, Loader2, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api, setAuthToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AuthPanelProps {
  onAuth: (data: any) => void;
  isAuthenticated: boolean;
  userName?: string;
}

export function AuthPanel({ onAuth, isAuthenticated, userName }: AuthPanelProps) {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const authMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      const response = await api.validateApiKey(apiKey);
      return response;
    },
    onSuccess: (data) => {
      setAuthToken(data.sessionId);
      onAuth(data);
      toast({
        title: "Authentication successful!",
        description: `Connected as ${data.user.username}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Authentication failed",
        description: error.message || "Invalid API key. Please check your credentials.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast({
        title: "API key required",
        description: "Please enter your Apify API key.",
        variant: "destructive",
      });
      return;
    }
    authMutation.mutate(apiKey);
  };

  return (
    <Card className="w-full sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Key className="h-5 w-5 text-primary" />
          <span>Authentication</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Apify API Key</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  placeholder="apify_api_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono text-sm pr-10"
                  disabled={authMutation.isPending}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                <span className="mr-1">ℹ️</span>
                Find your API key in Apify Console
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={authMutation.isPending || !apiKey.trim()}
            >
              {authMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Connect to Apify
                </>
              )}
            </Button>
          </form>
        ) : (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Connected as {userName}
            </AlertDescription>
          </Alert>
        )}

        {!isAuthenticated && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Secure API Connection</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
