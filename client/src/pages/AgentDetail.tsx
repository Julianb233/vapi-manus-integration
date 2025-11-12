import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Copy, Loader2, Phone, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation, useParams } from "wouter";

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const agentId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: agent, isLoading, refetch } = trpc.agents.get.useQuery(
    { id: agentId },
    { enabled: isAuthenticated && agentId > 0 }
  );

  const [name, setName] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setFirstMessage(agent.firstMessage || "");
      setSystemPrompt(agent.systemPrompt || "");
      setIsActive(agent.isActive);
    }
  }, [agent]);

  const updateMutation = trpc.agents.update.useMutation({
    onSuccess: () => {
      toast.success("Agent updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update agent: ${error.message}`);
    },
  });

  const deleteMutation = trpc.agents.delete.useMutation({
    onSuccess: () => {
      toast.success("Agent deleted successfully");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(`Failed to delete agent: ${error.message}`);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      id: agentId,
      name,
      firstMessage: firstMessage || undefined,
      systemPrompt: systemPrompt || undefined,
      isActive,
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      deleteMutation.mutate({ id: agentId });
    }
  };

  const webhookUrl = `${window.location.origin}/api/trpc/webhook.vapi`;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook URL copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Agent Not Found</CardTitle>
            <CardDescription>The requested agent could not be found</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/dashboard">
            <div className="flex items-center gap-2 cursor-pointer">
              <Phone className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">{APP_TITLE}</h1>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          {/* Agent Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
              <CardDescription>
                Configure your voice AI agent's behavior and responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Customer Support Agent"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="firstMessage">First Message</Label>
                <Input
                  id="firstMessage"
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  placeholder="Hello! How can I help you today?"
                />
                <p className="text-sm text-muted-foreground">
                  The first message your agent will say when answering a call
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are a helpful customer support agent..."
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  Instructions that define your agent's personality and behavior
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Agent is active
                </Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex-1"
                >
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Delete Agent
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vapi Integration */}
          <Card>
            <CardHeader>
              <CardTitle>Vapi Integration</CardTitle>
              <CardDescription>
                Connect this agent to your Vapi assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Webhook URL</Label>
                <div className="flex gap-2">
                  <Input value={webhookUrl} readOnly className="font-mono text-sm" />
                  <Button variant="outline" size="icon" onClick={copyWebhookUrl}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use this URL as the <code className="bg-muted px-1 py-0.5 rounded">serverUrl</code> when creating your Vapi assistant
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Setup Instructions:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Copy the webhook URL above</li>
                  <li>Go to your Vapi dashboard and create or edit an assistant</li>
                  <li>Set the <code className="bg-background px-1 py-0.5 rounded">serverUrl</code> to the webhook URL</li>
                  <li>Configure <code className="bg-background px-1 py-0.5 rounded">serverMessages</code> to include "assistant-request"</li>
                  <li>Save your Vapi assistant and start making calls!</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
