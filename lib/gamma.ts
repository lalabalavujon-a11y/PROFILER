import axios from "axios";

type GenerateInput = {
  prompt: string;
  templateId?: string;
  brand?: { colors?: string[]; logoUrl?: string };
  variables?: Record<string, string>;
  idempotencyKey: string;
};

const baseURL = process.env.GAMMA_API_BASE_URL ?? "https://api.gamma.app/v1";
const key = process.env.GAMMA_API_KEY;

export const gammaClient = {
  async generate(input: GenerateInput): Promise<{ docId: string; shareUrl?: string }> {
    if (!key) throw new Error("GAMMA_API_KEY missing");
    const res = await axios.post(
      `${baseURL}/generate`,
      {
        prompt: input.prompt,
        templateId: input.templateId,
        brand: input.brand,
        variables: input.variables,
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": input.idempotencyKey,
        },
        timeout: 60000,
      }
    );
    return { docId: res.data.docId, shareUrl: res.data.shareUrl };
  },

  async export(docId: string, format: "pdf" | "pptx"): Promise<Uint8Array> {
    if (!key) throw new Error("GAMMA_API_KEY missing");
    const res = await axios.get(`${baseURL}/documents/${docId}/export?format=${format}`, {
      headers: { Authorization: `Bearer ${key}` },
      responseType: "arraybuffer",
      timeout: 60000,
    });
    return new Uint8Array(res.data);
  },
};
