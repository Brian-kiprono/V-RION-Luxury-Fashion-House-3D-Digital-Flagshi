import React from 'react';
import { COLLECTIONS } from '../data/catalog';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { setActiveCollection, setActiveLine, setActiveCategory } = useStore();

  const jumpToCollection = (colId: (typeof COLLECTIONS)[number]['id']) => {
    setActiveCollection(colId);
    setActiveLine('all');
    setActiveCategory('all');
    document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0F0F10] text-[#F6F4EF] border-t border-white/10 pt-16 pb-10">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="md:col-span-5">
            <span className="font-display text-3xl tracking-[0.28em] uppercase">VÉRION</span>
            <p className="text-xs tracking-[0.18em] uppercase text-[#8E8377] mt-2">
              Form. Fabric. Future.
            </p>
            <p className="text-sm text-[#B4B1AA] mt-4 max-w-sm leading-relaxed">
              Original luxury fashion house concept uniting editorial garment craft with interactive WebGL inspection.
            </p>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs tracking-[0.18em] uppercase text-[#8E8377] mb-3">
              Collections
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {COLLECTIONS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => jumpToCollection(col.id)}
                  className="text-left text-[#E5E2DA] hover:text-white transition-colors py-1 cursor-pointer"
                >
                  {col.title}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs tracking-[0.18em] uppercase text-[#8E8377] mb-3">
              Flagship Navigation
            </p>
            <div className="flex flex-col gap-2 text-sm text-[#E5E2DA]">
              <a href="#runway" className="hover:text-white transition-colors">
                3D Architectural Runway
              </a>
              <a href="#outfit-studio" className="hover:text-white transition-colors">
                Outfit Styling Studio
              </a>
              <a href="#footwear-accessories" className="hover:text-white transition-colors">
                Footwear & Accessories
              </a>
              <a href="#campaigns" className="hover:text-white transition-colors">
                Editorial Campaigns
              </a>
              <a href="#about" className="hover:text-white transition-colors">
                About the House
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#8E8377]">
          <p>© 2026 VÉRION. All rights reserved.</p>
          <p>
            Demonstration flagship · All product pricing, SKUs, and checkout flows are non-transactional fixtures.
          </p>
        </div>
      </div>
    </footer>
  );
};
