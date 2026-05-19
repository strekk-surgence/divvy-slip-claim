import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  mockConnectX,
  claimSlip,
  getReferralCodeFromUrl,
  getCurrentSlip,
  totalClaimedDisplay,
} from "@/lib/divvy";

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

/* ---------- Decorative atoms ---------- */

function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2l2.6 6.6L22 9.6l-5.4 4.6L18.4 22 12 18.2 5.6 22l1.8-7.8L2 9.6l7.4-1z" />
    </svg>
  );
}

function PerfDivider() {
  return (
    <div className="relative my-16 flex items-center gap-4">
      <div className="flex-1 border-t border-dashed border-electric-green/30" />
      <Star className="w-3 h-3 text-electric-green/70" />
      <div className="flex-1 border-t border-dashed border-electric-green/30" />
    </div>
  );
}

function Stamp({ className = "", label = "Stamped" }: { className?: string; label?: string }) {
  return (
    <div
      className={`inline-block px-2 py-1 text-[10px] font-mono-num uppercase tracking-[0.2em] border-2 border-electric-green/70 text-electric-green/80 rotate-[-8deg] opacity-80 ${className}`}
    >
      {label}
    </div>
  );
}

/* ---------- Hero ticket (big, photoreal-style, 7deg) ---------- */

function HeroTicket() {
  return (
    <div className="relative mx-auto" style={{ perspective: "1200px" }}>
      <div className="absolute -inset-10 bg-electric-green/10 blur-[80px] rounded-full pointer-events-none" />
      <div
        className="relative paper-grain-soft border border-ink/15 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.85),0_15px_40px_-15px_rgba(0,0,0,0.6)]"
        style={{
          width: "min(560px, 90vw)",
          aspectRatio: "5 / 3",
          transform: "rotate(7deg)",
          borderRadius: 6,
        }}
      >
        {/* perforated edges */}
        <div className="absolute top-0 left-0 h-full w-3 perforated-left pointer-events-none" />
        <div
          className="absolute top-0 right-0 h-full w-3 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at calc(100% - 6px) 50%, hsl(var(--background)) 4px, transparent 4.5px)",
            backgroundSize: "12px 14px",
            backgroundRepeat: "repeat-y",
            backgroundPosition: "right center",
          }}
        />

        {/* corner stars */}
        <Star className="absolute top-3 left-6 w-3 h-3 text-ink/50" />
        <Star className="absolute top-3 right-6 w-3 h-3 text-ink/50" />
        <Star className="absolute bottom-3 left-6 w-3 h-3 text-ink/50" />
        <Star className="absolute bottom-3 right-6 w-3 h-3 text-ink/50" />

        {/* double-line green border */}
        <div className="absolute inset-3 border-2 border-double border-ink/30 pointer-events-none" />

        <div className="h-full grid grid-cols-[1fr_auto] gap-6 px-10 py-7">
          <div className="flex flex-col">
            <div className="font-serif-display text-xl tracking-wide leading-tight">
              DIVVY <span className="text-ink-soft">·</span> SEASON ONE
            </div>
            <div className="label-caps-paper mt-1">Official Lottery Ticket · World Cup 2026</div>

            <div className="mt-5">
              <div className="label-caps-paper">Ticket No.</div>
              <div className="font-mono-num text-5xl leading-none mt-1 text-ink tracking-tight">
                00<span className="text-stamp">342</span>
              </div>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-3">
              <div>
                <div className="label-caps-paper">Holder</div>
                <div className="font-mono-num text-sm text-ink">@your_handle</div>
              </div>
              <div>
                <div className="label-caps-paper">Draw</div>
                <div className="font-mono-num text-sm text-ink">11 · JUN · 26</div>
              </div>
            </div>
          </div>

          {/* stub */}
          <div className="relative pl-5 border-l-2 border-dashed border-ink/40 flex flex-col items-center justify-between py-1">
            <div className="label-caps-paper text-[9px] [writing-mode:vertical-rl] rotate-180">
              Admit · One · Lottery
            </div>
            <div className="font-mono-num text-2xl text-ink">342</div>
            <Stamp label="Issued" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Mini ticket-stub feature card ---------- */

function MiniTicket({
  no,
  tag,
  title,
  body,
}: {
  no: string;
  tag: string;
  title: string;
  body: string;
}) {
  return (
    <div
      className="relative p-5 pl-7"
      style={{
        background:
          "linear-gradient(180deg, hsl(195 45% 8%) 0%, hsl(195 50% 6%) 100%)",
        borderRadius: 4,
      }}
    >
      {/* outer double green border */}
      <div className="absolute inset-0 border-2 border-double border-electric-green/40 pointer-events-none" style={{ borderRadius: 4 }} />
      <div className="absolute inset-[5px] border border-electric-green/15 pointer-events-none" style={{ borderRadius: 2 }} />

      {/* perforated stub on left */}
      <div
        className="absolute top-0 left-0 h-full w-3 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 6px 50%, hsl(var(--background)) 3px, transparent 3.5px)",
          backgroundSize: "10px 12px",
          backgroundRepeat: "repeat-y",
        }}
      />

      {/* corner stars */}
      <Star className="absolute top-2 left-4 w-2.5 h-2.5 text-electric-green/70" />
      <Star className="absolute top-2 right-3 w-2.5 h-2.5 text-electric-green/70" />
      <Star className="absolute bottom-2 left-4 w-2.5 h-2.5 text-electric-green/70" />
      <Star className="absolute bottom-2 right-3 w-2.5 h-2.5 text-electric-green/70" />

      <div className="flex items-baseline justify-between">
        <div className="font-mono-num text-xs uppercase tracking-[0.2em] text-electric-green/80">
          № {no}
        </div>
        <div className="font-mono-num text-[10px] uppercase tracking-[0.2em] text-foreground/50">
          {tag}
        </div>
      </div>

      <div className="mt-3 border-t border-dashed border-electric-green/25" />

      <div className="mt-4 font-serif-display text-xl leading-tight text-foreground">
        {title}
      </div>
      <p className="mt-2 font-mono-num text-[12px] leading-relaxed text-foreground/65 uppercase tracking-wide">
        {body}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div className="font-mono-num text-[10px] text-electric-green/70 tracking-widest">
          ADMIT · ONE
        </div>
        <Star className="w-2.5 h-2.5 text-electric-green/60" />
      </div>
    </div>
  );
}

/* ---------- Flip-clock style counter ---------- */

function FlipCounter() {
  const [n, setN] = useState(totalClaimedDisplay());
  useEffect(() => {
    const id = setInterval(() => setN((v) => v + 1), 4000 + Math.random() * 5000);
    return () => clearInterval(id);
  }, []);
  const digits = n.toLocaleString("en-US").split("");

  return (
    <div className="inline-flex flex-col items-center">
      <div className="label-caps text-electric-green/80 mb-3 tracking-[0.3em]">
        ★ Tickets Claimed ★
      </div>
      <div className="flex gap-1.5">
        {digits.map((d, i) =>
          d === "," ? (
            <div key={i} className="self-end pb-2 text-electric-green/70 font-mono-num text-3xl">·</div>
          ) : (
            <FlipDigit key={`${i}-${d}`} d={d} />
          )
        )}
      </div>
      <div className="mt-3 font-mono-num text-[10px] tracking-[0.3em] uppercase text-foreground/50">
        Live · Booth № 01 · Season One
      </div>
    </div>
  );
}

function FlipDigit({ d }: { d: string }) {
  return (
    <div
      className="relative w-12 h-16 sm:w-14 sm:h-20 flex items-center justify-center font-mono-num text-4xl sm:text-5xl text-electric-green"
      style={{
        background:
          "linear-gradient(180deg, hsl(195 50% 9%) 0%, hsl(195 60% 5%) 49%, hsl(195 50% 8%) 50%, hsl(195 55% 6%) 100%)",
        border: "1px solid hsl(var(--electric-green) / 0.35)",
        boxShadow:
          "inset 0 1px 0 hsl(var(--electric-green) / 0.15), 0 8px 24px -10px hsl(var(--electric-green) / 0.35)",
        borderRadius: 4,
      }}
    >
      <span className="inline-block animate-tick">{d}</span>
      <div className="absolute left-0 right-0 top-1/2 h-px bg-black/60" />
    </div>
  );
}

/* ---------- Page ---------- */

export default function Landing() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const days = useDaysUntil(WC_KICKOFF);

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
    <main
      className="min-h-screen text-foreground relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 90% 60% at 50% 0%, hsl(160 70% 12% / 0.9) 0%, transparent 60%), radial-gradient(ellipse 70% 60% at 50% 100%, hsl(145 70% 14% / 0.5) 0%, transparent 60%), hsl(195 55% 4%)",
      }}
    >
      {/* subtle paper grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(hsl(145 80% 60%) 1px, transparent 1px), radial-gradient(hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "5px 5px, 11px 11px",
          backgroundPosition: "0 0, 2px 3px",
        }}
      />

      <header className="container relative flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <Star className="w-4 h-4 text-electric-green" />
          <div className="font-serif-display text-xl tracking-wide">DIVVY</div>
        </div>
        <div className="hidden sm:flex items-center gap-3 font-mono-num text-[10px] uppercase tracking-[0.25em] text-foreground/60">
          <span className="text-electric-green">●</span>
          Season One · Claim Window Open
          <span className="text-foreground/30">|</span>
          <span>Kickoff in <span className="text-electric-green">{days}</span> days</span>
        </div>
      </header>

      {/* Hero */}
      <section className="container relative pt-10 pb-20 text-center">
        <div className="flex items-center justify-center gap-3 mb-6 animate-fade-up">
          <Star className="w-3 h-3 text-electric-green" />
          <div className="font-mono-num text-[10px] uppercase tracking-[0.3em] text-electric-green/80">
            Free · X Auth · No Wallet · Season One
          </div>
          <Star className="w-3 h-3 text-electric-green" />
        </div>

        <h1
          className="font-serif-display text-[2.2rem] sm:text-5xl md:text-6xl leading-[1.05] max-w-4xl mx-auto animate-fade-up"
          style={{
            animationDelay: "60ms",
            background:
              "linear-gradient(180deg, hsl(145 90% 75%) 0%, hsl(145 85% 55%) 60%, hsl(145 80% 45%) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            textShadow: "0 0 60px hsl(145 85% 55% / 0.25)",
          }}
        >
          CLAIM YOUR DIVVY SEASON ONE LOTTERY TICKET
        </h1>

        <p
          className="mt-6 italic text-foreground/60 text-lg sm:text-xl font-serif-display font-normal animate-fade-up"
          style={{ animationDelay: "140ms" }}
        >
          Stack tickets. Win the pool. World Cup 2026.
        </p>
        <p
          className="mt-2 font-mono-num text-[11px] uppercase tracking-[0.25em] text-foreground/45 animate-fade-up"
          style={{ animationDelay: "180ms" }}
        >
          Bet from your wallet · Win onchain · Be the house
        </p>

        {/* Big ticket */}
        <div className="mt-16 animate-fade-up" style={{ animationDelay: "240ms" }}>
          <HeroTicket />
        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "320ms" }}>
          <Button
            size="lg"
            onClick={onConnect}
            disabled={loading}
            className="h-14 px-10 text-base font-semibold tracking-[0.15em] uppercase rounded-none bg-electric-green text-background hover:bg-electric-green/90 glow-green"
          >
            {loading ? "Issuing Ticket…" : "Connect X · Claim Ticket"}
          </Button>
          <Stamp label="Free Entry" />
        </div>
      </section>

      <div className="container">
        <PerfDivider />
      </div>

      {/* Mechanic mini-tickets */}
      <section className="container relative pb-8">
        <div className="text-center mb-10">
          <div className="font-mono-num text-[10px] uppercase tracking-[0.3em] text-electric-green/80">
            ★ Three Ways to Stack ★
          </div>
          <h2 className="mt-3 font-serif-display text-3xl sm:text-4xl">
            How the Lottery Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <MiniTicket
            no="001"
            tag="Claim"
            title="Your Starting Ticket"
            body="Connect X. Get your first lottery ticket. Free entry to Season One."
          />
          <MiniTicket
            no="002"
            tag="Stack"
            title="Wager. Earn Tickets."
            body="Every $5 wagered on Divvy stacks one ticket. 0.05 SOL on WC Champions Series stacks more."
          />
          <MiniTicket
            no="003"
            tag="Win"
            title="The Season Pool"
            body="Top ticket holders win the Season One pool. Drawn at season close. Real money. Onchain."
          />
        </div>
      </section>

      <div className="container">
        <PerfDivider />
      </div>

      {/* Counter */}
      <section className="container relative py-12 text-center">
        <FlipCounter />
        <div className="mt-10 flex justify-center gap-6 opacity-70">
          <Stamp label="Verified" />
          <Stamp label="Onchain" />
          <Stamp label="Season One" />
        </div>
      </section>

      <footer className="container relative py-10 border-t border-dashed border-electric-green/20 mt-8 flex flex-col sm:flex-row gap-2 justify-between font-mono-num text-[11px] uppercase tracking-[0.2em] text-foreground/50">
        <span>© Divvy · Built for fans, not bookies.</span>
        <span className="text-electric-green/70">★ Claim · Stack · Win ★</span>
      </footer>
    </main>
  );
}
