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

  // Collect ONLY the manually uploaded ad images
  const adItems = adProfiles.flatMap(p =>
    (p.adImages || []).map(img => ({
      id: p.id,
      name: p.name,
      image: img,
      slug: slugify(p.name),
      location: p.location || "Kampala",
      description: p.description || p.shortBio || "Experience premier relaxation, skilled massage therapies, and royal pampering in a serene private setting.",
      services: p.services && p.services.length > 0 ? p.services : ["Full Body Massage", "Sensual Care", "Private Suites"],
      phone: p.phone || p.whatsapp,
    }))
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
                  <Sparkles className="w-3 h-3" /> Featured Spa
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
              Featured Spas & Massage
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
                <Link
                  href={`/profile/${item.slug}`}
                  className="group block relative w-full rounded-2xl overflow-hidden border border-pink-500/25 bg-gradient-to-br from-gray-950 via-gray-900 to-black hover:border-pink-500/60 shadow-[0_0_15px_-3px_rgba(236,72,153,0.15)] active:scale-[0.99] transition-all"
                >
                  {/* Poster Banner with Ambient Backdrop (Uncropped) */}
                  <div className="relative overflow-hidden bg-black flex items-center justify-center p-2.5 min-h-[190px]">
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-30 blur-md scale-110"
                      style={{ backgroundImage: `url('${item.image}')` }}
                    />
                    <img
                      src={item.image}
                      alt={item.name}
                      className="relative z-10 max-h-48 w-auto max-w-full rounded-xl object-contain shadow-2xl group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <span className="absolute top-2 left-2 z-20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-pink-600 text-white rounded-full shadow-md">
                      âœ¨ Featured Spa
                    </span>
                    <span className="absolute top-2 right-2 z-20 px-2 py-0.5 text-[9px] font-bold text-gray-200 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5 text-pink-400" />
                      {item.location}
                    </span>
                  </div>

                  {/* Card Info Footer */}
                  <div className="p-3.5 border-t border-gray-800/80 bg-black/40">
                    <h4 className="text-base font-black text-white group-hover:text-pink-400 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-900">
                      <span className="text-[10px] text-pink-400 font-bold flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        Direct WhatsApp
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-[10px] font-bold rounded-lg shadow">
                        View Spa <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};