"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProfileGrid } from "@/components/profiles/ProfileGrid";
import { useAllProfiles } from "@/hooks/use-all-profiles";
import { ProfileType } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AdCarousel } from "@/components/profiles/AdCarousel";
import { Crown } from "lucide-react";

const PAGE_SIZE = 12;

const cities = [
  { name: "Kampala", path: "/escorts-in/kampala" },
  { name: "Entebbe", path: "/escorts-in/entebbe" },
  { name: "Jinja", path: "/escorts-in/jinja" },
  { name: "Mbarara", path: "/escorts-in/mbarara" },
  { name: "Gulu", path: "/escorts-in/gulu" },
  { name: "Mbale", path: "/escorts-in/mbale" },
  { name: "Tororo", path: "/escorts-in/tororo" },
  { name: "Fort Portal", path: "/escorts-in/fort-portal" },
  { name: "Mukono", path: "/escorts-in/mukono" },
];

interface HomePageProps {
  initialProfiles?: ProfileType[];
  shuffleSeed?: string;
}

const HomePage = ({ initialProfiles = [], shuffleSeed }: HomePageProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: queryProfiles } = useAllProfiles(initialProfiles, shuffleSeed);
  const allProfiles = queryProfiles || initialProfiles || [];

  const isInitialLoading = allProfiles.length === 0;

  // Split profiles into VIP and Ordinary
  const vipProfiles = allProfiles.filter(p => p.isPinned);
  const ordinaryProfiles = allProfiles.filter(p => !p.isPinned);
  
  const visibleOrdinary = ordinaryProfiles.slice(0, visibleCount);
  const hasMore = visibleCount < ordinaryProfiles.length;

  return (
    <div className="pt-20 lg:pt-6 min-h-screen max-w-[100vw] overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
        {/* SEO Header */}
        <div className="mb-6 sm:mb-8 overflow-x-hidden">
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-primary mb-4 break-words">
            Verified Escorts in Uganda
          </h1>
          
          {/* Top Sliding Section */}
          <div className="w-full overflow-hidden mb-6">
            <AdCarousel profiles={allProfiles} />
          </div>

          <nav aria-label="Browse by city" className="flex flex-wrap gap-1.5 sm:gap-2">
            {cities.map((c) => (
              <Link
                key={c.name}
                href={c.path}
                className="text-[9px] sm:text-[11px] bg-gradient-to-r from-[#db0061] to-[#ff1493] text-white hover:from-[#ff1493] hover:to-[#db0061] px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-black transition-all duration-300 shadow-[0_2px_10px_rgba(255,20,147,0.3)] hover:shadow-[0_2px_15px_rgba(255,20,147,0.5)] hover:-translate-y-0.5 active:scale-95 text-center break-words max-w-full"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Profile Grid Section */}
        <div className="space-y-16 sm:space-y-24">
          
          {/* VIP SECTION */}
          {vipProfiles.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-col items-center sm:items-start">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="text-2xl sm:text-3xl lg:text-5xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-yellow-400 via-white to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,215,0,0.4)] animate-pulse flex items-center gap-3"
                >
                  {/* Show Emoji on Mobile, Hide on Desktop */}
                  <span className="lg:hidden">👑</span>
                  {/* Show Icon on Desktop, Hide on Mobile */}
                  <Crown className="hidden lg:block w-14 h-14 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
                  Elite VIP Escorts
                </motion.h2>
                <div className="h-1 w-32 bg-gradient-to-r from-yellow-500 to-transparent mt-1" />
              </div>
              <ProfileGrid
                profiles={vipProfiles}
                featuredIds={vipProfiles.map(p => p.id)}
                loading={isInitialLoading}
              />
            </div>
          )}

          {/* OTHER SECTION */}
          <div className="space-y-6">
            <div className="flex flex-col items-center sm:items-start">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white/90 tracking-tight">
                Other Escorts
              </h2>
              <div className="h-0.5 w-24 bg-gray-700 mt-1" />
            </div>
            <ProfileGrid
              profiles={visibleOrdinary}
              loading={isInitialLoading}
            />

            {!isInitialLoading && hasMore && (
              <div className="flex justify-center pt-8 pb-4">
                <Button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white px-8 py-2 rounded-full font-semibold shadow-[0_0_18px_4px_rgba(236,72,153,0.55)] hover:shadow-[0_0_28px_8px_rgba(236,72,153,0.75)] transition-shadow duration-300"
                >
                  Load More Profiles
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section for SEO Keywords */}
        <div className="mt-20 border-t border-gray-800 pt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="space-y-2">
              <h4 className="text-primary font-bold">How do I find verified Escorts in Kampala Uganda?</h4>
              <p className="text-sm text-gray-400">Finding verified Escorts in Kampala Uganda is easy on our Uganda escorts directory. Every companion listed as a Kampala call girl or Entebbe escorts has been manually vetted to ensure they are real and professional. We offer direct contacts for Ntinda escorts, Escorts in Ntinda, Call girls Najjera, escorts near Makerere, and Kawempe escorts.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-primary font-bold">Are the photos of Ugandan call girls 100% real?</h4>
              <p className="text-sm text-gray-400">Yes. We pride ourselves on being the only Uganda escort directory that enforces strict photo verification. When you book a sexy girl or Kampala call girls in Uganda from our site, you meet who you see.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-primary font-bold">Can I get direct WhatsApp contacts for hookups?</h4>
              <p className="text-sm text-gray-400">Absolutely. We provide direct WhatsApp links for every Kampala hookup, Entebbe escorts, Ntinda escorts, and Kawempe escorts listed. There are no middlemen, just direct contact between you and the companion.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-primary font-bold">Do you have VIP companions for high-end events?</h4>
              <p className="text-sm text-gray-400">Yes, our VIP section features elite Ugandan companions, Verified escorts Kampala (and verified escortd Kampala), and high-class call girls perfect for corporate dinners, travel companionship, and exclusive private encounters.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-primary font-bold">Is it discreet to book a hookup in Uganda?</h4>
              <p className="text-sm text-gray-400">Privacy is our #1 priority. Whether you are looking for an escort in Ntinda, Call girls Najjera, or escorts near Makerere, our platform ensures your search for hookups in Uganda remains 100% confidential.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-primary font-bold">Where can I find independent escorts in Jinja or Mbarara?</h4>
              <p className="text-sm text-gray-400">We have a growing directory of independent companions in Jinja, Mbarara, and Gulu. Simply filter by location to find the best call girls or Entebbe escorts available in your specific city.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-primary font-bold">What types of sexy girls in Uganda are available?</h4>
              <p className="text-sm text-gray-400">Our directory features a diverse range of **sexy escorts**, including **ebony** beauties, slim models, and curvy **Ugandan escorts**. Whether you want a college girl or a mature companion, we have the best **sexy girls** and Kampala call girls in the country.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-primary font-bold">How do I book a hookup with Uganda escorts?</h4>
              <p className="text-sm text-gray-400">You can book **escorts in Uganda** by contacting them directly via the WhatsApp numbers provided on their profiles. We make it easy to find **uganda escorts** and girls in uganda to fuck for quick hookups or overnight stays.</p>
            </div>
          </div>
        </div>

        {/* Popular Searches Bar */}
        <div className="mt-12 py-6 border-y border-gray-800/50">
          <p className="text-[10px] text-center text-gray-500 uppercase tracking-[0.3em] mb-4">Trending Searches</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[11px] sm:text-xs font-medium text-gray-400">
            {["uganda escorts", "ugandan escorts", "sexy escorts", "sexy girls", "escorts in uganda", "ebony", "fuck girls", "kampala hookups", "entebbe call girls", "jinja escorts", "mbarara girls", "gulu hookups"].map((term) => (
              <span key={term} className="hover:text-primary cursor-default transition-colors">#{term.replace(/\s+/g, '')}</span>
            ))}
          </div>
        </div>

        {/* SEO Content Section */}
        <div className="mt-16 text-center text-muted-foreground prose prose-invert mx-auto max-w-4xl pt-8 pb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6">Verified Uganda Escorts - Premium Sexy Girls & Ugandan Escorts</h2>
          <div className="space-y-6 text-sm sm:text-base leading-relaxed text-gray-400">
            <p>
              Welcome to <strong>Escorts UG</strong> – the premier <strong>Uganda escorts directory</strong>. Find the best <strong>Escorts in Kampala Uganda</strong>, verified <strong>Kampala call girls</strong>, and verified <strong>Entebbe escorts</strong>. 
              Whether you are looking for <strong>Ntinda escorts</strong>, <strong>Escorts in Ntinda</strong>, <strong>Call girls Najjera</strong>, <strong>Escorts near Makerere</strong>, or <strong>Kawempe escorts</strong>, we connect you with the most beautiful <strong>girls in uganda to fuck</strong>.
            </p>
            <p>
              Our platform features the best <strong>Verified escorts Kampala</strong> (and verified escortd Kampala listings). 
              If you need <strong>Affordable escorts in kampala</strong> or affordableescorts in kampala with direct numbers, search our directory. We list independent <strong>girls in uganda to fuck</strong> in all major suburbs.
            </p>
            
            <h3 className="text-xl font-semibold text-white">Find Your Perfect Sexy Escort Today</h3>
            <p>
              In a market filled with fake profiles, we stand out by ensuring that every <strong>ugandan escort</strong> listed on our site 
              undergoes a strict manual verification process. We provide direct contacts for <strong>sexy girls</strong> in every major city. 
              Browse our listings for <strong>ebony</strong> models, elite <strong>sexy escorts</strong>, and the most reliable <strong>escorts in uganda</strong>.
            </p>

            <h3 className="text-xl font-semibold text-white">Discreet Hookups with Ugandan Escorts</h3>
            <p>
              From <strong>ebony</strong> beauties to curvy <strong>sexy girls</strong>, find the perfect <strong>uganda escorts</strong> for your specific desires. 
              Our site is the top choice for anyone searching for <strong>escorts in uganda</strong> or <strong>sexy escorts</strong> with genuine contacts. 
              Book your next <strong>fuck girls</strong> hookup with confidence.
            </p>
            <div className="text-[10px] opacity-30 mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex flex-col">
                  <span>Escorts in Kampala Uganda</span>
                  <span>Kampala call girls</span>
                  <span>Uganda escorts directory</span>
                  <span>Verified escorts Kampala</span>
                  <span>Verified escortd Kampala</span>
                  <span>Entebbe escorts</span>
                  <span>Ntinda escorts</span>
                  <span>Escorts in Ntinda</span>
                  <span>Call girls Najjera</span>
                  <span>Escorts near Makerere</span>
                  <span>Kawempe escorts</span>
                  <span>Affordable escorts in kampala</span>
                  <span>Affordableescorts in kampala</span>
                  <span>girls in uganda to fuck</span>
                  <span>uganda escorts</span>
                  <span>ugandan escorts</span>
                  <span>sexy escorts</span>
                  <span>sexy girls</span>
                  <span>escorts in uganda</span>
                  <span>ebony</span>
                  <span>fuck girls</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
