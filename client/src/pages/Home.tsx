import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Phone, Zap, MessageSquare, BarChart3 } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  // Skip loading check - auth is optional
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">{APP_TITLE}</h1>
          </div>
          <div>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Build Intelligent Voice AI Agents
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Integrate Vapi voice AI with Manus AI capabilities to create powerful, conversational phone agents that understand context and provide intelligent responses.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Real-time AI</CardTitle>
              <CardDescription>
                Powered by Manus AI for intelligent, context-aware conversations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <Phone className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Voice Integration</CardTitle>
              <CardDescription>
                Seamless integration with Vapi for natural phone conversations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Conversation History</CardTitle>
              <CardDescription>
                Track and analyze all conversations for insights and improvements
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Monitor call metrics, duration, and agent performance
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16">
        <div className="mx-auto max-w-3xl">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Create Your Agent</h4>
                <p className="text-muted-foreground">
                  Configure your voice AI agent with custom prompts, voice settings, and behavior
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Connect to Vapi</h4>
                <p className="text-muted-foreground">
                  Use the provided webhook URL to connect your Vapi assistant to Manus AI
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Start Making Calls</h4>
                <p className="text-muted-foreground">
                  Your agent is ready to handle phone calls with intelligent, AI-powered responses
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-24">
        <div className="container py-8 text-center text-muted-foreground">
          <p>© 2024 {APP_TITLE}. Powered by Vapi and Manus AI.</p>
        </div>
      </footer>
    </div>
  );
}
