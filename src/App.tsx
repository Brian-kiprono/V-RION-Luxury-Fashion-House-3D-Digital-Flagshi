/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CatalogSection } from './components/CatalogSection';
import { RunwaySection } from './components/RunwaySection';
import { OutfitBuilder } from './components/OutfitBuilder';
import { CampaignsSection } from './components/CampaignsSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { ProductModal } from './components/ProductModal';
import { BagDrawer, SearchModal, WishlistDrawer } from './components/ShoppingDrawers';
import { ErrorBoundary } from './components/ErrorBoundary';

function FlagshipToast() {
  const { toastMessage } = useStore();
  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 bg-[#0F0F10] text-[#F6F4EF] border border-white/15 px-4 py-3 text-xs tracking-[0.08em] shadow-lg"
    >
      {toastMessage}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <div className="min-h-screen flex flex-col bg-[#F6F4EF] text-[#0F0F10] overflow-x-hidden">
        <Navbar />
        <main className="flex-1">
          <HeroSection />
          <ErrorBoundary fallbackTitle="Collections & 3D Atelier Unavailable">
            <CatalogSection />
          </ErrorBoundary>
          <ErrorBoundary fallbackTitle="3D Runway Presentation Unavailable">
            <RunwaySection />
          </ErrorBoundary>
          <ErrorBoundary fallbackTitle="Outfit Architecture Studio Unavailable">
            <OutfitBuilder />
          </ErrorBoundary>
          <CampaignsSection />
          <AboutSection />
        </main>
        <Footer />

        <ProductModal />
        <BagDrawer />
        <WishlistDrawer />
        <SearchModal />
        <FlagshipToast />
      </div>
    </StoreProvider>
  );
}
