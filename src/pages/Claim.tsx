import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { buildReferralUrl, getCurrentSlip } from "@/lib/divvy";
import { toast } from "@/hooks/use-toast";
import Dashboard from "./Dashboard";
import { SlipCard } from "@/components/SlipCard";

export default function Claim() {
  const slip = getCurrentSlip();
  const nav = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [gateOpen, setGateOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("divvy_followed_x") !== "1";
  });
  const [connected, setConnected] = useState(false);
  const [followClicked, setFollowClicked] = useState(false);
  const [shared, setShared] = useState(() => typeof window !== "undefined" && localStorage.getItem("divvy_shared_x") === "1");

  useEffect(() => { if (!slip) nav("/"); }, [slip, nav]);
  if (!slip) return null;

  function openFollow() {
    window.open("https://x.com/intent/follow?screen_name=divvybet", "_blank", "noopener,noreferrer");
    setFollowClicked(true);
  }
  function revealSlip() {
    localStorage.setItem("divvy_followed_x", "1");
    setGateOpen(false);
  }

  const referralUrl = buildReferralUrl(slip.referral_code);
  const tweet = `Just claimed my Divvy Ticket No. ${slip.slip_no}. 1 Ticket credited. Stack more to fill the draw. → ${referralUrl}`;

  async function downloadAndShare(intent: "share" | "download") {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 3, useCORS: true });
      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png"));
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `divvy-ticket-${slip!.slip_no}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
      if (intent === "share") {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`, "_blank", "noopener,noreferrer");
        localStorage.setItem("divvy_shared_x", "1");
        setShared(true);
        nav("/dashboard");
      }
    } catch {
      toast({ title: "Couldn't render ticket", description: "Try Copy Link instead." });
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(referralUrl);
    toast({ title: "Referral link copied", description: referralUrl });
  }

  return (
    <>
      {/* Dashboard rendered underneath as the persistent background */}
      <div aria-hidden className="pointer-events-none">
        <Dashboard />
      </div>

      {/* Claim experience as a centered modal popup over the dashboard */}
      <div className="fixed inset-0 z-40 overflow-y-auto bg-background/40 backdrop-blur-sm animate-fade-in flex items-start md:items-center justify-center p-4">
        {gateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-md animate-fade-in p-4">
            <div className="surface relative max-w-md w-full p-8 text-center border hairline">
              <div className="label-caps text-electric-green">Claim your Ticket</div>
              <h2 className="font-serif-display text-3xl mt-3">
                Connect <span className="italic text-electric-green">X</span> & follow <span className="italic text-electric-green">@divvybet</span>
              </h2>
              <div className="mt-7 space-y-3 text-left">
                <button
                  onClick={() => {
                    if (connected) return;
                    window.open("https://x.com/i/oauth2/authorize", "_blank", "noopener,noreferrer");
                    setConnected(true);
                  }}
                  className={`w-full h-12 px-4 flex items-center gap-3 border transition-colors ${
                    connected
                      ? "border-electric-green/40 bg-electric-green/10 text-foreground cursor-default"
                      : "border-foreground/20 bg-transparent text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center border ${
                      connected ? "border-electric-green bg-electric-green text-background" : "border-foreground/30"
                    }`}
                  >
                    {connected ? "✓" : ""}
                  </span>
                  <span className="font-semibold tracking-wide text-sm">
                    {connected ? "Connected" : "Connect X account"}
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (followClicked) return;
                    openFollow();
                  }}
                  className={`w-full h-12 px-4 flex items-center gap-3 border transition-colors ${
                    followClicked
                      ? "border-electric-green/40 bg-electric-green/10 text-foreground cursor-default"
                      : "border-foreground/20 bg-transparent text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center border ${
                      followClicked ? "border-electric-green bg-electric-green text-background" : "border-foreground/30"
                    }`}
                  >
                    {followClicked ? "✓" : ""}
                  </span>
                  <span className="font-semibold tracking-wide text-sm">
                    {followClicked ? "Following" : "Follow @divvybet on X"}
                  </span>
                </button>
                <Button
                  onClick={revealSlip}
                  disabled={!connected || !followClicked}
                  className="w-full h-12 rounded-none bg-electric-green text-background hover:bg-electric-green/90 font-semibold tracking-wide glow-green disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-foreground/10 disabled:text-foreground/40 disabled:shadow-none"
                >
                  Reveal my Ticket →
                </Button>
              </div>
              <p className="text-xs text-foreground/40 mt-5">
                Once you're in, stay in.
              </p>
            </div>
          </div>
        )}

        <div className="relative w-full max-w-3xl my-8 surface border hairline shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] bg-background/95 backdrop-blur-xl">
          <button
            onClick={() => nav("/dashboard")}
            aria-label="Close and go to dashboard"
            className="absolute top-4 right-4 h-10 w-10 inline-flex items-center justify-center rounded-full border hairline hover:bg-foreground/5 transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>

          <section className="px-6 md:px-10 py-10">
            <div className="text-center mb-8 animate-fade-up">
              <div className="label-caps text-electric-green">Stamped & issued</div>
              <h1 className="font-serif-display text-3xl md:text-4xl mt-3">
                Slip No. <span className="font-mono-num align-middle">{slip.slip_no}</span> claimed.
              </h1>
              <p className="font-serif-display italic text-foreground/85 mt-3 text-base md:text-lg">
                You now hold one of the first <span className="font-mono-num not-italic">{Number(slip.slip_no).toLocaleString()}</span> slips issued.
              </p>
              <p className="text-foreground/70 mt-3 max-w-md mx-auto">
                You're in Season One. <span className="text-electric-green font-semibold">100 Slip Tickets</span> credited. Climb the leaderboard.
              </p>
            </div>

            <div className="animate-fade-up relative" style={{ animationDelay: "120ms" }}>
              <div className="absolute -inset-8 bg-electric-green/10 blur-3xl rounded-full pointer-events-none" />
              <div ref={cardRef} className="relative mx-auto max-w-2xl">
                <img src={slipImage} alt={`Divvy Season 1 Slip No. ${slip.slip_no}`} className="w-full h-auto block" />
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: "260ms" }}>
              <Button
                onClick={() => downloadAndShare("share")}
                disabled={busy}
                className="h-12 rounded-none bg-electric-green text-background hover:bg-electric-green/90 font-semibold tracking-wide glow-green"
              >
                {busy ? "Preparing image…" : "Share to X"}
              </Button>
              <Button
                onClick={copyLink}
                variant="outline"
                className="h-12 rounded-none border-foreground/30 bg-transparent text-foreground hover:bg-foreground/5 font-semibold tracking-wide"
              >
                Copy Link
              </Button>
            </div>


            <button
              onClick={() => downloadAndShare("download")}
              className="mt-5 label-caps underline-offset-4 hover:underline mx-auto block"
            >
              Just download the PNG
            </button>

            <p className="text-xs text-foreground/50 text-center mt-6 leading-relaxed">
              Your Slip image will download. Attach it to the X compose window for best timeline preview.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

