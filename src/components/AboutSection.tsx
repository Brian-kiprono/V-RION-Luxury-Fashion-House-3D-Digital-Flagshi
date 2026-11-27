import React from 'react';
import { IMAGES } from '../data/catalog';
import { SafeImage } from './SafeImage';

export const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      className="py-20 sm:py-28 bg-[#E8E4DA] text-[#0F0F10] border-t border-[#0F0F10]/10"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between gap-8 py-2">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#78756E] mb-3">
                The House of VÉRION
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-normal leading-[1.06] text-[#0F0F10] [text-wrap:balance]">
                Clothing conceived as wearable architecture.
              </h2>
              <p className="text-base text-[#0F0F10]/80 mt-5 leading-relaxed max-w-xl">
                Founded at the intersection of Italian sartorial craft and technical material engineering, VÉRION strips fashion down to proportion, tactile permanence, and structural honesty.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-[#0F0F10]/15">
              <div>
                <p className="font-display text-2xl text-[#0F0F10]">Form</p>
                <p className="text-xs text-[#78756E] mt-1.5 leading-relaxed">
                  Balanced geometric shoulders and kinetic pleats shaped for natural human movement.
                </p>
              </div>
              <div>
                <p className="font-display text-2xl text-[#0F0F10]">Fabric</p>
                <p className="text-xs text-[#78756E] mt-1.5 leading-relaxed">
                  680gsm double-faced cashmere, Japanese high-twist gabardine, and 3-layer storm membranes.
                </p>
              </div>
              <div>
                <p className="font-display text-2xl text-[#0F0F10]">Future</p>
                <p className="text-xs text-[#78756E] mt-1.5 leading-relaxed">
                  Real-time 3D pattern inspection and transparent provenance across every numbered piece.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[380px] overflow-hidden bg-[#D8D3C8]">
              <SafeImage
                src={IMAGES.formalTailoring}
                alt="VÉRION model seated on monolithic travertine bench in midnight blue tailored blazer"
                focus="top"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
