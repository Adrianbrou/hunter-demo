import { LineView } from "@/components/line-view";
import { LogFeed } from "@/components/log-feed";
import { HunterChat } from "@/components/hunter-chat";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-panel">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-3">
              <span className="inline-block w-2 h-2 rounded-full bg-status-running animate-pulse-slow" />
              Hunter
              <span className="text-muted text-sm font-normal">
                Plant Floor AI Assistant
              </span>
            </h1>
            <p className="text-xs text-muted mt-1">
              Huntersville High Voltage Cable Manufacturing &middot; Demo Build
            </p>
          </div>
          <div className="text-right text-xs text-muted">
            <div>3 lines monitored</div>
            <div className="font-mono">230kV / 345kV / 400kV</div>
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
