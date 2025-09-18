import { z } from "zod";
import { gammaClient } from "../lib/gamma";
import { uploadBuffer } from "../lib/storage";

const schema = z.object({
  packet: z.any(),
  artifacts: z
    .any()
    .default({ deck: { providers: {} } }),
});

type GammaState = z.infer<typeof schema>;

export async function deckGammaNode(state: GammaState) {
  const { packet } = state;
  const brandColors = packet.assets?.brandingPalette ?? [];
  const logoUrl = packet.host?.logoUrl;

  const prompt = buildPrompt(packet);
  const { docId, shareUrl } = await gammaClient.generate({
    prompt,
    templateId: packet.assets?.gammaTemplateId,
    brand: { colors: brandColors, logoUrl },
    variables: {
      HOST_NAME: packet.host?.name,
      CTA_URL: "{{AFFILIATE_LINK}}",
      EVENT_DATE: packet.date,
    },
    idempotencyKey: `gamma-generate-${packet.eventId}`,
  });

  const pdfBytes = await gammaClient.export(docId, "pdf");
  const pptxBytes = await gammaClient.export(docId, "pptx");

  const pdfUrl = await uploadBuffer(
    pdfBytes,
    `decks/${packet.eventId}/gamma/${docId}.pdf`,
    "application/pdf"
  );
  const pptxUrl = await uploadBuffer(
    pptxBytes,
    `decks/${packet.eventId}/gamma/${docId}.pptx`,
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  );

  const existing = state.artifacts?.deck?.providers ?? {};
  const preferred =
    (packet.assets?.deckProvider ?? "google") === "gamma"
      ? "gamma"
      : state.artifacts?.deck?.active ?? "google";

  return {
    ...state,
    artifacts: {
      ...state.artifacts,
      deck: {
        active: preferred,
        providers: {
          ...existing,
          gamma: {
            docId,
            pdfUrl,
            pptxUrl,
            shareUrl,
            variantTag: "gamma_v1",
          },
        },
      },
    },
  };
}

function buildPrompt(packet: any) {
  return [
    `Create a 12–18 slide deck for a live demo to ${packet.audience?.industry} business owners.`,
    `Offer: $${packet.offer?.tripwirePrice} for ${packet.offer?.tripwireCredits} credits (one-time).`,
    packet.offer?.bumpEnabled
      ? `Include post-checkout bump at $${packet.offer?.bumpPrice}/mo.`
      : ``,
    "Include: agenda, problem, solution (Profiler + Leads), live demo flow, social proof, pricing slide, CTA with affiliate link.",
    "Tone: confident, ROI-focused, practical demos.",
  ].join("\n");
}
