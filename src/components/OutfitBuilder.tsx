import React, { useMemo, useState } from 'react';
import { Bookmark, RotateCcw, ShoppingBag, Trash2, ArrowUpRight } from 'lucide-react';
import { PRODUCTS, type OutfitSlot, type Product } from '../data/catalog';
import { useStore, type OutfitSelection } from '../context/StoreContext';
import { ThreeOutfitStage } from '../three/ThreeOutfitStage';

const INITIAL_SELECTION: OutfitSelection = {
  outerwear: 'atl-asymmetric-blazer',
  top: 'ess-merino-knit',
  trousers: 'atl-pleated-trouser',
  footwear: 'acc-monolith-boot',
  accessory: 'acc-crossbody-bag',
};

const SLOT_LABELS: Array<{ slot: OutfitSlot; label: string }> = [
  { slot: 'outerwear', label: 'Outerwear' },
  { slot: 'top', label: 'Top / Knit' },
  { slot: 'trousers', label: 'Trousers' },
  { slot: 'footwear', label: 'Footwear' },
  { slot: 'accessory', label: 'Bag / Eyewear' },
];

export const OutfitBuilder: React.FC = () => {
  const {
    savedOutfits,
    saveOutfit,
    deleteSavedOutfit,
    addToBag,
    openProduct,
    showToast,
  } = useStore();

  const [selection, setSelection] = useState<OutfitSelection>(INITIAL_SELECTION);
  const [colorOverrides, setColorOverrides] = useState<Partial<Record<OutfitSlot, string>>>({});
  const [lookName, setLookName] = useState('');
  const [activeSlot, setActiveSlot] = useState<OutfitSlot>('outerwear');

  const slotOptions = useMemo(() => {
    const map: Record<OutfitSlot, Product[]> = {
      outerwear: [],
      top: [],
      trousers: [],
      footwear: [],
      accessory: [],
    };
    PRODUCTS.forEach((p) => {
      if (p.outfitSlot) map[p.outfitSlot].push(p);
    });
    return map;
  }, []);

  const resolvedProducts = useMemo(() => {
    const find = (id: string | null) => PRODUCTS.find((p) => p.id === id) || null;
    return {
      outerwear: find(selection.outerwear),
      top: find(selection.top),
      trousers: find(selection.trousers),
      footwear: find(selection.footwear),
      accessory: find(selection.accessory),
    };
  }, [selection]);

  const activeProductsList = useMemo(
    () =>
      Object.values(resolvedProducts).filter((p): p is Product => p !== null),
    [resolvedProducts],
  );

  const totalOutfitPrice = useMemo(
    () => activeProductsList.reduce((sum, p) => sum + p.price, 0),
    [activeProductsList],
  );

  const handleSelectProduct = (slot: OutfitSlot, productId: string | null) => {
    setSelection((prev) => ({ ...prev, [slot]: productId }));
    setColorOverrides((prev) => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });
  };

  const handleReset = () => {
    setSelection(INITIAL_SELECTION);
    setColorOverrides({});
    setLookName('');
  };

  const handleSaveLook = (e: React.FormEvent) => {
    e.preventDefault();
    saveOutfit(lookName || `Look ${savedOutfits.length + 1}`, selection, colorOverrides);
    setLookName('');
  };

  const handleAddLookToBag = () => {
    if (activeProductsList.length === 0) return;
    activeProductsList.forEach((product) => {
      const firstAvailSize =
        product.sizes.find((s) => s.available)?.label || product.sizes[0].label;
      const chosenHex =
        (product.outfitSlot && colorOverrides[product.outfitSlot]) ||
        product.colors[0].hex;
      const chosenColor =
        product.colors.find((c) => c.hex === chosenHex) || product.colors[0];

      addToBag({
        productId: product.id,
        colorName: chosenColor.name,
        colorHex: chosenColor.hex,
        sizeLabel: firstAvailSize,
      });
    });
    showToast(`Added ${activeProductsList.length} styled pieces to bag`);
  };

  const currentSlotProduct = resolvedProducts[activeSlot];

  return (
    <section
      id="outfit-studio"
      className="py-20 sm:py-28 bg-[#EAE6DC] text-[#0F0F10] border-t border-[#0F0F10]/10"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#0F0F10]/10">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-[#78756E] mb-2">
              Interactive Styling Studio
            </p>
            <h2 className="font-display text-3xl sm:text-5xl font-normal tracking-tight">
              Outfit Architecture Builder
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#0F0F10]/20 text-xs uppercase tracking-[0.14em] hover:bg-[#0F0F10] hover:text-[#F6F4EF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Styling</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-stretch">
          {/* Left 5 Columns: Live 3D Multi-Garment Ensemble Stage */}
          <div className="lg:col-span-5 flex flex-col border border-[#0F0F10]/10 bg-[#F6F4EF]">
            <ThreeOutfitStage
              outerwear={resolvedProducts.outerwear}
              top={resolvedProducts.top}
              trousers={resolvedProducts.trousers}
              footwear={resolvedProducts.footwear}
              accessory={resolvedProducts.accessory}
              colorOverrides={colorOverrides}
              className="w-full h-[420px] sm:h-[500px]"
            />

            {/* Outfit Total & Quick Actions */}
            <div className="p-5 border-t border-[#0F0F10]/10 flex flex-col gap-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[11px] tracking-[0.16em] uppercase text-[#78756E]">
                    Composed Ensemble ({activeProductsList.length} pieces)
                  </p>
                  <p className="font-mono text-lg tabular-nums text-[#0F0F10] font-medium mt-0.5">
                    €{totalOutfitPrice.toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddLookToBag}
                  disabled={activeProductsList.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F0F10] text-[#F6F4EF] text-xs uppercase tracking-[0.14em] hover:bg-[#1A1A1D] disabled:opacity-40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add Look to Bag</span>
                </button>
              </div>

              {/* Save Outfit Form */}
              <form onSubmit={handleSaveLook} className="flex items-center gap-2 pt-3 border-t border-[#0F0F10]/10">
                <input
                  type="text"
                  value={lookName}
                  onChange={(e) => setLookName(e.target.value)}
                  placeholder="Name this silhouette (e.g. Milan Evening)"
                  className="flex-1 min-w-0 bg-transparent border border-[#0F0F10]/20 px-3 py-2 text-xs text-[#0F0F10] placeholder:text-[#8E8377] focus:outline-none focus:border-[#0F0F10]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#0F0F10] text-xs uppercase tracking-[0.12em] hover:bg-[#0F0F10] hover:text-[#F6F4EF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right 7 Columns: Slot Switcher, Garment Picker & Saved Looks */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div className="bg-[#F6F4EF] border border-[#0F0F10]/10 p-6">
              {/* Slot Tabs */}
              <div className="flex flex-wrap gap-1.5 pb-5 border-b border-[#0F0F10]/10">
                {SLOT_LABELS.map(({ slot, label }) => {
                  const chosen = resolvedProducts[slot];
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setActiveSlot(slot)}
                      className={`px-3.5 py-2 text-xs tracking-[0.12em] uppercase transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        activeSlot === slot
                          ? 'bg-[#0F0F10] text-[#F6F4EF]'
                          : 'bg-[#E5E2DA]/70 text-[#0F0F10]/80 hover:bg-[#D8D3C8]'
                      }`}
                    >
                      {label}
                      {chosen ? ' · ✓' : ''}
                    </button>
                  );
                })}
              </div>

              {/* Garment Options for Active Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => handleSelectProduct(activeSlot, null)}
                  className={`p-3.5 text-left border transition-colors cursor-pointer ${
                    selection[activeSlot] === null
                      ? 'border-[#0F0F10] bg-[#EAE6DC]/60'
                      : 'border-[#0F0F10]/10 hover:border-[#0F0F10]/35'
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.14em] text-[#78756E]">Omit Layer</p>
                  <p className="text-sm font-medium text-[#0F0F10] mt-1">None Selected</p>
                </button>

                {slotOptions[activeSlot].map((item) => {
                  const isSelected = selection[activeSlot] === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 border transition-colors flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'border-[#0F0F10] bg-[#EAE6DC]/60'
                          : 'border-[#0F0F10]/10 hover:border-[#0F0F10]/35'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectProduct(activeSlot, item.id)}
                        className="text-left w-full cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#78756E]">
                          <span>{item.collectionLabel}</span>
                          <span className="font-mono tabular-nums text-[#0F0F10]">
                            €{item.price}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[#0F0F10] mt-1">{item.name}</p>
                      </button>

                      <div className="flex items-center justify-between pt-2 border-t border-[#0F0F10]/10">
                        <div className="flex items-center gap-1.5">
                          {item.colors.map((c) => {
                            const activeHex = colorOverrides[activeSlot] || item.colors[0].hex;
                            return (
                              <button
                                key={c.name}
                                type="button"
                                onClick={() => {
                                  handleSelectProduct(activeSlot, item.id);
                                  setColorOverrides((prev) => ({ ...prev, [activeSlot]: c.hex }));
                                }}
                                aria-label={`Select ${c.name} for ${item.name}`}
                                className={`w-4 h-4 rounded-full border cursor-pointer ${
                                  isSelected && activeHex === c.hex
                                    ? 'border-[#0F0F10] scale-110'
                                    : 'border-[#0F0F10]/25'
                                }`}
                                style={{ backgroundColor: c.hex }}
                              />
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => openProduct(item)}
                          className="inline-flex items-center gap-1 text-[11px] text-[#78756E] hover:text-[#0F0F10] cursor-pointer"
                        >
                          <span>Specs</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Piece Summary Bar */}
              {currentSlotProduct && (
                <div className="mt-5 pt-4 border-t border-[#0F0F10]/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#78756E]">
                  <span>
                    Selected: <strong className="text-[#0F0F10]">{currentSlotProduct.name}</strong> ·{' '}
                    {currentSlotProduct.materials.split('·')[0]}
                  </span>
                  <button
                    type="button"
                    onClick={() => openProduct(currentSlotProduct)}
                    className="underline underline-offset-4 text-[#0F0F10] cursor-pointer"
                  >
                    Inspect Full Piece
                  </button>
                </div>
              )}
            </div>

            {/* Locally Persisted Saved Looks */}
            <div className="bg-[#F6F4EF] border border-[#0F0F10]/10 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-xl text-[#0F0F10]">
                  Saved Studio Looks
                </h3>
                <span className="font-mono text-xs tabular-nums text-[#78756E]">
                  {savedOutfits.length} saved
                </span>
              </div>

              {savedOutfits.length === 0 ? (
                <p className="text-xs text-[#78756E]">
                  Combine garments above and save your look to store combinations locally across sessions.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedOutfits.map((outfit) => (
                    <div
                      key={outfit.id}
                      className="p-3 border border-[#0F0F10]/10 flex items-center justify-between gap-3"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelection(outfit.selection);
                          setColorOverrides(outfit.colorOverrides);
                          showToast(`Loaded "${outfit.name}"`);
                        }}
                        className="text-left flex-1 cursor-pointer"
                      >
                        <p className="text-sm font-medium text-[#0F0F10]">{outfit.name}</p>
                        <p className="text-[11px] text-[#78756E]">
                          Saved {outfit.createdAt} · Load Look
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSavedOutfit(outfit.id)}
                        className="p-1.5 text-[#8E8377] hover:text-[#5C1E26] transition-colors cursor-pointer"
                        aria-label={`Delete ${outfit.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
