import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  Key, 
  Users, 
  Settings, 
  Play, 
  Download,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpGuide({ isOpen, onClose }: HelpGuideProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const steps = [
    {
      id: 1,
      title: "Get Your Apify API Key",
      icon: Key,
      description: "First, you need an API key from your Apify account",
      details: [
        "Visit Apify Console (console.apify.com)",
        "Sign up for an account or log in",
        "Go to Settings → Integrations → API tokens",
        "Create a new token or copy existing key",
        "Your key looks like: apify_api_xxxxxxxx..."
      ]
    },
    {
      id: 2,
      title: "Connect to the Application",
      icon: Users,
      description: "Enter your API key to authenticate",
      details: [
        "Paste your API key in the Authentication panel",
        "Click 'Connect to Apify'",
        "The app validates your key automatically",
        "Your available actors will load"
      ]
    },
    {
      id: 3,
      title: "Select an Actor",
      icon: Settings,
      description: "Choose which actor you want to run",
      details: [
        "Browse actors in the grid display",
        "See name, description, and run history",
        "Icons show actor categories (scraper, search, etc.)",
        "Click any actor to select it"
      ]
    },
    {
      id: 4,
      title: "Configure & Execute",
      icon: Play,
      description: "Set parameters and run your actor",
      details: [
        "Fill in required parameters (marked with *)",
        "Optional fields can be left empty",
        "Forms adapt to each actor's needs",
        "Click 'Execute Actor' to start"
      ]
    },
    {
      id: 5,
      title: "View Results",
      icon: Download,
      description: "Monitor progress and download data",
      details: [
        "Watch real-time progress tracking",
        "View live statistics and metrics",
        "Preview results with images and data",
        "Download full results as JSON"
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <span>How to Use This Application</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          <p className="text-sm text-slate-600">
            Follow these simple steps to start executing Apify actors
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step) => {
            const IconComponent = step.icon;
            const isExpanded = expandedStep === step.id;
            
            return (
              <div key={step.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          Step {step.id}
                        </Badge>
                        <h3 className="font-medium text-slate-800">{step.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 bg-slate-50">
                    <ul className="space-y-2 ml-11">
                      {step.details.map((detail, index) => (
                        <li key={index} className="text-sm text-slate-600 flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          <div className="border-t border-slate-200 pt-4 space-y-3">
            <h4 className="font-medium text-slate-800">Helpful Links</h4>
            <div className="space-y-2">
              <a
                href="https://console.apify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Apify Console</span>
              </a>
              <a
                href="https://docs.apify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Apify Documentation</span>
              </a>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Pro Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Start with simple actors to get familiar with the interface</li>
              <li>• Check estimated costs before running expensive actors</li>
              <li>• Download results immediately after completion</li>
              <li>• Keep your API key secure and never share it</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}