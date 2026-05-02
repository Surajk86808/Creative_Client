import ExpiredPage from "@/components/ExpiredPage";
import SitePage from "@/components/SitePage";
import { getSite } from "@/lib/sites-store";

export const dynamic = "force-dynamic";

type PageProps = {
  params: {
    country: string;
    category: string;
    shopname: string;
  };
};

export default async function DynamicSitePage({ params }: PageProps) {
  const site = await getSite(params.country, params.category, params.shopname);

  if (!site || site.active === false) {
    return <ExpiredPage />;
  }

  return <SitePage site={site} />;
}
