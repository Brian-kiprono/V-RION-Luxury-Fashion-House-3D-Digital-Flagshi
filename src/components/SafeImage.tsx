import React, { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  focus?: 'top' | 'center';
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  focus = 'top',
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#E5E2DA] via-[#D8D3C8] to-[#C8C2B5] text-[#0F0F10]/60 p-6 text-center ${className}`}
      >
        <span className="font-display text-2xl tracking-[0.2em] uppercase text-[#0F0F10]/80">
          VÉRION
        </span>
        <span className="text-[11px] mt-2 max-w-[20ch] text-[#78756E]">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${focus === 'top' ? 'object-top' : 'object-center'} object-cover ${className}`}
    />
  );
};
