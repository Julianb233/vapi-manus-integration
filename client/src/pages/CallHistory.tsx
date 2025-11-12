import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, MessageSquare, Phone } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";

export default function CallHistory() {
  const { agentId } = useParams<{ agentId: string }>();
  const parsedAgentId = parseInt(agentId || "0");
  const { isAuthenticated } = useAuth();
  const [selectedCallId, setSelectedCallId] = useState<number | null>(null);

  const { data: agent } = trpc.agents.get.useQuery(
    { id: parsedAgentId },
    { enabled: isAuthenticated && parsedAgentId > 0 }
  );

  const { data: calls, isLoading } = trpc.calls.listByAgent.useQuery(
    { agentId: parsedAgentId },
    { enabled: isAuthenticated && parsedAgentId > 0 }
  );

  const { data: messages, isLoading: messagesLoading } = trpc.calls.getMessages.useQuery(
    { callSessionId: selectedCallId! },
    { enabled: selectedCallId !== null }
  );

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
      <main className="container py-8 max-w-6xl">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-bold">Call History</h2>
          {agent && (
            <p className="text-muted-foreground mt-2">
              Viewing calls for <span className="font-semibold">{agent.name}</span>
            </p>
          )}
        </div>

        {calls && calls.length > 0 ? (
          <div className="space-y-4">
            {calls.map((call) => (
              <Card key={call.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        {call.phoneNumber || "Unknown Number"}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(call.startedAt)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Duration: {formatDuration(call.duration)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Status: {call.status}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {call.endReason && (
                        <span>End reason: {call.endReason}</span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCallId(call.id)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View Conversation
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
              <h3 className="text-lg font-semibold mb-2">No calls yet</h3>
              <p className="text-muted-foreground">
                Call history will appear here once your agent starts receiving calls
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Conversation Dialog */}
      <Dialog open={selectedCallId !== null} onOpenChange={() => setSelectedCallId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conversation History</DialogTitle>
          </DialogHeader>
          {messagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages && messages.length > 0 ? (
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <div className="text-xs opacity-70 mb-1">
                      {message.role === "user" ? "Caller" : "Agent"}
                    </div>
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No messages in this conversation
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
