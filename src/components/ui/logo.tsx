"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  textSize?: string;
}

export function Logo({ size = 40, className, textSize = "2xl" }: LogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center">
        <img 
          src="/new-logo.jpg" 
          alt="Hex Escorts ug Logo" 
          width={size}
          height={size}
          className="mr-2 object-cover rounded-full shadow-[0_0_10px_rgba(255,20,147,0.5)] border-2 border-primary"
        />
        <div className="text-white">
          <span className={cn(`font-bold italic text-${textSize}`)}>
            <span className="text-primary">Hex Escorts ug</span>
          </span>
        </div>
      </div>
    </div>
  );
}
