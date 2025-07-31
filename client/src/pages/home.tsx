import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthPanel } from "@/components/auth-panel";
import { ActorGrid } from "@/components/actor-grid";
import { SchemaForm } from "@/components/schema-form";
import { ExecutionResults } from "@/components/execution-results";
import { Shield, HelpCircle, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, getAuthToken } from "@/lib/api";

interface AuthData {
  user: {
    id: string;
    username: string;
  };
  actors: Array<{
    id: string;
    actorId: string;
    name: string;
    description: string;
    runCount: string;
    lastRun: string | null;
    isSelected: boolean;
  }>;
}

export default function Home() {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [selectedActor, setSelectedActor] = useState<any>(null);
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);

  const { data: actorsData, isLoading: actorsLoading } = useQuery({
    queryKey: ['/api/actors'],
    enabled: !!getAuthToken(),
    refetchOnWindowFocus: false,
  });

  const handleAuth = (data: AuthData) => {
    setAuthData(data);
    
    // Set the first selected actor if any
    const selected = data.actors.find(actor => actor.isSelected);
    if (selected) {
      setSelectedActor(selected);
    }
  };

  const handleActorSelect = (actor: any) => {
    setSelectedActor(actor);
    setCurrentExecutionId(null); // Reset execution when changing actors
  };

  const handleExecute = (executionId: string) => {
    setCurrentExecutionId(executionId);
  };

  const actors = (actorsData as any)?.actors || authData?.actors || [];
  const isAuthenticated = !!authData;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-700 rounded-lg flex items-center justify-center">
                <Bot className="text-white text-sm" />
              </div>
              <h1 className="text-xl font-semibold text-slate-800">Apify Actor Executor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600">
                <Shield className="text-green-500 h-4 w-4" />
                <span>Secure API Connection</span>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Authentication Panel */}
          <div className="lg:col-span-1">
            <AuthPanel
              onAuth={handleAuth}
              isAuthenticated={isAuthenticated}
              userName={authData?.user.username}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Actor Selection Section */}
            <ActorGrid
              actors={actors}
              onActorSelect={handleActorSelect}
              isLoading={!isAuthenticated || actorsLoading}
            />

            {/* Dynamic Schema Form Section */}
            {isAuthenticated && (
              <SchemaForm
                selectedActor={selectedActor}
                onExecute={handleExecute}
              />
            )}

            {/* Execution Results Section */}
            {isAuthenticated && (
              <ExecutionResults
                executionId={currentExecutionId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
