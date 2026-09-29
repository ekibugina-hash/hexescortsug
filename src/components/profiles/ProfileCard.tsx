"use client";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn, getMediaUrl, slugify } from "@/lib/utils";
import { ProfileType } from "@/types/profile";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePhoneHandler } from "@/hooks/use-phone-handler";

interface ProfileCardProps {
  profile: ProfileType;
  featured?: boolean;
  priority?: boolean;
  animate?: boolean;
  index?: number;
}

export function ProfileCard({ profile, featured = false, priority = false, animate = true, index = 0 }: ProfileCardProps) {
  const [showContact, setShowContact] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(() => getMediaUrl(profile.profileImage));
  const isMobile = useIsMobile();
  const { handlePhoneClick } = usePhoneHandler();
  
  useEffect(() => {
    setIsMounted(true);
    setImgSrc(getMediaUrl(profile.profileImage));
  }, [profile.profileImage]);

  const handleImageError = () => {
    // Always fall back to placeholder on any image load error
    setImgSrc("/placeholder.svg");
  };

  // Use the phone number from the profile data
  const phoneNumber = profile.phone || "";
  // Convert to international format for WhatsApp: 07XXXXXXXX -> 256XXXXXXXX
  const toWhatsAppNumber = (num: string) => {
    if (!num) return "";
    const cleaned = num.replace(/[\s\(\)\-+]/g, "");
    if (cleaned.startsWith("256")) return cleaned;
    if (cleaned.startsWith("0")) return "256" + cleaned.slice(1);
    return "256" + cleaned;
  };
  const waNumber = toWhatsAppNumber(profile.whatsapp || phoneNumber);

  // Stable badges based on data or deterministic ID-based logic
  const isPremium = profile.isPremium ?? (profile.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 3 === 0);

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (phoneNumber) {
      handlePhoneClick(phoneNumber);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="flex flex-col h-full">
        <Card className={cn(
          "overflow-hidden border-gray-800 h-full relative group",
          featured ? "border-pink-500/30" : ""
        )}>
          <div className="relative aspect-[3/4] overflow-hidden">
            {/* Golden Crown Corner Sash - Elite Royal Design */}
            {profile.isPinned && (
              <div className="absolute top-0 left-0 z-20 overflow-hidden w-24 h-24 pointer-events-none select-none">
                <div className="absolute top-0 left-0 bg-gradient-to-br from-[#ffd700] via-[#fff1a8] to-[#b8860b] text-black w-32 py-1 text-center font-black text-[10px] tracking-[0.2em] transform -rotate-45 -translate-x-10 translate-y-4 shadow-[0_2px_10_rgba(0,0,0,0.5)] border-b border-yellow-200/50 flex items-center justify-center gap-1.5 uppercase">
                   <span className="text-xs">👑</span>
                   <span className="drop-shadow-sm">VIP</span>
                </div>
              </div>
            )}
            
            {/* PREMIUM Badge */}
            {isPremium && (
              <div className="absolute top-0 right-0 z-10">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black text-[8px] sm:text-[10px] py-0.5 px-2 rotate-45 translate-x-[20%] translate-y-[-30%] shadow-md">
                  PREMIUM
                </div>
              </div>
            )}

            {/* VERIFIED Badge */}
            {profile.isVerified && (
              <div className="absolute top-2 right-2 z-30">
                <div className="bg-green-500/90 backdrop-blur-sm text-white text-[7px] sm:text-[9px] font-bold py-0.5 px-2 rounded-full shadow-[0_2px_10_rgba(34,197,94,0.4)] flex items-center gap-1 border border-white/20">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full" />
                  VERIFIED
                </div>
              </div>
            )}
            
            <Link href={`/profile/${slugify(profile.name)}`} prefetch={false}>
              <div className="w-full h-full overflow-hidden">
                <Image 
                  src={imgSrc} 
                  alt={`${profile.name} - verified sexy call girl and erotic companion in ${profile.location} - Hex Escorts UG`}
                  className="w-full h-full object-cover"
                  priority={priority}
                  width={300}
                  height={400}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  onError={handleImageError}
                />
              </div>
            </Link>
          
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-1 pb-1 pt-3 text-white">
              <h3 className="font-bold text-[10px] sm:text-xs text-center truncate leading-tight">{profile.name}</h3>
              <div className="flex flex-col items-center justify-center mt-0.5 space-y-0.5">
                <div className="flex items-center text-[8px] sm:text-[9px] text-gray-300">
                  <MapPin className="h-1.5 w-1.5 mr-0.5 shrink-0" />
                  <span className="truncate">{profile.location}</span>
                </div>
                <p className="text-[7px] sm:text-[8px] text-pink-500/80 font-bold uppercase tracking-widest">
                  {profile.isPinned ? "VIP Call Girl" : "Verified Hookup"}
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Action buttons */}
        {phoneNumber && (
          <div className="mt-1 w-full flex items-center gap-1">
            <Button 
              variant="default" 
              className="flex-1 min-w-0 bg-primary hover:bg-primary/90 text-white text-[8px] sm:text-[10px] h-5 sm:h-7 px-1 shadow-[0_0_8px_rgba(235,0,115,0.3)]"
              onMouseEnter={() => setShowContact(true)}
              onMouseLeave={() => setShowContact(false)}
              onClick={handleContactClick}
            >
              <span suppressHydrationWarning className="truncate block">
                {!isMounted ? "Contact" : (showContact ? phoneNumber : "Contact")}
              </span>
            </Button>
            {waNumber && (
              <a 
                href={`whatsapp://send?phone=${waNumber}&text=${encodeURIComponent("Hi, i got your contact from https://www.hexescortsug.com")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-none flex items-center justify-center bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full w-5 h-5 sm:w-7 sm:h-7 shadow-sm overflow-hidden shrink-0"
                onClick={(e) => e.stopPropagation()}
                aria-label="Contact on WhatsApp"
              >
                <Image 
                  src="/assets/whatsapp-icon.jpg" 
                  alt="WhatsApp" 
                  width={24} 
                  height={24} 
                  className="w-full h-full object-cover"
                />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}