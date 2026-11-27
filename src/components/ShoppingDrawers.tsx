import React, { useMemo, useState } from 'react';
import { CheckCircle2, Heart, Minus, Plus, Search, ShoppingBag, Trash2, X } from 'lucide-react';
import { PRODUCTS, getProductStudioView } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { ProductStudioImage } from './ProductStudioImage';

export const BagDrawer: React.FC = () => {
  const {
    bag,
    bagSubtotal,
    isBagOpen,
    setIsBagOpen,
    updateBagQty,
    removeFromBag,
    clearBag,
    openProductById,
  } = useStore();

  const [checkoutStep, setCheckoutStep] = useState<'bag' | 'form' | 'confirmed'>('bag');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [formError, setFormError] = useState('');
  const [orderRef, setOrderRef] = useState('');

  if (!isBagOpen) return null;

  const handleClose = () => {
    setIsBagOpen(false);
    if (checkoutStep === 'confirmed') setCheckoutStep('bag');
  };

  const handleConfirmDemoOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.includes('@') || !customerCity.trim()) {
      setFormError('Please enter your name, a valid email, and destination city.');
      return;
    }
    setFormError('');
    setOrderRef(`VR-${Math.floor(100000 + Math.random() * 899999)}`);
    clearBag();
    setCheckoutStep('confirmed');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
      className="fixed inset-0 z-50 bg-[#0F0F10]/60 flex justify-end"
    >
      <div className="w-full max-w-md bg-[#F6F4EF] text-[#0F0F10] h-full flex flex-col border-l border-[#0F0F10]/15">
        <div className="px-6 py-5 border-b border-[#0F0F10]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <h2 className="font-display text-2xl">Shopping Bag</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 hover:bg-[#E5E2DA] transition-colors cursor-pointer"
            aria-label="Close shopping bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {checkoutStep === 'confirmed' ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 mx-auto text-[#1F362C]" />
              <p className="text-xs tracking-[0.18em] uppercase text-[#78756E]">
                Demonstration Order Recorded
              </p>
              <h3 className="font-display text-3xl text-[#0F0F10]">
                Reference {orderRef}
              </h3>
              <p className="text-sm text-[#78756E] leading-relaxed">
                Prepared for {customerName} ({customerCity}). No real payment was collected and no physical shipment will be dispatched.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCheckoutStep('bag');
                  setIsBagOpen(false);
                }}
                className="mt-4 px-6 py-3 bg-[#0F0F10] text-[#F6F4EF] text-xs uppercase tracking-[0.16em] cursor-pointer"
              >
                Return to Flagship
              </button>
            </div>
          ) : bag.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="font-display text-2xl text-[#0F0F10]">Your bag is empty</p>
              <p className="text-xs text-[#78756E]">
                Explore the collections or compose an ensemble in the Outfit Studio.
              </p>
            </div>
          ) : checkoutStep === 'form' ? (
            <form onSubmit={handleConfirmDemoOrder} className="space-y-4">
              <div className="p-3 bg-[#EAE6DC] text-xs text-[#0F0F10]/80">
                Demonstration checkout only. Do not enter real payment credentials.
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.12em] text-[#78756E] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Elena Vance"
                  className="w-full border border-[#0F0F10]/20 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#0F0F10]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.12em] text-[#78756E] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full border border-[#0F0F10]/20 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#0F0F10]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.12em] text-[#78756E] mb-1">
                  Destination City
                </label>
                <input
                  type="text"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder="Milan, Italy"
                  className="w-full border border-[#0F0F10]/20 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#0F0F10]"
                />
              </div>
              {formError && (
                <p className="text-xs text-[#5C1E26]" role="alert">
                  {formError}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('bag')}
                  className="px-4 py-3 border border-[#0F0F10]/25 text-xs uppercase tracking-[0.14em] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#0F0F10] text-[#F6F4EF] text-xs uppercase tracking-[0.16em] cursor-pointer"
                >
                  Submit Demo Order (€{bagSubtotal.toLocaleString()})
                </button>
              </div>
            </form>
          ) : (
            <div className="divide-y divide-[#0F0F10]/10">
              {bag.map((item) => {
                const product = PRODUCTS.find((p) => p.id === item.productId);
                if (!product) return null;
                const studioView = getProductStudioView(product.id);
                return (
                  <div
                    key={`${item.productId}-${item.colorName}-${item.sizeLabel}`}
                    className="py-4 flex gap-4"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsBagOpen(false);
                        openProductById(product.id);
                      }}
                      className="w-20 h-24 shrink-0 bg-[#E5E2DA] overflow-hidden cursor-pointer"
                    >
                      <ProductStudioImage
                        id={product.id}
                        archetype={product.model3dType}
                        colorHex={item.colorHex}
                        fabricType={product.fabricType}
                        yaw={studioView.yaw}
                        pitch={studioView.pitch}
                        zoom={studioView.zoom}
                        bgHex={studioView.bgHex}
                        alt={`${product.name} in ${item.colorName}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-[#0F0F10] truncate">
                            {product.name}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              removeFromBag(item.productId, item.colorName, item.sizeLabel)
                            }
                            aria-label={`Remove ${product.name}`}
                            className="text-[#8E8377] hover:text-[#5C1E26] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-[#78756E] mt-0.5">
                          {item.colorName} · Size {item.sizeLabel}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="inline-flex items-center border border-[#0F0F10]/20">
                          <button
                            type="button"
                            onClick={() =>
                              updateBagQty(item.productId, item.colorName, item.sizeLabel, -1)
                            }
                            className="p-1.5 hover:bg-[#E5E2DA] cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-mono tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateBagQty(item.productId, item.colorName, item.sizeLabel, 1)
                            }
                            className="p-1.5 hover:bg-[#E5E2DA] cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-mono text-sm tabular-nums">
                          €{(product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {bag.length > 0 && checkoutStep === 'bag' && (
          <div className="p-6 border-t border-[#0F0F10]/10 bg-[#EFECE4] space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#78756E]">Subtotal (Demo)</span>
              <span className="font-mono text-lg tabular-nums font-medium">
                €{bagSubtotal.toLocaleString()}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCheckoutStep('form')}
              className="w-full py-3.5 bg-[#0F0F10] text-[#F6F4EF] text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#1A1A1D] transition-colors cursor-pointer"
            >
              Proceed to Demo Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const WishlistDrawer: React.FC = () => {
  const {
    wishlistIds,
    toggleWishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    openProductById,
  } = useStore();

  if (!isWishlistOpen) return null;

  const savedProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Saved Archive"
      className="fixed inset-0 z-50 bg-[#0F0F10]/60 flex justify-end"
    >
      <div className="w-full max-w-md bg-[#F6F4EF] text-[#0F0F10] h-full flex flex-col border-l border-[#0F0F10]/15">
        <div className="px-6 py-5 border-b border-[#0F0F10]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <h2 className="font-display text-2xl">Saved Archive</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsWishlistOpen(false)}
            className="p-1.5 hover:bg-[#E5E2DA] transition-colors cursor-pointer"
            aria-label="Close saved archive"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {savedProducts.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="font-display text-2xl">No saved pieces yet</p>
              <p className="text-xs text-[#78756E]">
                Tap the heart icon on any garment to curate your personal archive.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#0F0F10]/10">
              {savedProducts.map((product) => {
                const studioView = getProductStudioView(product.id);
                return (
                  <div key={product.id} className="py-4 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsWishlistOpen(false);
                        openProductById(product.id);
                      }}
                      className="w-16 h-20 shrink-0 bg-[#E5E2DA] overflow-hidden cursor-pointer"
                    >
                      <ProductStudioImage
                        id={product.id}
                        archetype={product.model3dType}
                        colorHex={product.colors[0].hex}
                        fabricType={product.fabricType}
                        yaw={studioView.yaw}
                        pitch={studioView.pitch}
                        zoom={studioView.zoom}
                        bgHex={studioView.bgHex}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-[#78756E]">{product.collectionLabel}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsWishlistOpen(false);
                          openProductById(product.id);
                        }}
                        className="text-sm font-medium text-[#0F0F10] hover:underline truncate block cursor-pointer"
                      >
                        {product.name}
                      </button>
                      <p className="font-mono text-xs tabular-nums text-[#0F0F10]/80 mt-0.5">
                        €{product.price}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className="p-2 text-[#78756E] hover:text-[#5C1E26] cursor-pointer"
                      aria-label={`Remove ${product.name} from saved archive`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, openProduct } = useStore();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS.slice(0, 6);
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.collectionLabel.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.materials.toLowerCase().includes(q),
    );
  }, [query]);

  if (!isSearchOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search VÉRION"
      className="fixed inset-0 z-50 bg-[#0F0F10]/70 flex items-start justify-center pt-12 sm:pt-20 px-4"
    >
      <div className="w-full max-w-2xl bg-[#F6F4EF] text-[#0F0F10] border border-[#0F0F10]/15 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#0F0F10]/10">
          <Search className="w-4 h-4 text-[#78756E]" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search coats, techwear, merino, boots, atelier..."
            className="flex-1 bg-transparent text-sm text-[#0F0F10] placeholder:text-[#8E8377] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 hover:bg-[#E5E2DA] cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#0F0F10]/10">
          {results.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#78756E]">
              No pieces found for "{query}".
            </div>
          ) : (
            results.map((product) => {
              const studioView = getProductStudioView(product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    openProduct(product);
                  }}
                  className="w-full px-5 py-3.5 flex items-center justify-between gap-4 text-left hover:bg-[#EFECE4] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-14 bg-[#E5E2DA] shrink-0 overflow-hidden">
                      <ProductStudioImage
                        id={product.id}
                        archetype={product.model3dType}
                        colorHex={product.colors[0].hex}
                        fabricType={product.fabricType}
                        yaw={studioView.yaw}
                        pitch={studioView.pitch}
                        zoom={studioView.zoom}
                        bgHex={studioView.bgHex}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-[#78756E]">
                        {product.collectionLabel} · {product.category}
                      </p>
                      <p className="text-sm font-medium text-[#0F0F10] truncate">{product.name}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-[#0F0F10] shrink-0">
                    €{product.price}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
