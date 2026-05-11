import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SlipCard } from "@/components/SlipCard";
import { Flywheel } from "@/components/Flywheel";
import { getCurrentSlip, getReferralsFor, getLeaderboardPosition } from "@/lib/divvy";

function useCountUp(target: number, duration = 900) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

export default function Dashboard() {
  const slip = getCurrentSlip();
  const nav = useNavigate();
  useEffect(() => { if (!slip) nav("/"); }, [slip, nav]);
  if (!slip) return null;

  const refs = getReferralsFor(slip.x_handle);
  const position = getLeaderboardPosition(slip.x_handle);

  const slipPoints = 100 + refs.length * 50;
  const bonusUsd = 10 + refs.length * 5;
  const refPoints = refs.length * 50;

  const animPoints = useCountUp(slipPoints);
  const animBonus = useCountUp(bonusUsd);
  const animRefPts = useCountUp(refPoints);

  return (
    <main className="min-h-screen divvy-bg">
      <header className="container flex items-center justify-between py-6 border-b hairline">
        <Link to="/" className="font-serif-display text-xl tracking-wide">DIVVY</Link>
        <Link to="/claim" className="label-caps underline-offset-4 hover:underline">‹ Back to Slip</Link>
      </header>

      <section className="container py-10 md:py-14 grid lg:grid-cols-[minmax(0,340px)_1fr] gap-12 items-start">
        <div>
          <div className="label-caps mb-3">Your Slip</div>
          <div className="relative">
            <div className="absolute -inset-6 bg-electric-green/10 blur-3xl rounded-full pointer-events-none" />
            <div className="relative"><SlipCard slip={slip} /></div>
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <div className="label-caps">Issued To</div>
            <h1 className="font-serif-display text-4xl md:text-5xl mt-1">@{slip.x_handle}</h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Slip Points" value={animPoints.toLocaleString()} accent="green" />
            <Stat label="Bonus Credit" value={`$${animBonus}`} accent="blue" />
            <Stat label="Referrals" value={String(refs.length).padStart(2, "0")} />
            <Stat label="Leaderboard" value={`#${String(position).padStart(3, "0")}`} />
          </div>

          <div className="surface p-5 flex items-center justify-between gap-4">
            <div>
              <div className="label-caps">From referrals</div>
              <div className="font-mono-num text-2xl mt-1">
                +<span className="text-electric-green">{animRefPts.toLocaleString()}</span> pts
              </div>
            </div>
            <div className="text-right">
              <div className="label-caps">Friends claimed</div>
              <div className="font-mono-num text-2xl mt-1">{refs.length}</div>
            </div>
          </div>

          <Button asChild className="h-12 rounded-none bg-electric-blue text-white hover:bg-electric-blue/90 font-semibold tracking-wide px-6 glow-blue">
            <a href="https://divvy.bet" target="_blank" rel="noreferrer">Go bet on Divvy →</a>
          </Button>

          <div className="pt-6 border-t hairline">
            <div className="label-caps mb-4">How it works</div>
            <Flywheel />
          </div>
        </div>
      </section>

      <footer className="container py-8 text-sm text-foreground/55 border-t hairline">
        Bonuses and Slip Points credit to your wallet when you connect on Divvy and place your first bet.
      </footer>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "green" | "blue" }) {
  const color = accent === "green" ? "text-electric-green" : accent === "blue" ? "text-electric-blue" : "";
  return (
    <div className="surface-soft p-4">
      <div className="label-caps">{label}</div>
      <div className={`font-mono-num text-2xl md:text-3xl mt-1 ${color}`}>{value}</div>
    </div>
  );
}
