import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CAMPAIGNS, FASHION_WORLD_STORIES, PRODUCTS, type Campaign } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { ProductStudioImage } from './ProductStudioImage';
import { SafeImage } from './SafeImage';

export const CampaignsSection: React.FC = () => {
  const { openProductById, setActiveCollection } = useStore();
  const [activeCampaign, setActiveCampaign] = useState<Campaign>(CAMPAIGNS[0]);

  const handleExploreCollection = (collectionId: Campaign['collectionId']) => {
    setActiveCollection(collectionId);
    document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* 1. EDITORIAL CAMPAIGNS — Each of the 4 Campaign Photos Appears Exactly Once */}
      <section id="campaigns" className="bg-[#0F0F10] text-[#F6F4EF] py-20 sm:py-28">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#8E8377] mb-2">
                Visual Campaigns
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-normal tracking-wide">
                Four Chapters in Light & Form
              </h2>
            </div>

            <p className="text-xs text-[#B4B1AA] max-w-sm leading-relaxed">
              Select any campaign chapter below to inspect its palette and shop the featured garments worn on set.
            </p>
          </div>

          {/* Four Unique Campaign Plates (zero duplicated spotlight images) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {CAMPAIGNS.map((c) => {
              const isSelected = activeCampaign.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCampaign(c)}
                  className={`group text-left border transition-colors cursor-pointer flex flex-col ${
                    isSelected
                      ? 'border-[#F6F4EF] bg-[#1A1A1D]'
                      : 'border-white/10 bg-[#141416] hover:border-white/40'
                  }`}
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#18181B]">
                    <SafeImage
                      src={c.image}
                      alt={c.imageAlt}
                      focus="top"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#0F0F10]/90 via-[#0F0F10]/35 to-transparent">
                      <p className="text-[10px] tracking-[0.18em] uppercase text-[#E5E2DA]">
                        Campaign {c.number}
                      </p>
                      <h3 className="font-display text-2xl sm:text-3xl text-[#F6F4EF] mt-0.5">
                        {c.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <p className="text-xs text-[#B4B1AA] leading-relaxed">{c.subtitle}</p>
                    <p className="text-[11px] text-[#8E8377]">{c.setting}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Chapter Dossier Bar */}
          <div className="mt-8 bg-[#161619] border border-white/10 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <p className="text-xs tracking-[0.18em] uppercase text-[#8E8377]">
                Selected Chapter · {activeCampaign.number}
              </p>
              <h3 className="font-display text-3xl sm:text-4xl text-[#F6F4EF] mt-1">
                {activeCampaign.title}
              </h3>
              <p className="text-sm text-[#B4B1AA] mt-2">{activeCampaign.subtitle}</p>

              <div className="flex items-center gap-2 mt-5">
                {activeCampaign.palette.map((hex) => (
                  <span
                    key={hex}
                    className="w-6 h-6 rounded-full border border-white/20"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
                <span className="text-[11px] text-[#8E8377] ml-2">Chapter Palette</span>
              </div>

              <button
                type="button"
                onClick={() => handleExploreCollection(activeCampaign.collectionId)}
                className="mt-6 inline-flex items-center gap-3 py-3 px-5 bg-[#F6F4EF] text-[#0F0F10] text-xs tracking-[0.16em] uppercase font-medium hover:bg-[#E5E2DA] transition-colors cursor-pointer"
              >
                <span>Shop {activeCampaign.collectionId} Collection</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="lg:col-span-7">
              <p className="text-[11px] tracking-[0.18em] uppercase text-[#8E8377] mb-3">
                Featured Garments in {activeCampaign.title}
              </p>
              <div className="divide-y divide-white/10 border-t border-b border-white/10">
                {activeCampaign.featuredProductIds.map((pid) => {
                  const prod = PRODUCTS.find((p) => p.id === pid);
                  if (!prod) return null;
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => openProductById(prod.id)}
                      className="w-full py-3.5 flex items-center justify-between gap-3 text-left hover:bg-white/5 px-2 transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="text-sm text-[#F6F4EF]">{prod.name}</p>
                        <p className="text-[11px] text-[#8E8377]">
                          {prod.collectionLabel} · {prod.materials.split('·')[0]}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs tabular-nums text-[#E5E2DA]">
                          €{prod.price}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#8E8377]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE FASHION WORLD — UNIQUE 3D MACRO MATERIAL PLATES */}
      <section id="fashion-world" className="py-20 sm:py-24 bg-[#F6F4EF] text-[#0F0F10]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#0F0F10]/10">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#8E8377] mb-2">
                The Fashion World
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-normal tracking-tight">
                Material Studies & Journal
              </h2>
            </div>
            <p className="text-xs text-[#78756E] max-w-sm">
              Dispatches from the VÉRION textile research atelier, silhouette studies, and architectural collaborations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            {FASHION_WORLD_STORIES.map((story) => (
              <article key={story.id} className="flex flex-col">
                <div className="aspect-[4/3] overflow-hidden bg-[#E5E2DA]">
                  <ProductStudioImage
                    id={`story-${story.id}`}
                    archetype={story.archetype}
                    colorHex={story.colorHex}
                    fabricType={story.fabricType}
                    yaw={story.yaw}
                    pitch={0.18}
                    zoom={story.zoom}
                    bgHex={story.bgHex}
                    alt={story.imageAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pt-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-[11px] text-[#78756E]">
                    <span>{story.kicker}</span>
                    <span aria-hidden="true">·</span>
                    <span>{story.readTime}</span>
                  </div>
                  <h3 className="font-display text-2xl text-[#0F0F10] leading-snug">
                    {story.title}
                  </h3>
                  <p className="text-sm text-[#78756E] leading-relaxed mt-1">
                    {story.excerpt}
                  </p>
                  <p className="font-mono text-[11px] text-[#8E8377] mt-2">
                    {story.materialSpec}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
