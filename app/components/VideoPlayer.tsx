'use client';

import { useState } from 'react';

interface VideoPlayerProps {
  videoUrl: string | null;
  imageUrl: string | null;
  thumbnailUrl: string;
  name: string;
}

export default function VideoPlayer({ videoUrl, imageUrl, thumbnailUrl, name }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);

  if (videoUrl && playing) {
    return (
      <div className="relative w-full aspect-[9/16] max-h-[500px] bg-black rounded-lg overflow-hidden">
        <video
          src={videoUrl}
          controls
          autoPlay
          className="w-full h-full object-contain"
          onError={() => setPlaying(false)}
        >
          Twoja przeglądarka nie wspiera odtwarzania video.
        </video>
      </div>
    );
  }

  if (imageUrl && !videoUrl) {
    return (
      <div className="relative w-full aspect-square max-h-[500px] bg-gray-900 rounded-lg overflow-hidden">
        <img src={imageUrl} alt={name} className="w-full h-full object-contain" />
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-[9/16] max-h-[500px] bg-gray-900 rounded-lg overflow-hidden cursor-pointer group"
      onClick={() => videoUrl && setPlaying(true)}
    >
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          Brak podglądu
        </div>
      )}
      {videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
