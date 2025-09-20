import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

async function getAccounts() {
  return await prisma.account.findMany({
    include: {
      contacts: true,
      opportunities: true,
      intent: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: {
        select: {
          contacts: true,
          opportunities: true,
          activities: true,
        },
      },
    },
    orderBy: { icpScore: "desc" },
  });
}

function computeIntentScore(intentSignals: any[]) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return intentSignals
    .filter((signal) => signal.createdAt >= thirtyDaysAgo)
    .reduce((sum, signal) => sum + (signal.weight || 0), 0);
}

function getStageColor(stage: string) {
  const colors = {
    IDENTIFY: "bg-gray-100 text-gray-800",
    ENGAGE: "bg-blue-100 text-blue-800",
    ACTIVATE: "bg-yellow-100 text-yellow-800",
    CLOSE: "bg-green-100 text-green-800",
    EXPAND: "bg-purple-100 text-purple-800",
  };
  return colors[stage as keyof typeof colors] || "bg-gray-100 text-gray-800";
}

function getTierColor(tier: string) {
  const colors = {
    TARGET: "bg-orange-100 text-orange-800",
    STRATEGIC: "bg-red-100 text-red-800",
    EXPANSION: "bg-green-100 text-green-800",
  };
  return colors[tier as keyof typeof colors] || "bg-gray-100 text-gray-800";
}

export default async function ABMHubPage() {
  const accounts = await getAccounts();

  return (
    <main className="max-w-7xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ABM Hub</h1>
        <p className="text-gray-600 mt-2">
          Account-Based Marketing for Luxury Yacht Industry
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600">Total Accounts</div>
          <div className="text-2xl font-semibold">{accounts.length}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600">Strategic Accounts</div>
          <div className="text-2xl font-semibold">
            {accounts.filter((a) => a.tier === "STRATEGIC").length}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600">Active Opportunities</div>
          <div className="text-2xl font-semibold">
            {accounts.reduce((sum, a) => sum + a.opportunities.length, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600">Avg Intent Score</div>
          <div className="text-2xl font-semibold">
            {Math.round(
              accounts.reduce(
                (sum, a) => sum + computeIntentScore(a.intent),
                0
              ) / accounts.length
            ) || 0}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Account Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ICP Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intent Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opportunities
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map((account) => {
                const intentScore = computeIntentScore(account.intent);
                return (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {account.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {account.industry} • {account.hqCity}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(
                          account.tier
                        )}`}
                      >
                        {account.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(
                          account.abmStage
                        )}`}
                      >
                        {account.abmStage}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.icpScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {intentScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account._count.contacts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account._count.opportunities}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={`/abm/${account.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </a>
                      <button className="text-green-600 hover:text-green-900">
                        Advance
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900">Quick Actions</h3>
        <div className="mt-2 space-x-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
            Import Target List
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
            Launch Campaign
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700">
            View Analytics
          </button>
        </div>
      </div>
    </main>
  );
}
