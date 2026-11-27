import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  PRODUCTS,
  type CollectionId,
  type OutfitSlot,
  type Product,
  type ProductCategory,
  type ProductLine,
} from '../data/catalog';

export interface BagItem {
  productId: string;
  colorName: string;
  colorHex: string;
  sizeLabel: string;
  quantity: number;
}

export type OutfitSelection = Record<OutfitSlot, string | null>;

export interface SavedOutfit {
  id: string;
  name: string;
  createdAt: string;
  selection: OutfitSelection;
  colorOverrides: Partial<Record<OutfitSlot, string>>;
}

interface StoreContextValue {
  // Bag
  bag: BagItem[];
  addToBag: (item: Omit<BagItem, 'quantity'>, qty?: number) => void;
  updateBagQty: (productId: string, colorName: string, sizeLabel: string, delta: number) => void;
  removeFromBag: (productId: string, colorName: string, sizeLabel: string) => void;
  clearBag: () => void;
  bagCount: number;
  bagSubtotal: number;

  // Wishlist
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Saved Outfits
  savedOutfits: SavedOutfit[];
  saveOutfit: (name: string, selection: OutfitSelection, colorOverrides: Partial<Record<OutfitSlot, string>>) => void;
  deleteSavedOutfit: (id: string) => void;

  // Catalog Filters (synced with navigation clicks)
  activeCollection: CollectionId | 'all';
  setActiveCollection: (col: CollectionId | 'all') => void;
  activeLine: ProductLine | 'all';
  setActiveLine: (line: ProductLine | 'all') => void;
  activeCategory: ProductCategory | 'all';
  setActiveCategory: (cat: ProductCategory | 'all') => void;

  // Modals / Drawers
  selectedProduct: Product | null;
  openProduct: (product: Product) => void;
  openProductById: (id: string) => void;
  closeProduct: () => void;

  isBagOpen: boolean;
  setIsBagOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Subtle toast notification
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const STORAGE_KEYS = {
  BAG: 'verion_bag_v1',
  WISHLIST: 'verion_wishlist_v1',
  OUTFITS: 'verion_outfits_v1',
} as const;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [bag, setBag] = useState<BagItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BAG);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return raw ? JSON.parse(raw) : ['atl-asymmetric-blazer', 'acc-monolith-boot'];
    } catch {
      return [];
    }
  });

  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.OUTFITS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [activeCollection, setActiveCollection] = useState<CollectionId | 'all'>('all');
  const [activeLine, setActiveLine] = useState<ProductLine | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BAG, JSON.stringify(bag));
    } catch {
      // Ignore storage quota errors
    }
  }, [bag]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlistIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OUTFITS, JSON.stringify(savedOutfits));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedOutfits]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const addToBag = (item: Omit<BagItem, 'quantity'>, qty = 1) => {
    setBag((prev) => {
      const idx = prev.findIndex(
        (b) =>
          b.productId === item.productId &&
          b.colorName === item.colorName &&
          b.sizeLabel === item.sizeLabel,
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { ...item, quantity: qty }];
    });
    const product = PRODUCTS.find((p) => p.id === item.productId);
    showToast(`Added ${product ? product.name : 'piece'} (${item.sizeLabel}) to bag`);
  };

  const updateBagQty = (productId: string, colorName: string, sizeLabel: string, delta: number) => {
    setBag((prev) =>
      prev
        .map((item) => {
          if (
            item.productId === productId &&
            item.colorName === colorName &&
            item.sizeLabel === sizeLabel
          ) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromBag = (productId: string, colorName: string, sizeLabel: string) => {
    setBag((prev) =>
      prev.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.colorName === colorName &&
            item.sizeLabel === sizeLabel
          ),
      ),
    );
  };

  const clearBag = () => setBag([]);

  const bagCount = bag.reduce((sum, item) => sum + item.quantity, 0);
  const bagSubtotal = bag.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed from saved archive' : 'Saved to archive');
      return next;
    });
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  const saveOutfit = (
    name: string,
    selection: OutfitSelection,
    colorOverrides: Partial<Record<OutfitSlot, string>>,
  ) => {
    const entry: SavedOutfit = {
      id: `look-${Date.now()}`,
      name: name.trim() || `Studio Look ${savedOutfits.length + 1}`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      selection,
      colorOverrides,
    };
    setSavedOutfits((prev) => [entry, ...prev]);
    showToast(`Saved "${entry.name}" to Lookbook`);
  };

  const deleteSavedOutfit = (id: string) => {
    setSavedOutfits((prev) => prev.filter((o) => o.id !== id));
  };

  const openProduct = (product: Product) => setSelectedProduct(product);
  const openProductById = (id: string) => {
    const found = PRODUCTS.find((p) => p.id === id);
    if (found) setSelectedProduct(found);
  };
  const closeProduct = () => setSelectedProduct(null);

  return (
    <StoreContext.Provider
      value={{
        bag,
        addToBag,
        updateBagQty,
        removeFromBag,
        clearBag,
        bagCount,
        bagSubtotal,
        wishlistIds,
        toggleWishlist,
        isWishlisted,
        savedOutfits,
        saveOutfit,
        deleteSavedOutfit,
        activeCollection,
        setActiveCollection,
        activeLine,
        setActiveLine,
        activeCategory,
        setActiveCategory,
        selectedProduct,
        openProduct,
        openProductById,
        closeProduct,
        isBagOpen,
        setIsBagOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isSearchOpen,
        setIsSearchOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
