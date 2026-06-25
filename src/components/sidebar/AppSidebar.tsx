"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Info, HelpCircle, Menu, ChevronDown, ChevronRight, UserPlus, Star, Send } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

const kampalaAreas = [
  "Banda", "Bugolobi", "Bukesa", "Bukoto", "Bunamwaya", "Bunga", 
  "Busega", "Buwate", "Buziga", "Bwaise", "Central", "Ggaba", "Kabalagala", "Kabowa", 
  "Kampala Town", "Kamwokya", "Kansanga", "Kanyanya", "Kasubi", "Katooke", 
  "Kawempe", "Kazo", "Kibuli", "Kireka", "Kirinnya", "Kisaasi", "Kisugu", 
  "Kitintale", "Kiwatule", "Kololo", "Komamboga", "Kulambiro", "Kyaliwajjala", 
  "Kyambogo", "Kyanja", "Kyebando", "Lubaga", "Lugala", "Lugogo", "Lungujja", 
  "Luzira", "Makerere", "Makindye", "Masajja", "Masanafu", "Mawanda Road", 
  "Mbuya", "Mengo", "Mpererwe", "Mulago", "Munyonyo", "Mutundwe", "Mutungo", 
  "Muyenga", "Naalya", "Nabulagala", "Nabweru", "Naguru", "Najjanankumbi", 
  "Najjera", "Nakasero", "Nakawa", "Nakulabye", "Namasuba", "Namirembe", 
  "Namungoona", "Namuwongo", "Nateete", "Nkuba", "Nsambya", "Ntinda", 
  "Rubaga", "Salaama Rd", "Sir Apollo Kagwa", "Wandegeya"
];

const locations = [
  { name: "Kampala", path: "/escorts-in/kampala", hasSubmenu: true, submenu: kampalaAreas },
  { name: "Entebbe", path: "/escorts-in/entebbe" },
  { name: "Jinja", path: "/escorts-in/jinja" },
  { name: "Mbarara", path: "/escorts-in/mbarara" },
  { name: "Gulu", path: "/escorts-in/gulu" },
  { name: "Fort Portal", path: "/escorts-in/fort-portal" },
  { name: "Mbale", path: "/escorts-in/mbale" },
  { name: "Tororo", path: "/escorts-in/tororo" },
  { name: "Mukono", path: "/escorts-in/mukono" },
];

const mainItems = [
  { title: "Home", path: "/", icon: Home },
  { title: "VIP Escorts", path: "/vip", icon: Star },
  { title: "Locations", path: "/escorts-in", icon: MapPin, children: locations },
  { title: "About", path: "/about", icon: Info },
  { title: "FAQ", path: "/faq", icon: HelpCircle },
  { title: "Become an escort", path: "/become-escort", icon: UserPlus },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isPathActive = (path: string) => {
    if (path === "/") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const toggleLocationExpansion = (locationName: string) => {
    if (expandedLocation === locationName) {
      setExpandedLocation(null);
    } else {
      setExpandedLocation(locationName);
    }
  };

  const DesktopSidebar = () => (
    <Sidebar className="hidden lg:block h-screen sticky top-0 left-0">
      <SidebarContent>
        <div className="p-4 mb-4">
          <Logo textSize="2xl" />
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <div key={item.title}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isPathActive(item.path)}
                      onClick={() => {
                        if (item.title === "Locations") {
                          setIsLocationExpanded(!isLocationExpanded);
                        }
                      }}
                    >
                      {item.title === "Locations" ? (
                        <div className="flex items-center w-full">
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                      ) : (
                        <Link href={item.path} className="flex items-center w-full">
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {item.children && isLocationExpanded && (
                    <div className="ml-6 space-y-1 mt-1">
                      {item.children.map((child) => (
                        <div key={child.name}>
                          {child.hasSubmenu ? (
                            <div className="space-y-1">
                              <div 
                               className="flex items-center cursor-pointer text-sm py-1 hover:text-primary"
                                onClick={() => toggleLocationExpansion(child.name)}
                              >
                                {expandedLocation === child.name ? 
                                  <ChevronDown className="h-3 w-3 mr-1 text-primary" /> : 
                                  <ChevronRight className="h-3 w-3 mr-1" />
                                }
                                <span className={expandedLocation === child.name ? "text-primary" : ""}>{child.name}</span>
                              </div>
                              
                              {expandedLocation === child.name && child.submenu && (
                                <div className="ml-4 space-y-1">
                                  {child.submenu.map((area) => (
                                    <Link 
                                      key={area} 
                                      href={`/escorts-in/kampala/${area.toLowerCase().replace(/ /g, '-')}`}
                                      className="block text-xs py-1 hover:text-primary"
                                    >
                                      {area}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <SidebarMenuItem>
                              <SidebarMenuButton asChild isActive={isPathActive(child.path)}>
                                <Link href={child.path}>{child.name}</Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Telegram Button */}
        <div className="p-4 mt-auto border-t border-gray-800">
          <a
                  href="https://t.me/+yX6mljCz8to2ODE0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-[#24A1DE] hover:bg-[#24A1DE]/90 text-white shadow-lg shadow-[#24A1DE]/20 transition-all text-sm font-semibold"
          >
            <Send className="h-4 w-4" />
            Join Telegram Group
          </a>
        </div>
      </SidebarContent>
    </Sidebar>
  );

  const MobileSidebar = () => (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b flex items-center justify-between p-4">
      <Logo textSize="xl" />
      <div className="flex items-center">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <SheetContent side="right" className="w-[280px] sm:w-[350px] bg-background border-l border-gray-800">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Menu</h2>
              </div>
              <nav className="space-y-2">
                {mainItems.map((item) => (
                  <div key={item.title}>
                    {item.title === "Locations" ? (
                      <>
                        <button
                          onClick={() => setIsLocationExpanded(!isLocationExpanded)}
                          className={cn(
                            "flex items-center w-full p-2 rounded-md",
                            isPathActive(item.path) ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          )}
                        >
                          <item.icon className="mr-2 h-5 w-5" />
                          <span>{item.title}</span>
                        </button>
                        {isLocationExpanded && (
                          <div className="ml-6 space-y-1 mt-1">
                            {locations.map((city) => (
                              <div key={city.name} className="rounded-md">
                                {city.hasSubmenu ? (
                                  <div>
                                    <div 
                                      className="flex items-center p-2 hover:bg-muted rounded-md cursor-pointer"
                                      onClick={() => toggleLocationExpansion(city.name)}
                                    >
                                      {expandedLocation === city.name ? 
                                        <ChevronDown className="h-4 w-4 mr-1 text-primary" /> : 
                                        <ChevronRight className="h-4 w-4 mr-1" />
                                      }
                                      <span className={expandedLocation === city.name ? "text-primary" : ""}>
                                        {city.name}
                                      </span>
                                    </div>
                                    
                                    {expandedLocation === city.name && city.submenu && (
                                      <div className="ml-6 space-y-1 mt-1 max-h-[250px] overflow-y-auto">
                                        {city.submenu.map((area) => (
                                          <Link
                                            key={area}
                                            href={`/escorts-in/kampala/${area.toLowerCase().replace(/ /g, '-')}`}
                                            className="block p-1 text-sm hover:text-primary"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                          >
                                            {area}
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <Link
                                    href={city.path}
                                    className={cn(
                                      "flex items-center p-2 rounded-md",
                                      isPathActive(city.path) ? "bg-primary/80 text-primary-foreground" : "hover:bg-muted"
                                    )}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    {city.name}
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.path}
                        className={cn(
                          "flex items-center p-2 rounded-md",
                          isPathActive(item.path) ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="mr-2 h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {/* Telegram Button in mobile menu */}
              <div className="pt-4 mt-4 border-t border-gray-800">
                <a
                        href="https://t.me/+yX6mljCz8to2ODE0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-[#24A1DE] hover:bg-[#24A1DE]/90 text-white shadow-lg shadow-[#24A1DE]/20 transition-all text-sm font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Send className="h-5 w-5" />
                  Join our Telegram Group
                </a>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}
