import React, { useState } from "react";
import { PhotoModal } from "./PhotoModal";
import { useAllProfiles } from "@/hooks/use-all-profiles";
import { ProfileType } from "@/types/profile";

interface Photo {
  id: string;
  title: string | null;
  photo_url: string;
}

interface PhotoListProps {
  profileId: string;
  profiles?: ProfileType[];
  refreshTrigger?: number;
}

export function PhotoList({ profileId, profiles = [], refreshTrigger }: PhotoListProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  
  // Get images from profile data
  const profile = profiles.find(p => p.id === profileId);
  const photos: Photo[] = profile?.images?.map((url, index) => ({
    id: `${profileId}-photo-${index}`,
    title: `${profile.name} - Photo ${index + 1}`,
    photo_url: url
  })) || [];

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  if (photos.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-600">No photos uploaded yet</p>
        <p className="text-sm text-gray-500 mt-1">Photo uploads will be available soon</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className="aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"
            onClick={() => handlePhotoClick(photo)}
          >
            <img 
              src={photo.photo_url} 
              alt={photo.title || 'Photo'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        ))}
      </div>

      <PhotoModal
        isOpen={!!selectedPhoto}
        onClose={closeModal}
        photoUrl={selectedPhoto?.photo_url || ''}
        photoTitle={selectedPhoto?.title || undefined}
      />
    </>
  );
}
