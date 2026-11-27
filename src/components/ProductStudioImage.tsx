import React, { useEffect, useState } from 'react';
import type { FabricMaterialType, Model3DArchetype } from '../data/catalog';
import { getCachedStudioRender, requestStudioRender } from '../three/studioRenderer';

interface ProductStudioImageProps {
  id: string;
  archetype: Model3DArchetype;
  colorHex: string;
  secondaryHex?: string;
  fabricType: FabricMaterialType;
  alt: string;
  yaw?: number;
  pitch?: number;
  zoom?: number;
  bgHex?: string;
  className?: string;
}

export const ProductStudioImage: React.FC<ProductStudioImageProps> = ({
  id,
  archetype,
  colorHex,
  secondaryHex,
  fabricType,
  alt,
  yaw = 0.5,
  pitch = 0.14,
  zoom = 1,
  bgHex = '#EAE6DC',
  className = '',
}) => {
  const cacheKey = `${id}:${archetype}:${colorHex}:${fabricType}:${yaw.toFixed(2)}:${zoom.toFixed(2)}:${bgHex}`;
  const [src, setSrc] = useState<string | undefined>(() => getCachedStudioRender(cacheKey));

  useEffect(() => {
    let active = true;
    const cached = getCachedStudioRender(cacheKey);
    if (cached) {
      setSrc(cached);
      return;
    }

    requestStudioRender(
      {
        key: cacheKey,
        archetype,
        colorHex,
        secondaryHex,
        fabricType,
        yaw,
        pitch,
        zoom,
        bgHex,
      },
      (dataUrl) => {
        if (active) setSrc(dataUrl);
      },
    );

    return () => {
      active = false;
    };
  }, [cacheKey, archetype, colorHex, secondaryHex, fabricType, yaw, pitch, zoom, bgHex]);

  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center p-6 text-center ${className}`}
        style={{ backgroundColor: bgHex }}
      >
        <div
          className="w-12 h-12 rounded-full border border-[#0F0F10]/15 mb-3"
          style={{ backgroundColor: colorHex }}
        />
        <span className="font-display text-lg tracking-[0.18em] uppercase text-[#0F0F10]/70">
          VÉRION
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover w-full h-full ${className}`}
    />
  );
};
