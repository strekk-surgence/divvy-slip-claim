// Mock backend for Divvy Slip Claim — persists in localStorage
// Replace with Supabase once the product team integrates.

const SLIPS_KEY = "divvy.slips";
const REFS_KEY = "divvy.referrals";
const ME_KEY = "divvy.me";
const COUNTER_BASE = 12480;

export type Slip = {
  slip_no: string;          // e.g. "00347"
  x_handle: string;
  x_user_id: string;
  referral_code: string;    // short code, used in URL
  issued_at: string;        // ISO date
};

export type Referral = {
  referrer_handle: string;
  referee_handle: string;
  action: "claim" | "bet";
  timestamp: string;
};

function read<T>(k: string, fallback: T): T {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fallback; }
  catch { return fallback; }
}
function write<T>(k: string, v: T) { localStorage.setItem(k, JSON.stringify(v)); }

export function getAllSlips(): Slip[] { return read<Slip[]>(SLIPS_KEY, []); }
export function getAllReferrals(): Referral[] { return read<Referral[]>(REFS_KEY, []); }

export function getCurrentSlip(): Slip | null { return read<Slip | null>(ME_KEY, null); }
export function clearCurrentSlip() { localStorage.removeItem(ME_KEY); }

export function totalClaimedDisplay(): number {
  // Base counter + actual claims so the number looks alive
  return COUNTER_BASE + getAllSlips().length;
}

function nextSlipNo(): string {
  const n = getAllSlips().length + 1;
  return String(n).padStart(5, "0");
}

function genReferralCode(handle: string): string {
  const seed = (handle + Date.now().toString(36)).toLowerCase().replace(/[^a-z0-9]/g, "");
  return seed.slice(0, 4) + Math.random().toString(36).slice(2, 6);
}

// Mock X OAuth — returns a fake X user. Replace with real OAuth later.
export async function mockConnectX(): Promise<{ x_handle: string; x_user_id: string }> {
  await new Promise((r) => setTimeout(r, 700));
  const adjectives = ["paper", "ledger", "kickoff", "longshot", "bracket", "underdog", "stoppage", "extratime"];
  const nouns = ["fan", "punter", "scout", "oracle", "handler", "ref", "keeper"];
  const handle = `${adjectives[Math.floor(Math.random()*adjectives.length)]}_${nouns[Math.floor(Math.random()*nouns.length)]}${Math.floor(Math.random()*99)}`;
  return { x_handle: handle, x_user_id: "u_" + Math.random().toString(36).slice(2, 10) };
}

export function claimSlip(x_handle: string, x_user_id: string, referrerCode?: string): Slip {
  const existing = getAllSlips().find((s) => s.x_user_id === x_user_id);
  if (existing) { write(ME_KEY, existing); return existing; }
  const slip: Slip = {
    slip_no: nextSlipNo(),
    x_handle,
    x_user_id,
    referral_code: genReferralCode(x_handle),
    issued_at: new Date().toISOString(),
  };
  const all = getAllSlips();
  all.push(slip);
  write(SLIPS_KEY, all);
  write(ME_KEY, slip);

  if (referrerCode) {
    const referrer = all.find((s) => s.referral_code === referrerCode);
    if (referrer && referrer.x_handle !== x_handle) {
      const refs = getAllReferrals();
      refs.push({
        referrer_handle: referrer.x_handle,
        referee_handle: x_handle,
        action: "claim",
        timestamp: new Date().toISOString(),
      });
      write(REFS_KEY, refs);
    }
  }
  return slip;
}

export function getReferralsFor(handle: string): Referral[] {
  return getAllReferrals().filter((r) => r.referrer_handle === handle);
}

export type LeaderboardRow = { handle: string; referrals: number; points: number };

export function getLeaderboard(handle?: string): LeaderboardRow[] {
  const counts = new Map<string, number>();
  for (const r of getAllReferrals()) counts.set(r.referrer_handle, (counts.get(r.referrer_handle) || 0) + 1);
  if (handle && !counts.has(handle)) counts.set(handle, getReferralsFor(handle).length);
  const seeded: Array<[string, number]> = [
    ["sundayparlay", 14], ["boot_room", 12], ["extra_time_xi", 10],
    ["the_punter", 8], ["stoppage99", 6], ["paper_oracle", 5],
    ["bracket_king", 4], ["longshot_lou", 3],
  ];
  seeded.forEach(([h, n]) => { if (!counts.has(h)) counts.set(h, n); });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([h, n]) => ({ handle: h, referrals: n, points: 100 + n * 50 }));
}

export function getLeaderboardPosition(handle: string): number {
  const board = getLeaderboard(handle);
  const idx = board.findIndex((r) => r.handle === handle);
  return idx === -1 ? board.length + 1 : idx + 1;
}

export function buildReferralUrl(code: string): string {
  return `${window.location.origin}/?ref=${code}`;
}

export function getReferralCodeFromUrl(): string | undefined {
  const u = new URL(window.location.href);
  return u.searchParams.get("ref") || undefined;
}
