import HomePage from "@/screens/HomePage";
import { fetchAllProfiles } from "@/data/allProfiles";

export const revalidate = 300; // Cache home data for 5 minutes

export default async function Page() {
  const seed = Math.random().toString(36).substring(2, 10);
  const rawProfiles = await fetchAllProfiles(seed);
  return <HomePage initialProfiles={rawProfiles} shuffleSeed={seed} />;
}