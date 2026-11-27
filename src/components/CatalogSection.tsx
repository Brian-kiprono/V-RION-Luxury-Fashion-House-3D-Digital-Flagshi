import React, { useMemo, useState } from 'react';
import { ArrowUpRight, Box, Heart, SlidersHorizontal } from 'lucide-react';
import {
  COLLECTIONS,
  IMAGES,
  PRODUCTS,
  getProductStudioView,
  type Product,
  type ProductCategory,
  type ProductLine,
} from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { ThreeGarmentViewer } from '../three/ThreeGarmentViewer';
import { ProductStudioImage } from './ProductStudioImage';
import { SafeImage } from './SafeImage';

type SortOption = 'featured' | 'price-asc' | 'price-desc';

export const CatalogSection: React.FC = () => {
  const {
    activeCollection,
    setActiveCollection,
    activeLine,
    setActiveLine,
    activeCategory,
    setActiveCategory,
    openProduct,
    toggleWishlist,
    isWishlisted,
  } = useStore();

  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [colorFilter, setColorFilter] = useState<string>('all');

  // Interactive 3D Garment Atelier Showcase product
  const featured3DProducts = useMemo(() => PRODUCTS.filter((p) => p.featured), []);
  const [atelierIndex, setAtelierIndex] = useState(0);
  const atelierProduct = featured3DProducts[atelierIndex] || PRODUCTS[0];
  const [atelierColorIndex, setAtelierColorIndex] = useState(0);

  const activeAtelierColor =
    atelierProduct.colors[atelierColorIndex] || atelierProduct.colors[0];

  // Main Clothing & Objects Catalog Filter
  const clothingProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      if (activeCollection !== 'all') {
        if (activeCollection === 'womenswear' || activeCollection === 'menswear') {
          if (product.line !== activeCollection && product.line !== 'unisex') return false;
        } else if (product.collection !== activeCollection) {
          return false;
        }
      }
      if (activeLine !== 'all' && product.line !== activeLine && product.line !== 'unisex') {
        return false;
      }
      if (activeCategory !== 'all' && product.category !== activeCategory) {
        return false;
      }
      if (colorFilter !== 'all') {
        const hasColor = product.colors.some((c) =>
          c.name.toLowerCase().includes(colorFilter.toLowerCase()),
        );
        if (!hasColor) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [activeCollection, activeLine, activeCategory, colorFilter, sortBy]);

  const footwearAndAccessories = useMemo(
    () =>
      PRODUCTS.filter(
        (p) => p.category === 'footwear' || p.category === 'bags' || p.category === 'accessories',
      ),
    [],
  );

  // Exclude footwear/accessories from the upper clothing grid when category === 'all' so cards never appear twice
  const upperCatalogProducts = useMemo(() => {
    if (activeCategory !== 'all') return clothingProducts;
    return clothingProducts.filter(
      (p) => p.category !== 'footwear' && p.category !== 'bags' && p.category !== 'accessories',
    );
  }, [clothingProducts, activeCategory]);

  const activeCollectionMeta = COLLECTIONS.find((c) => c.id === activeCollection);

  return (
    <>
      {/* 1. COLLECTIONS & GARMENT DISCOVERY */}
      <section id="collections" className="py-20 sm:py-28 bg-[#F6F4EF] text-[#0F0F10]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#0F0F10]/10">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#8E8377] mb-2">
                Seasonal & Permanent Archive
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-normal tracking-tight text-[#0F0F10] [text-wrap:balance]">
                {activeCollectionMeta ? `${activeCollectionMeta.title} Collection` : 'The Collections'}
              </h2>
              {activeCollectionMeta && (
                <p className="text-sm text-[#78756E] mt-2 max-w-xl">
                  {activeCollectionMeta.description}
                </p>
              )}
            </div>

            {/* Line Switcher: All / Womenswear / Menswear */}
            <div className="flex items-center gap-1 p-1 bg-[#E5E2DA]/70 self-start">
              {(
                [
                  ['all', 'All Lines'],
                  ['womenswear', 'Womenswear'],
                  ['menswear', 'Menswear'],
                ] as Array<[ProductLine | 'all', string]>
              ).map(([lineId, label]) => (
                <button
                  key={lineId}
                  type="button"
                  onClick={() => setActiveLine(lineId)}
                  className={`px-3.5 py-1.5 text-xs tracking-[0.08em] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeLine === lineId
                      ? 'bg-[#0F0F10] text-[#F6F4EF]'
                      : 'text-[#0F0F10]/70 hover:text-[#0F0F10]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 7 Collection Selector Strip */}
          <div className="flex flex-wrap items-center gap-2 py-5 border-b border-[#0F0F10]/10">
            <button
              type="button"
              onClick={() => setActiveCollection('all')}
              className={`px-3.5 py-1.5 text-xs tracking-[0.12em] uppercase transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeCollection === 'all'
                  ? 'bg-[#0F0F10] text-[#F6F4EF]'
                  : 'border border-[#0F0F10]/15 text-[#0F0F10]/75 hover:border-[#0F0F10]'
              }`}
            >
              All Collections
            </button>
            {COLLECTIONS.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => setActiveCollection(col.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs tracking-[0.12em] uppercase transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeCollection === col.id
                    ? 'bg-[#0F0F10] text-[#F6F4EF]'
                    : 'border border-[#0F0F10]/15 text-[#0F0F10]/75 hover:border-[#0F0F10]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: col.accentHex }}
                  aria-hidden="true"
                />
                <span>{col.title}</span>
              </button>
            ))}
          </div>

          {/* Category, Color & Sort Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-8 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8E8377] mr-1" />
              {(
                [
                  ['all', 'Ready-to-Wear'],
                  ['outerwear', 'Outerwear'],
                  ['tops', 'Tops & Knitwear'],
                  ['trousers', 'Trousers'],
                  ['dresses', 'Dresses & Tunics'],
                  ['footwear', 'Footwear'],
                  ['bags', 'Bags'],
                  ['accessories', 'Accessories'],
                ] as Array<[ProductCategory | 'all', string]>
              ).map(([cat, label]) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeCategory === cat
                      ? 'text-[#0F0F10] underline underline-offset-4 font-medium'
                      : 'text-[#78756E] hover:text-[#0F0F10]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-[#78756E]">
                <span>Tone</span>
                <select
                  value={colorFilter}
                  onChange={(e) => setColorFilter(e.target.value)}
                  className="bg-transparent border border-[#0F0F10]/20 px-2.5 py-1 text-[#0F0F10] text-xs cursor-pointer"
                >
                  <option value="all">All Tones</option>
                  <option value="obsidian">Obsidian / Black</option>
                  <option value="ivory">Warm Ivory / Stone</option>
                  <option value="charcoal">Deep Charcoal</option>
                  <option value="midnight">Midnight Blue</option>
                  <option value="olive">Forest / Olive</option>
                  <option value="burgundy">Burgundy</option>
                  <option value="taupe">Taupe / Sand</option>
                </select>
              </label>

              <label className="flex items-center gap-2 text-[#78756E]">
                <span>Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent border border-[#0F0F10]/20 px-2.5 py-1 text-[#0F0F10] text-xs cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </label>
            </div>
          </div>

          {/* Product Grid */}
          {upperCatalogProducts.length === 0 ? (
            <div className="py-16 text-center border border-[#0F0F10]/10 bg-[#EFECE4]">
              <p className="font-display text-2xl text-[#0F0F10]">
                No pieces match the current filter combination.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCollection('all');
                  setActiveLine('all');
                  setActiveCategory('all');
                  setColorFilter('all');
                }}
                className="mt-4 px-5 py-2 bg-[#0F0F10] text-[#F6F4EF] text-xs uppercase tracking-[0.14em] cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-12">
              {upperCatalogProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wishlisted={isWishlisted(product.id)}
                  onOpen={() => openProduct(product)}
                  onToggleWishlist={() => toggleWishlist(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. INTERACTIVE 3D GARMENT ATELIER SPOTLIGHT */}
      <section className="py-20 bg-[#E8E4DA] text-[#0F0F10] border-t border-b border-[#0F0F10]/10">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#78756E] mb-2">
                Interactive 3D Garment Inspection
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-normal tracking-tight">
                Sculpted Construction Studio
              </h2>
            </div>
            <p className="text-xs text-[#78756E] max-w-sm leading-relaxed">
              Rotate, zoom, switch fabrics, and separate construction layers in real-time WebGL to examine lapels, seams, pockets, and hardware.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-8 border border-[#0F0F10]/10">
              <ThreeGarmentViewer
                archetype={atelierProduct.model3dType}
                colorHex={activeAtelierColor.hex}
                fabricType={activeAtelierColor.fabricType || atelierProduct.fabricType}
                label={atelierProduct.name}
                className="w-full h-[430px] sm:h-[540px]"
              />
            </div>

            <div className="lg:col-span-4 bg-[#F6F4EF] border border-[#0F0F10]/10 p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div>
                <div className="flex items-center justify-between text-xs text-[#78756E] mb-4">
                  <span>{atelierProduct.collectionLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{atelierProduct.sku}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {featured3DProducts.map((fp, idx) => (
                    <button
                      key={fp.id}
                      type="button"
                      onClick={() => {
                        setAtelierIndex(idx);
                        setAtelierColorIndex(0);
                      }}
                      className={`px-2.5 py-1 text-[11px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        idx === atelierIndex
                          ? 'bg-[#0F0F10] text-[#F6F4EF]'
                          : 'bg-[#E5E2DA] text-[#0F0F10]/80 hover:bg-[#D8D3C8]'
                      }`}
                    >
                      {fp.name.split(' ').slice(-2).join(' ')}
                    </button>
                  ))}
                </div>

                <h3 className="font-display text-2xl sm:text-3xl text-[#0F0F10]">
                  {atelierProduct.name}
                </h3>
                <p className="font-mono text-sm tabular-nums text-[#0F0F10]/80 mt-1">
                  €{atelierProduct.price}
                </p>
                <p className="text-sm text-[#78756E] mt-3 leading-relaxed">
                  {atelierProduct.shortDescription}
                </p>

                <div className="mt-5">
                  <p className="text-[11px] tracking-[0.14em] uppercase text-[#78756E] mb-2">
                    Finish · {activeAtelierColor.name}
                  </p>
                  <div className="flex items-center gap-2.5">
                    {atelierProduct.colors.map((col, idx) => (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => setAtelierColorIndex(idx)}
                        aria-label={`Select color ${col.name}`}
                        className={`w-7 h-7 rounded-full border transition-transform cursor-pointer ${
                          idx === atelierColorIndex
                            ? 'border-[#0F0F10] scale-110 ring-2 ring-[#0F0F10]/20'
                            : 'border-[#0F0F10]/25 hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>
                </div>

                <ul className="mt-6 pt-5 border-t border-[#0F0F10]/10 space-y-2 text-xs text-[#0F0F10]/80">
                  {atelierProduct.details.map((d) => (
                    <li key={d} className="flex items-start gap-2">
                      <span className="text-[#8E8377] select-none">—</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => openProduct(atelierProduct)}
                className="w-full py-3.5 px-5 bg-[#0F0F10] text-[#F6F4EF] text-xs tracking-[0.16em] uppercase font-medium flex items-center justify-between hover:bg-[#1A1A1D] transition-colors cursor-pointer"
              >
                <span>Open Full Specification & Sizing</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOOTWEAR & ACCESSORIES */}
      <section id="footwear-accessories" className="py-20 sm:py-24 bg-[#F6F4EF] text-[#0F0F10]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-12 border-b border-[#0F0F10]/10">
            <div className="lg:col-span-6">
              <p className="text-xs tracking-[0.2em] uppercase text-[#8E8377] mb-2">
                Objects & Footwear
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-normal tracking-tight">
                Footwear, Bags & Hardware
              </h2>
              <p className="text-sm text-[#78756E] mt-3 max-w-lg leading-relaxed">
                Goodyear-welted Italian calfskin boots, vegetable-tanned architectural leather bags, and featherweight Japanese beta-titanium eyewear. Every object is inspectable in 3D.
              </p>
            </div>
            <div className="lg:col-span-6">
              <div className="aspect-[16/10] overflow-hidden bg-[#E5E2DA]">
                <SafeImage
                  src={IMAGES.footwearAccessories}
                  alt="Sculpted matte obsidian boots, structured leather crossbody bag, and titanium sunglasses on travertine"
                  focus="center"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 mt-12">
            {footwearAndAccessories.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                wishlisted={isWishlisted(item.id)}
                onOpen={() => openProduct(item)}
                onToggleWishlist={() => toggleWishlist(item.id)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

interface ProductCardProps {
  product: Product;
  wishlisted: boolean;
  onOpen: () => void;
  onToggleWishlist: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  wishlisted,
  onOpen,
  onToggleWishlist,
}) => {
  const [colorIndex, setColorIndex] = useState(0);
  const activeColor = product.colors[colorIndex] || product.colors[0];
  const studioView = getProductStudioView(product.id);

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#EAE6DC]">
        <button
          type="button"
          onClick={onOpen}
          className="w-full h-full block text-left cursor-pointer"
          aria-label={`View ${product.name}`}
        >
          <ProductStudioImage
            id={product.id}
            archetype={product.model3dType}
            colorHex={activeColor.hex}
            fabricType={activeColor.fabricType || product.fabricType}
            yaw={studioView.yaw}
            pitch={studioView.pitch}
            zoom={studioView.zoom}
            bgHex={studioView.bgHex}
            alt={`${product.name} in ${activeColor.name}`}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        </button>

        <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-1.5 bg-[#F6F4EF]/92 text-[#0F0F10] px-2.5 py-1 text-[10px] tracking-[0.14em] uppercase">
          <Box className="w-3 h-3" />
          <span>3D Studio</span>
        </div>

        <button
          type="button"
          onClick={onToggleWishlist}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className="absolute top-3 right-3 p-2 bg-[#F6F4EF]/92 text-[#0F0F10] hover:bg-[#0F0F10] hover:text-[#F6F4EF] transition-colors cursor-pointer"
        >
          <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="pt-3.5 flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] text-[#78756E]">
          <span>
            {product.collectionLabel} · {product.availability}
          </span>
          <span className="font-mono tabular-nums text-[#0F0F10] text-sm font-medium">
            €{product.price}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="text-left font-medium text-base text-[#0F0F10] group-hover:underline underline-offset-4 cursor-pointer"
        >
          {product.name}
        </button>

        <div className="flex items-center gap-1.5 pt-1">
          {product.colors.map((c, idx) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setColorIndex(idx)}
              title={`Preview ${c.name}`}
              aria-label={`Preview ${product.name} in ${c.name}`}
              className={`w-3.5 h-3.5 rounded-full border transition-transform cursor-pointer ${
                idx === colorIndex
                  ? 'border-[#0F0F10] scale-115'
                  : 'border-[#0F0F10]/25 hover:scale-110'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
          <span className="text-[11px] text-[#8E8377] ml-1">
            {activeColor.name}
          </span>
        </div>
      </div>
    </article>
  );
};
