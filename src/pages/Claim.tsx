import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { buildReferralUrl, getCurrentSlip } from "@/lib/divvy";
import { toast } from "@/hooks/use-toast";
import Dashboard from "./Dashboard";
import slipImage from "@/assets/slip.png";

export default function Claim() {
  const slip = getCurrentSlip();
  const nav = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [gateOpen, setGateOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("divvy_followed_x") !== "1";
  });
  const [gateStep, setGateStep] = useState<"connect" | "follow">("connect");
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
  const tweet = `Just claimed my Divvy Season One Slip — No. ${slip.slip_no}. 100 Slip Points locked in. Climb the standings with me → ${referralUrl}`;

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
        a.download = `divvy-slip-${slip!.slip_no}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
      if (intent === "share") {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`, "_blank", "noopener,noreferrer");
        localStorage.setItem("divvy_shared_x", "1");
        setShared(true);
      }
    } catch {
      toast({ title: "Couldn't render slip", description: "Try Copy Link instead." });
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
              {gateStep === "connect" ? (
                <>
                  <div className="label-caps text-electric-green">Step 1 of 2</div>
                  <h2 className="font-serif-display text-3xl mt-3">
                    Connect your <span className="italic text-electric-green">X account</span>
                  </h2>
                  <p className="text-foreground/70 text-sm mt-3 leading-relaxed">
                    We link your Slip to your handle so points, referrals, and leaderboard rank stick to you.
                  </p>
                  <div className="mt-7 space-y-3">
                    <Button
                      onClick={() => {
                        window.open("https://x.com/i/oauth2/authorize", "_blank", "noopener,noreferrer");
                        setConnected(true);
                      }}
                      className="w-full h-12 rounded-none bg-electric-green text-background hover:bg-electric-green/90 font-semibold tracking-wide glow-green"
                    >
                      Connect X account
                    </Button>
                    <Button
                      onClick={() => setGateStep("follow")}
                      disabled={!connected}
                      variant="outline"
                      className="w-full h-12 rounded-none border-foreground/30 bg-transparent text-foreground hover:bg-foreground/5 font-semibold tracking-wide disabled:opacity-40"
                    >
                      {connected ? "Continue →" : "Connect first to continue"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="label-caps text-electric-green">Step 2 of 2</div>
                  <h2 className="font-serif-display text-3xl mt-3">
                    Follow <span className="italic text-electric-green">@divvybet</span> on X
                  </h2>
                  <p className="text-foreground/70 text-sm mt-3 leading-relaxed">
                    Stay in the loop on Season 1 drops, leaderboard updates, and bonus windows.
                    Follow to reveal your Slip.
                  </p>
                  <div className="mt-7 space-y-3">
                    <Button
                      onClick={openFollow}
                      className="w-full h-12 rounded-none bg-electric-green text-background hover:bg-electric-green/90 font-semibold tracking-wide glow-green"
                    >
                      Follow @divvybet on X
                    </Button>
                    <Button
                      onClick={revealSlip}
                      disabled={!followClicked}
                      variant="outline"
                      className="w-full h-12 rounded-none border-foreground/30 bg-transparent text-foreground hover:bg-foreground/5 font-semibold tracking-wide disabled:opacity-40"
                    >
                      {followClicked ? "Reveal my Slip →" : "Follow first to reveal"}
                    </Button>
                  </div>
                  <button
                    onClick={() => setGateStep("connect")}
                    className="label-caps mt-5 text-foreground/50 hover:text-foreground/80 underline-offset-4 hover:underline"
                  >
                    ← Back
                  </button>
                </>
              )}
              <p className="text-xs text-foreground/40 mt-5">
                We can't verify the follow — please don't unfollow after.
              </p>
            </div>
          </div>
        )}

        <div className="relative w-full max-w-xl my-8 surface border hairline shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] bg-background/95 backdrop-blur-xl">
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
                You're in Season One. <span className="text-electric-green font-semibold">100 Slip Points</span> credited. Climb the leaderboard.
              </p>
            </div>

            <div className="animate-fade-up relative" style={{ animationDelay: "120ms" }}>
              <div className="absolute -inset-8 bg-electric-green/10 blur-3xl rounded-full pointer-events-none" />
              <div ref={cardRef} className="relative mx-auto max-w-sm">
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

            <Button
              onClick={() => nav("/dashboard")}
              variant="outline"
              className="mt-3 w-full h-12 rounded-none border-foreground/30 bg-transparent text-foreground hover:bg-foreground/5 font-semibold tracking-wide"
            >
              Skip →
            </Button>

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

