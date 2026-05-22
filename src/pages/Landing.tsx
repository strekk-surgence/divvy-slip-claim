import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  mockConnectX,
  claimSlip,
  getReferralCodeFromUrl,
  getCurrentSlip,
} from "@/lib/divvy";
import ticketImage from "@/assets/ticket.png";

const DRAW_DATE = new Date("2026-07-26T18:00:00Z");

function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    const d = Math.floor(diff / 86_400_000);
    const h = Math.floor((diff / 3_600_000) % 24);
    const m = Math.floor((diff / 60_000) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return { d, h, m, s };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return t;
}

/* ---------- Divvy "D" house mark ---------- */
function DMark({ className = "", glow = false }: { className?: string; glow?: boolean }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {glow && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(135deg, #7C02FF 0%, #00D87E 100%)",
            filter: "blur(28px)",
            opacity: 0.6,
          }}
        />
      )}
      <div
        className="relative h-full w-full rounded-md flex items-center justify-center font-serif-display text-white font-bold"
        style={{
          background: "linear-gradient(135deg, #7C02FF 0%, #00D87E 100%)",
        }}
      >
        <span style={{ fontSize: "0.7em", lineHeight: 1 }}>D</span>
      </div>
    </div>
  );
}

/* ---------- Ticket preview (v3 spec) ---------- */
function TicketPreview() {
  return (
    <div
      className="relative w-full max-w-md mx-auto"
      style={{
        aspectRatio: "5 / 3",
        background: "linear-gradient(180deg, #1A1A1A 0%, #0E0E0E 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        boxShadow: "0 40px 80px -30px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      {/* perforated divider */}
      <div
        className="absolute top-3 bottom-3 pointer-events-none"
        style={{
          left: "26%",
          width: 1,
          backgroundImage:
            "linear-gradient(to bottom, rgba(255,255,255,0.25) 50%, transparent 50%)",
          backgroundSize: "1px 8px",
        }}
      />

      {/* Left stub */}
      <div className="absolute inset-y-0 left-0 w-[26%] flex flex-col items-center justify-between py-5 px-3">
        <DMark glow className="h-14 w-14" />
        <div className="text-[9px] text-white/60 font-mono-num uppercase tracking-[0.25em] [writing-mode:vertical-rl] rotate-180">
          Grand Jackpot
        </div>
        <div className="font-mono-num text-white text-lg">342</div>
      </div>

      {/* Right body */}
      <div className="absolute inset-y-0 right-0 left-[26%] p-5 flex flex-col">
        <div className="flex items-baseline justify-between">
          <div className="font-serif-display text-white text-base tracking-wide">
            Divvy.bet
          </div>
          <div className="font-mono-num text-[9px] text-white/50 uppercase tracking-[0.25em]">
            No. <span className="text-white/80">00342</span>
          </div>
        </div>
        <div className="font-mono-num text-[10px] text-white/55 uppercase tracking-[0.3em] mt-0.5">
          World Cup 2026
        </div>

        <div className="mt-3 font-mono-num text-[10px] uppercase tracking-[0.25em] text-win-green">
          Official Grand Jackpot Entry
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3">
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">Holder</div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="h-4 w-4 rounded-full bg-white/15" />
              <div className="font-mono-num text-xs text-white/90">@your_handle</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">Draw Date</div>
            <div className="font-mono-num text-xs text-white/90 mt-1">26 JULY 2026</div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">Pool</div>
          <div className="font-mono-num text-[10px] text-white/80 uppercase tracking-[0.2em]">
            WC Grand Jackpot
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Icons (white outline) ---------- */
function StackIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="13" width="18" height="7" rx="1" />
      <rect x="5" y="8" width="14" height="3" rx="0.5" />
      <rect x="7" y="4" width="10" height="2" rx="0.5" />
    </svg>
  );
}
function TrophyIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M7 6H4v2a3 3 0 0 0 3 3" />
      <path d="M17 6h3v2a3 3 0 0 1-3 3" />
      <path d="M10 14h4v3h-4z" />
      <path d="M8 20h8" />
    </svg>
  );
}
function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2H21l-6.52 7.45L22 22h-6.78l-5.31-6.94L3.78 22H1l7.02-8.02L1.5 2h6.92l4.8 6.34L18.244 2zm-2.38 18h1.88L8.22 4H6.26l9.604 16z" />
    </svg>
  );
}
function DiscordIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20 4.5A18 18 0 0 0 15.6 3l-.2.5a14 14 0 0 0-6.8 0L8.4 3A18 18 0 0 0 4 4.5C1.5 8.5 1 12.4 1.2 16.2A18 18 0 0 0 6.8 19l.5-.7a12 12 0 0 1-2-1 6 6 0 0 0 .4-.3 13 13 0 0 0 10.6 0l.4.3a12 12 0 0 1-2 1l.5.7a18 18 0 0 0 5.6-2.8c.3-4.4-.4-8.3-1.8-11.7zM8.7 14.2c-1 0-1.9-1-1.9-2.2s.8-2.2 1.9-2.2 1.9 1 1.9 2.2-.9 2.2-1.9 2.2zm6.6 0c-1 0-1.9-1-1.9-2.2s.8-2.2 1.9-2.2 1.9 1 1.9 2.2-.8 2.2-1.9 2.2z" />
    </svg>
  );
}
function TelegramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.5 3.5L2.7 10.9c-1 .4-1 1 .2 1.3l4.7 1.5 1.8 5.7c.2.7.6.8 1.1.3l2.6-2.4 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.5c.3-1.2-.4-1.8-1.3-1.4zM9.4 14.7l11.2-7c.5-.3.9-.1.5.3l-9.4 8.5-.4 3.7-1.9-5.5z" />
    </svg>
  );
}

/* ---------- Page ---------- */
export default function Landing() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const { d, h, m, s } = useCountdown(DRAW_DATE);

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
    <main className="min-h-screen divvy-page text-white">
      {/* Header */}
      <header className="container flex items-center justify-between py-6 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <a href="https://divvy.bet" className="font-serif-display text-xl tracking-wide text-white shrink-0">
            Divvy<span className="text-white/60">.bet</span>
          </a>
          <span className="hidden md:inline text-white/30">·</span>
          <span className="hidden md:inline text-xs text-white/65 font-mono-num tracking-tight truncate">
            Non-custodial sportsbook on Solana. Bet from your wallet, settle instantly. No signups, no deposits.
          </span>
        </div>
        <div className="font-mono-num text-[11px] sm:text-xs text-white/85 tracking-tight shrink-0">
          <span className="text-white">{d}d {String(h).padStart(2, "0")}h {String(m).padStart(2, "0")}m {String(s).padStart(2, "0")}s</span>
          <span className="hidden sm:inline text-white/40"> · Closes 26 July 2026</span>
        </div>
      </header>


      {/* Hero */}
      <section className="container pt-10 pb-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="text-left">
          <h1 className="font-sans font-bold text-[2.25rem] sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-white">
            CLAIM YOUR FREE TICKET TO THE
            <br />
            <span className="divvy-gradient-text">WORLD CUP 2026 GRAND JACKPOT</span>
          </h1>

          <p className="mt-6 text-lg text-white/75 max-w-xl leading-relaxed">
            Your first Ticket is free. Bet, mint, refer and share to stack more entries. Weekly winners will be drawn throughout the tournament, with the Grand Jackpot drawn at the World Cup Final.
          </p>




          <div className="mt-10">
            <Button
              size="lg"
              onClick={onConnect}
              disabled={loading}
              className="divvy-glow divvy-gradient text-white h-14 px-10 text-base font-semibold tracking-wide rounded-md hover:opacity-95 hover:text-white border-0"
            >
              {loading ? "Claiming…" : "Claim Your Free Ticket →"}
            </Button>
            <div className="mt-4 text-xs text-white/55 font-mono-num tracking-wide">
              <span className="text-white/85">12,481 entries claimed</span>
              <span className="text-white/30 mx-2">·</span>
              First Ticket free
              <span className="text-white/30 mx-2">·</span>
              X connection required
            </div>
          </div>
        </div>

        <div className="relative lg:scale-110 lg:-mr-8 xl:scale-[1.2] xl:-mr-12">
          <div className="absolute -inset-10 bg-[#00D87E]/10 blur-3xl rounded-full pointer-events-none" />
          <img
            src={ticketImage}
            alt="Divvy.bet World Cup 2026 Grand Jackpot entry ticket"
            className="relative w-full h-auto block rounded-lg shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]"
          />
        </div>
      </section>

      <div className="container">
        <div className="border-t border-white/10" />
      </div>

      {/* How it works */}
      <section className="container py-20">
        <div className="grid md:grid-cols-3 gap-6">
          <HowCard
            icon={<DMark glow className="h-12 w-12" />}
            title="Connect your X account"
            body="Connect X. Claim your free Ticket and start stacking."
          />
          <HowCard
            icon={<StackIcon className="h-10 w-10 text-white" />}
            title="Earn more entries"
            body="Bet, mint, refer, share. Every action stacks more entries in the draw."
          />
          <HowCard
            icon={<TrophyIcon className="h-10 w-10 text-white" />}
            title="Win across the season"
            body="Multiple winners drawn each week. Grand Jackpot drawn at the World Cup Final. More Tickets, more chances."
          />
        </div>
      </section>



      <div className="container">
        <div className="border-t border-white/10" />
      </div>

      {/* FAQ */}
      <section className="container py-20">
        <h2 className="font-sans font-bold text-3xl sm:text-4xl text-white tracking-tight">
          Questions, answered
        </h2>
        <p className="mt-3 text-white/60 text-sm">The rules, the draw, and what you need to know before claiming.</p>
        <div className="mt-10 max-w-3xl divide-y divide-white/10 border-t border-b border-white/10">
          {[
            { q: "Do I need a Divvy account to enter?", a: "No traditional signup is needed. Connect your X account to claim your free Ticket." },
            { q: "Is the first Ticket really free?", a: "Yes. Your first Ticket is free to claim. You can stack more entries by betting, minting, referring and sharing." },
            { q: "Why do I need to connect X?", a: "X connection helps verify your entry, track referrals and keep the draw fair." },
            { q: "How do I earn more Tickets?", a: "You can earn more entries by betting on Divvy, minting, referring friends and sharing the campaign." },
            { q: "When are winners drawn?", a: "Weekly winners will be drawn throughout the World Cup, starting June 11, 2026. The Grand Jackpot will be drawn at the World Cup Final on July 19, 2026." },
            { q: "What is Divvy.bet?", a: "Divvy is a non-custodial sportsbook on Solana. You bet from your wallet, settle instantly and stay in control of your funds." },
            { q: "Who can participate?", a: "18+ only. Availability may vary by jurisdiction. Terms apply." },
          ].map((item, i) => (
            <details key={i} className="group py-5">
              <summary className="flex items-center justify-between cursor-pointer list-none text-white text-base font-medium">
                <span>{item.q}</span>
                <span className="ml-4 text-white/40 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <p className="mt-3 text-sm text-white/65 leading-relaxed pr-8">{item.a}</p>
            </details>
          ))}
        </div>
      </section>


      {/* Footer */}
      <footer className="container py-10 border-t border-white/10 mt-4">
        <div className="grid sm:grid-cols-3 gap-6 items-center text-sm">
          <div className="font-serif-display text-white text-base">
            Divvy<span className="text-white/60">.bet</span>
          </div>
          <div className="text-white/65 text-center text-xs sm:text-sm">
            Non-custodial sportsbook on Solana.
          </div>
          <div className="flex items-center gap-4 sm:justify-end text-white/75">
            <a href="https://x.com/divvybet" aria-label="X" className="hover:text-white"><XIcon className="h-4 w-4" /></a>
            <a href="https://discord.gg/divvy" aria-label="Discord" className="hover:text-white"><DiscordIcon className="h-5 w-5" /></a>
            <a href="https://t.me/divvybet" aria-label="Telegram" className="hover:text-white"><TelegramIcon className="h-5 w-5" /></a>
          </div>
        </div>
        <div className="mt-8 text-center text-[11px] text-white/35 font-mono-num tracking-wide">
          © Divvy.bet 2026
        </div>
      </footer>
    </main>
  );
}

function HowCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="p-7 rounded-md border border-white/10 bg-white/[0.02] hover:bg-white/[0.035] transition-colors">
      <div className="h-12 flex items-center">{icon}</div>
      <div className="mt-5 font-sans font-bold text-xl text-white">{title}</div>
      <p className="mt-3 text-sm text-white/65 leading-relaxed">{body}</p>
    </div>
  );
}

function PoolPanel({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <div className="p-8 rounded-md border border-white/10 bg-white/[0.02]">
      <div className="text-[10px] uppercase tracking-[0.3em] text-win-green font-mono-num font-semibold">
        {label}
      </div>
      <div className="mt-3 font-sans font-bold text-2xl text-white">{title}</div>
      <p className="mt-4 text-sm text-white/65 leading-relaxed">{body}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#121212] p-6 text-center">
      <div className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-mono-num">{label}</div>
      <div className="mt-2 font-mono-num text-3xl text-white font-semibold">{value}</div>
    </div>
  );
}
