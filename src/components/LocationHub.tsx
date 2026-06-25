import Link from "next/link";

const kampalaSuburbs = [
  "bugolobi", "bukoto", "buziga", "kabalagala", "kamwokya", "kansanga",
  "kisaasi", "kololo", "kyaliwajjala", "kyanja", "lubaga", "luzira",
  "makindye", "muyenga", "naalya", "naguru", "najjera", "nakasero", "ntinda",
  "bunga", "gaba", "munyonyo", "namuwongo", "kiwatule", "kungu", "buwaate",
  "kiruddu", "salaama", "seguku", "namasuba", "lubowa", "najjanankumbi"
];

const cities = [
  "entebbe", "jinja", "mbarara", "gulu", "fort-portal", "mbale", "tororo", "mukono", 
  "masaka", "arua", "lira", "kasese", "hoima", "soroti", "busia", "mubende", "wakiso"
];

const LocationHub = () => {
  return (
    <div className="mt-12 pt-8 border-t border-gray-900/50">
      <h5 className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-6 text-center md:text-left">
        Browse by Area
      </h5>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
        {/* Kampala Suburbs */}
        {kampalaSuburbs.map((suburb) => (
          <Link 
            key={suburb} 
            href={`/escorts-in/kampala/${suburb}`}
            className="text-gray-600 hover:text-pink-500/80 transition-colors text-[11px] capitalize"
          >
            {suburb.replace(/-/g, ' ')} Escorts
          </Link>
        ))}
        
        {/* Other Cities */}
        {cities.map((city) => (
          <Link 
            key={city} 
            href={`/escorts-in/${city}`}
            className="text-gray-600 hover:text-pink-500/80 transition-colors text-[11px] capitalize"
          >
            {city.replace(/-/g, ' ')} Escorts
          </Link>
        ))}
      </div>
      
      <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 border-t border-gray-900/30 pt-6">
        <Link href="/thick-escorts-in/kampala" className="text-gray-700 hover:text-pink-500 transition-colors text-[10px] font-medium">Thick Escorts Kampala</Link>
        <Link href="/slim-escorts-in/kampala" className="text-gray-700 hover:text-pink-500 transition-colors text-[10px] font-medium">Slim Escorts Kampala</Link>
        <Link href="/curvy-escorts-in/kampala" className="text-gray-700 hover:text-pink-500 transition-colors text-[10px] font-medium">Curvy Escorts Kampala</Link>
        <Link href="/vip-escorts-in/kampala" className="text-gray-700 hover:text-pink-500 transition-colors text-[10px] font-medium">VIP Escorts Kampala</Link>
        <Link href="/massage-escorts-in/kampala" className="text-gray-700 hover:text-pink-500 transition-colors text-[10px] font-medium">Massage Kampala</Link>
      </div>
    </div>
  );
};

export default LocationHub;
