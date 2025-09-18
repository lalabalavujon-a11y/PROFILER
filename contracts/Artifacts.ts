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
};
