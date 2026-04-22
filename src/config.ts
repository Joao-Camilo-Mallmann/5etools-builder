export const GITHUB_REPO_URL =
  "https://github.com/5etools-mirror-3/5etools-src";
export const GITHUB_RAW_BASE_URL =
  "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/refs/heads/main";
export const BASE_URL = `${GITHUB_RAW_BASE_URL}/data`;
export const CACHE_TTL = 1000 * 60 * 60;
export const CACHE_VERSION = "v1";

export const UPSTREAM_PATHS = {
  races: "races.json",
  backgrounds: "backgrounds.json",
  classIndex: "class/index.json",
  spellIndex: "spells/index.json",
  spellSourceLookup: "generated/gendata-spell-source-lookup.json",
} as const;

export type UpstreamPathKey = keyof typeof UPSTREAM_PATHS;

export function toDataUrl(relativePath: string): string {
  return `${BASE_URL}/${relativePath}`;
}
