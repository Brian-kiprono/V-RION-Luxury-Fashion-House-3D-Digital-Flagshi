import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, ArrowUpRight, Video } from 'lucide-react';
import { PRODUCTS, RUNWAY_LOOKS, type CollectionId } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { ThreeRunwayScene, type RunwayCameraAngle } from '../three/ThreeRunwayScene';
import { ProductStudioImage } from './ProductStudioImage';

export const RunwaySection: React.FC = () => {
  const { openProductById } = useStore();
  const [collectionFilter, setCollectionFilter] = useState<CollectionId | 'all'>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [cameraAngle, setCameraAngle] = useState<RunwayCameraAngle>('catwalk');

  const filteredLooks = useMemo(() => {
    if (collectionFilter === 'all') return RUNWAY_LOOKS;
    const subset = RUNWAY_LOOKS.filter((l) => l.collectionId === collectionFilter);
    return subset.length > 0 ? subset : RUNWAY_LOOKS;
  }, [collectionFilter]);

  useEffect(() => {
    setActiveIndex(0);
  }, [collectionFilter]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isPlaying || reduced) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % filteredLooks.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [isPlaying, filteredLooks.length]);

  const activeLook = filteredLooks[activeIndex] || filteredLooks[0];
  const linkedProducts = useMemo(
    () =>
      activeLook.productIds
        .map((id) => PRODUCTS.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [activeLook],
  );

  const stepLook = (delta: number) => {
    setActiveIndex((prev) => (prev + delta + filteredLooks.length) % filteredLooks.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepLook(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepLook(-1);
    } else if (e.key === ' ') {
      e.preventDefault();
      setIsPlaying((p) => !p);
    }
  };

  return (
    <section
      id="runway"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="VÉRION Signature 3D Runway"
      className="bg-[#0F0F10] text-[#F6F4EF] py-20 sm:py-24 border-t border-white/10 focus:outline-none"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-[#8E8377] mb-2">
              Signature Presentation
            </p>
            <h2 className="font-display text-3xl sm:text-5xl font-normal tracking-wide text-[#F6F4EF] [text-wrap:balance]">
              The Architectural Runway
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                ['all', 'All Looks'],
                ['atelier', 'Atelier'],
                ['techwear', 'Techwear'],
                ['formal', 'Formal'],
                ['essentials', 'Essentials'],
                ['street', 'Street'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setCollectionFilter(id)}
                className={`px-3.5 py-1.5 text-xs tracking-[0.12em] uppercase transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  collectionFilter === id
                    ? 'bg-[#F6F4EF] text-[#0F0F10] font-medium'
                    : 'text-[#B4B1AA] hover:text-[#F6F4EF] border border-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8 items-stretch">
          {/* Left 7 Columns: Live Interactive Three.js 3D Architectural Runway */}
          <div className="lg:col-span-7 flex flex-col border border-white/10 bg-[#141416]">
            <div className="px-4 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#B4B1AA]">
                <span>3D Spatial Colonnade</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#F6F4EF] font-mono tabular-nums">
                  {activeLook.lookNumber}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-[#8E8377] mr-1" />
                {(['catwalk', 'balcony', 'tracking'] as RunwayCameraAngle[]).map((angle) => (
                  <button
                    key={angle}
                    type="button"
                    onClick={() => setCameraAngle(angle)}
                    className={`px-2.5 py-1 text-[11px] uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      cameraAngle === angle
                        ? 'bg-[#F6F4EF] text-[#0F0F10]'
                        : 'text-[#B4B1AA] hover:text-[#F6F4EF]'
                    }`}
                  >
                    {angle}
                  </button>
                ))}
              </div>
            </div>

            <ThreeRunwayScene
              looks={filteredLooks}
              activeIndex={activeIndex}
              isPlaying={isPlaying}
              cameraAngle={cameraAngle}
              className="w-full h-[380px] sm:h-[460px] lg:h-[520px]"
            />

            <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between gap-4 bg-[#141416]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => stepLook(-1)}
                  className="p-2 border border-white/15 hover:bg-white hover:text-[#0F0F10] transition-colors cursor-pointer"
                  aria-label="Previous runway look"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 border border-white/15 text-xs uppercase tracking-[0.14em] hover:bg-white hover:text-[#0F0F10] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause' : 'Resume'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => stepLook(1)}
                  className="p-2 border border-white/15 hover:bg-white hover:text-[#0F0F10] transition-colors cursor-pointer"
                  aria-label="Next runway look"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {filteredLooks.map((look, i) => (
                  <button
                    key={look.id}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Select ${look.lookNumber}`}
                    className={`h-1.5 transition-all cursor-pointer ${
                      i === activeIndex ? 'w-7 bg-[#F6F4EF]' : 'w-2.5 bg-white/25 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Runway Silhouette Dossier & 3D Back/Detail Plate */}
          <div className="lg:col-span-5 flex flex-col justify-between border border-white/10 bg-[#18181B]">
            <div className="relative h-[300px] sm:h-[340px] overflow-hidden bg-[#1D1D21]">
              <ProductStudioImage
                id={`runway-dossier-${activeLook.id}`}
                archetype={activeLook.archetype}
                colorHex={activeLook.primaryColor}
                secondaryHex={activeLook.secondaryColor}
                fabricType={activeLook.fabricType}
                yaw={-2.55}
                pitch={0.14}
                zoom={1.25}
                bgHex="#1C1C20"
                alt={`Back-profile 3D silhouette detail for ${activeLook.title}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-[#0F0F10]/95 via-[#0F0F10]/50 to-transparent">
                <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-[#E5E2DA]">
                  <span>{activeLook.lookNumber}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeLook.collectionName}</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl text-[#F6F4EF] mt-1">
                  {activeLook.title}
                </h3>
              </div>
            </div>

            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
              <div>
                <p className="text-sm text-[#E5E2DA] leading-relaxed">
                  {activeLook.modelDescription}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span
                    className="w-4 h-4 rounded-full border border-white/25"
                    style={{ backgroundColor: activeLook.primaryColor }}
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-white/25"
                    style={{ backgroundColor: activeLook.secondaryColor }}
                  />
                  <span className="text-xs text-[#8E8377]">{activeLook.silhouetteNote}</span>
                </div>
              </div>

              <div>
                <p className="text-[11px] tracking-[0.18em] uppercase text-[#8E8377] mb-3">
                  Garments in This Look
                </p>
                <div className="divide-y divide-white/10 border-t border-b border-white/10">
                  {linkedProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => openProductById(product.id)}
                      className="w-full py-2.5 flex items-center justify-between gap-3 text-left hover:bg-white/5 px-1 transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="text-sm text-[#F6F4EF]">{product.name}</p>
                        <p className="text-[11px] text-[#8E8377]">{product.materials.split('·')[0]}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs tabular-nums text-[#E5E2DA]">
                          €{product.price}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#8E8377]" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
