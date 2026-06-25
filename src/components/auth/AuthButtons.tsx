
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

interface AuthButtonsProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export function AuthButtons({ onLoginClick, onSignupClick }: AuthButtonsProps) {
  return (
    <div className="fixed top-4 right-4 z-40 flex space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="text-primary border-primary hover:bg-primary/10 font-semibold"
        onClick={onLoginClick}
      >
        <LogIn className="mr-1 h-4 w-4" />
        Login
      </Button>
      <Button 
        size="sm" 
        className="bg-primary hover:bg-primary/80 font-semibold animate-pulse"
        onClick={onSignupClick}
      >
        <UserPlus className="mr-1 h-4 w-4" />
        Sign Up
      </Button>
    </div>
  );
}
