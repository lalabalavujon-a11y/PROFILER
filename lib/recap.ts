import { ProviderStats, RecapContext } from "@/contracts/Analytics";

function pct(n: number, d: number) {
  return d > 0 ? (n / d) * 100 : 0;
}

function fmtPct(x: number) {
  return `${x.toFixed(1)}%`;
}

function money(x: number) {
  return `$${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function bar(v: number) {
  const len = Math.max(1, Math.min(20, Math.round(v * 20)));
  return "█".repeat(len);
}

export function buildWeeklySlackBlocks(stats: ProviderStats, ctx: RecapContext) {
  const g = stats.google;
  const m = stats.gamma;
  const vCRg = pct(g.ctaClicks, g.views);
  const vCRm = pct(m.ctaClicks, m.views);
  const cCRg = pct(g.purchases, g.ctaClicks);
  const cCRm = pct(m.purchases, m.ctaClicks);
  const bumpRg = pct(g.bumpAttach, g.purchases);
  const bumpRm = pct(m.bumpAttach, m.purchases);
  const revDiff = stats.gamma.revenueUSD - stats.google.revenueUSD;
  const winner = ctx.winners;

  const providerRow = (name: string, s: any) =>
    `*${name}* | Views: *${s.views}* | CTR: *${fmtPct(pct(s.ctaClicks, s.views))}* | \nCheckout→Purchase: *${fmtPct(pct(s.purchases, s.ctaClicks))}* | Bump attach: *${fmtPct(pct(s.bumpAttach, s.purchases))}* | Revenue: *${money(s.revenueUSD)}*`;

  const maxViews = Math.max(g.views, m.views) || 1;
  const maxPurch = Math.max(g.purchases, m.purchases) || 1;
  const maxRev = Math.max(g.revenueUSD, m.revenueUSD) || 1;

  const bars =
    `*Views*     G ${bar(g.views / maxViews)}  |  M ${bar(m.views / maxViews)}\n` +
    `*Purchases* G ${bar(g.purchases / maxPurch)}  |  M ${bar(m.purchases / maxPurch)}\n` +
    `*Revenue*   G ${bar(g.revenueUSD / maxRev)}  |  M ${bar(m.revenueUSD / maxRev)}`;

  const anomalies: string[] = [];
  if (vCRm - vCRg > 5) anomalies.push("Gamma CTR outperforms Google by >5pp.");
  if (cCRg - cCRm > 5) anomalies.push("Google Checkout→Purchase beats Gamma by >5pp.");
  if (Math.abs(revDiff) / (stats.total.revenueUSD || 1) > 0.15)
    anomalies.push("Revenue split deviates >15% between providers.");

  const notes = (ctx.notes ?? []).concat(anomalies);

  return {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `📊 Weekly Deck Performance — ${ctx.weekOf}`, emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Events*\n${stats.total.events}` },
          { type: "mrkdwn", text: `*Gamma Enabled*\n${ctx.gammaEnabled ? "Yes" : "No"}` },
          { type: "mrkdwn", text: `*Total Revenue*\n${money(stats.total.revenueUSD)}` },
          { type: "mrkdwn", text: `*Total Purchases*\n${stats.total.purchases}` },
        ],
      },
      { type: "divider" },
      {
        type: "section",
        text: { type: "mrkdwn", text: providerRow("Google", g) },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: providerRow("Gamma", m) },
      },
      { type: "context", elements: [{ type: "mrkdwn", text: bars }] },
      { type: "divider" },
      ...(winner
        ? [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `:trophy: *Winner:* *${winner.provider.toUpperCase()}* — ${winner.reason}`,
              },
            },
          ]
        : []),
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "*Key Ratios*\n" +
            `• CTR — Google: *${fmtPct(vCRg)}*, Gamma: *${fmtPct(vCRm)}*\n` +
            `• Checkout→Purchase — Google: *${fmtPct(cCRg)}*, Gamma: *${fmtPct(cCRm)}*\n` +
            `• Bump attach — Google: *${fmtPct(bumpRg)}*, Gamma: *${fmtPct(bumpRm)}*`,
        },
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "*Notes / Anomalies*\n" +
            (notes.length ? notes.map((n) => `• ${n}`).join("\n") : "None"),
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text:
              "_Tip: set `GAMMA_ENABLED=false` to force Google globally; per-event override still honored if enabled._",
          },
        ],
      },
    ],
  };
}
