import { useState, useCallback, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

// Define the settings type
interface Settings {
  apiKey?: string;
  useMockData?: boolean;
}

export default function Settings() {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState("");
  const [useMockData, setUseMockData] = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Get current settings
  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
    retry: false
  });

  // Initialize form with current settings if available
  useEffect(() => {
    if (settings) {
      if (settings.apiKey) {
        setApiKey(settings.apiKey);
      }
      if (settings.useMockData !== undefined) {
        setUseMockData(settings.useMockData);
      }
    }
  }, [settings]);

  // Mutation to save settings
  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        apiKey,
        useMockData
      };
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error("Failed to save settings");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);
      toast({
        title: "Settings Saved",
        description: "Your API settings have been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle save settings
  const handleSave = useCallback(() => {
    saveMutation.mutate();
  }, [apiKey, useMockData, saveMutation]);

  // Handle toggle mock data
  const handleToggleMockData = useCallback((checked: boolean) => {
    setUseMockData(!checked);
  }, []);

  return (
    <main className="container max-w-3xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">API Settings</h2>
        <p className="text-gray-600">Configure the AI API settings for your compliance checks</p>
      </div>

      {showSuccessAlert && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertTitle className="text-green-600">Settings Saved</AlertTitle>
          <AlertDescription className="text-green-700">
            Your API settings have been updated successfully. Changes will take effect immediately.
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">OpenAI API Key</h3>
              <p className="text-sm text-gray-500 mt-1">
                Enter your personal OpenAI API key to use with the application
              </p>
            </div>
            <Switch 
              checked={!useMockData} 
              onCheckedChange={handleToggleMockData}
              id="use-api-toggle"
            />
          </div>
          
          <div className="relative">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="mt-1"
              disabled={useMockData}
            />
          </div>
          
          {useMockData && (
            <p className="text-sm text-amber-600 mt-2">
              <i className="fas fa-info-circle mr-1"></i>
              Using mock data mode. Toggle the switch to use a real OpenAI API.
            </p>
          )}
          
          {!useMockData && !apiKey && (
            <p className="text-sm text-red-600 mt-2">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              You need to provide an API key to use the real OpenAI service.
            </p>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">How to get an OpenAI API key</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.openai.com/api-keys</a></li>
            <li>Sign in or create an account</li>
            <li>Click "Create new secret key"</li>
            <li>Copy the key and paste it here</li>
          </ol>
          <p className="mt-3 text-sm text-gray-500">
            <strong>Note:</strong> OpenAI API keys are separate from ChatGPT Plus subscriptions. You'll need to add payment information to OpenAI's platform to use your own API key.
          </p>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={!useMockData && !apiKey || saveMutation.isPending}
            className="px-6 py-2"
          >
            {saveMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </main>
  );
}