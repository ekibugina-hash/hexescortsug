"use client";

import { ProfileGrid } from "@/components/profiles/ProfileGrid";
import { useAllProfiles } from "@/hooks/use-all-profiles";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { useState, useEffect } from "react";
import { Menu, ChevronDown, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileType } from "@/types/profile";
import { slugify } from "@/lib/utils";

const cityMeta: Record<string, { title: string; description: string; heading: string; body: string }> = {
  kampala: {
    title: "Kampala Escorts – Verified Profiles | Escorts UG",
    description: "Find verified escorts in Kampala, Uganda. Browse authentic profiles from Nakasero, Kololo, Bugolobi and all major Kampala areas.",
    heading: "Escorts in Kampala",
    body: "Kampala is the vibrant capital of Uganda and our premier location for connecting with verified, high-class companions. Whether you are traveling for business, staying in upscale neighborhoods like Kololo, Nakasero, or Bugolobi, or experiencing the bustling nightlife of the city centre, our diverse directory of Kampala escorts offers the perfect match for your specific desires. From elegant dinner dates and corporate event companions to private, discreet encounters, the companions listed on Escorts UG are thoroughly vetted for authenticity. Kampala's fast-paced lifestyle demands flexible and professional companionship. Our platform features local beauties, university students, and professional models who know the city intimately. By browsing our verified profiles, you gain access to high-quality photos, detailed service lists, and genuine availability. We prioritize your privacy and safety, ensuring that every interaction is smooth and confidential. Choose from a variety of categories, including VIP companions, GFE (Girlfriend Experience) specialists, and travel companions ready to accompany you to luxury hotels or private residences across the metropolitan area. If you are looking for an unforgettable experience in Uganda's heartbeat, you have found the definitive directory. Filter by your preferences to find your ideal match today and discover the best of what Kampala has to offer with an intelligent and discreet companion by your side.",
  },
  entebbe: {
    title: "Entebbe Escorts – Verified Profiles | Escorts UG",
    description: "Find verified escorts in Entebbe, Uganda. Browse authentic companion profiles near Entebbe International Airport and lakeside areas.",
    heading: "Escorts in Entebbe",
    body: "Entebbe is renowned for its serene lakeside environment, luxurious resorts, and proximity to the Entebbe International Airport, making it a prime hub for traveling professionals, tourists, and expatriates. Our exclusive directory of Entebbe escorts provides you with access to verified, sophisticated companions perfectly suited for the relaxed yet upscale atmosphere of this beautiful peninsula. Whether you require a discreet companion for a relaxing weekend getaway at a Lake Victoria resort, a beautiful date for a sunset cruise, or unwinding after a long corporate flight, our profiles feature the most reliable and stunning companions in the area. Each profile is rigorously reviewed to ensure 100% authenticity, giving you ultimate peace of mind. Entebbe companions offer a wide variety of services tailored to your needs, from casual meetups to extensive overnight bookings at leading hotels. Skip the uncertainty of unverified classifieds and use our filtered search to find your perfect match. With Escorts UG, your privacy is safeguarded, allowing you to focus on enjoying unparalleled companionship in Uganda's most relaxing city.",
  },
  jinja: {
    title: "Jinja Escorts – Verified Profiles | Escorts UG",
    description: "Find verified escorts in Jinja, the adventure capital of Uganda. Browse authentic companion profiles near the Nile source.",
    heading: "Escorts in Jinja",
    body: "Welcome to Jinja, the undisputed adventure capital of East Africa and the historic source of the River Nile. Whether you are visiting for thrilling white-water rafting, a scenic corporate retreat, or simply looking to escape the hustle of the capital, our premium directory of Jinja escorts is here to elevate your experience. Jinja boasts a vibrant, growing community of beautiful, intelligent, and verified companions ready to help you unwind after a long day of adventure. Our platform connects you with local companions, touring models, and discreet professionals who understand the unique dynamic of this tourist hotspot. From sharing a quiet drink overlooking the Nile to engaging in a passionate, private encounter in one of Jinja's beautiful boutique lodges, our verified profiles ensure you meet exactly who you see. We enforce strict verification standards so your stay in Jinja is secure, private, and immensely satisfying. Browse through comprehensive galleries, check exact service offerings, and confidently arrange your perfect date in Uganda's most scenic city.",
  },
  mbarara: {
    title: "Mbarara Escorts – Verified Profiles | Escorts UG",
    description: "Find verified escorts in Mbarara, western Uganda. Browse authentic companion profiles in this growing city.",
    heading: "Escorts in Mbarara",
    body: "Mbarara is the fastest-growing city in Western Uganda, a bustling center of commerce, agriculture, and hospitality. As the city expands, so does the demand for premium, private companionship. Our definitive directory of Mbarara escorts provides residents and visiting businessmen with direct access to the most beautiful and verified companions in the western region. Avoid the stress of unreliable classifieds and browse a curated selection of genuine profiles. Whether you are attending a conference, managing regional business, or simply enjoying the local hospitality, an elegant companion can transform your downtime into an unforgettable experience. The companions featured on Escorts UG in Mbarara cater to a variety of sophisticated tastes, offering everything from standard discreet meetups to extensive weekend arrangements. Every escort undergoes our verification process, ensuring that their photos and descriptions are entirely accurate. Explore our Mbarara listings to find stunning local beauties who provide top-tier companionship, absolute discretion, and pure satisfaction in the heart of Western Uganda.",
  },
  gulu: {
    title: "Gulu Escorts – Verified Profiles | Escorts UG",
    description: "Find verified escorts in Gulu, northern Uganda. Browse authentic companion profiles in the northern hub.",
    heading: "Escorts in Gulu",
    body: "Gulu is the central hub of Northern Uganda, a city with a unique character and a rapidly developing social scene. For those visiting Gulu on business, NGO work, or leisure, finding reliable and verified companionship is now easier than ever. Our Gulu escort directory features stunning local beauties who offer professional and discreet services. Each profile is vetted to ensure that your experience is safe and authentic. From quiet evenings to more adventurous encounters, our Gulu companions are the best in the region.",
  },
  mukono: {
    title: "Mukono Escorts – Verified Profiles | Escorts UG",
    description: "Find verified escorts in Mukono. Browse authentic companion profiles near UCU and the Kampala-Jinja highway.",
    heading: "Escorts in Mukono",
    body: "Mukono is a bustling town strategically located between Kampala and Jinja. Known for its academic institutions and industrial growth, it attracts a diverse range of people. Our Mukono escorts offer high-quality, discreet companionship for students, professionals, and travelers alike. Whether you are staying in Mukono or just passing through, our verified profiles ensure you find the perfect companion for any occasion.",
  },
};

interface LocationPageProps {
  cityParam?: string;
  suburbParam?: string;
  categoryParam?: string;
  initialProfiles?: ProfileType[];
  shuffleSeed?: string;
}

const LocationPage = ({ cityParam, suburbParam, categoryParam, initialProfiles, shuffleSeed }: LocationPageProps) => {
  const city = cityParam;
  const suburb = suburbParam;
  const category = categoryParam;
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [countText, setCountText] = useState("Browse authentic companion profiles...");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: queryProfiles } = useAllProfiles(initialProfiles, shuffleSeed);
  const allProfiles = queryProfiles || initialProfiles || [];

  const locationProfiles = (() => {
    let filtered = allProfiles;

    // Filter by Location
    if (city) {
      const kampalaSuburbs = [
        "banda", "bugolobi", "bukesa", "bukoto", "bunamwaya", "bunga", 
        "busega", "buwate", "buziga", "bwaise", "central", "ggaba", "kabalagala", "kabowa", 
        "kampala town", "kamwokya", "kansanga", "kanyanya", "kasubi", "katooke", 
        "kawempe", "kazo", "kibuli", "kireka", "kirinnya", "kisaasi", "kisugu", 
        "kitintale", "kiwatule", "kololo", "komamboga", "kulambiro", "kyaliwajjala", 
        "kyambogo", "kyanja", "kyebando", "lubaga", "lugala", "lugogo", "lungujja", 
        "luzira", "makerere", "makindye", "masajja", "masanafu", "mawanda road", 
        "mbuya", "mengo", "mpererwe", "mulago", "munyonyo", "mutundwe", "mutungo", 
        "muyenga", "naalya", "nabulagala", "nabweru", "naguru", "najjanankumbi", 
        "najjera", "nakasero", "nakawa", "nakulabye", "namasuba", "namirembe", 
        "namungoona", "namuwongo", "nateete", "nkuba", "nsambya", "ntinda", 
        "rubaga", "salaama rd", "sir apollo kagwa", "wandegeya"
      ];

      filtered = filtered.filter(profile => {
        const profileLoc = profile.location.toLowerCase();
        const targetCity = city.toLowerCase();

        if (suburb) {
          const targetSuburb = suburb.toLowerCase().replace(/-/g, ' ');
          return profileLoc === targetSuburb || profileLoc.includes(targetSuburb);
        }

        if (targetCity === 'kampala') {
          const isKampala = profileLoc === 'kampala' || profileLoc.includes('kampala');
          const isSuburb = kampalaSuburbs.some(sub => profileLoc.includes(sub));
          return isKampala || isSuburb;
        }

        return profileLoc === targetCity || profileLoc.includes(targetCity);
      });
    }

    // Filter by Category (Body Type or Services or VIP)
    if (category) {
      const cat = category.toLowerCase().replace(/-/g, ' ');
      filtered = filtered.filter(profile => {
        const bodyTypeMatch = profile.bodyType?.toLowerCase() === cat || profile.bodyType?.toLowerCase().includes(cat);
        const serviceMatch = profile.services?.some(s => s.toLowerCase().includes(cat));
        const vipMatch = (cat === 'vip' || cat === 'premium') ? profile.isVip || profile.isPinned : false;
        
        return bodyTypeMatch || serviceMatch || vipMatch;
      });
    }

    return filtered;
  })();

  const getLocationTitle = () => {
    const catName = category ? category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "Escorts";
    if (!city) return category ? catName : "All Locations";
    
    const cityName = city.charAt(0).toUpperCase() + city.slice(1);
    if (!suburb) return `${catName} in ${cityName}`;
    
    const suburbName = suburb.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return `${catName} in ${suburbName}, ${cityName}`;
  };

  useEffect(() => {
    setIsMounted(true);
    if (locationProfiles.length > 0) {
      setCountText(`Discover ${locationProfiles.length} verified profiles in ${getLocationTitle()}`);
    } else {
      setCountText(`Browse available escorts in ${getLocationTitle()}`);
    }
  }, [locationProfiles.length, city, suburb]);
  const featuredIds = locationProfiles.filter(p => p.isPinned).map(p => p.id);

  const NoEscortsMessage = () => (
    <div className="text-center py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl lg:text-2xl font-bold text-primary mb-4">
          There are no escorts in this area at the moment
        </h2>
        <Button asChild className="bg-red-600 hover:bg-red-700">
          <Link href="/">Browse All Locations</Link>
        </Button>
      </div>
    </div>
  );

  const meta = city ? cityMeta[city.toLowerCase()] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Top Nav */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-black py-2 px-3 flex justify-between items-center lg:hidden">
        <Logo size={32} textSize="xl" />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowSidebar(!showSidebar)}
          className="text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex pt-12 lg:pt-0">
        {/* Sidebar */}
        <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed top-0 left-0 h-full w-64 bg-sidebar pt-12 lg:pt-4 z-20 transition-transform duration-300 overflow-y-auto`}>
          <div className="p-4">
            <div className="hidden lg:block mb-6">
              <Logo textSize="xl" />
            </div>
            <h3 className="text-base font-bold mb-4 text-white">Find your match</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {["Kampala", "Entebbe", "Jinja", "Mbarara", "Gulu"].map((location) => (
                <li key={location}>
                  <Link 
                    href={`/escorts-in/${location.toLowerCase()}`}
                    className={`hover:text-red-400 ${city?.toLowerCase() === location.toLowerCase() ? "text-red-500 font-bold" : ""}`}
                  >
                    {location}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 lg:pl-64 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl lg:text-4xl font-bold mb-2 text-primary">
              {meta && !category ? meta.heading : getLocationTitle()}
            </h1>
            
            {/* Stable Hydration Text */}
            <p className="text-sm lg:text-base text-muted-foreground mb-6 h-6">
              {countText}
            </p>

            {locationProfiles.length > 0 ? (
              <ProfileGrid profiles={locationProfiles} featuredIds={featuredIds} />
            ) : (
              <NoEscortsMessage />
            )}
            
            {meta && (
              <div className="mt-12 p-6 bg-gray-900/50 rounded-xl border border-gray-800 text-muted-foreground prose prose-invert max-w-none">
                <h2 className="text-xl font-bold text-white mb-4">About {meta.heading}</h2>
                <div className="text-sm leading-relaxed space-y-4">
                  {meta.body.split('\n').map((para, i) => <p key={i}>{para}</p>)}
                </div>
              </div>
            )}

            <div className="mt-16 pt-8 border-t border-gray-800">
              <h3 className="text-lg font-bold text-white mb-6">Popular Locations in Uganda</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm">
                {["Kampala", "Entebbe", "Jinja", "Mbarara", "Gulu", "Mukono", "Mbale", "Masaka", "Fort Portal", "Arua", "Lira", "Kasese"].map((loc) => (
                  <Link key={loc} href={`/escorts-in/${slugify(loc)}`} className="text-gray-400 hover:text-primary transition-colors">
                    Escorts in {loc}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSidebar && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
};

export default LocationPage;
