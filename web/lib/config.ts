import { z } from "zod";

const EnvSchema = z
  .object({
    NODE_ENV: z.string().optional(),
    NEXT_PUBLIC_SITE_URL: z.string().url(),

    // ABM
    ABM_TOKEN: z.string().min(8),
    ABM_HMAC_SECRET: z.string().min(16),
    N8N_ABM_EVENT_URL: z.string().url().optional(),

    // Email
    RESEND_API_KEY: z.string().optional(),
    DIGEST_FROM: z.string().email().default("insights@leadrecon.com"),
    ABM_WEEKLY_TO: z.string().optional(),

    // GHL (optional at runtime; required for scripts/integrations)
    GHL_API_KEY: z.string().optional(),
    GHL_LOCATION_ID: z.string().optional(),
    GHL_PIPELINE_ID: z.string().optional(),
    GHL_STAGE_ID_ENGAGED: z.string().optional(),
    GHL_STAGE_ID_MEETING: z.string().optional(),
    GHL_STAGE_ID_PILOT_LIVE: z.string().optional(),
    GHL_STAGE_ID_EXPANSION: z.string().optional(),
    GHL_CF_ACCOUNT_ID: z.string().optional(),
    GHL_CF_ACCOUNT_NAME: z.string().optional(),
    GHL_CF_ABM_STAGE: z.string().optional(),
    GHL_CF_ICP_SCORE: z.string().optional(),
    GHL_CF_INTENT_SCORE: z.string().optional(),

    // ClickUp (optional)
    CLICKUP_API_TOKEN: z.string().optional(),
    CLICKUP_LIST_ID_INTENT: z.string().optional(),
    CLICKUP_LIST_ID_CAMPAIGNS: z.string().optional(),

    // Slack (optional)
    SLACK_WEBHOOK_URL: z.string().optional(),

    // Feature Flags
    FEATURE_FLAGS: z.string().optional(),
  })
  .transform((e) => ({
    ...e,
    FEATURE_SET: new Set(
      (e.FEATURE_FLAGS || "").split(/[,\s]+/).filter(Boolean)
    ),
  }));

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const formatted = parsed.error.format();
  throw new Error("Config validation failed: " + JSON.stringify(formatted));
}

export const config = {
  env: parsed.data.NODE_ENV || "development",
  siteUrl: parsed.data.NEXT_PUBLIC_SITE_URL,
  features: parsed.data.FEATURE_SET,

  abm: {
    token: parsed.data.ABM_TOKEN,
    hmacSecret: parsed.data.ABM_HMAC_SECRET,
    n8nEventUrl: parsed.data.N8N_ABM_EVENT_URL,
  },

  email: {
    resendKey: parsed.data.RESEND_API_KEY,
    from: parsed.data.DIGEST_FROM,
    weeklyTo: parsed.data.ABM_WEEKLY_TO,
  },

  ghl: {
    apiKey: parsed.data.GHL_API_KEY,
    locationId: parsed.data.GHL_LOCATION_ID,
    pipelineId: parsed.data.GHL_PIPELINE_ID,
    stages: {
      Engaged: parsed.data.GHL_STAGE_ID_ENGAGED,
      Meeting: parsed.data.GHL_STAGE_ID_MEETING,
      "Pilot Live": parsed.data.GHL_STAGE_ID_PILOT_LIVE,
      Expansion: parsed.data.GHL_STAGE_ID_EXPANSION,
    } as Record<
      "Engaged" | "Meeting" | "Pilot Live" | "Expansion",
      string | undefined
    >,
    fields: {
      account_id: parsed.data.GHL_CF_ACCOUNT_ID,
      account_name: parsed.data.GHL_CF_ACCOUNT_NAME,
      abm_stage: parsed.data.GHL_CF_ABM_STAGE,
      icp_score: parsed.data.GHL_CF_ICP_SCORE,
      intent_score: parsed.data.GHL_CF_INTENT_SCORE,
    } as Record<
      | "account_id"
      | "account_name"
      | "abm_stage"
      | "icp_score"
      | "intent_score",
      string | undefined
    >,
  },

  clickup: {
    apiToken: parsed.data.CLICKUP_API_TOKEN,
    listIds: {
      intent: parsed.data.CLICKUP_LIST_ID_INTENT,
      campaigns: parsed.data.CLICKUP_LIST_ID_CAMPAIGNS,
    },
  },

  slack: {
    webhookUrl: parsed.data.SLACK_WEBHOOK_URL,
  },
};

export type GhlStageName = keyof typeof config.ghl.stages;
export function stageId(name: GhlStageName): string | undefined {
  return config.ghl.stages[name];
}

export type GhlFieldName = keyof typeof config.ghl.fields;
export function customFieldId(name: GhlFieldName): string | undefined {
  return config.ghl.fields[name];
}

// ABM token helpers (works with API routes and middleware)
export function abmTokenFrom(
  headers: Headers,
  cookies?: { get: (name: string) => { value: string } | undefined }
) {
  return headers.get("x-abm-token") || cookies?.get("abm_token")?.value || "";
}

export function isAbmAuthorized(
  headers: Headers,
  cookies?: { get: (name: string) => { value: string } | undefined }
) {
  return abmTokenFrom(headers, cookies) === config.abm.token;
}

// Feature flag helpers
export function isFeatureEnabled(feature: string): boolean {
  return config.features.has(feature);
}

// Validation helpers
export function validateRequiredConfig() {
  const errors: string[] = [];

  if (!config.abm.token) errors.push("ABM_TOKEN is required");
  if (!config.abm.hmacSecret) errors.push("ABM_HMAC_SECRET is required");
  if (!config.siteUrl) errors.push("NEXT_PUBLIC_SITE_URL is required");

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateOptionalIntegrations() {
  const warnings: string[] = [];

  if (!config.email.resendKey)
    warnings.push("RESEND_API_KEY not set - email features disabled");
  if (!config.slack.webhookUrl)
    warnings.push("SLACK_WEBHOOK_URL not set - Slack notifications disabled");
  if (!config.ghl.apiKey)
    warnings.push("GHL_API_KEY not set - GoHighLevel integration disabled");
  if (!config.clickup.apiToken)
    warnings.push("CLICKUP_API_TOKEN not set - ClickUp integration disabled");

  return {
    hasWarnings: warnings.length > 0,
    warnings,
  };
}
