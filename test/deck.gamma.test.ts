import { describe, it, expect, vi, beforeEach } from "vitest";
import * as gamma from "../lib/gamma";
import * as storage from "../lib/storage";
import { deckGammaNode } from "../agents/deck.gamma";

describe("deckGammaNode", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("generates, exports and stores Gamma deck", async () => {
    vi.spyOn(gamma.gammaClient, "generate").mockResolvedValue({
      docId: "doc_123",
      shareUrl: "https://gamma.app/docs/doc_123",
    });
    vi.spyOn(gamma.gammaClient, "export").mockResolvedValue(new Uint8Array([1, 2, 3]));
    vi.spyOn(storage, "uploadBuffer")
      .mockResolvedValueOnce("https://cdn.example.com/gamma/doc_123.pdf")
      .mockResolvedValueOnce("https://cdn.example.com/gamma/doc_123.pptx");

    const state: any = {
      packet: {
        eventId: "evt_abc",
        date: "2025-09-18",
        host: {
          name: "Host X",
          logoUrl: "https://logo",
          email: "",
          website: "",
          payoutModel: "GHL_AFFILIATE",
          commissionPct: 30,
        },
        audience: { industry: "SMBs", size: "smb" },
        offer: {
          tripwirePrice: 297,
          tripwireCredits: 1000,
          bumpEnabled: true,
          bumpPrice: 99,
        },
        assets: { deckProvider: "gamma" },
      },
      artifacts: {},
    };

    const out = await deckGammaNode(state);

    expect(out.artifacts.deck.providers.gamma?.pdfUrl).toMatch(/\.pdf/);
    expect(out.artifacts.deck.providers.gamma?.pptxUrl).toMatch(/\.pptx/);
    expect(out.artifacts.deck.active).toBe("gamma");
  });
});
