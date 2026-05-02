import { promises as fs } from "fs";
import path from "path";

export type SiteRecord = {
  name: string;
  hero: string;
  services: string[];
  phone: string;
  email: string;
  address: string;
  whatsapp: boolean;
  created_at: string;
  expires_at: string;
  active: boolean;
};

export type SitesStore = Record<string, Record<string, Record<string, SiteRecord>>>;

const DEFAULT_SITES_JSON_PATH = path.resolve(
  process.cwd(),
  "../../../../backend/data/sites.json"
);

function getSitesFilePath() {
  const customPath = process.env.SITES_JSON_PATH;
  if (!customPath) return DEFAULT_SITES_JSON_PATH;
  return path.isAbsolute(customPath)
    ? customPath
    : path.resolve(process.cwd(), customPath);
}

async function ensureParentDir(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function writeJsonSafely(filePath: string, payload: SitesStore) {
  await ensureParentDir(filePath);
  const tempPath = path.join(
    path.dirname(filePath),
    `sites.${process.pid}.${Date.now()}.tmp`
  );
  await fs.writeFile(tempPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await fs.rename(tempPath, filePath);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readSitesStore(): Promise<SitesStore> {
  const filePath = getSitesFilePath();
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return isObjectRecord(parsed) ? (parsed as SitesStore) : {};
  } catch {
    return {};
  }
}

export async function getSite(country: string, category: string, shopname: string) {
  const data = await readSitesStore();
  return data[country]?.[category]?.[shopname] ?? null;
}

function parseUtcDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function runCleanup() {
  const filePath = getSitesFilePath();
  const data = await readSitesStore();
  const now = new Date();
  let deactivated = 0;
  let remaining = 0;

  for (const country of Object.keys(data)) {
    const categories = data[country];
    for (const category of Object.keys(categories)) {
      const shops = categories[category];
      const shopNames = Object.keys(shops);
      for (const shopname of shopNames) {
        const site = shops[shopname];
        const expiresAt = parseUtcDate(site.expires_at);
        if (site.active !== false && expiresAt && now > expiresAt) {
          site.active = false;
          deactivated += 1;
        }
        if (site.active === true) {
          remaining += 1;
        }
      }
    }
  }

  await writeJsonSafely(filePath, data);
  return { deactivated, remaining };
}
