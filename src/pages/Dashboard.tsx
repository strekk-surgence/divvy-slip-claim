import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Copy, Check, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import slipImage from "@/assets/ticket.png";
import { Flywheel } from "@/components/Flywheel";
import { buildReferralUrl, clearCurrentSlip, getCurrentSlip, getLeaderboard, getLeaderboardPosition, getReferralsFor } from "@/lib/divvy";
import { toast } from "@/hooks/use-toast";

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

type EarnPath = { id: string; label: string; pts: string; url?: string; group: "social" | "wager" };

const EARN_PATHS: EarnPath[] = [
  { id: "wallet_connect", group: "wager", label: "Connect wallet on divvy.bet", pts: "5 tickets", url: "https://divvy.bet" },
  { id: "wager_sol", group: "wager", label: "Every 0.05 SOL wagered on Divvy (auto-synced)", pts: "10 tickets", url: "https://divvy.bet" },
  { id: "match_night", group: "wager", label: "Bet on the weekly Match Night fixture", pts: "20 tickets", url: "https://divvy.bet" },
  { id: "mint_champ", group: "wager", label: "Mint your 1st Champions Series entry", pts: "20 tickets", url: "https://divvy.bet" },
  { id: "mint_champ_more", group: "wager", label: "Mint additional Champions Series entries", pts: "10 tickets each", url: "https://divvy.bet" },
  { id: "refer", group: "social", label: "Refer a friend", pts: "1 ticket each" },
  { id: "submit_email", group: "social", label: "Submit your email", pts: "1 ticket" },
  { id: "follow_x", group: "social", label: "Follow @divvybet on X", pts: "1 ticket", url: "https://x.com/intent/follow?screen_name=divvybet" },
  { id: "share_x", group: "social", label: "Share Ticket on X", pts: "5 tickets", url: "https://twitter.com/intent/tweet?text=Just%20claimed%20my%20Divvy%20Ticket" },
  { id: "share_ig", group: "social", label: "Share on Instagram", pts: "5 tickets", url: "https://www.instagram.com/" },
  { id: "join_discord", group: "social", label: "Join Divvy Discord", pts: "1 ticket", url: "https://discord.gg/divvy" },
  { id: "join_tg", group: "social", label: "Join Divvy Telegram", pts: "1 ticket", url: "https://t.me/divvybet" },
];

export default function Dashboard() {
  const slip = getCurrentSlip();
  const nav = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showAllBoard, setShowAllBoard] = useState(false);
  const [claimed, setClaimed] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("divvy_earn_claimed") || "{}"); } catch { return {}; }
  });

  function claimEarn(p: EarnPath) {
    if (claimed[p.id]) return;
    if (p.id === "submit_email") {
      const email = window.prompt("Enter your email to claim 1 ticket:");
      if (!email) return;
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      if (!ok) {
        toast({ title: "Invalid email", description: "Please enter a valid email address." });
        return;
      }
      localStorage.setItem("divvy_email", email.trim());
      toast({ title: "Email saved", description: "+1 ticket credited." });
    } else if (p.url) {
      window.open(p.url, "_blank", "noopener,noreferrer");
    }
    const next = { ...claimed, [p.id]: true };
    setClaimed(next);
    localStorage.setItem("divvy_earn_claimed", JSON.stringify(next));
  }
  useEffect(() => { if (!slip) nav("/"); }, [slip, nav]);
  if (!slip) return null;

  const refs = getReferralsFor(slip.x_handle);
  const position = getLeaderboardPosition(slip.x_handle);
  const fullBoard = getLeaderboard(slip.x_handle);
  const board = showAllBoard ? fullBoard : fullBoard.slice(0, 10);
  const referralUrl = buildReferralUrl(slip.referral_code);

  const slipPoints = 1 + refs.length;
  const refPoints = refs.length;

  const animPoints = useCountUp(slipPoints);
  const animRefPts = useCountUp(refPoints);

  async function copyRef() {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast({ title: "Referral link copied" });
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="min-h-screen divvy-bg">
      <header className="container flex items-center justify-between py-6 border-b hairline">
        <Link to="/" className="flex items-center gap-2">
          <span
            className="h-7 w-7 rounded-md flex items-center justify-center font-serif-display text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #7C02FF 0%, #00D87E 100%)" }}
          >
            D
          </span>
          <span className="font-serif-display text-xl tracking-wide text-white">
            Divvy<span className="text-white/60">.bet</span>
          </span>
        </Link>
        <Button
          onClick={() => {
            clearCurrentSlip();
            localStorage.removeItem("divvy_followed_x");
            localStorage.removeItem("divvy_shared_x");
            toast({ title: "Disconnected", description: `@${slip.x_handle} signed out.` });
            nav("/");
          }}
          variant="outline"
          className="h-10 rounded-none border-foreground/20 hover:bg-foreground/5 px-4"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </Button>
      </header>

      {/* Top CTA bar: referral link + claim on Divvy */}
      <section className="container pt-8">
        <div className="surface p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          <div className="min-w-0 flex-1">
            <div className="label-caps mb-1">Your referral link</div>
            <div className="font-mono-num text-sm md:text-base truncate text-foreground/90">{referralUrl}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={copyRef}
              variant="outline"
              className="h-11 rounded-none border-foreground/20 hover:bg-foreground/5 px-4"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
        </div>
      </section>

      <section className="container py-10 md:py-14 grid lg:grid-cols-[minmax(0,560px)_1fr] gap-12 lg:gap-16 items-start">
        <div className="lg:sticky lg:top-8">
          <div className="label-caps mb-3">Your Ticket</div>
          <div className="relative">
            <img src={slipImage} alt={`Divvy Season 1 Slip No. ${slip.slip_no}`} className="w-full h-auto block" />
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <div className="label-caps">Issued To</div>
            <h1 className="font-serif-display text-4xl md:text-5xl mt-1">@{slip.x_handle}</h1>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Tickets" value={animPoints.toLocaleString()} accent="green" />
            <Stat label="Grand Jackpot Pool" value="TBD" accent="green" />
          </div>

          <div className="surface p-5 flex items-center justify-between gap-4">
            <div>
              <div className="label-caps">From referrals</div>
              <div className="font-mono-num text-2xl mt-1">
                +<span className="text-electric-green">{animRefPts.toLocaleString()}</span> tickets
              </div>
              <div className="text-right sm:text-left mt-3">
                <div className="label-caps">Friends claimed</div>
                <div className="font-mono-num text-2xl mt-1">{refs.length}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono-num font-bold text-electric-green text-5xl md:text-6xl leading-none glow-green">
                1
              </div>
              <div className="label-caps text-electric-green mt-2">per referral</div>
            </div>
          </div>

          {/* Stack More Tickets */}
          <div className="surface">
            <div className="px-5 pt-5">
              <div className="label-caps">Stack More Tickets</div>
              <div className="font-serif-display text-2xl mt-1">Ways to stack</div>
            </div>

            <div className="mt-4">
              <div className="px-5 py-2 border-b hairline flex items-center justify-between bg-electric-green/5">
                <div className="label-caps text-electric-green">Wagering on Divvy</div>
                <div className="label-caps text-electric-green">Stack faster ▲</div>
              </div>
              {EARN_PATHS.filter((p) => p.group === "wager").map((p) => {
                const isClaimed = !!claimed[p.id];
                return (
                  <button
                    key={p.id}
                    onClick={() => claimEarn(p)}
                    disabled={isClaimed}
                    className={`w-full flex items-center justify-between px-5 py-3 border-b hairline last:border-b-0 text-left transition-colors border-l-2 border-l-electric-green/60 ${
                      isClaimed ? "opacity-50 cursor-not-allowed" : "hover:bg-electric-green/5 cursor-pointer"
                    }`}
                  >
                    <div className={`text-sm md:text-[15px] flex items-center gap-2 font-medium ${isClaimed ? "text-foreground/50 line-through" : "text-foreground/90"}`}>
                      {p.label}
                      {isClaimed && <Check className="h-3.5 w-3.5 text-electric-green" />}
                    </div>
                    <div className={`font-mono-num text-sm shrink-0 ml-4 ${isClaimed ? "text-foreground/40" : "text-electric-green"}`}>
                      {isClaimed ? "Claimed" : p.pts}
                    </div>
                  </button>
                );
              })}

              <div className="px-5 py-2 border-y hairline flex items-center justify-between bg-foreground/[0.02]">
                <div className="label-caps">Social actions</div>
                
              </div>
              {EARN_PATHS.filter((p) => p.group === "social").map((p) => {
                const isClaimed = !!claimed[p.id];
                return (
                  <button
                    key={p.id}
                    onClick={() => claimEarn(p)}
                    disabled={isClaimed}
                    className={`w-full flex items-center justify-between px-5 py-3 border-b hairline last:border-b-0 text-left transition-colors ${
                      isClaimed ? "opacity-50 cursor-not-allowed" : "hover:bg-electric-green/5 cursor-pointer"
                    }`}
                  >
                    <div className={`text-sm md:text-[15px] flex items-center gap-2 ${isClaimed ? "text-foreground/50 line-through" : "text-foreground/85"}`}>
                      {p.label}
                      {isClaimed && <Check className="h-3.5 w-3.5 text-electric-green" />}
                    </div>
                    <div className={`font-mono-num text-sm shrink-0 ml-4 ${isClaimed ? "text-foreground/40" : "text-electric-green"}`}>
                      {isClaimed ? "Claimed" : p.pts}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Top Rewards This Season */}
          <div className="surface">
            <div className="px-5 pt-5">
              <div className="label-caps text-electric-green">Top Rewards This Season</div>
              <div className="font-serif-display text-2xl mt-1">What you're climbing for</div>
              <p className="text-xs text-foreground/55 mt-2">Rewards revealed soon. Placeholders below.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-foreground/10 mt-4 border-t hairline">
              {[
                { tag: "Prize Pool", title: "Season prize pool", sub: "Drawn at the World Cup Final. More Tickets, more chances." },
                { tag: "Status", title: "Founder status", sub: "Permanent badge for early holders." },
              ].map((r) => (
                <div key={r.title} className="bg-background p-5">
                  <div className="label-caps text-electric-green">{r.tag}</div>
                  <div className="font-serif-display text-xl mt-1">{r.title}</div>
                  <p className="text-xs text-foreground/60 mt-2 leading-snug">{r.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="surface">
            <div className="flex items-baseline justify-between px-5 pt-5">
              <div>
                <div className="label-caps">Leaderboard</div>
                <div className="font-serif-display text-2xl mt-1">Top Ticket Holders</div>
              </div>
              <div className="label-caps">You · #{String(position).padStart(3, "0")}</div>
            </div>
            <p className="px-5 mt-3 text-xs text-foreground/60 leading-relaxed">
              Live activity.
            </p>
            <div className="mt-4">
              <div className="grid grid-cols-[40px_1fr_80px_100px] label-caps px-5 pb-2 border-b hairline">
                <div>#</div><div>Handle</div><div className="text-right">Refs</div><div className="text-right">Tickets</div>
              </div>
              {board.map((row, i) => {
                const isMe = row.handle === slip.x_handle;
                return (
                  <div
                    key={row.handle}
                    className={`grid grid-cols-[40px_1fr_80px_100px] px-5 py-3 border-b hairline last:border-b-0 items-center ${
                      isMe ? "bg-electric-green/10" : ""
                    }`}
                  >
                    <div className={`font-mono-num ${i < 3 ? "text-electric-green" : "text-foreground/70"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="truncate">
                      @{row.handle}{" "}
                      {isMe && <span className="ml-2 text-xs label-caps text-electric-green">You</span>}
                    </div>
                    <div className="font-mono-num text-right">{row.referrals}</div>
                    <div className="font-mono-num text-right">{row.points.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
            <p className="px-5 py-4 text-xs italic text-foreground/55 border-t hairline">
              Display only. Winners drawn randomly. More Tickets weight your odds.
            </p>
            {fullBoard.length > 10 && (
              <div className="px-5 py-4 border-t hairline">
                <button
                  onClick={() => setShowAllBoard((v) => !v)}
                  className="label-caps text-electric-green underline-offset-4 hover:underline"
                >
                  {showAllBoard ? "Collapse leaderboard" : "View Full Leaderboard →"}
                </button>
              </div>
            )}
          </div>

          <div className="pt-6 border-t hairline">
            <div className="label-caps mb-4">How it works</div>
            <Flywheel />
          </div>
        </div>
      </section>

      <footer className="container py-8 text-sm text-foreground/55 border-t hairline">
        Slip Tickets credit to your wallet when you connect on Divvy. Season One standings TBD.
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
