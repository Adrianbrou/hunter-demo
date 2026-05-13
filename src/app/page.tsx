import { LineView } from "@/components/line-view";
import { LogFeed } from "@/components/log-feed";
import { HunterChat } from "@/components/hunter-chat";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Southwire-blue accent strip */}
      <div className="h-0.5 bg-gradient-to-r from-primary via-primary-light to-primary" />

      {/* Header */}
      <header className="border-b border-border bg-panel">
        <div className="max-w-[1600px] mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-3 tracking-tight">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-status-running animate-pulse-slow shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              Hunter
              <span className="text-muted text-sm font-normal hidden md:inline">
                Plant Floor AI Assistant
              </span>
            </h1>
            <p className="text-xs text-muted mt-1.5">
              Live operations intelligence &middot; Built on the Connected Enterprise pattern
            </p>
            <p className="text-[10px] text-muted/70 mt-1">
              Demo system &middot; All data synthetic &middot; Built for portfolio review
            </p>
          </div>
          <div className="flex items-center gap-5 text-right text-xs">
            <div>
              <div className="text-muted uppercase tracking-wider">Lines</div>
              <div className="font-mono text-foreground mt-0.5">
                230kV &middot; 345kV &middot; 400kV
              </div>
            </div>
            <div className="h-9 w-px bg-border" />
            <div>
              <div className="text-muted uppercase tracking-wider">Feed</div>
              <div className="font-mono text-status-running flex items-center gap-1.5 mt-0.5 justify-end">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-status-running animate-pulse-slow" />
                Live
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-9rem)]">
          {/* Left column: line view + log feed */}
          <div className="col-span-8 flex flex-col gap-6 overflow-hidden">
            <LineView />
            <LogFeed />
          </div>

          {/* Right column: Hunter chat */}
          <div className="col-span-4 flex flex-col overflow-hidden">
            <HunterChat />
          </div>
        </div>
      </main>
    </div>
  );
}
