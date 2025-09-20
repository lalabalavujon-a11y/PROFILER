import { PrismaClient, AbmStage } from "@prisma/client";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

async function getStageCounts() {
  const rows = await prisma.account.groupBy({
    by: ["abmStage"],
    _count: { _all: true },
  });
  const order: AbmStage[] = [
    "IDENTIFY",
    "ENGAGE",
    "ACTIVATE",
    "CLOSE",
    "EXPAND",
  ];
  return order.map((s) => ({
    stage: s,
    count: rows.find((r) => r.abmStage === s)?._count._all || 0,
  }));
}

async function getIntentSeries(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const sigs = await prisma.intentSignal.findMany({
    where: { createdAt: { gte: since } },
    select: { weight: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const byDay = new Map<string, number>();
  for (const s of sigs) {
    const d = new Date(s.createdAt);
    d.setHours(0, 0, 0, 0);
    const k = d.toISOString();
    byDay.set(k, (byDay.get(k) || 0) + (s.weight || 0));
  }
  const out: { date: string; score: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const k = d.toISOString();
    out.push({ date: k.slice(0, 10), score: byDay.get(k) || 0 });
  }
  return out;
}

async function getFunnelKpis() {
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const accs = await prisma.account.findMany({
    where: { updatedAt: { gte: since } },
    select: { abmStage: true },
  });
  const total = accs.length || 1;
  const engaged = accs.filter((a) => a.abmStage !== "IDENTIFY").length;
  const activate = accs.filter((a) =>
    ["ACTIVATE", "CLOSE", "EXPAND"].includes(a.abmStage)
  ).length;
  const close = accs.filter((a) =>
    ["CLOSE", "EXPAND"].includes(a.abmStage)
  ).length;
  return {
    engagedRate: Math.round((100 * engaged) / total),
    activateRate: Math.round((100 * activate) / total),
    closeRate: Math.round((100 * close) / total),
  };
}

async function getTopAccounts() {
  const accounts = await prisma.account.findMany({
    include: {
      intent: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      opportunities: true,
    },
    orderBy: { icpScore: "desc" },
    take: 10,
  });

  return accounts.map((account) => ({
    ...account,
    intentScore: account.intent.reduce(
      (sum, signal) => sum + (signal.weight || 0),
      0
    ),
    totalOpportunities: account.opportunities.length,
    totalValue: account.opportunities.reduce(
      (sum, opp) => sum + (opp.amount || 0),
      0
    ),
  }));
}

function Sparkline({
  data,
  height = 60,
}: {
  data: { date: string; score: number }[];
  height?: number;
}) {
  const width = 600;
  const max = Math.max(1, ...data.map((d) => d.score));
  const pts = data
    .map((d, i) => {
      const x = Math.round((i / (data.length - 1)) * width);
      const y = Math.round(height - (d.score / max) * height);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={pts}
      />
    </svg>
  );
}

export default async function InsightsPage() {
  const [stages, series, funnel, topAccounts] = await Promise.all([
    getStageCounts(),
    getIntentSeries(30),
    getFunnelKpis(),
    getTopAccounts(),
  ]);

  const totalIntent = series.reduce((s, d) => s + d.score, 0);

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">ABM Insights</h1>
        <div className="text-sm text-gray-500">Last 30 days</div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border p-4">
          <div className="text-xs text-gray-600">Total Intent</div>
          <div className="text-2xl font-semibold">{totalIntent}</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-xs text-gray-600">Engaged %</div>
          <div className="text-2xl font-semibold">{funnel.engagedRate}%</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-xs text-gray-600">Activated %</div>
          <div className="text-2xl font-semibold">{funnel.activateRate}%</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-xs text-gray-600">Closed/Pilot %</div>
          <div className="text-2xl font-semibold">{funnel.closeRate}%</div>
        </div>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="font-medium mb-2">Intent Velocity</h2>
        <Sparkline data={series} />
        <div className="mt-2 grid grid-cols-5 gap-2 text-xs text-gray-500">
          {series.slice(0, 5).map((s) => (
            <span key={s.date} className="truncate">
              {s.date.slice(5)}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="font-medium mb-2">Stage Distribution</h2>
        <div className="grid grid-cols-5 gap-3">
          {stages.map((s) => (
            <div key={s.stage} className="rounded-xl border p-3 text-center">
              <div className="text-xs text-gray-600">{s.stage}</div>
              <div className="text-xl font-semibold">{s.count}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="font-medium mb-4">Top Performing Accounts</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Account</th>
                <th className="text-left py-2">Stage</th>
                <th className="text-left py-2">ICP Score</th>
                <th className="text-left py-2">Intent Score</th>
                <th className="text-left py-2">Opportunities</th>
                <th className="text-left py-2">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {topAccounts.map((account) => (
                <tr key={account.id} className="border-b">
                  <td className="py-2">
                    <div className="font-medium">{account.name}</div>
                    <div className="text-sm text-gray-500">
                      {account.industry}
                    </div>
                  </td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        account.abmStage === "ENGAGE"
                          ? "bg-blue-100 text-blue-800"
                          : account.abmStage === "ACTIVATE"
                          ? "bg-yellow-100 text-yellow-800"
                          : account.abmStage === "CLOSE"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {account.abmStage}
                    </span>
                  </td>
                  <td className="py-2">{account.icpScore}</td>
                  <td className="py-2">{account.intentScore}</td>
                  <td className="py-2">{account.totalOpportunities}</td>
                  <td className="py-2">
                    {account.totalValue > 0
                      ? `$${(account.totalValue / 1000).toFixed(0)}k`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900">Quick Actions</h3>
        <div className="mt-2 space-x-4">
          <a
            href="/api/abm/weekly"
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 inline-block"
          >
            Send Weekly Brief
          </a>
          <a
            href="/api/abm/intent/spikes"
            className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 inline-block"
          >
            Check Intent Spikes
          </a>
          <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
            Export Report
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Tip: protected by your /abm middleware.
      </p>
    </main>
  );
}
