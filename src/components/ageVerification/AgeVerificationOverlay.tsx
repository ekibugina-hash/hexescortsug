
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AgeVerificationOverlayProps {
  onVerify: (isAdult: boolean) => void;
}

export function AgeVerificationOverlay({ onVerify }: AgeVerificationOverlayProps) {
  // Using Dialog to ensure the overlay stays visible until user interaction
  const [open, setOpen] = useState(true);

  // When dialog closes without explicit verification, treat as "No" response
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onVerify(false);
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={true}>
      <DialogContent 
        className="bg-background p-8 rounded-lg max-w-md text-center border border-pink-500/30 shadow-lg shadow-pink-500/20"
        onPointerDownOutside={(e) => e.preventDefault()} // Prevent closing on outside click
        onEscapeKeyDown={(e) => e.preventDefault()} // Prevent closing on Escape key
      >
        <h2 className="text-2xl font-bold mb-4 text-gradient-primary">Age Verification</h2>
        <p className="mb-6">This website contains adult content. Are you at least 18 years old?</p>
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => {
              onVerify(true);
              setOpen(false);
            }} 
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold"
          >
            Yes, I am 18+
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              onVerify(false);
              setOpen(false);
            }}
            className="border-pink-500 text-pink-500 hover:bg-pink-500/10"
          >
            No, I am under 18
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
