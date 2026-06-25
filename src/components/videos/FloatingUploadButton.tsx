
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { VideoUpload } from "./VideoUpload";
import { useRouter } from "next/navigation";

interface FloatingUploadButtonProps {
  profileId: string;
  onVideoUploaded?: () => void;
}

export function FloatingUploadButton({ profileId, onVideoUploaded }: FloatingUploadButtonProps) {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleButtonClick = () => {
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordSubmit = () => {
    if (password === "Badman256.") {
      setIsPasswordDialogOpen(false);
      setPassword("");
      setIsUploadDialogOpen(true);
    } else {
      setIsPasswordDialogOpen(false);
      setPassword("");
      router.push("/");
    }
  };

  const handleVideoUploaded = () => {
    onVideoUploaded?.();
    setIsUploadDialogOpen(false);
  };

  return (
    <>
      {/* Floating U Button */}
      <Button
        size="icon"
        onClick={handleButtonClick}
        className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg z-50"
      >
        <span className="text-sm font-bold text-white">U</span>
      </Button>

      {/* Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
            <Button onClick={handlePasswordSubmit} className="w-full">
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Video</DialogTitle>
          </DialogHeader>
          <VideoUpload 
            profileId={profileId}
            onVideoUploaded={handleVideoUploaded}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
