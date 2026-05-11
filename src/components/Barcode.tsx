import { useMemo } from "react";

type Props = { value: string; className?: string };

// Renders a deterministic faux barcode from a string. Pure CSS bars.
export function Barcode({ value, className }: Props) {
  const bars = useMemo(() => {
    const widths: number[] = [];
    let h = 5381;
    for (let i = 0; i < value.length; i++) h = ((h << 5) + h) ^ value.charCodeAt(i);
    let x = Math.abs(h);
    for (let i = 0; i < 64; i++) {
      const w = (x & 3) + 1; // 1..4
      widths.push(w);
      x = (x * 1103515245 + 12345) >>> 0;
    }
    return widths;
  }, [value]);

  return (
    <div className={className}>
      <div className="barcode">
        {bars.map((w, i) => (
          <span key={i} style={{ width: `${w}px`, opacity: i % 5 === 0 ? 0.95 : 0.85 }} />
        ))}
      </div>
      <div className="font-mono-num text-[10px] tracking-[0.3em] mt-1.5 text-ink-soft text-center">
        {value.replace(/^https?:\/\//, "").toUpperCase()}
      </div>
    </div>
  );
}
