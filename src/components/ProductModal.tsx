import React, { useEffect, useMemo, useState } from 'react';
import { Box, Check, Heart, Layers, ShoppingBag, X } from 'lucide-react';
import { PRODUCTS, getProductStudioView } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { ThreeGarmentViewer } from '../three/ThreeGarmentViewer';
import { ProductStudioImage } from './ProductStudioImage';

export const ProductModal: React.FC = () => {
  const {
    selectedProduct,
    closeProduct,
    openProduct,
    addToBag,
    toggleWishlist,
    isWishlisted,
  } = useStore();

  const [viewMode, setViewMode] = useState<'3d' | 'studio'>('3d');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [sizeError, setSizeError] = useState<string>('');

  useEffect(() => {
    if (!selectedProduct) return;
    setViewMode('3d');
    setSelectedColorIdx(0);
    const firstAvailable = selectedProduct.sizes.find((s) => s.available);
    setSelectedSize(firstAvailable ? firstAvailable.label : '');
    setSizeError('');
  }, [selectedProduct]);

  useEffect(() => {
    if (!selectedProduct) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeProduct();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedProduct, closeProduct]);

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return PRODUCTS.filter(
      (p) =>
        p.id !== selectedProduct.id &&
        (p.collection === selectedProduct.collection || p.category === selectedProduct.category),
    ).slice(0, 3);
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const activeColor = selectedProduct.colors[selectedColorIdx] || selectedProduct.colors[0];
  const wishlisted = isWishlisted(selectedProduct.id);
  const studioView = getProductStudioView(selectedProduct.id);

  const handleAddToBag = () => {
    const sizeObj = selectedProduct.sizes.find((s) => s.label === selectedSize);
    if (!sizeObj || !sizeObj.available) {
      setSizeError('Please select an available size before adding to bag.');
      return;
    }
    setSizeError('');
    addToBag({
      productId: selectedProduct.id,
      colorName: activeColor.name,
      colorHex: activeColor.hex,
      sizeLabel: selectedSize,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={selectedProduct.name}
      className="fixed inset-0 z-50 bg-[#0F0F10]/70 flex items-center justify-center p-0 sm:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-[1160px] bg-[#F6F4EF] text-[#0F0F10] border border-[#0F0F10]/15 max-h-screen sm:max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-30 bg-[#F6F4EF] border-b border-[#0F0F10]/10 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#78756E]">
            <span>{selectedProduct.collectionLabel}</span>
            <span aria-hidden="true">/</span>
            <span className="font-mono text-[#0F0F10]">{selectedProduct.sku}</span>
            <span aria-hidden="true">·</span>
            <span>Demonstration Specification</span>
          </div>
          <button
            type="button"
            onClick={closeProduct}
            className="p-2 hover:bg-[#E5E2DA] transition-colors cursor-pointer"
            aria-label="Close product detail"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 bg-[#E5E2DA] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#0F0F10]/10 bg-[#EFECE4]">
              <div className="flex items-center gap-1 p-1 bg-[#E5E2DA]">
                <button
                  type="button"
                  onClick={() => setViewMode('3d')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                    viewMode === '3d'
                      ? 'bg-[#0F0F10] text-[#F6F4EF]'
                      : 'text-[#0F0F10]/75 hover:text-[#0F0F10]'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>Interactive 3D</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('studio')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                    viewMode === 'studio'
                      ? 'bg-[#0F0F10] text-[#F6F4EF]'
                      : 'text-[#0F0F10]/75 hover:text-[#0F0F10]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Rear Profile</span>
                </button>
              </div>

              <span className="text-[11px] text-[#78756E] hidden sm:inline">
                {viewMode === '3d' ? 'Drag to rotate · Scroll to zoom' : 'Alternate 3D studio angle'}
              </span>
            </div>

            {viewMode === '3d' ? (
              <ThreeGarmentViewer
                archetype={selectedProduct.model3dType}
                colorHex={activeColor.hex}
                fabricType={activeColor.fabricType || selectedProduct.fabricType}
                label={selectedProduct.name}
                className="w-full h-[460px] sm:h-[560px]"
              />
            ) : (
              <div className="aspect-[3/4] sm:aspect-[4/4] w-full overflow-hidden bg-[#EAE6DC]">
                <ProductStudioImage
                  id={`${selectedProduct.id}-rear`}
                  archetype={selectedProduct.model3dType}
                  colorHex={activeColor.hex}
                  fabricType={activeColor.fabricType || selectedProduct.fabricType}
                  yaw={studioView.yaw + Math.PI}
                  pitch={0.14}
                  zoom={1.08}
                  bgHex="#EFECE4"
                  alt={`${selectedProduct.name} rear studio profile in ${activeColor.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center justify-between text-xs text-[#78756E]">
                <span>{selectedProduct.line === 'unisex' ? 'Unisex' : selectedProduct.line}</span>
                <span>{selectedProduct.availability}</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl text-[#0F0F10] mt-2">
                {selectedProduct.name}
              </h2>
              <p className="font-mono text-xl tabular-nums text-[#0F0F10] mt-2">
                €{selectedProduct.price}
              </p>

              <p className="text-sm text-[#78756E] mt-4 leading-relaxed">
                {selectedProduct.shortDescription}
              </p>

              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.14em] text-[#78756E] mb-2.5">
                  Colorway · <span className="text-[#0F0F10]">{activeColor.name}</span>
                </p>
                <div className="flex items-center gap-3">
                  {selectedProduct.colors.map((c, idx) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColorIdx(idx)}
                      aria-label={`Select colorway ${c.name}`}
                      className={`w-8 h-8 rounded-full border transition-transform cursor-pointer ${
                        idx === selectedColorIdx
                          ? 'border-[#0F0F10] scale-110 ring-2 ring-[#0F0F10]/20'
                          : 'border-[#0F0F10]/25 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <span className="uppercase tracking-[0.14em] text-[#78756E]">Size</span>
                  <span className="text-[#78756E]">{selectedProduct.fit}</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {selectedProduct.sizes.map((s) => {
                    const isSelected = selectedSize === s.label;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        disabled={!s.available}
                        onClick={() => {
                          setSelectedSize(s.label);
                          setSizeError('');
                        }}
                        className={`py-2.5 text-xs font-mono border transition-colors ${
                          !s.available
                            ? 'border-[#0F0F10]/10 text-[#B4B1AA] line-through cursor-not-allowed bg-[#E5E2DA]/40'
                            : isSelected
                              ? 'border-[#0F0F10] bg-[#0F0F10] text-[#F6F4EF] cursor-pointer'
                              : 'border-[#0F0F10]/20 text-[#0F0F10] hover:border-[#0F0F10] cursor-pointer'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
                {sizeError && (
                  <p className="text-xs text-[#5C1E26] mt-2" role="alert">
                    {sizeError}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-stretch gap-2.5">
                <button
                  type="button"
                  onClick={handleAddToBag}
                  className="flex-1 py-3.5 px-5 bg-[#0F0F10] text-[#F6F4EF] text-xs tracking-[0.16em] uppercase font-medium inline-flex items-center justify-center gap-2 hover:bg-[#1A1A1D] transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(selectedProduct.id)}
                  aria-label={wishlisted ? 'Remove from saved archive' : 'Save to archive'}
                  className="px-4 border border-[#0F0F10]/25 hover:border-[#0F0F10] transition-colors inline-flex items-center justify-center cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current text-[#5C1E26]' : ''}`} />
                </button>
              </div>

              <div className="mt-7 pt-5 border-t border-[#0F0F10]/10 space-y-3 text-xs">
                <div>
                  <span className="uppercase tracking-[0.14em] text-[#8E8377] block">
                    Materials
                  </span>
                  <span className="text-[#0F0F10] mt-0.5 block">{selectedProduct.materials}</span>
                </div>
                <div>
                  <span className="uppercase tracking-[0.14em] text-[#8E8377] block">
                    Care
                  </span>
                  <span className="text-[#0F0F10] mt-0.5 block">{selectedProduct.care}</span>
                </div>
                <div>
                  <span className="uppercase tracking-[0.14em] text-[#8E8377] block mb-1">
                    Construction Details
                  </span>
                  <ul className="space-y-1 text-[#0F0F10]/80">
                    {selectedProduct.details.map((d) => (
                      <li key={d} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-[#8E8377] shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#8E8377] pt-4 border-t border-[#0F0F10]/10">
              Demonstration catalog fixture. Pricing and inventory represent concept specifications.
            </p>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="p-6 sm:p-8 border-t border-[#0F0F10]/10 bg-[#EFECE4]">
            <p className="text-xs tracking-[0.18em] uppercase text-[#78756E] mb-4">
              Pair With
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedProducts.map((rel) => {
                const relView = getProductStudioView(rel.id);
                return (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => openProduct(rel)}
                    className="group flex items-center gap-4 text-left bg-[#F6F4EF] p-3 border border-[#0F0F10]/10 hover:border-[#0F0F10] transition-colors cursor-pointer"
                  >
                    <div className="w-16 h-20 shrink-0 overflow-hidden bg-[#E5E2DA]">
                      <ProductStudioImage
                        id={rel.id}
                        archetype={rel.model3dType}
                        colorHex={rel.colors[0].hex}
                        fabricType={rel.fabricType}
                        yaw={relView.yaw}
                        pitch={relView.pitch}
                        zoom={relView.zoom}
                        bgHex={relView.bgHex}
                        alt={rel.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-[#78756E]">{rel.collectionLabel}</p>
                      <p className="text-sm font-medium text-[#0F0F10] truncate">{rel.name}</p>
                      <p className="font-mono text-xs tabular-nums text-[#0F0F10]/80 mt-0.5">
                        €{rel.price}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
