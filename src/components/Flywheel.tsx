type Stage = { key: string; title: string; desc: string };

const STAGES: Stage[] = [
  { key: "01", title: "Seed", desc: "Claim your Slip on X. Sequential, signed, yours." },
  { key: "02", title: "Discover", desc: "Friends spot the Slip on the timeline and want one." },
  { key: "03", title: "Create", desc: "They claim via your code. Your referrals stack." },
  { key: "04", title: "Convert", desc: "Slip Points convert to DVY when betting opens." },
];

export function Flywheel() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STAGES.map((s, i) => (
        <div key={s.key} className="paper-grain-soft border border-ink/20 p-5 relative">
          <div className="flex items-baseline justify-between">
            <span className="font-mono-num text-xs tracking-[0.25em] text-ink-soft">{s.key}</span>
            <span className="label-caps">Stage</span>
          </div>
          <div className="font-serif-display text-2xl mt-2">{s.title}</div>
          <p className="text-sm text-ink-soft mt-2 leading-snug">{s.desc}</p>
          {i < STAGES.length - 1 && (
            <div className="hidden lg:block absolute right-[-14px] top-1/2 -translate-y-1/2 text-ink-soft font-mono-num">→</div>
          )}
        </div>
      ))}
    </div>
  );
}
