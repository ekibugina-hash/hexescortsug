"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileDetail } from "@/components/profiles/ProfileDetail";
import { useAllProfiles } from "@/hooks/use-all-profiles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoList } from "@/components/videos/VideoList";
import { PhotoList } from "@/components/photos/PhotoList";
import { useEffect } from "react";
import { ProfileType } from "@/types/profile";
import { slugify } from "@/lib/utils";

interface ProfileDetailPageProps {
  profileId: string;
  initialProfile?: ProfileType;
}

const ProfileDetailPage = ({ profileId, initialProfile }: ProfileDetailPageProps) => {
  const id = profileId;
  
  const { data: allProfiles = [], isLoading } = useAllProfiles();
  // Use initialProfile immediately (server-rendered data) while client query loads
  const profile = (allProfiles.length > 0 ? allProfiles.find(p => p.id === id || slugify(p.name) === id) : undefined) ?? initialProfile;

  // Scroll to top when component mounts or profile ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  
  // While loading, show skeleton to avoid premature 404
  if (isLoading && !profile) {
    return (
      <div className="lg:pl-64 relative">
        <div className="lg:hidden h-16"></div>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12 text-center lg:pl-72">
        <div className="lg:hidden h-16"></div>
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p className="mb-6">The profile you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/">Go Back Home</Link>
        </Button>
      </div>
    );
  }


  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: profile.name, text: `Check out ${profile.name} on Hex Escorts UG`, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="lg:pl-64 relative">
      <div className="lg:hidden h-16"></div>
      
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="default"
            size="sm"
            asChild
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow-md"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              See all escorts
            </Link>
          </Button>
          
        </div>
        
        <ProfileDetail profile={profile} onShare={handleShare} />

        <div className="mt-8">
          <Tabs defaultValue="gallery" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="gallery" className="flex-1">Gallery</TabsTrigger>
              <TabsTrigger value="videos" className="flex-1">Videos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="gallery" className="p-4">
              <PhotoList 
                profileId={profile.id} 
                profiles={allProfiles}
              />
            </TabsContent>

            <TabsContent value="videos" className="p-4">
              <VideoList 
                profileId={profile.id} 
                profiles={allProfiles}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Similar Profiles Section for SEO Internal Linking */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h2 className="text-xl font-bold mb-6 text-pink-500">More Similar Sexy Girls in {profile.location}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allProfiles
              .filter(p => p.id !== profile.id && p.location === profile.location)
              .slice(0, 4)
              .map(p => (
                <Link key={p.id} href={`/profile/${slugify(p.name)}`} className="group hover:opacity-90">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-2 shadow-lg">
                    <img src={p.profileImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 sm:p-3">
                      <p className="font-bold text-white text-xs sm:text-sm">{p.name}</p>
                      <p className="text-[10px] sm:text-xs text-pink-400">{p.location}</p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
          <div className="mt-6 text-center">
            <Button variant="outline" asChild size="sm">
              <Link href={`/escorts-in/${profile.location.toLowerCase()}`}>
                See all {profile.location} Escorts
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileDetailPage;
