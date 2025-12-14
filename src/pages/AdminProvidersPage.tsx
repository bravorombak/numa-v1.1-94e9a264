import { useState } from "react";
import { Key, Save, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccessDenied } from "@/components/common/AccessDenied";
import { useAuthStore } from "@/stores/authStore";
import { useAiProviders, useUpsertAiProvider } from "@/hooks/useAiProviders";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SUPPORTED_PROVIDERS = [
  { id: "openai", name: "OpenAI", description: "GPT models (gpt-5, gpt-4, etc.)" },
  { id: "anthropic", name: "Anthropic", description: "Claude models (claude-4, etc.)" },
  { id: "google", name: "Google", description: "Gemini models (gemini-2.5-pro, etc.)" },
  { id: "perplexity", name: "Perplexity", description: "Perplexity AI models" },
  { id: "grok", name: "Grok", description: "xAI Grok models" },
];

const AdminProvidersPage = () => {
  const { isAdmin } = useAuthStore();
  const { data: providers, isLoading } = useAiProviders();
  const upsertProvider = useUpsertAiProvider();

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  // Admin-only guard
  if (!isAdmin) {
    return <AccessDenied message="Only Admins can access Provider Settings." />;
  }

  const handleSave = async (providerId: string) => {
    const apiKey = apiKeys[providerId]?.trim();
    if (!apiKey) {
      return;
    }

    await upsertProvider.mutateAsync({
      provider: providerId,
      api_credential: apiKey,
    });

    // Clear the input after successful save
    setApiKeys((prev) => ({ ...prev, [providerId]: "" }));
  };

  const isConfigured = (providerId: string) => {
    return providers?.some((p) => p.provider === providerId);
  };

  return (
    <div className="space-y-6 px-4 py-4 sm:p-6">
      <div>
        <h1 className="text-3xl font-header font-extrabold text-foreground">
          Provider API Keys
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage API credentials for AI providers
        </p>
      </div>

      <Alert>
        <Key className="h-4 w-4" />
        <AlertDescription>
          API keys are stored securely and encrypted. For security, existing keys cannot be
          viewed—only set or updated. Keys are used by the generation service to call AI
          providers.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading providers...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {SUPPORTED_PROVIDERS.map((provider) => {
            const configured = isConfigured(provider.id);
            const isSaving = upsertProvider.isPending;

            return (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {provider.name}
                        {configured ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {provider.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="mt-2">
                    {configured ? (
                      <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                        Configured
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        Not configured
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${provider.id}-key`}>
                      {configured ? "Update API Key" : "Set API Key"}
                    </Label>
                    <Input
                      id={`${provider.id}-key`}
                      type="password"
                      placeholder="Enter new API key..."
                      value={apiKeys[provider.id] || ""}
                      onChange={(e) =>
                        setApiKeys((prev) => ({
                          ...prev,
                          [provider.id]: e.target.value,
                        }))
                      }
                      disabled={isSaving}
                    />
                  </div>
                  <Button
                    onClick={() => handleSave(provider.id)}
                    disabled={!apiKeys[provider.id]?.trim() || isSaving}
                    className="w-full"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminProvidersPage;
