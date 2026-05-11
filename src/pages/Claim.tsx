import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { SlipCard } from "@/components/SlipCard";
import { useNavigate, Link } from "react-router-dom";
import { buildReferralUrl, getCurrentSlip } from "@/lib/divvy";
import { toast } from "@/hooks/use-toast";

export default function Claim() {
  const slip = getCurrentSlip();
  const nav = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!slip) nav("/"); }, [slip, nav]);
  if (!slip) return null;

  const referralUrl = buildReferralUrl(slip.referral_code);
  const tweet = `Just claimed my Divvy Season 1 Slip. No. ${slip.slip_no}. Join me before the World Cup → ${referralUrl}`;

  async function downloadAndShare(intent: "share" | "download") {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
      });
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
        const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
        window.open(x, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
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
    <main className="min-h-screen paper-grain">
      <header className="container flex items-center justify-between py-6">
        <Link to="/" className="font-serif-display text-xl tracking-wide">DIVVY</Link>
        <Link to="/dashboard" className="label-caps underline-offset-4 hover:underline">My Slip ›</Link>
      </header>

      <section className="container py-6 md:py-10 max-w-xl">
        <div className="text-center mb-8 animate-fade-up">
          <div className="label-caps">Stamped & issued</div>
          <h1 className="font-serif-display text-4xl md:text-5xl mt-2">
            Slip No. <span className="font-mono-num text-[2.2rem] md:text-[2.6rem] align-middle">{slip.slip_no}</span>
          </h1>
          <p className="text-ink-soft mt-2">Issued to @{slip.x_handle}. Share it to earn referrals.</p>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
          <SlipCard ref={cardRef} slip={slip} animate />
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: "260ms" }}>
          <Button
            onClick={() => downloadAndShare("share")}
            disabled={busy}
            className="h-12 rounded-none bg-ink text-paper hover:bg-ink/90 font-semibold tracking-wide"
          >
            {busy ? "Preparing image…" : "Share to X"}
          </Button>
          <Button
            onClick={copyLink}
            variant="outline"
            className="h-12 rounded-none border-ink text-ink hover:bg-ink hover:text-paper font-semibold tracking-wide"
          >
            Copy Link
          </Button>
        </div>

        <button
          onClick={() => downloadAndShare("download")}
          className="mt-4 label-caps underline-offset-4 hover:underline mx-auto block"
        >
          Just download the PNG
        </button>

        <p className="text-xs text-ink-soft text-center mt-6 leading-relaxed">
          Your Slip image will download. Attach it to the X compose window for best timeline preview.
        </p>
      </section>

      <footer className="container py-10 text-center text-sm text-ink-soft">
        <Link to="/dashboard" className="underline underline-offset-4">Go to my dashboard →</Link>
      </footer>
    </main>
  );
}
