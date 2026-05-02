export interface SiteData {
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
}

export async function getAllSites(): Promise<any> {
  try {
    const response = await fetch('/data/sites.json');
    if (!response.ok) return {};
    return await response.json();
  } catch (error) {
    console.error('Failed to load sites:', error);
    return {};
  }
}

export async function getSite(country: string, category: string, slug: string): Promise<SiteData | null> {
  const sites = await getAllSites();
  if (!sites[country] || !sites[country][category] || !sites[country][category][slug]) {
    return null;
  }
  return sites[country][category][slug];
}
