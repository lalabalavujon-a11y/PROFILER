export type DeckProvider = "google" | "gamma" | "both";

export type Host = {
  name: string;
  email: string;
  logoUrl: string;
  website: string;
  payoutModel: "GHL_AFFILIATE" | "STRIPE_CONNECT";
  commissionPct: number;
  affiliateId?: string;
};

export type Audience = {
  industry: string;
  size: "solo" | "smb" | "mid";
  region?: string;
  painPoints?: string[];
};

export type OfferToggle = {
  tripwirePrice: number;
  tripwireCredits: number;
  bumpEnabled: boolean;
  bumpPrice: number;
};

export type EventPacket = {
  eventId: string;
  date: string;
  venue: "live" | "zoom";
  host: Host;
  audience: Audience;
  offer: OfferToggle;
  utmBase?: string;
  assets: {
    deckTemplateId: string;
    gammaTemplateId?: string;
    brandingPalette?: string[];
    deckProvider?: DeckProvider;
  };
};
