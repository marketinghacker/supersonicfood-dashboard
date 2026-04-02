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
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="relative w-full aspect-[9/16] max-h-[500px] bg-gray-900 rounded-lg overflow-hidden flex flex-col items-center justify-center p-6">
        <p className="text-base font-bold text-red-300 mb-2">Video niedostępne</p>
        <p className="text-sm text-gray-200 mb-4 text-center">Link do video wygasł lub jest nieprawidłowy</p>
        <button
          onClick={() => { setError(false); setPlaying(true); }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-500"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (videoUrl && playing) {
    return (
      <div className="relative w-full aspect-[9/16] max-h-[500px] bg-black rounded-lg overflow-hidden">
        <video
          src={videoUrl}
          controls
          autoPlay
          playsInline
          className="w-full h-full object-contain"
          onError={() => { setPlaying(false); setError(true); }}
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
        <img
          src={thumbnailUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-200 text-base font-bold">
          {name}
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
      {!videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <p className="text-base font-bold text-gray-200">Brak video URL</p>
        </div>
      )}
    </div>
  );
}
