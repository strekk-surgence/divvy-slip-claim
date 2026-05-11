import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SlipCard } from "@/components/SlipCard";
import { Flywheel } from "@/components/Flywheel";
import { getCurrentSlip, getReferralsFor, getLeaderboardPosition } from "@/lib/divvy";

export default function Dashboard() {
  const slip = getCurrentSlip();
  const nav = useNavigate();
  useEffect(() => { if (!slip) nav("/"); }, [slip, nav]);
  if (!slip) return null;

  const refs = getReferralsFor(slip.x_handle);
  const position = getLeaderboardPosition(slip.x_handle);
  const estDvy = (refs.length * 25 + 100).toLocaleString();

  return (
    <main className="min-h-screen paper-grain">
      <header className="container flex items-center justify-between py-6">
        <Link to="/" className="font-serif-display text-xl tracking-wide">DIVVY</Link>
        <Link to="/claim" className="label-caps underline-offset-4 hover:underline">‹ Back to Slip</Link>
      </header>

      <section className="container py-6 md:py-12 grid lg:grid-cols-[minmax(0,360px)_1fr] gap-12 items-start">
        <div>
          <div className="label-caps mb-3">Your Slip</div>
          <SlipCard slip={slip} />
        </div>

        <div className="space-y-10">
          <div>
            <div className="label-caps">Issued To</div>
            <h1 className="font-serif-display text-4xl md:text-5xl mt-1">@{slip.x_handle}</h1>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat label="Referrals" value={String(refs.length).padStart(2, "0")} />
            <Stat label="Leaderboard" value={`#${String(position).padStart(3, "0")}`} />
            <Stat label="Est. DVY" value={estDvy} />
          </div>

          <div>
            <div className="label-caps mb-3">How it works</div>
            <Flywheel />
          </div>

          <div className="border-t border-ink/30 pt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-ink-soft text-sm max-w-md">
              Wallet connection happens later on Divvy when you place your first bet. Your Slip travels with you.
            </p>
            <Button asChild className="h-12 rounded-none bg-stamp text-paper hover:bg-stamp/90 font-semibold tracking-wide px-6">
              <a href="https://divvy.bet" target="_blank" rel="noreferrer">Go to Divvy product →</a>
            </Button>
          </div>
        </div>
      </section>

      <footer className="container py-10 text-sm text-ink-soft border-t border-ink/20">
        © Divvy · Season 1 Claim
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="paper-grain-soft border border-ink/20 p-4">
      <div className="label-caps">{label}</div>
      <div className="font-mono-num text-2xl md:text-3xl mt-1">{value}</div>
    </div>
  );
}
