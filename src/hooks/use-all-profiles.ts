"use client";

import { ProfileType } from "@/types/profile";
import { fetchAllProfiles } from "@/data/allProfiles";
import { useQuery } from "@tanstack/react-query";

export function useAllProfiles(initialData?: ProfileType[], seed?: string) {
  return useQuery({
    queryKey: ["all-profiles", seed], // Include seed in key to ensure unique cache per shuffle
    queryFn: async () => {
      return fetchAllProfiles(seed);
    },
    initialData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
