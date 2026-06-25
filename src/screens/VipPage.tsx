"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProfileGrid } from "@/components/profiles/ProfileGrid";
import { useAllProfiles } from "@/hooks/use-all-profiles";
import { ProfileType } from "@/types/profile";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;

const VipPage = ({ initialProfiles = [], shuffleSeed }: { initialProfiles?: ProfileType[], shuffleSeed?: string }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: queryProfiles } = useAllProfiles(initialProfiles, shuffleSeed);
  const allProfiles = queryProfiles || initialProfiles || [];
  
  // Filter for ONLY VIP (Pinned) profiles
  const vipProfiles = allProfiles.filter(p => p.isPinned);

  const visibleProfiles = vipProfiles.slice(0, visibleCount);
  const hasMore = visibleCount < vipProfiles.length;
  const isInitialLoading = allProfiles.length === 0;

  // In VIP page, everyone is featured
  const featuredIds = vipProfiles.map(p => p.id);

  return (
    <div className="pt-20 lg:pt-6 min-h-screen bg-black">
      <div className="container mx-auto px-4">
        {/* VIP Header */}
        <div className="mb-8 text-center bg-gradient-to-b from-yellow-500/10 to-transparent p-8 rounded-2xl border border-yellow-500/20">
          <h1 className="text-3xl lg:text-5xl font-bold text-yellow-500 mb-4 flex items-center justify-center gap-3">
             <span className="animate-pulse">✨</span> Elite VIP Escorts <span className="animate-pulse">✨</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience true luxury with our hand-picked VIP companions. These elite escorts represent the pinnacle of beauty, charm, and professional service in Uganda.
          </p>
        </div>

        {/* Profile Grid */}
        <div className="space-y-8">
          <ProfileGrid
            profiles={visibleProfiles}
            title="💎 Featured VIPs"
            featuredIds={featuredIds}
            loading={isInitialLoading}
          />

          {!isInitialLoading && hasMore && (
            <div className="flex justify-center pt-2 pb-4">
              <Button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-black px-8 py-2 rounded-full font-bold shadow-[0_0_18px_4px_rgba(234,179,8,0.4)] transition-all duration-300"
              >
                Load More VIPs
              </Button>
            </div>
          )}

          {!isInitialLoading && vipProfiles.length === 0 && (
            <div className="text-center py-20">
               <p className="text-yellow-500/50 text-xl">No VIP escorts currently active. Check back soon!</p>
               <Link href="/" className="text-primary hover:underline mt-4 inline-block">View All Profiles</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VipPage;
