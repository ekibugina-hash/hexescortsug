"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] text-white selection:bg-pink-500/30">
      <div className="text-center px-4 max-w-lg">
        <div className="relative mb-8">
           <h1 className="text-[120px] md:text-[180px] font-black leading-none bg-gradient-to-b from-pink-500 to-transparent bg-clip-text text-transparent opacity-20">
             404
           </h1>
           <div className="absolute inset-0 flex items-center justify-center">
             <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Oops! Lost in the city?</h2>
           </div>
        </div>
        
        <p className="text-gray-400 text-sm md:text-base mb-10 leading-relaxed">
          The profile or page you are looking for has moved to a new location or disappeared. 
          Don't worry, there are plenty of other verified companions waiting for you.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 shadow-[0_0_20px_rgba(219,0,97,0.3)]">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
          
          <Button variant="ghost" asChild className="w-full sm:w-auto text-gray-300 hover:text-white hover:bg-gray-800">
            <Link href="/escorts-in/kampala">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Kampala
            </Link>
          </Button>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-800/50">
          <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">HEX ESCORTS UG • VERIFIED & DISCREET</p>
        </div>
      </div>
    </div>
  );
}
