type Stage = { key: string; title: string; desc: string };

const STAGES: Stage[] = [
  { key: "01", title: "Claim", desc: "Claim your free Ticket on X." },
  { key: "02", title: "Stack", desc: "Bet, mint, refer, share. Every action stacks more Tickets." },
  { key: "03", title: "Enter", desc: "Every Ticket enters you into the Weekly Pool and Grand Jackpot." },
  { key: "04", title: "Win", desc: "Multiple winners every week. Grand Jackpot drawn at the World Cup Final." },
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
