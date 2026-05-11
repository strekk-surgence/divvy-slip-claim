import { Button } from "@/components/ui/button";
import { ClaimCounter } from "@/components/ClaimCounter";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { mockConnectX, claimSlip, getReferralCodeFromUrl, getCurrentSlip } from "@/lib/divvy";

export default function Landing() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  async function onConnect() {
    setLoading(true);
    try {
      const existing = getCurrentSlip();
      if (existing) { nav("/claim"); return; }
      const { x_handle, x_user_id } = await mockConnectX();
      claimSlip(x_handle, x_user_id, getReferralCodeFromUrl());
      nav("/claim");
    } finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen paper-grain relative overflow-hidden">
      {/* perforated edge on right (desktop) */}
      <div className="hidden md:block absolute top-0 right-0 h-full w-4 perforated-right pointer-events-none" />

      {/* Top bar */}
      <header className="container flex items-center justify-between py-6">
        <div className="font-serif-display text-xl tracking-wide">DIVVY</div>
        <div className="label-caps hidden sm:block">Season 1 · Claim Window Open</div>
      </header>

      <section className="container pt-10 pb-24 md:pt-20 md:pb-28 relative">
        <div className="max-w-3xl">
          <div className="label-caps mb-6 animate-fade-up">Official Slip · Free to Claim</div>
          <h1 className="font-serif-display text-[2.6rem] sm:text-6xl md:text-7xl leading-[1.02] animate-fade-up" style={{animationDelay:"60ms"}}>
            Divvy Season 1 is live.
            <br />
            <span className="italic">Claim your Slip.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-ink-soft max-w-xl animate-fade-up" style={{animationDelay:"140ms"}}>
            Connect X. Get your Slip. Share to earn before the World Cup.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-up" style={{animationDelay:"220ms"}}>
            <Button
              size="lg"
              onClick={onConnect}
              disabled={loading}
              className="h-14 px-8 text-base font-semibold tracking-wide rounded-none bg-ink text-paper hover:bg-ink/90"
            >
              {loading ? "Issuing your Slip…" : "Connect X"}
            </Button>
            <span className="label-caps">No wallet · No email · 10 seconds</span>
          </div>
        </div>

        {/* sample slip preview, desktop right */}
        <div className="hidden lg:block absolute right-16 top-24 rotate-[6deg] opacity-95 pointer-events-none">
          <div className="w-[260px] aspect-[3/5] paper-grain-soft border border-ink/15 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] p-5">
            <div className="font-serif-display text-base">DIVVY · SEASON 1</div>
            <div className="label-caps mt-1">Specimen</div>
            <div className="font-mono-num text-4xl mt-6">00342</div>
            <div className="label-caps mt-6">Issued To</div>
            <div className="font-mono-num text-sm">@your_handle</div>
            <div className="label-caps mt-4">Selection</div>
            <div className="text-sm">Season 1 · World Cup</div>
            <div className="absolute right-3 top-3"><div className="stamp text-[10px]">Issued</div></div>
          </div>
        </div>
      </section>

      {/* Counter */}
      <section className="container pb-20">
        <ClaimCounter />
      </section>

      <footer className="container py-8 border-t border-ink/20 flex flex-col sm:flex-row gap-2 justify-between text-sm text-ink-soft">
        <span>© Divvy · Built for fans, not bookies.</span>
        <span className="label-caps">Form. Stamp. Issue. Share.</span>
      </footer>
    </main>
  );
}
