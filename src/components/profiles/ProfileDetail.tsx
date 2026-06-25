"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Star, Heart, Share2 } from "lucide-react";
import { ProfileType } from "@/types/profile";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePhoneHandler } from "@/hooks/use-phone-handler";
import Image from "next/image";
import { getMediaUrl } from "@/lib/utils";

interface ProfileDetailProps {
  profile: ProfileType;
  onShare?: () => void;
}

export function ProfileDetail({ profile, onShare }: ProfileDetailProps) {
  const isMobile = useIsMobile();
  const { handlePhoneClick } = usePhoneHandler();
  
  // Use the phone number from the profile data
  const phoneNumber = profile.phone || "";
  // Convert to international format for WhatsApp: 07XXXXXXXX → 256XXXXXXXX
  const toWhatsAppNumber = (num: string) => {
    if (!num) return "";
    const cleaned = num.replace(/[\s\(\)\-+]/g, "");
    if (cleaned.startsWith("256")) return cleaned;
    if (cleaned.startsWith("0")) return "256" + cleaned.slice(1);
    return "256" + cleaned;
  };
  const waNumber = toWhatsAppNumber(profile.whatsapp || phoneNumber);

  // Stable badges based on data or deterministic ID-based logic
  const isVip = profile.isVip ?? true; 
  const isPremium = profile.isPremium ?? (profile.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 3 === 0);

  const handleContactClick = () => {
    if (phoneNumber) {
      handlePhoneClick(phoneNumber);
    }
  };

  return (
    <div className="container mx-auto px-0 py-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
        {/* Profile Images */}
        <div className="lg:col-span-2">
          <div className="relative rounded-lg lg:rounded-xl overflow-hidden mb-2 lg:mb-4 group aspect-[4/3]">
            {isPremium && (
              <div className="absolute top-0 right-0 z-10">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black text-[10px] sm:text-xs font-bold py-0.5 px-2 lg:py-1 lg:px-3 rotate-45 translate-x-[30%] translate-y-[10%] shadow-md">
                  PREMIUM
                </div>
              </div>
            )}
            
            {isVip && (
              <div className="absolute top-2 left-2 lg:top-3 lg:left-3 z-10">
                <Badge className="bg-gradient-to-r from-pink-600 to-pink-500 text-white border-0 font-bold text-[10px] h-5 sm:text-xs">VIP</Badge>
              </div>
            )}
            
            <Image 
              src={getMediaUrl(profile.profileImage)} 
              alt={`${profile.name} - verified high class sexy escort in ${profile.location} - Hex Escorts UG`} 
              fill
              priority
              className="object-cover transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
            
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity">
              <span className="text-pink-500 text-2xl lg:text-4xl font-bold">HEX ESCORTS UG</span>
            </div>
          </div>
        </div>
        
        {/* Profile Details */}
        <div>
          <Card className="mb-3 lg:mb-4 bg-card border-gray-700 rounded-lg lg:rounded-xl overflow-hidden">
            <CardContent className="p-3 lg:p-5">
              <div className="flex justify-between items-start mb-2 lg:mb-3">
                <h1 className="text-xl lg:text-2xl font-bold text-gradient-primary">{profile.name}</h1>
                <div className="flex items-center">
                  <Star className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="font-medium text-sm lg:text-base">{profile.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center text-gray-400 mb-3 lg:mb-4 text-xs lg:text-sm">
                <MapPin className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                <span>{profile.location}</span>
              </div>
              
              <div className="space-y-3 lg:space-y-4 mb-4 lg:mb-5">
                <div>
                  <h3 className="font-semibold mb-1 lg:mb-2 text-white text-sm lg:text-base">About Me</h3>
                  <p className="text-xs lg:text-sm text-gray-300 leading-relaxed">{profile.description || profile.shortBio}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1 lg:mb-2 text-white text-sm lg:text-base">Details</h3>
                  <div className="grid grid-cols-2 gap-x-2 lg:gap-x-4 gap-y-1 lg:gap-y-2 text-xs lg:text-sm">
                    <div className="flex justify-between items-center p-1.5 lg:p-2 rounded-lg bg-muted/40">
                      <span className="text-gray-400">Age:</span>
                      <span className="text-gray-200 font-medium">{profile.age || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-1.5 lg:p-2 rounded-lg bg-muted/40">
                      <span className="text-gray-400">Height:</span>
                      <span className="text-gray-200 font-medium">{profile.height || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-1.5 lg:p-2 rounded-lg bg-muted/40">
                      <span className="text-gray-400">Body Type:</span>
                      <span className="text-gray-200 font-medium">{profile.bodyType || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-1.5 lg:p-2 rounded-lg bg-muted/40">
                      <span className="text-gray-400">Complexion:</span>
                      <span className="text-gray-200 font-medium">{profile.complexion || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {phoneNumber && (
                <div className="pt-2 lg:pt-3 border-t border-gray-700 flex gap-2 sm:gap-3 items-center">
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs lg:text-sm h-9 lg:h-11 rounded-md"
                    onClick={handleContactClick}
                  >
                    <Phone className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" /> 
                    Contact
                  </Button>
                  {waNumber && (
                    <a 
                      href={`whatsapp://send?phone=${waNumber}&text=${encodeURIComponent("Hi, i got your contact from https://www.hexescortsug.com")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center bg-[#25D366] hover:bg-[#128C7E] text-white rounded-md h-9 lg:h-11 transition-all hover:scale-105 shadow-lg shadow-green-500/20 overflow-hidden font-medium text-xs lg:text-sm gap-2"
                      aria-label="Contact on WhatsApp"
                    >
                      <Image 
                        src="/assets/whatsapp-icon.jpg" 
                        alt="WhatsApp" 
                        width={20}
                        height={20}
                        className="w-5 h-5 lg:w-6 lg:h-6 object-cover rounded-full"
                      />
                      WhatsApp
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex space-x-2 lg:space-x-3">
            <Button variant="outline" className="flex-1 border-gray-700 hover:bg-pink-500/10 hover:border-pink-500/50 transition-colors text-xs lg:text-sm h-8 lg:h-10">
              <Heart className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4 text-pink-500" /> Save
            </Button>
            <Button variant="outline" className="flex-1 border-gray-700 hover:bg-pink-500/10 hover:border-pink-500/50 transition-colors text-xs lg:text-sm h-8 lg:h-10" onClick={onShare}>
              <Share2 className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4 text-pink-500" /> Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
