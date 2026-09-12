import HomePage from "@/screens/HomePage";
import { fetchAllProfiles } from "@/data/allProfiles";

export const revalidate = 300; // Cache home data for 5 minutes

export default async function Page() {
  // Deterministic seed per 5-minute block so Next.js ISR can properly cache server-side
  const seed = Math.floor(Date.now() / (1000 * 300)).toString(36);
  const rawProfiles = await fetchAllProfiles(seed);
  return <HomePage initialProfiles={rawProfiles} shuffleSeed={seed} />;
}
