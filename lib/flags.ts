const defaultProvider = (process.env.DEFAULT_DECK_PROVIDER ?? "google") as
  | "google"
  | "gamma";

export const flags = {
  gammaEnabled: process.env.GAMMA_ENABLED !== "false",
  defaultDeckProvider: defaultProvider,
};
