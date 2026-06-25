import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useAllProfiles } from "@/hooks/use-all-profiles";
import { ProfileType } from "@/types/profile";

interface VideoListProps {
  profileId: string;
  profiles?: ProfileType[];
  refreshTrigger?: number;
}

export function VideoList({ profileId, profiles = [], refreshTrigger }: VideoListProps) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const profile = profiles.find(p => p.id === profileId);
  const videos = (profile?.videos || []).map((url, index) => ({
    id: `video-${index}`,
    title: `Video ${index + 1}`,
    video_url: url,
  }));

  if (videos.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
        <Play className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-600">No videos uploaded yet</p>
        <p className="text-sm text-gray-500 mt-1">Video uploads will be available soon</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
              onClick={() => setSelectedVideo(null)}
            >
              ✕ Close
            </Button>
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-full rounded-lg"
              style={{ maxHeight: '80vh' }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-video bg-black">
              <video
                src={video.video_url}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setSelectedVideo(video.video_url)}
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                   onClick={() => setSelectedVideo(video.video_url)}>
                <Play className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1 truncate">
                {video.title || 'Untitled Video'}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
