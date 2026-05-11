import { useEffect, useState } from "react";
import { totalClaimedDisplay } from "@/lib/divvy";

export function ClaimCounter() {
  const [n, setN] = useState(totalClaimedDisplay());
  useEffect(() => {
    const id = setInterval(() => {
      // Climb slowly: +1 every 4-9s
      setN((v) => v + 1);
    }, 4000 + Math.random() * 5000);
    return () => clearInterval(id);
  }, []);

  const digits = n.toLocaleString("en-US").split("");

  return (
    <div className="inline-flex items-baseline gap-3 border-t border-b border-ink/30 py-3 px-5 paper-grain-soft">
      <span className="label-caps">Slips claimed</span>
      <span className="font-mono-num text-2xl tracking-tight">
        {digits.map((d, i) => (
          <span key={`${i}-${d}`} className="inline-block animate-tick">{d}</span>
        ))}
      </span>
    </div>
  );
}
