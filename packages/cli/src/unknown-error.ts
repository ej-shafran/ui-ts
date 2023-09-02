export type UnknownError = {
  _type: "UnknownError";
  original: unknown;
};

export const UnknownError = (original: unknown): UnknownError => ({
  _type: "UnknownError",
  original,
});
