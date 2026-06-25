
import { useIsMobile } from "./use-mobile";
import { useToast } from "./use-toast";

export function usePhoneHandler() {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handlePhoneClick = (phoneNumber: string) => {
    if (isMobile) {
      // On mobile, open the phone app
      window.location.href = `tel:${phoneNumber}`;
    } else {
      // On desktop, copy to clipboard
      navigator.clipboard.writeText(phoneNumber).then(() => {
        toast({
          title: "Phone number copied!",
          description: `${phoneNumber} has been copied to your clipboard.`,
        });
      }).catch(() => {
        toast({
          title: "Failed to copy",
          description: "Please copy the phone number manually.",
          variant: "destructive",
        });
      });
    }
  };

  return { handlePhoneClick, isMobile };
}
