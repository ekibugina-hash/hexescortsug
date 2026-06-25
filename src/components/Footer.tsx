import Link from "next/link";
import { Logo } from "@/components/ui/logo";

import LocationHub from "./LocationHub";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12 border-t border-gray-800">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          
          <div className="flex flex-col items-center md:items-start space-y-4">
            <Logo size={40} textSize="2xl" />
            <p className="text-gray-400 text-sm max-w-xs text-center md:text-left">
              Uganda's premier directory for verified, high-quality companions. Browse safely, connect privately.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-4">
            <h4 className="font-bold text-lg text-primary">Top Locations</h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-400 text-center md:text-left">
              <Link href="/escorts-in/kampala" className="hover:text-pink-500 transition-colors">Kampala</Link>
              <Link href="/escorts-in/entebbe" className="hover:text-pink-500 transition-colors">Entebbe</Link>
              <Link href="/escorts-in/jinja" className="hover:text-pink-500 transition-colors">Jinja</Link>
              <Link href="/escorts-in/mbarara" className="hover:text-pink-500 transition-colors">Mbarara</Link>
              <Link href="/escorts-in/gulu" className="hover:text-pink-500 transition-colors">Gulu</Link>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-4">
            <h4 className="font-bold text-lg text-primary">Connect With Us</h4>
            <div className="flex space-x-6">
              {/* X / Twitter */}
              <a 
                href="https://x.com/vickywiz60" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors group"
                aria-label="Follow us on X (Twitter)"
              >
                <span className="bg-gray-800 p-2 rounded-full group-hover:bg-pink-600 transition-colors inline-block">
                  <svg className="h-5 w-5 block" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </span>
              </a>
              {/* Telegram */}
              <a 
                href="https://t.me/+yX6mljCz8to2ODE0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors group"
                aria-label="Join our Telegram Group"
              >
                <span className="bg-gray-800 p-2 rounded-full group-hover:bg-[#24A1DE] transition-colors inline-block">
                  <svg className="h-5 w-5 block" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.62-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
                  </svg>
                </span>
              </a>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              © {new Date().getFullYear()} Hex Escorts UG. All Rights Reserved.
            </p>
          </div>
          
        </div>

        {/* SEO Hub - Hidden but crawlable for massive internal linking authority */}
        <LocationHub />
      </div>
    </footer>
  );
};

export default Footer;
