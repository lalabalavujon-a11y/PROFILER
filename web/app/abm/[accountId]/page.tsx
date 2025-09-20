import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

async function getAccount(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      contacts: {
        orderBy: { influence: "desc" },
      },
      opportunities: {
        orderBy: { createdAt: "desc" },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      intent: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      segments: true,
    },
  });

  if (!account) {
    notFound();
  }

  return account;
}

function computeIntentScore(intentSignals: any[]) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return intentSignals
    .filter((signal) => signal.createdAt >= thirtyDaysAgo)
    .reduce((sum, signal) => sum + (signal.weight || 0), 0);
}

function getRoleColor(role: string) {
  const colors = {
    ECONOMIC: "bg-red-100 text-red-800",
    TECHNICAL: "bg-blue-100 text-blue-800",
    CHAMPION: "bg-green-100 text-green-800",
    USER: "bg-gray-100 text-gray-800",
  };
  return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
}

function getStageColor(stage: string) {
  const colors = {
    QUALIFY: "bg-yellow-100 text-yellow-800",
    PROPOSE: "bg-blue-100 text-blue-800",
    NEGOTIATE: "bg-orange-100 text-orange-800",
    WON: "bg-green-100 text-green-800",
    LOST: "bg-red-100 text-red-800",
  };
  return colors[stage as keyof typeof colors] || "bg-gray-100 text-gray-800";
}

interface AccountPageProps {
  params: {
    accountId: string;
  };
}

export default async function AccountPage({ params }: AccountPageProps) {
  const account = await getAccount(params.accountId);
  const intentScore = computeIntentScore(account.intent);

  return (
    <main className="max-w-7xl mx-auto p-6">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{account.name}</h1>
            <p className="text-gray-600 mt-2">
              {account.industry} • {account.hqCity} • {account.region}
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
              Schedule Meeting
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
              Start Pilot
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Overview */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Account Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">ICP Score</div>
                <div className="text-2xl font-semibold">{account.icpScore}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Intent Score</div>
                <div className="text-2xl font-semibold">{intentScore}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">ABM Stage</div>
                <div className="text-lg font-medium">{account.abmStage}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Account Tier</div>
                <div className="text-lg font-medium">{account.tier}</div>
              </div>
            </div>
            {account.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Notes</div>
                <div className="text-sm">{account.notes}</div>
              </div>
            )}
          </div>

          {/* Buying Committee */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Buying Committee</h2>
            <div className="space-y-3">
              {account.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <div className="font-medium">
                      {contact.firstName} {contact.lastName}
                    </div>
                    <div className="text-sm text-gray-600">{contact.title}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {contact.role && (
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                          contact.role
                        )}`}
                      >
                        {contact.role}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      Influence: {contact.influence}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Opportunities</h2>
            <div className="space-y-3">
              {account.opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <div className="font-medium">{opp.name}</div>
                    <div className="text-sm text-gray-600">
                      {opp.amount &&
                        opp.currency &&
                        `${opp.amount} ${opp.currency}`}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(
                        opp.stage
                      )}`}
                    >
                      {opp.stage}
                    </span>
                    {opp.closeDate && (
                      <span className="text-sm text-gray-500">
                        {new Date(opp.closeDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
            <div className="space-y-3">
              {account.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <div className="font-medium">
                      {activity.action} via {activity.channel}
                    </div>
                    <div className="text-sm text-gray-600">
                      by {activity.actor}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Intent Signals */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Intent Signals</h2>
            <div className="space-y-3">
              {account.intent.slice(0, 10).map((signal) => (
                <div key={signal.id} className="p-3 border rounded">
                  <div className="font-medium text-sm">{signal.signal}</div>
                  <div className="text-xs text-gray-600">
                    via {signal.source}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(signal.createdAt).toLocaleDateString()} • Weight:{" "}
                    {signal.weight}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Segments */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Segments</h2>
            <div className="space-y-2">
              {account.segments.map((segment) => (
                <div
                  key={segment.id}
                  className="px-3 py-2 bg-gray-50 rounded text-sm"
                >
                  {segment.name}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
                📧 Send Account Brief
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
                📞 Schedule Call
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
                💼 Create Opportunity
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
                📊 Log Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
