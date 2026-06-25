
import { Button } from "@/components/ui/button";

interface UnderageNoticeProps {
  onBack: () => void;
}

export function UnderageNotice({ onBack }: UnderageNoticeProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center">
      <div className="bg-background p-8 rounded-lg max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
        <p className="mb-6">People below 18 years of age cannot access this content.</p>
        <Button 
          onClick={onBack}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}
