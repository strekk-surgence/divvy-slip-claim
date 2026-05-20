import { forwardRef } from "react";
import { Barcode } from "./Barcode";
import { buildReferralUrl, type Slip } from "@/lib/divvy";

type Props = {
  slip: Slip;
  animate?: boolean;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}

export const SlipCard = forwardRef<HTMLDivElement, Props>(({ slip, animate }, ref) => {
  const url = buildReferralUrl(slip.referral_code);

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-[360px] aspect-[3/5] paper-grain-soft shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45),0_8px_20px_-12px_rgba(0,0,0,0.3)] border border-ink/15"
      style={{ borderRadius: 4 }}
    >
      {/* Perforated edge on left */}
      <div className="absolute top-0 left-0 h-full w-3 perforated-left pointer-events-none" />

      {/* Stamp */}
      <div
        className={`absolute right-4 top-5 z-10 select-none ${animate ? "animate-stamp-in" : ""}`}
        style={animate ? { opacity: 0 } : undefined}
      >
        <div className="stamp text-sm">Issued</div>
      </div>

      <div className="h-full flex flex-col px-6 pl-8 py-6">
        {/* Header */}
        <div className="border-b border-dashed border-ink/40 pb-3">
          <div className="font-serif-display text-[1.35rem] leading-none tracking-wide">
            DIVVY <span className="text-ink-soft">·</span> SEASON 1
          </div>
          <div className="label-caps-paper mt-2">Official Claim Receipt</div>
        </div>

        {/* Slip No */}
        <div className="mt-5">
          <div className="label-caps-paper">Slip No.</div>
          <div className="font-mono-num text-[2.6rem] leading-none tracking-tight mt-1">
            {slip.slip_no}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-y-4 gap-x-3">
          <Field label="Issued To" value={`@${slip.x_handle}`} mono />
          <Field label="Issued" value={formatDate(slip.issued_at)} mono />
          <Field label="Selection" value="Season 1 · World Cup" />
          <Field label="Stake" value="your call" italic />
          <Field label="Potential" value="Slip Tickets" className="col-span-2" />
        </div>

        <div className="my-4 border-t border-dashed border-ink/40" />

        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <div className="label-caps-paper">Ref. Code</div>
            <div className="font-mono-num text-base mt-0.5">{slip.referral_code.toUpperCase()}</div>
          </div>
          <div className="text-right">
            <div className="label-caps-paper">Status</div>
            <div className="font-mono-num text-base mt-0.5">VALID</div>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <Barcode value={url} />
        </div>
      </div>
    </div>
  );
});
SlipCard.displayName = "SlipCard";

function Field({
  label, value, mono, italic, className,
}: { label: string; value: string; mono?: boolean; italic?: boolean; className?: string }) {
  return (
    <div className={className}>
      <div className="label-caps-paper">{label}</div>
      <div className={`mt-0.5 text-ink ${mono ? "font-mono-num text-[0.95rem]" : "text-[0.95rem]"} ${italic ? "italic font-serif-display font-normal" : ""}`}>
        {value}
      </div>
    </div>
  );
}
