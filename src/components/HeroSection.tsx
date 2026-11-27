import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDownRight, Play } from 'lucide-react';
import { IMAGES } from '../data/catalog';
import { SafeImage } from './SafeImage';

gsap.registerPlugin(ScrollTrigger);

export const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-reveal', {
        y: 28,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });

      if (bgRef.current) {
        gsap.to(bgRef.current, {
          yPercent: 10,
          scale: 1.06,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-[92vh] lg:min-h-screen w-full overflow-hidden bg-[#0F0F10] text-[#F6F4EF] flex items-end"
    >
      {/* Monumental Architectural Campaign Backdrop */}
      <div ref={bgRef} className="absolute inset-0 will-change-transform">
        <SafeImage
          src={IMAGES.heroAtelier}
          alt="Two VÉRION models in sculptural ivory wool coat and obsidian architectural suit inside a monumental travertine hall"
          loading="eager"
          focus="top"
          className="w-full h-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#0F0F10] via-[#0F0F10]/35 to-[#0F0F10]/40"
        />
      </div>

      {/* Editorial Foreground */}
      <div
        ref={contentRef}
        className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 pb-12 sm:pb-16 pt-28"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <p className="hero-reveal text-xs tracking-[0.24em] uppercase text-[#E5E2DA] mb-4">
              Autumn / Winter Flagship Presentation
            </p>
            <h1 className="hero-reveal font-display text-[clamp(3rem,7.5vw,6.25rem)] leading-[0.94] tracking-[0.04em] font-normal text-[#F6F4EF] [text-wrap:balance]">
              VÉRION
            </h1>
            <p className="hero-reveal font-display text-[clamp(1.5rem,3.2vw,2.65rem)] tracking-[0.14em] text-[#E5E2DA] mt-3 [text-wrap:balance]">
              FORM. FABRIC. FUTURE.
            </p>
          </div>

          <div className="lg:col-span-4 lg:pb-2 flex flex-col items-start lg:items-end gap-5">
            <p className="hero-reveal text-sm sm:text-base text-[#E5E2DA] max-w-xs lg:text-right leading-relaxed">
              Fashion beyond convention. Sculptural tailoring, protective membranes, and interactive 3D garment craft.
            </p>
            <div className="hero-reveal flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => scrollToSection('collections')}
                className="inline-flex items-center gap-2 bg-[#F6F4EF] text-[#0F0F10] px-6 py-3 text-xs tracking-[0.16em] uppercase font-medium hover:bg-[#E5E2DA] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Explore Collections</span>
                <ArrowDownRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('runway')}
                className="inline-flex items-center gap-2 border border-white/35 bg-[#0F0F10]/60 text-[#F6F4EF] px-5 py-3 text-xs tracking-[0.16em] uppercase hover:bg-white hover:text-[#0F0F10] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Enter 3D Runway</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
