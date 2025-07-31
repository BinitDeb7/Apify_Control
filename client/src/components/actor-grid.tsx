import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Layers, Play, Clock, Check, Worm, Search, ShoppingCart, Mail } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Actor {
  id: string;
  actorId: string;
  name: string;
  description: string;
  runCount: string;
  lastRun: string | null;
  isSelected: boolean;
}

interface ActorGridProps {
  actors: Actor[];
  onActorSelect: (actor: Actor) => void;
  isLoading?: boolean;
}

const getActorIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('scraper') || lowerName.includes('spider')) return Worm;
  if (lowerName.includes('search') || lowerName.includes('google')) return Search;
  if (lowerName.includes('amazon') || lowerName.includes('product') || lowerName.includes('shop')) return ShoppingCart;
  if (lowerName.includes('email') || lowerName.includes('mail')) return Mail;
  return Layers;
};

const getActorIconColor = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('scraper') || lowerName.includes('spider')) return 'text-blue-600 group-hover:text-white';
  if (lowerName.includes('search') || lowerName.includes('google')) return 'text-green-600 group-hover:text-white';
  if (lowerName.includes('amazon') || lowerName.includes('product') || lowerName.includes('shop')) return 'text-orange-600 group-hover:text-white';
  if (lowerName.includes('email') || lowerName.includes('mail')) return 'text-purple-600 group-hover:text-white';
  return 'text-slate-600 group-hover:text-white';
};

const getActorBgColor = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('scraper') || lowerName.includes('spider')) return 'from-blue-100 to-blue-200 group-hover:from-primary group-hover:to-blue-700';
  if (lowerName.includes('search') || lowerName.includes('google')) return 'from-green-100 to-green-200 group-hover:from-primary group-hover:to-blue-700';
  if (lowerName.includes('amazon') || lowerName.includes('product') || lowerName.includes('shop')) return 'from-orange-100 to-orange-200 group-hover:from-primary group-hover:to-blue-700';
  if (lowerName.includes('email') || lowerName.includes('mail')) return 'from-purple-100 to-purple-200 group-hover:from-primary group-hover:to-blue-700';
  return 'from-slate-100 to-slate-200 group-hover:from-primary group-hover:to-blue-700';
};

export function ActorGrid({ actors, onActorSelect, isLoading }: ActorGridProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const selectMutation = useMutation({
    mutationFn: async (actorId: string) => {
      await api.selectActor(actorId);
      return actorId;
    },
    onSuccess: (actorId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/actors'] });
      const selectedActor = actors.find(a => a.actorId === actorId);
      if (selectedActor) {
        onActorSelect(selectedActor);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Selection failed",
        description: error.message || "Failed to select actor",
        variant: "destructive",
      });
    },
  });

  const formatLastRun = (lastRun: string | null) => {
    if (!lastRun) return 'Never';
    const date = new Date(lastRun);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return 'Over a month ago';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-primary" />
            <span>Select Actor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-primary" />
            <span>Select Actor</span>
          </CardTitle>
          <Button variant="outline" size="sm" className="text-primary hover:text-blue-700">
            <RefreshCw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actors.map((actor) => {
            const IconComponent = getActorIcon(actor.name);
            const iconColor = getActorIconColor(actor.name);
            const bgColor = getActorBgColor(actor.name);
            
            return (
              <div
                key={actor.id}
                className={cn(
                  "border rounded-lg p-4 cursor-pointer group transition-all duration-200",
                  actor.isSelected 
                    ? "border-2 border-primary bg-blue-50" 
                    : "border border-slate-200 hover:border-primary hover:shadow-md"
                )}
                onClick={() => selectMutation.mutate(actor.actorId)}
              >
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                    actor.isSelected 
                      ? "bg-gradient-to-br from-primary to-blue-700"
                      : `bg-gradient-to-br ${bgColor}`
                  )}>
                    <IconComponent className={cn(
                      "h-5 w-5 transition-all duration-200",
                      actor.isSelected ? "text-white" : iconColor
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-800 truncate">
                      {actor.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {actor.description || "No description available"}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        Updated {formatLastRun(actor.lastRun)}
                      </span>
                      <span className="flex items-center">
                        <Play className="mr-1 h-3 w-3" />
                        {actor.runCount} runs
                      </span>
                    </div>
                    {actor.isSelected && (
                      <div className="mt-2">
                        <Badge className="bg-primary text-white">
                          <Check className="mr-1 h-3 w-3" />
                          Selected
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {actors.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Layers className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p>No actors available. Please check your Apify account.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
