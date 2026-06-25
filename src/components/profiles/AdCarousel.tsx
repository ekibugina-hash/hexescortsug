"use client";

import { ProfileType } from "@/types/profile";
import Link from "next/link";
import { slugify } from "@/lib/utils";

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
    }))
  );

  if (adItems.length === 0) return null;

  // The key to a seamless endless loop:
  // Render EXACTLY TWO identical copies side-by-side.
  // Animate exactly -50% (the width of one full copy).
  // When it resets to 0, the visual is pixel-perfect identical → no jump.
  const trackItems = [...adItems, ...adItems];

  return (
    <div className="relative w-full max-w-full overflow-hidden bg-black/40 py-4 border-y border-pink-500/20 mb-8">
      <div className="flex marquee-track gap-3 sm:gap-4 w-max max-w-none">
        {trackItems.map((item, idx) => (
          <Link
            key={`${item.id}-${idx}`}
            href={`/profile/${item.slug}`}
            className="relative shrink-0 w-32 h-44 sm:w-48 sm:h-64 lg:w-64 lg:h-80 rounded-xl overflow-hidden border border-pink-500/30 hover:border-pink-500 transition-colors shadow-[0_0_15px_rgba(236,72,153,0.1)] hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
              <span className="text-white font-bold text-sm sm:text-base lg:text-lg drop-shadow-md">
                {item.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
