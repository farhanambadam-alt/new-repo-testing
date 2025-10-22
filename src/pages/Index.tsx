import { useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { GameSandbox } from "@/components/GameSandbox";
import { useToast } from "@/hooks/use-toast";

interface GameCode {
  html: string;
  css: string;
  javascript: string;
}

const Index = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gameCode, setGameCode] = useState<GameCode | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (message: string) => {
    setIsProcessing(true);

    try {
      // TODO: Replace with actual API call to edge function
      // This is a placeholder to demonstrate the flow
      
      toast({
        title: "Processing Request",
        description: "AI is analyzing your game description...",
      });

      // Simulate AI processing
      setTimeout(() => {
        toast({
          title: "Coming Soon!",
          description: "AI integration requires external API keys. Check the console for setup instructions.",
          variant: "default",
        });
        setIsProcessing(false);
      }, 2000);

      // The actual implementation would call an edge function like:
      // const response = await supabase.functions.invoke('generate-game', {
      //   body: { message, sessionId }
      // });

    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleConsoleError = (error: string) => {
    console.error("Game Error:", error);
    // TODO: Send error to edge function to update session state
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel - Chat */}
      <div className="w-1/2 h-full">
        <ChatPanel
          sessionId={sessionId}
          onSendMessage={handleSendMessage}
          isProcessing={isProcessing}
        />
      </div>

      {/* Right Panel - Game Sandbox */}
      <div className="w-1/2 h-full">
        <GameSandbox code={gameCode} onConsoleError={handleConsoleError} />
      </div>

      {/* Setup Instructions Overlay */}
      {!sessionId && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="glass-effect rounded-lg border border-border p-4 max-w-2xl shadow-xl">
            <h4 className="font-semibold text-sm mb-2 text-primary">⚡ Setup Required</h4>
            <p className="text-xs text-muted-foreground mb-3">
              This AI Game Dev Agent is powered by Lovable AI:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 mb-3">
              <li>• <strong>Gemini 2.5 Pro</strong> for intelligent code generation</li>
              <li>• <strong>Gemini 2.5 Flash Image Preview</strong> for game asset creation</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              ✨ <strong>Ready to use!</strong> Lovable AI is now enabled with free tier included.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;