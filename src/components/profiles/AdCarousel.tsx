"use client";

import { ProfileType } from "@/types/profile";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkles, MapPin, ArrowRight, MessageCircle } from "lucide-react";

interface AdCarouselProps {
  profiles: ProfileType[];
}

export const AdCarousel = ({ profiles }: AdCarouselProps) => {
  // Only profiles explicitly marked as ads AND with manually uploaded ad images
  const adProfiles = profiles.filter(p => p.isAd && p.adImages && p.adImages.length > 0);

  // Helper to format phone to WhatsApp international format (Uganda 256)
  const toWhatsAppNumber = (num?: string) => {
    if (!num) return "";
    const cleaned = num.replace(/[\s\(\)\-+]/g, "");
    if (cleaned.startsWith("256")) return cleaned;
    if (cleaned.startsWith("0")) return "256" + cleaned.slice(1);
    return "256" + cleaned;
  };

  // Collect ONLY the manually uploaded ad images
  const adItems = adProfiles.flatMap(p =>
    (p.adImages || []).map(img => {
      const waNumber = toWhatsAppNumber(p.whatsapp || p.phone);
      return {
        id: p.id,
        name: p.name,
        image: img,
        slug: slugify(p.name),
        location: p.location || "Kampala",
        description: p.description || p.shortBio || "Experience premier relaxation, skilled massage therapies, and royal pampering in a serene private setting.",
        services: p.services && p.services.length > 0 ? p.services : ["Full Body Massage", "Sensual Care", "Private Suites"],
        phone: p.phone || p.whatsapp,
        waUrl: waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${p.name}, I saw your spa ad on https://www.hexescortsug.com`)}` : null,
      };
    })
  );

  if (adItems.length === 0) return null;

  // For Desktop/Tablet: Endless looping horizontal marquee track
  const trackItems = [...adItems, ...adItems];

  return (
    <div className="w-full">
      {/* DESKTOP & TABLET: Former Horizontal Sliding Marquee Carousel (md:block) */}
      <div className="hidden md:block relative w-full max-w-full overflow-hidden bg-black/40 py-4 border-y border-pink-500/20 mb-8 rounded-2xl">
        <div className="flex marquee-track gap-4 lg:gap-6 w-max max-w-none">
          {trackItems.map((item, idx) => (
            <Link
              key={`desktop-${item.id}-${idx}`}
              href={`/profile/${item.slug}`}
              className="relative shrink-0 w-48 h-64 lg:w-64 lg:h-80 rounded-xl overflow-hidden border border-pink-500/30 hover:border-pink-500 transition-all duration-300 shadow-[0_0_15px_rgba(236,72,153,0.15)] hover:shadow-[0_0_25px_rgba(236,72,153,0.35)] group"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent flex flex-col justify-end p-3 lg:p-4">
                <span className="text-[10px] font-black uppercase text-pink-400 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> FEATURED SPA
                </span>
                <span className="text-white font-bold text-sm lg:text-base drop-shadow-md group-hover:text-pink-300 transition-colors">
                  {item.name}
                </span>
                <span className="text-[11px] text-gray-300 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-pink-400" /> {item.location}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* MOBILE: Elegant Vertical Scroll Slide-In Animated Banners (block md:hidden) */}
      <div className="block md:hidden w-full space-y-4 mb-8 overflow-hidden">
        {/* Mobile Section Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-pink-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              FEATURED SPAS & MASSAGE
            </h3>
          </div>
          <span className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">
            Verified Partners
          </span>
        </div>

        {/* Mobile Vertical List of Animated Cards */}
        <div className="space-y-4">
          {adItems.map((item, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={`mobile-${item.id}-${idx}`}
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: idx === 0 ? 0.05 : 0 }}
                className="w-full"
              >
                <div className="group block relative w-full rounded-2xl overflow-hidden border border-pink-500/25 bg-gradient-to-br from-gray-950 via-gray-900 to-black hover:border-pink-500/60 shadow-[0_0_15px_-3px_rgba(236,72,153,0.15)] transition-all">
                  {/* Poster Banner - Zoomed & Full Impact */}
                  <Link href={`/profile/${item.slug}`} className="block relative overflow-hidden bg-black flex items-center justify-center min-h-[225px] sm:min-h-[250px]">
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-40 blur-md scale-125"
                      style={{ backgroundImage: `url('${item.image}')` }}
                    />
                    <img
                      src={item.image}
                      alt={item.name}
                      className="relative z-10 w-full h-[225px] sm:h-[250px] object-cover object-center shadow-2xl group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                    
                    <span className="absolute top-2.5 left-2.5 z-20 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-pink-600 text-white rounded-full shadow-lg flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> FEATURED SPA
                    </span>
                    <span className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1 text-[9px] font-bold text-gray-100 bg-black/70 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-pink-400" />
                      {item.location}
                    </span>
                  </Link>

                  {/* Card Info & Action Bar */}
                  <div className="p-3.5 border-t border-gray-800/80 bg-black/50">
                    <Link href={`/profile/${item.slug}`} className="block">
                      <h4 className="text-base font-black text-white group-hover:text-pink-400 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </Link>

                    {/* Action Buttons Row: WhatsApp Left, View Spa Right */}
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-gray-900">
                      {/* Left Side: Green WhatsApp Button */}
                      {item.waUrl ? (
                        <a
                          href={item.waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white text-[11px] font-black rounded-xl shadow-lg shadow-green-500/25 transition-all"
                        >
                          <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
                          WhatsApp
                        </a>
                      ) : (
                        <div className="flex-1" />
                      )}

                      {/* Right Side: Pink View Spa Button */}
                      <Link
                        href={`/profile/${item.slug}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 active:scale-95 text-white text-[11px] font-bold rounded-xl shadow-md transition-all"
                      >
                        View Spa <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};