import { Button } from "@/components/ui/button";
import { ClaimCounter } from "@/components/ClaimCounter";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { mockConnectX, claimSlip, getReferralCodeFromUrl, getCurrentSlip } from "@/lib/divvy";

const WC_KICKOFF = new Date("2026-06-11T00:00:00Z");

function useDaysUntil(target: Date) {
  const [days, setDays] = useState(() =>
    Math.max(0, Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  );
  useEffect(() => {
    const id = setInterval(() => {
      setDays(Math.max(0, Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24))));
    }, 60_000);
    return () => clearInterval(id);
  }, [target]);
  return days;
}

function Countdown() {
  const days = useDaysUntil(WC_KICKOFF);
  return (
    <div className="inline-flex items-baseline gap-3 surface py-2 px-4">
      <span className="label-caps">World Cup kicks off in</span>
      <span className="font-mono-num text-2xl text-electric-green leading-none">{days}</span>
      <span className="label-caps">days</span>
    </div>
  );
}

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

          <div className="mb-6 animate-fade-up" style={{ animationDelay: "30ms" }}>
            <Countdown />
          </div>

          <h1 className="font-serif-display text-[2.4rem] sm:text-5xl md:text-6xl leading-[1.05] animate-fade-up" style={{ animationDelay: "60ms" }}>
            Claim your{" "}
            <span className="italic text-electric-green">Divvy Season One Lottery Ticket.</span>
          </h1>
          <p className="mt-6 text-lg text-foreground/70 max-w-xl animate-fade-up" style={{ animationDelay: "140ms" }}>
            Stack tickets. Win the pool. World Cup 2026.
          </p>
          <p className="mt-3 text-base text-foreground/55 max-w-xl animate-fade-up" style={{ animationDelay: "180ms" }}>
            Bet from your wallet. Win onchain. Be the house.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-up" style={{ animationDelay: "220ms" }}>
            <Button
              size="lg"
              onClick={onConnect}
              disabled={loading}
              className="h-14 px-8 text-base font-semibold tracking-wide rounded-none bg-electric-green text-background hover:bg-electric-green/90 glow-green"
            >
              {loading ? "Issuing your Ticket…" : "Connect X"}
            </Button>
            <span className="text-sm text-foreground/60 max-w-[280px] leading-snug">
              X OAuth. No wallet required to claim.
            </span>
          </div>

          <div className="mt-6 label-caps animate-fade-up" style={{ animationDelay: "260ms" }}>
            Claim. Stack. Win.
          </div>
        </div>

        <div className="hidden lg:flex justify-center animate-fade-up" style={{ animationDelay: "300ms" }}>
          <div className="relative rotate-[4deg]">
            <div className="absolute -inset-6 bg-electric-green/10 blur-3xl rounded-full" />
            <div className="relative w-[280px] aspect-[3/5] paper-grain-soft border border-ink/15 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] p-5">
              <div className="font-serif-display text-sm leading-tight">DIVVY · SEASON ONE · WORLD CUP 2026</div>
              <div className="label-caps-paper mt-1 text-[10px]">Official Lottery Ticket</div>
              <div className="label-caps-paper mt-3">Specimen</div>
              <div className="font-mono-num text-4xl mt-4 text-ink">00342</div>
              <div className="label-caps-paper mt-6">Issued To</div>
              <div className="font-mono-num text-sm text-ink">@your_handle</div>
              <div className="label-caps-paper mt-4">Selection</div>
              <div className="text-sm text-ink">Season One</div>
              <div className="absolute right-3 top-3"><div className="stamp text-[10px]">Issued</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Value cards */}
      <section className="container py-10 border-t hairline">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ValueCard
            tag="Lottery entry"
            tagColor="green"
            title="Your Starting Ticket"
            sub="Claim your Slip on the Flywheel site. Get your first lottery ticket. Stack more by sharing, joining the community, and wagering on Divvy."
          />
          <ValueCard
            tag="Wagering on Divvy"
            tagColor="blue"
            title="Real Wagers, Real Tickets"
            sub="Every $5 wager on Divvy stacks one ticket. Every 0.05 SOL on WC Champions Series stacks more. The lottery rewards real play."
          />
          <ValueCard
            tag="Top ticket holders win"
            tagColor="green"
            title="The Pool"
            sub="Top ticket holders win the Season One lottery pool. Drawn at season close. Stack more, raise your odds."
          />
        </div>
      </section>

      <section className="container py-12 border-t hairline">
        <ClaimCounter />
      </section>

      <footer className="container py-8 border-t hairline flex flex-col sm:flex-row gap-2 justify-between text-sm text-foreground/50">
        <span>© Divvy · Built for fans, not bookies.</span>
        <span className="label-caps">Claim. Stack. Win.</span>
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
