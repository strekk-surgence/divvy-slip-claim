type Stage = { key: string; title: string; desc: string };

const STAGES: Stage[] = [
  { key: "01", title: "Seed", desc: "Claim your Ticket on X. Sequential, signed, yours." },
  { key: "02", title: "Discover", desc: "Friends spot the Ticket on the timeline and want one." },
  { key: "03", title: "Create", desc: "They claim via your code. Your referrals stack." },
  { key: "04", title: "Convert", desc: "Tickets win prizes." },
];

export function Flywheel() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STAGES.map((s, i) => (
        <div key={s.key} className="surface-soft p-5 relative">
          <div className="flex items-baseline justify-between">
            <span className="font-mono-num text-xs tracking-[0.25em] text-foreground/65">{s.key}</span>
            <span className="label-caps">Stage</span>
          </div>
          <div className="font-serif-display text-2xl mt-2">{s.title}</div>
          <p className="text-sm text-foreground/65 mt-2 leading-snug">{s.desc}</p>
          {i < STAGES.length - 1 && (
            <div className="hidden lg:block absolute right-[-14px] top-1/2 -translate-y-1/2 text-foreground/65 font-mono-num">→</div>
          )}
        </div>
      ))}
    </div>
  );
}
