export type Artifacts = {
  deck: {
    active: "google" | "gamma";
    providers: {
      google?: {
        fileId: string;
        pdfUrl: string;
        shareUrl: string;
        variantTag: string;
      };
      gamma?: {
        docId: string;
        pdfUrl: string;
        pptxUrl: string;
        shareUrl: string;
        variantTag: string;
      };
    };
  };
  funnel: { type: "GHL" | "Vercel"; url: string; checkoutUrl: string };
  stripe: { productIds: string[]; priceIds: string[] };
  tracking: { utm: Record<string, string>; affiliateLink: string };
  profiler: { csvUrl: string; segments: any[] };
  outreach: { emailsCsvUrl: string; adCopyDocUrl: string };
  leadReconProfiler: {
    reportUrl: string;
    idealClientProfiles: any[];
    clientPersonas: any[];
    strategicQuestions: any[];
    businessAnalysis: any;
    totalProfiles: number;
    highValueSegments: number;
  };
  leadReconStrategist: {
    reportUrl: string;
    marketingStrategy: any;
    connectionStrategies: any[];
    channelStrategies: any[];
    implementationRoadmap: any;
    marketAnalysis: any;
    totalStrategies: number;
    priorityChannels: number;
  };
  leadReconDMBreakthrough: {
    reportUrl: string;
    breakthroughStrategies: any[];
    messageTemplates: any[];
    attentionHooks: any[];
    followUpSequences: any[];
    messageVariations: any[];
    communicationAnalysis: any;
    totalMessages: number;
    highImpactHooks: number;
  };
  leadReconContentCreator: {
    reportUrl: string;
    contentStrategy: any;
    contentCalendar: any;
    contentPieces: any[];
    contentTemplates: any[];
    distributionStrategy: any;
    performanceFramework: any;
    clientMediaAnalysis: any;
    totalContentPieces: number;
    contentTypes: number;
  };
  leadReconPromptWizard: {
    reportUrl: string;
    generatedPrompt: any;
    promptVariations: any[];
    promptTemplates: any[];
    optimizationSuggestions: any;
    variableAnalysis: any;
    userIntent: any;
    totalPrompts: number;
    readyToUse: boolean;
  };
};
