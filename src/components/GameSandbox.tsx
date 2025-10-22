import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GameCode {
  html: string;
  css: string;
  javascript: string;
}

interface GameSandboxProps {
  code: GameCode | null;
  onConsoleError: (error: string) => void;
}

export const GameSandbox = ({ code, onConsoleError }: GameSandboxProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (code && iframeRef.current) {
      renderGame();
    }
  }, [code]);

  const renderGame = () => {
    if (!code || !iframeRef.current) return;

    setIsLoading(true);
    setErrors([]);

    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game Preview</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #000;
    }
    ${code.css}
  </style>
</head>
<body>
  ${code.html}
  <script>
    // Capture console errors and send to parent
    window.addEventListener('error', (e) => {
      window.parent.postMessage({
        type: 'console-error',
        error: e.message + ' at ' + e.filename + ':' + e.lineno
      }, '*');
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      window.parent.postMessage({
        type: 'console-error',
        error: 'Unhandled promise rejection: ' + e.reason
      }, '*');
    });

    // Game code
    try {
      ${code.javascript}
    } catch (err) {
      window.parent.postMessage({
        type: 'console-error',
        error: err.message
      }, '*');
    }
  </script>
</body>
</html>
    `;

    const blob = new Blob([fullHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    if (iframeRef.current) {
      iframeRef.current.src = url;
      setTimeout(() => setIsLoading(false), 500);
    }

    // Clean up the blob URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "console-error") {
        const error = event.data.error;
        setErrors((prev) => [...prev, error]);
        onConsoleError(error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onConsoleError]);

  const handleReload = () => {
    renderGame();
  };

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--code-bg))]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4 glass-effect">
        <div>
          <h2 className="text-lg font-semibold">Game Preview</h2>
          <p className="text-xs text-muted-foreground">Live rendering of your game</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleReload}
            variant="outline"
            size="sm"
            disabled={!code}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reload
          </Button>
        </div>
      </div>

      {/* Console Errors */}
      {errors.length > 0 && (
        <div className="border-b border-destructive/50 bg-destructive/10 p-2">
          <Alert variant="destructive" className="border-destructive/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <details className="text-xs">
                <summary className="cursor-pointer font-semibold">
                  {errors.length} error{errors.length > 1 ? "s" : ""} detected
                </summary>
                <div className="mt-2 space-y-1 code-font">
                  {errors.map((error, i) => (
                    <div key={i} className="text-xs opacity-90">
                      • {error}
                    </div>
                  ))}
                </div>
              </details>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Sandbox iframe */}
      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
              <p className="text-sm text-muted-foreground">Loading game...</p>
            </div>
          </div>
        )}

        {!code && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Play className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Game Yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Start by describing your game in the chat panel. I'll generate it for you!
              </p>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          className={cn(
            "h-full w-full border-0",
            !code && "hidden"
          )}
          title="Game Sandbox"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
};