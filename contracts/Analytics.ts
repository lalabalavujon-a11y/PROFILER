export type ProviderKey = "google" | "gamma";

export type FunnelStats = {
  views: number;
  ctaClicks: number;
  checkouts: number;
  purchases: number;
  bumpAttach: number;
  revenueUSD: number;
};

export type ProviderStats = Record<ProviderKey, FunnelStats> & {
  total: FunnelStats & { events: number };
};

export type RecapContext = {
  weekOf: string;
  gammaEnabled: boolean;
  winners: { provider: ProviderKey; reason: string } | null;
  notes?: string[];
};
