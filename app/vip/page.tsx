import { fetchAllProfiles } from "@/data/allProfiles";
import VipPage from "@/screens/VipPage";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Elite VIP Escorts in Uganda | Premium Companions - Hex Escorts UG',
  description: 'Experience true luxury with our hand-picked elite VIP escorts in Kampala and across Uganda. The most premium companions for the most discerning clients.',
  alternates: {
    canonical: 'https://www.hexescortsug.com/vip',
  }
};

export const revalidate = 300; // Cache VIP data for 5 minutes

export default async function Page() {
  // Deterministic seed per 5-minute block so Next.js ISR can properly cache server-side
  const seed = Math.floor(Date.now() / (1000 * 300)).toString(36);
  const rawProfiles = await fetchAllProfiles(seed);
  return <VipPage initialProfiles={rawProfiles} shuffleSeed={seed} />;
}
