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
    <main className="min-h-screen divvy-bg text-foreground">
      <header className="container flex items-center justify-between py-6">
        <div className="font-serif-display text-xl tracking-wide">DIVVY</div>
        <div className="label-caps hidden sm:block">Season One · Claim Window Open</div>
      </header>

      <section className="container pt-10 pb-16 md:pt-20 md:pb-24 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
        <div>
          <div className="label-caps mb-6 animate-fade-up">
            <span className="text-electric-green">●</span>&nbsp;&nbsp;Free to Claim · X Auth, No Wallet
          </div>
          <h1 className="font-serif-display text-[2.4rem] sm:text-5xl md:text-6xl leading-[1.05] animate-fade-up" style={{ animationDelay: "60ms" }}>
            Claim your{" "}
            <span className="italic text-electric-green">Divvy Season One Slip.</span>
          </h1>
          <p className="mt-6 text-lg text-foreground/70 max-w-xl animate-fade-up" style={{ animationDelay: "140ms" }}>
            Earn Slip Points. Climb the Season One standings. Win{" "}
            <span className="text-electric-green font-semibold">$DVY</span> every week.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-up" style={{ animationDelay: "220ms" }}>
            <Button
              size="lg"
              onClick={onConnect}
              disabled={loading}
              className="h-14 px-8 text-base font-semibold tracking-wide rounded-none bg-electric-green text-background hover:bg-electric-green/90 glow-green"
            >
              {loading ? "Issuing your Slip…" : "Connect X"}
            </Button>
            <span className="text-sm text-foreground/60 max-w-[280px] leading-snug">
              X OAuth. No wallet required to claim.
            </span>
          </div>
        </div>

        <div className="hidden lg:flex justify-center animate-fade-up" style={{ animationDelay: "300ms" }}>
          <div className="relative rotate-[4deg]">
            <div className="absolute -inset-6 bg-electric-green/10 blur-3xl rounded-full" />
            <div className="relative w-[280px] aspect-[3/5] paper-grain-soft border border-ink/15 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] p-5">
              <div className="font-serif-display text-base">DIVVY · SEASON 1</div>
              <div className="label-caps-paper mt-1">Specimen</div>
              <div className="font-mono-num text-4xl mt-6 text-ink">00342</div>
              <div className="label-caps-paper mt-6">Issued To</div>
              <div className="font-mono-num text-sm text-ink">@your_handle</div>
              <div className="label-caps-paper mt-4">Selection</div>
              <div className="text-sm text-ink">Season One · $DVY</div>
              <div className="absolute right-3 top-3"><div className="stamp text-[10px]">Issued</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Value cards */}
      <section className="container py-10 border-t hairline">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ValueCard
            tag="Slip Points"
            tagColor="green"
            title="100 to start"
            sub="Starting allocation. Earn more by sharing, referring, and joining the community."
          />
          <ValueCard
            tag="Refer + Earn"
            tagColor="blue"
            title="Compounding rewards"
            sub="+100 Slip Points per friend who claims. +250 when they connect a wallet on Divvy. 5% lifetime compounding from every referred wallet's points."
          />
          <ValueCard
            tag="Season One Standings"
            tagColor="green"
            title="$DVY every Sunday"
            sub="Top 100 wallets win tier payouts each week. Top wallet ~$1K. Top 10 split $2.25K. Top 50 split $1K. Top 100 split $750."
          />
        </div>
      </section>

      <section className="container py-12 border-t hairline">
        <ClaimCounter />
      </section>

      <footer className="container py-8 border-t hairline flex flex-col sm:flex-row gap-2 justify-between text-sm text-foreground/50">
        <span>© Divvy · Built for fans, not bookies.</span>
        <span className="label-caps">Claim. Share. Climb.</span>
      </footer>
    </main>
  );
}

function ValueCard({
  tag, tagColor, title, sub,
}: { tag: string; tagColor: "green" | "blue"; title: string; sub: string }) {
  return (
    <div className="surface-soft p-6 relative overflow-hidden group">
      <div
        className={`absolute top-0 left-0 h-px w-1/3 ${tagColor === "green" ? "bg-electric-green" : "bg-electric-blue"}`}
      />
      <div className={`label-caps ${tagColor === "green" ? "text-electric-green" : "text-electric-blue"}`}>
        {tag}
      </div>
      <div className="font-serif-display text-2xl mt-3">{title}</div>
      <p className="text-sm text-foreground/65 mt-2 leading-snug">{sub}</p>
    </div>
  );
}
