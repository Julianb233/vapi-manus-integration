import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Phone, Plus, Settings, History, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

export default function Dashboard() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentFirstMessage, setNewAgentFirstMessage] = useState("");
  const [newAgentSystemPrompt, setNewAgentSystemPrompt] = useState("");

  const { data: agents, isLoading, refetch } = trpc.agents.list.useQuery();

  const createAgentMutation = trpc.agents.create.useMutation({
    onSuccess: () => {
      toast.success("Agent created successfully");
      setIsCreateDialogOpen(false);
      setNewAgentName("");
      setNewAgentFirstMessage("");
      setNewAgentSystemPrompt("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create agent: ${error.message}`);
    },
  });

  const handleCreateAgent = () => {
    if (!newAgentName.trim()) {
      toast.error("Please enter an agent name");
      return;
    }

    createAgentMutation.mutate({
      name: newAgentName,
      firstMessage: newAgentFirstMessage || undefined,
      systemPrompt: newAgentSystemPrompt || undefined,
    });
  };

  // Authentication is optional - skip auth checks
  // if (authLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <Loader2 className="h-12 w-12 animate-spin text-primary" />
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <Card className="w-full max-w-md">
  //         <CardHeader>
  //           <CardTitle>Authentication Required</CardTitle>
  //           <CardDescription>Please sign in to access the dashboard</CardDescription>
  //         </CardHeader>
  //         <CardContent>
  //           <Button asChild className="w-full">
  //             <a href={getLoginUrl()}>Sign In</a>
  //           </Button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Phone className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">{APP_TITLE}</h1>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email}
            </span>
            <Button variant="outline" onClick={() => logout()}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Your Voice AI Agents</h2>
            <p className="text-muted-foreground mt-2">
              Create and manage your Vapi voice agents powered by Manus AI
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Agent</DialogTitle>
                <DialogDescription>
                  Configure your voice AI agent. You can customize these settings later.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    placeholder="Customer Support Agent"
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="firstMessage">First Message (Optional)</Label>
                  <Input
                    id="firstMessage"
                    placeholder="Hello! How can I help you today?"
                    value={newAgentFirstMessage}
                    onChange={(e) => setNewAgentFirstMessage(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="systemPrompt">System Prompt (Optional)</Label>
                  <Textarea
                    id="systemPrompt"
                    placeholder="You are a helpful customer support agent..."
                    rows={4}
                    value={newAgentSystemPrompt}
                    onChange={(e) => setNewAgentSystemPrompt(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAgent}
                  disabled={createAgentMutation.isPending}
                >
                  {createAgentMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Agent
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Agents List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : agents && agents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{agent.name}</span>
                    {agent.isActive ? (
                      <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-500/10 text-gray-500 px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {agent.firstMessage || "No first message set"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setLocation(`/agent/${agent.id}`)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setLocation(`/calls/${agent.id}`)}
                    >
                      <History className="mr-2 h-4 w-4" />
                      Calls
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-12">
            <CardContent className="text-center">
              <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first voice AI agent to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Agent
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
