import React, { useEffect, useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, X, ArrowUpRight } from 'lucide-react';
import { FULL_INDEX_NAV, PRIMARY_TOP_NAV, type NavSectionId } from '../data/navigation';
import { useStore } from '../context/StoreContext';

export const Navbar: React.FC = () => {
  const {
    bagCount,
    wishlistIds,
    setIsBagOpen,
    setIsWishlistOpen,
    setIsSearchOpen,
    setActiveCollection,
    setActiveLine,
    setActiveCategory,
  } = useStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const navigateTo = (id: NavSectionId, targetElementId: string) => {
    setMenuOpen(false);

    if (id === 'womenswear') {
      setActiveLine('womenswear');
      setActiveCollection('all');
      setActiveCategory('all');
    } else if (id === 'menswear') {
      setActiveLine('menswear');
      setActiveCollection('all');
      setActiveCategory('all');
    } else if (id === 'collections') {
      setActiveLine('all');
      setActiveCollection('all');
      setActiveCategory('all');
    } else if (id === 'footwear') {
      setActiveCategory('footwear');
    } else if (id === 'accessories') {
      setActiveCategory('accessories');
    }

    const el = document.getElementById(targetElementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-colors duration-200 border-b ${
          scrolled
            ? 'bg-[#F6F4EF]/95 border-[#0F0F10]/10 text-[#0F0F10]'
            : 'bg-[#0F0F10]/70 border-white/10 text-[#F6F4EF]'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('discover', 'hero');
            }}
            className="font-display text-xl sm:text-2xl tracking-[0.28em] uppercase font-medium whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            VÉRION
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7 text-[13px] tracking-[0.06em]"
          >
            {PRIMARY_TOP_NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.targetElementId}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo(item.id, item.targetElementId);
                }}
                className="whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-current transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Primary Action & Utility Cluster */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:opacity-75 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
              aria-label="Search VÉRION catalog"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsWishlistOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 p-2 hover:opacity-75 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
              aria-label={`Saved archive (${wishlistIds.length})`}
            >
              <Heart className="w-4 h-4" />
              <span className="text-[11px] font-mono tabular-nums">{wishlistIds.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBagOpen(true)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs tracking-[0.12em] uppercase transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                scrolled
                  ? 'bg-[#0F0F10] text-[#F6F4EF] hover:bg-[#1A1A1D]'
                  : 'bg-[#F6F4EF] text-[#0F0F10] hover:bg-[#E5E2DA]'
              }`}
              aria-label={`Open shopping bag with ${bagCount} items`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Bag</span>
              <span className="font-mono tabular-nums">({bagCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="p-2 hover:opacity-75 transition-opacity cursor-pointer"
              aria-label="Open full house index"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Minimal Architectural Index Menu */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="VÉRION House Index"
          className="fixed inset-0 z-50 bg-[#0F0F10] text-[#F6F4EF] overflow-y-auto"
        >
          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-6 flex items-center justify-between border-b border-white/10">
            <span className="font-display text-2xl tracking-[0.28em] uppercase">VÉRION</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase px-3 py-2 border border-white/20 hover:bg-white hover:text-[#0F0F10] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>

          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2">
              {FULL_INDEX_NAV.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id, item.targetElementId)}
                  className="group text-left py-4 border-b border-white/10 flex items-baseline justify-between gap-4 hover:border-white/50 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[11px] text-[#8E8377] tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="font-display text-2xl sm:text-3xl tracking-wide group-hover:translate-x-1.5 transition-transform inline-block">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#B4B1AA] mt-1 pl-7">{item.description}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#8E8377] group-hover:text-[#F6F4EF] shrink-0" />
                </button>
              ))}
            </div>

            <div className="lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/10 pt-8 lg:pt-0 lg:pl-10">
              <div className="space-y-6">
                <p className="text-xs tracking-[0.18em] uppercase text-[#8E8377]">
                  House Utility
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setIsSearchOpen(true);
                    }}
                    className="w-full py-3 px-4 border border-white/20 text-left text-sm flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span>Search Catalog</span>
                    <Search className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setIsWishlistOpen(true);
                    }}
                    className="w-full py-3 px-4 border border-white/20 text-left text-sm flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span>Saved Archive ({wishlistIds.length})</span>
                    <Heart className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setIsBagOpen(true);
                    }}
                    className="w-full py-3 px-4 bg-[#F6F4EF] text-[#0F0F10] text-left text-sm font-medium flex items-center justify-between hover:bg-[#E5E2DA] transition-colors cursor-pointer"
                  >
                    <span>Shopping Bag ({bagCount})</span>
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-10 text-xs text-[#8E8377] space-y-1">
                <p className="text-[#F6F4EF]">VÉRION Atelier · Milan · Paris · Tokyo</p>
                <p>Form. Fabric. Future.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
