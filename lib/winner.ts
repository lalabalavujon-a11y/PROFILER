import { ProviderStats } from "@/contracts/Analytics";

export function pickWinner(stats: ProviderStats) {
  const score = (s: any) =>
    0.4 * s.revenueUSD + 0.4 * s.purchases * 300 + 0.2 * (s.ctaClicks / Math.max(1, s.views)) * 10000;
  const googleScore = score(stats.google);
  const gammaScore = score(stats.gamma);
  if (Math.abs(googleScore - gammaScore) < 0.05 * Math.max(googleScore, gammaScore)) {
    return { provider: null, reason: "Statistical tie (<5% delta)." } as const;
  }
  const provider = googleScore > gammaScore ? "google" : "gamma";
  const reason = provider === "gamma" ? "Higher revenue & comparable close rate." : "Better close rate and total revenue.";
  return { provider, reason } as const;
}
