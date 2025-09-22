import { z } from "zod";
import { NextRequest } from "next/server";

// Input validation schemas for each agent
export const ProfilerInputSchema = z.object({
  eventId: z.string().min(1).max(100),
  website: z.string().url().optional().or(z.literal("")),
  businessName: z.string().min(1).max(200),
  industry: z.string().min(1).max(100),
  services: z.array(z.string().max(100)).max(20),
  valueProposition: z.string().min(1).max(1000),
  targetMarket: z.string().max(500).optional(),
  competitors: z.array(z.string().max(100)).max(50).optional(),
  marketSize: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  businessModel: z.string().max(200).optional(),
  revenue: z.string().max(100).optional(),
  employees: z.string().max(50).optional(),
  audienceSize: z.string().max(100).optional(),
  targetAudience: z.string().max(500).optional(),
  crmConfig: z.record(z.any()).optional(),
  socialConfig: z.record(z.any()).optional(),
  websiteConfig: z.record(z.any()).optional(),
});

export const StrategistInputSchema = z.object({
  eventId: z.string().min(1).max(100),
  businessName: z.string().min(1).max(200),
  industry: z.string().min(1).max(100),
  services: z.array(z.string().max(100)).max(20),
  valueProposition: z.string().min(1).max(1000),
  businessSize: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal("")),
  uniqueSellingPoints: z.array(z.string().max(200)).max(10).optional(),
  targetAudience: z.string().max(500).optional(),
  marketSize: z.string().max(200).optional(),
  competitors: z.array(z.string().max(100)).max(50).optional(),
  marketPosition: z.string().max(200).optional(),
  businessGoals: z.array(z.string().max(200)).max(20).optional(),
  marketingGoals: z.array(z.string().max(200)).max(20).optional(),
  revenueTargets: z.string().max(100).optional(),
  growthTargets: z.string().max(100).optional(),
  marketingBudget: z.string().max(100).optional(),
  teamSize: z.string().max(50).optional(),
  marketingTools: z.array(z.string().max(100)).max(20).optional(),
  timeline: z.string().max(200).optional(),
  audienceSize: z.string().max(100).optional(),
  pricing: z.string().max(200).optional(),
});

export const DMBreakthroughInputSchema = z.object({
  eventId: z.string().min(1).max(100),
  prospectName: z.string().min(1).max(100),
  prospectCompany: z.string().min(1).max(200),
  prospectRole: z.string().min(1).max(100),
  businessServices: z.array(z.string().max(100)).max(20),
  businessValueProposition: z.string().min(1).max(1000),
  prospectIndustry: z.string().max(100).optional(),
  prospectLocation: z.string().max(100).optional(),
  prospectEmail: z.string().email().optional().or(z.literal("")),
  prospectPhone: z.string().max(20).optional(),
  prospectLinkedin: z.string().url().optional().or(z.literal("")),
  prospectCompanySize: z.string().max(100).optional(),
  prospectWebsite: z.string().url().optional().or(z.literal("")),
  prospectRecentNews: z.array(z.string().max(500)).max(10).optional(),
  prospectChallenges: z.array(z.string().max(200)).max(20).optional(),
  prospectGoals: z.array(z.string().max(200)).max(20).optional(),
  prospectSource: z.string().max(100).optional(),
  prospectPreviousInteraction: z.array(z.string().max(500)).max(10).optional(),
  prospectInterests: z.array(z.string().max(200)).max(20).optional(),
  prospectPainPoints: z.array(z.string().max(200)).max(20).optional(),
  prospectDecisionMaking: z.record(z.any()).optional(),
  prospectCommunicationStyle: z.record(z.any()).optional(),
  businessCaseStudies: z.array(z.string().max(1000)).max(10).optional(),
  businessTestimonials: z.array(z.string().max(1000)).max(10).optional(),
  businessPricing: z.string().max(200).optional(),
});

export const ContentCreatorInputSchema = z.object({
  eventId: z.string().min(1).max(100),
  businessName: z.string().min(1).max(200),
  industry: z.string().min(1).max(100),
  services: z.array(z.string().max(100)).max(20),
  valueProposition: z.string().min(1).max(1000),
  targetAudience: z.string().max(500).optional(),
  brandVoice: z.string().max(200).optional(),
  contentGoals: z.array(z.string().max(200)).max(20).optional(),
  contentTypes: z.array(z.string().max(100)).max(20).optional(),
  contentFrequency: z.string().max(50).optional(),
  contentChannels: z.array(z.string().max(100)).max(20).optional(),
  contentBudget: z.string().max(100).optional(),
  contentResources: z.array(z.string().max(200)).max(20).optional(),
  audienceDemographics: z.record(z.any()).optional(),
  audiencePsychographics: z.record(z.any()).optional(),
  audiencePainPoints: z.array(z.string().max(200)).max(20).optional(),
  audienceInterests: z.array(z.string().max(200)).max(20).optional(),
  audienceMediaConsumption: z.record(z.any()).optional(),
  audienceContentPreferences: z.record(z.any()).optional(),
  competitorContentAnalysis: z.array(z.string().max(1000)).max(20).optional(),
  competitorContentGaps: z.array(z.string().max(500)).max(20).optional(),
  competitorOpportunities: z.array(z.string().max(500)).max(20).optional(),
  existingCurrentContent: z.array(z.string().max(1000)).max(50).optional(),
  existingPerformance: z.record(z.any()).optional(),
  existingGaps: z.array(z.string().max(500)).max(20).optional(),
});

export const PromptWizardInputSchema = z.object({
  eventId: z.string().min(1).max(100),
  userRequest: z.string().min(1).max(2000),
  intent: z.string().max(200).optional(),
  useCase: z.string().max(100).optional(),
  promptType: z.string().max(100).optional(),
  complexity: z.enum(["simple", "medium", "advanced"]).optional(),
  tone: z.enum(["professional", "casual", "urgent", "friendly"]).optional(),
  promptLength: z.enum(["short", "medium", "long"]).optional(),
  requiredVariables: z.array(z.string().max(50)).max(10).optional(),
  examples: z.array(z.string().max(1000)).max(10).optional(),
  website: z.string().url().optional().or(z.literal("")),
  companyName: z.string().max(200).optional(),
  contactPerson: z.string().max(100).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  peopleInfo: z.string().max(2000).optional(),
  influencerName: z.string().max(100).optional(),
  influencerProfile: z.string().max(2000).optional(),
  influencerInfo: z.string().max(2000).optional(),
});

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  profiler: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    message: "Too many profiler requests. Please try again later.",
  },
  strategist: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    message: "Too many strategist requests. Please try again later.",
  },
  dmBreakthrough: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 15,
    message: "Too many DM breakthrough requests. Please try again later.",
  },
  contentCreator: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    message: "Too many content creator requests. Please try again later.",
  },
  promptWizard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20,
    message: "Too many prompt wizard requests. Please try again later.",
  },
};

// Content filtering and sanitization
export class ContentFilter {
  private static readonly BLOCKED_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi,
    /<link\b[^>]*>/gi,
    /<meta\b[^>]*>/gi,
  ];

  private static readonly SUSPICIOUS_PATTERNS = [
    /password/i,
    /credit.?card/i,
    /ssn|social.?security/i,
    /bank.?account/i,
    /routing.?number/i,
    /api.?key/i,
    /secret/i,
    /token/i,
  ];

  static sanitizeInput(input: string): string {
    if (!input || typeof input !== "string") return "";

    // Remove potentially dangerous HTML/JavaScript
    let sanitized = input;
    this.BLOCKED_PATTERNS.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, "");
    });

    // Truncate if too long
    if (sanitized.length > 10000) {
      sanitized = sanitized.substring(0, 10000) + "...";
    }

    return sanitized.trim();
  }

  static containsSensitiveData(input: string): boolean {
    if (!input || typeof input !== "string") return false;
    return this.SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(input));
  }

  static validateUrl(url: string): boolean {
    if (!url || typeof url !== "string") return false;
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  static validateEmail(email: string): boolean {
    if (!email || typeof email !== "string") return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Rate limiting store (in production, use Redis or similar)
class RateLimitStore {
  private static store = new Map<
    string,
    { count: number; resetTime: number }
  >();

  static checkLimit(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      this.store.set(key, { count: 1, resetTime: now + config.windowMs });
      return true;
    }

    if (record.count >= config.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  static getRemainingRequests(key: string, config: RateLimitConfig): number {
    const record = this.store.get(key);
    if (!record || Date.now() > record.resetTime) {
      return config.maxRequests;
    }
    return Math.max(0, config.maxRequests - record.count);
  }
}

// Authentication and authorization
export class AuthGuard {
  static validateApiKey(request: NextRequest): boolean {
    const apiKey =
      request.headers.get("x-api-key") || request.headers.get("authorization");

    if (!apiKey) {
      return false;
    }

    // In production, validate against your API key store
    const validApiKeys = process.env.VALID_API_KEYS?.split(",") || [];
    return validApiKeys.includes(apiKey.replace("Bearer ", ""));
  }

  static getClientId(request: NextRequest): string | null {
    const clientId = request.headers.get("x-client-id");
    return clientId || null;
  }

  static validateClientAccess(clientId: string, agentType: string): boolean {
    // In production, check client permissions against your database
    // For now, allow all authenticated clients
    return !!clientId;
  }
}

// Input validation and sanitization
export class InputValidator {
  static validateAndSanitize<T>(
    data: any,
    schema: z.ZodSchema<T>,
    agentType: string
  ): { success: true; data: T } | { success: false; error: string } {
    try {
      // Sanitize string inputs
      const sanitizedData = this.sanitizeObject(data);

      // Check for sensitive data
      if (this.containsSensitiveData(sanitizedData)) {
        return {
          success: false,
          error:
            "Request contains potentially sensitive information. Please remove and try again.",
        };
      }

      // Validate with schema
      const validatedData = schema.parse(sanitizedData);

      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(
          (e) => `${e.path.join(".")}: ${e.message}`
        );
        return {
          success: false,
          error: `Validation failed: ${errorMessages.join(", ")}`,
        };
      }
      return {
        success: false,
        error: "Invalid request format",
      };
    }
  }

  private static sanitizeObject(obj: any): any {
    if (typeof obj === "string") {
      return ContentFilter.sanitizeInput(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }
    if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  }

  private static containsSensitiveData(obj: any): boolean {
    if (typeof obj === "string") {
      return ContentFilter.containsSensitiveData(obj);
    }
    if (Array.isArray(obj)) {
      return obj.some((item) => this.containsSensitiveData(item));
    }
    if (obj && typeof obj === "object") {
      return Object.values(obj).some((value) =>
        this.containsSensitiveData(value)
      );
    }
    return false;
  }
}

// Error handling and logging
export class ErrorHandler {
  static logError(agentType: string, error: any, context: any): void {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      agentType,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context: this.sanitizeContext(context),
    };

    console.error(`[Lead Recon ${agentType}] Error:`, errorInfo);

    // In production, send to your logging service (e.g., Sentry, DataDog)
    // this.sendToLoggingService(errorInfo);
  }

  static createErrorResponse(message: string, status: number = 400): Response {
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  private static sanitizeContext(context: any): any {
    // Remove sensitive information from context before logging
    const sanitized = { ...context };
    delete sanitized.apiKey;
    delete sanitized.password;
    delete sanitized.token;
    return sanitized;
  }
}

// Main guardrail function
export async function applyGuardrails<T>(
  request: NextRequest,
  agentType: string,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T; clientId: string } | Response> {
  try {
    // 1. Authentication
    if (!AuthGuard.validateApiKey(request)) {
      return ErrorHandler.createErrorResponse(
        "Authentication required. Please provide a valid API key.",
        401
      );
    }

    // 2. Rate limiting
    const clientId = AuthGuard.getClientId(request) || "anonymous";
    const rateLimitKey = `${agentType}:${clientId}`;
    const rateLimitConfig = RATE_LIMITS[agentType];

    if (!RateLimitStore.checkLimit(rateLimitKey, rateLimitConfig)) {
      return ErrorHandler.createErrorResponse(rateLimitConfig.message, 429);
    }

    // 3. Client authorization
    if (!AuthGuard.validateClientAccess(clientId, agentType)) {
      return ErrorHandler.createErrorResponse(
        "Access denied. Insufficient permissions for this agent.",
        403
      );
    }

    // 4. Parse and validate request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      return ErrorHandler.createErrorResponse(
        "Invalid JSON in request body",
        400
      );
    }

    // 5. Input validation and sanitization
    const validationResult = InputValidator.validateAndSanitize(
      requestData,
      schema,
      agentType
    );

    if (!validationResult.success) {
      return ErrorHandler.createErrorResponse(validationResult.error, 400);
    }

    return {
      success: true,
      data: validationResult.data,
      clientId,
    };
  } catch (error) {
    ErrorHandler.logError(agentType, error, { request: request.url });
    return ErrorHandler.createErrorResponse(
      "Internal server error. Please try again later.",
      500
    );
  }
}

// Utility function to get rate limit info
export function getRateLimitInfo(
  clientId: string,
  agentType: string
): {
  remaining: number;
  resetTime: number;
} {
  const rateLimitKey = `${agentType}:${clientId}`;
  const rateLimitConfig = RATE_LIMITS[agentType];
  const remaining = RateLimitStore.getRemainingRequests(
    rateLimitKey,
    rateLimitConfig
  );

  return {
    remaining,
    resetTime: Date.now() + rateLimitConfig.windowMs,
  };
}
