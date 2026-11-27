export type CollectionId =
  | 'essentials'
  | 'atelier'
  | 'techwear'
  | 'street'
  | 'formal'
  | 'womenswear'
  | 'menswear';

export type ProductLine = 'womenswear' | 'menswear' | 'unisex';

export type ProductCategory =
  | 'outerwear'
  | 'tops'
  | 'trousers'
  | 'dresses'
  | 'footwear'
  | 'bags'
  | 'accessories';

export type OutfitSlot = 'outerwear' | 'top' | 'trousers' | 'footwear' | 'accessory';

export type Model3DArchetype =
  | 'coat'
  | 'blazer'
  | 'parka'
  | 'vest'
  | 'hoodie'
  | 'tee'
  | 'trousers'
  | 'dress'
  | 'boot'
  | 'trainer'
  | 'bag'
  | 'eyewear';

export type FabricMaterialType = 'wool' | 'tech' | 'leather' | 'cotton' | 'metal';

export interface ProductColor {
  name: string;
  hex: string;
  fabricType?: FabricMaterialType;
}

export interface ProductSize {
  label: string;
  available: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  collection: CollectionId;
  collectionLabel: string;
  line: ProductLine;
  category: ProductCategory;
  outfitSlot?: OutfitSlot;
  price: number;
  shortDescription: string;
  materials: string;
  fit: string;
  care: string;
  availability: 'In Stock' | 'Limited Run' | 'Atelier Edition';
  colors: ProductColor[];
  sizes: ProductSize[];
  image: string;
  imageAlt: string;
  imageFocus?: 'top' | 'center';
  model3dType: Model3DArchetype;
  fabricType: FabricMaterialType;
  details: string[];
  featured?: boolean;
}

export interface CollectionMeta {
  id: CollectionId;
  title: string;
  subtitle: string;
  palette: string[];
  accentHex: string;
  description: string;
  heroImage: string;
}

export interface Campaign {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  setting: string;
  collectionId: CollectionId;
  image: string;
  imageAlt: string;
  palette: string[];
  featuredProductIds: string[];
}

export interface RunwayLook {
  id: string;
  lookNumber: string;
  title: string;
  collectionId: CollectionId;
  collectionName: string;
  modelDescription: string;
  silhouetteNote: string;
  image: string;
  imageAlt: string;
  archetype: Model3DArchetype;
  primaryColor: string;
  secondaryColor: string;
  fabricType: FabricMaterialType;
  productIds: string[];
}

export interface EditorialStory {
  id: string;
  kicker: string;
  title: string;
  excerpt: string;
  archetype: Model3DArchetype;
  colorHex: string;
  fabricType: FabricMaterialType;
  yaw: number;
  zoom: number;
  bgHex: string;
  imageAlt: string;
  readTime: string;
  materialSpec: string;
}

const STUDIO_ANGLES: Record<string, { yaw: number; pitch: number; zoom: number; bgHex: string }> = {
  'ess-oversized-tee': { yaw: 0.25, pitch: 0.12, zoom: 1.05, bgHex: '#EBE7DF' },
  'ess-merino-knit': { yaw: -0.45, pitch: 0.18, zoom: 1.08, bgHex: '#E5E1D8' },
  'ess-relaxed-trouser': { yaw: 0.35, pitch: 0.08, zoom: 1.02, bgHex: '#EAE6DC' },
  'ess-loopback-hoodie': { yaw: -0.58, pitch: 0.16, zoom: 1.04, bgHex: '#E3DFD6' },
  'atl-asymmetric-blazer': { yaw: 0.55, pitch: 0.14, zoom: 1.08, bgHex: '#E8E4DB' },
  'atl-ivory-overcoat': { yaw: -0.32, pitch: 0.12, zoom: 1.0, bgHex: '#DFDBD1' },
  'atl-pleated-trouser': { yaw: -0.42, pitch: 0.06, zoom: 1.05, bgHex: '#E7E3DA' },
  'atl-draped-tunic': { yaw: 0.42, pitch: 0.15, zoom: 1.02, bgHex: '#E2DED5' },
  'tch-membrane-parka': { yaw: 0.64, pitch: 0.14, zoom: 1.06, bgHex: '#E6E2D9' },
  'tch-utility-vest': { yaw: -0.36, pitch: 0.16, zoom: 1.12, bgHex: '#EAE6DD' },
  'tch-cargo-trouser': { yaw: 0.68, pitch: 0.09, zoom: 1.04, bgHex: '#E3DFD5' },
  'str-cropped-work-jacket': { yaw: -0.68, pitch: 0.15, zoom: 1.06, bgHex: '#ECE8E0' },
  'str-selvedge-denim': { yaw: 0.2, pitch: 0.07, zoom: 1.03, bgHex: '#E7E3D9' },
  'frm-midnight-blazer': { yaw: 0.38, pitch: 0.16, zoom: 1.06, bgHex: '#E5E1D7' },
  'frm-obsidian-suit': { yaw: -0.5, pitch: 0.12, zoom: 1.08, bgHex: '#E9E5DC' },
  'frm-barathea-trouser': { yaw: -0.22, pitch: 0.09, zoom: 1.04, bgHex: '#E4E0D6' },
  'acc-monolith-boot': { yaw: 0.72, pitch: 0.18, zoom: 1.15, bgHex: '#EAE6DC' },
  'acc-minimal-trainer': { yaw: -0.78, pitch: 0.2, zoom: 1.18, bgHex: '#E3DFD6' },
  'acc-crossbody-bag': { yaw: 0.46, pitch: 0.16, zoom: 1.15, bgHex: '#E8E4DB' },
  'acc-titanium-eyewear': { yaw: -0.44, pitch: 0.22, zoom: 1.25, bgHex: '#E5E1D8' },
};

export function getProductStudioView(productId: string) {
  return STUDIO_ANGLES[productId] || { yaw: 0.5, pitch: 0.14, zoom: 1.05, bgHex: '#EAE6DC' };
}

// Local compressed editorial images
export const IMAGES = {
  heroAtelier: '/src/assets/images/hero_verion_atelier_1795748234654.jpg',
  stillness: '/src/assets/images/campaign_stillness_1795748234659.jpg',
  afterDark: '/src/assets/images/campaign_after_dark_1795748235674.jpg',
  rawForm: '/src/assets/images/campaign_raw_form_1795748236772.jpg',
  newPerspective: '/src/assets/images/campaign_new_perspective_1795748237400.jpg',
  formalTailoring: '/src/assets/images/collection_formal_tailoring_1795748237433.jpg',
  footwearAccessories: '/src/assets/images/showcase_footwear_accessories_1795748239016.jpg',
} as const;

export const COLLECTIONS: CollectionMeta[] = [
  {
    id: 'essentials',
    title: 'Essentials',
    subtitle: 'Foundational Architecture',
    palette: ['#F6F4EF', '#1A1A1D', '#E5E2DA', '#8E8377'],
    accentHex: '#8E8377',
    description: 'Heavyweight organic jersey, fine merino knits, and relaxed wool staples in warm ivory, stone, and obsidian.',
    heroImage: IMAGES.stillness,
  },
  {
    id: 'atelier',
    title: 'Atelier',
    subtitle: 'Sculptural Tailoring',
    palette: ['#1A1A1D', '#F6F4EF', '#4A3528', '#B4B1AA'],
    accentHex: '#4A3528',
    description: 'Asymmetric wool suiting, architectural shoulder construction, and draped layered silhouettes.',
    heroImage: IMAGES.rawForm,
  },
  {
    id: 'techwear',
    title: 'Techwear',
    subtitle: 'Protective Engineering',
    palette: ['#0F0F10', '#1F362C', '#535844', '#B4B1AA'],
    accentHex: '#1F362C',
    description: 'Three-layer waterproof membranes, ultrasonic taped seams, and anodized titanium utility hardware.',
    heroImage: IMAGES.afterDark,
  },
  {
    id: 'street',
    title: 'Street',
    subtitle: 'Urban Volume',
    palette: ['#D2C6B2', '#1A1A1D', '#192338', '#5C1E26'],
    accentHex: '#D2C6B2',
    description: 'Enzyme-washed French terry hoodies, cropped canvas outerwear, and raw selvedge denim.',
    heroImage: IMAGES.newPerspective,
  },
  {
    id: 'formal',
    title: 'Formal',
    subtitle: 'Contemporary Evening',
    palette: ['#192338', '#0F0F10', '#5C1E26', '#F6F4EF'],
    accentHex: '#192338',
    description: 'Double-breasted barathea wool tailoring, hidden-placket silk poplin, and fluid dress trousers.',
    heroImage: IMAGES.formalTailoring,
  },
  {
    id: 'womenswear',
    title: 'Womenswear',
    subtitle: 'Fluid Precision',
    palette: ['#F6F4EF', '#5C1E26', '#8E8377', '#0F0F10'],
    accentHex: '#5C1E26',
    description: 'Double-faced cashmere coats, sculpted knit dresses, pleated wool skirts, and sharp tailoring.',
    heroImage: IMAGES.stillness,
  },
  {
    id: 'menswear',
    title: 'Menswear',
    subtitle: 'Monolithic Proportion',
    palette: ['#0F0F10', '#192338', '#1F362C', '#E5E2DA'],
    accentHex: '#192338',
    description: 'Structured coats, crisp formal blazers, heavyweight knits, and engineered outerwear.',
    heroImage: IMAGES.formalTailoring,
  },
];

export const PRODUCTS: Product[] = [
  // ESSENTIALS
  {
    id: 'ess-oversized-tee',
    sku: 'VR-ES-101',
    name: '320gsm Architectural Tee',
    collection: 'essentials',
    collectionLabel: 'Essentials',
    line: 'unisex',
    category: 'tops',
    outfitSlot: 'top',
    price: 165,
    shortDescription: 'Drop-shoulder heavyweight jersey tee with a bonded mock-rib collar and clean blind-stitched hem.',
    materials: '100% Organic Supima Cotton · 320gsm Portuguese Jersey',
    fit: 'Boxy, dropped shoulder',
    care: 'Cold hand wash, dry flat',
    availability: 'In Stock',
    colors: [
      { name: 'Warm Ivory', hex: '#F2EFE8', fabricType: 'cotton' },
      { name: 'Obsidian', hex: '#141416', fabricType: 'cotton' },
      { name: 'Warm Taupe', hex: '#8E8377', fabricType: 'cotton' },
    ],
    sizes: [
      { label: 'XS', available: true },
      { label: 'S', available: true },
      { label: 'M', available: true },
      { label: 'L', available: true },
      { label: 'XL', available: false },
    ],
    image: IMAGES.stillness,
    imageAlt: 'Model wearing VÉRION warm ivory knitwear and tailored stone coat',
    imageFocus: 'top',
    model3dType: 'tee',
    fabricType: 'cotton',
    details: [
      'High-density 320gsm combed cotton jersey',
      '1.5cm reinforced double-knit collar',
      'Blind-stitched sleeve and bottom hems',
      'Tonal woven interior neck label',
    ],
  },
  {
    id: 'ess-merino-knit',
    sku: 'VR-ES-104',
    name: 'Fine Gauge Merino Turtleneck',
    collection: 'essentials',
    collectionLabel: 'Essentials',
    line: 'womenswear',
    category: 'tops',
    outfitSlot: 'top',
    price: 390,
    shortDescription: 'Seamless tubular rib-knit turtleneck spun from extra-fine virgin merino wool.',
    materials: '100% Extra-Fine Italian Merino Wool · 18-Gauge',
    fit: 'Close, second-skin drape',
    care: 'Specialist wool wash or dry clean',
    availability: 'In Stock',
    colors: [
      { name: 'Stone', hex: '#D8D2C5', fabricType: 'wool' },
      { name: 'Deep Charcoal', hex: '#28282C', fabricType: 'wool' },
      { name: 'Burgundy', hex: '#5C1E26', fabricType: 'wool' },
    ],
    sizes: [
      { label: 'XS', available: true },
      { label: 'S', available: true },
      { label: 'M', available: true },
      { label: 'L', available: false },
    ],
    image: IMAGES.stillness,
    imageAlt: 'Model in VÉRION stone turtleneck knit under ivory overcoat',
    imageFocus: 'top',
    model3dType: 'tee',
    fabricType: 'wool',
    details: [
      'Zero-seam linked shoulder construction',
      'Foldable architectural rib neck',
      'Elongated wrist cuffs with subtle thumb slit',
    ],
    featured: true,
  },
  {
    id: 'ess-relaxed-trouser',
    sku: 'VR-ES-108',
    name: 'Fluid Wool Lounge Trouser',
    collection: 'essentials',
    collectionLabel: 'Essentials',
    line: 'unisex',
    category: 'trousers',
    outfitSlot: 'trousers',
    price: 440,
    shortDescription: 'Full-length relaxed tailored trousers with an interior drawcord waist and crisp pressed crease.',
    materials: '96% Virgin Wool, 4% Elastane · Brushed Flannel',
    fit: 'Relaxed straight leg',
    care: 'Dry clean only',
    availability: 'In Stock',
    colors: [
      { name: 'Warm Taupe', hex: '#8E8377', fabricType: 'wool' },
      { name: 'Obsidian', hex: '#141416', fabricType: 'wool' },
      { name: 'Chocolate', hex: '#4A3528', fabricType: 'wool' },
    ],
    sizes: [
      { label: '44', available: true },
      { label: '46', available: true },
      { label: '48', available: true },
      { label: '50', available: true },
      { label: '52', available: false },
    ],
    image: IMAGES.stillness,
    imageAlt: 'Model wearing VÉRION warm taupe wide wool trousers',
    imageFocus: 'center',
    model3dType: 'trousers',
    fabricType: 'wool',
    details: [
      'Concealed interior organic cotton drawcord',
      'Twin deep side-seam welt pockets',
      'Horn button rear jetted pocket',
    ],
  },
  {
    id: 'ess-loopback-hoodie',
    sku: 'VR-ES-112',
    name: 'Sculpted Heavyweight Hoodie',
    collection: 'essentials',
    collectionLabel: 'Essentials',
    line: 'menswear',
    category: 'tops',
    outfitSlot: 'top',
    price: 320,
    shortDescription: 'Double-layered hood and structured raglan sleeve hoodie in 520gsm diagonal loopback cotton.',
    materials: '100% Organic Cotton · 520gsm French Terry',
    fit: 'Relaxed structured volume',
    care: 'Machine wash cold gentle',
    availability: 'In Stock',
    colors: [
      { name: 'Sand', hex: '#D2C6B2', fabricType: 'cotton' },
      { name: 'Deep Charcoal', hex: '#2D2E32', fabricType: 'cotton' },
      { name: 'Muted Olive', hex: '#535844', fabricType: 'cotton' },
    ],
    sizes: [
      { label: 'S', available: true },
      { label: 'M', available: true },
      { label: 'L', available: true },
      { label: 'XL', available: true },
    ],
    image: IMAGES.newPerspective,
    imageAlt: 'Models walking in VÉRION sand and charcoal heavyweight hoodies',
    imageFocus: 'top',
    model3dType: 'hoodie',
    fabricType: 'cotton',
    details: [
      'Self-lined structured double hood without drawstrings',
      'Heavy-gauge 2x2 ribbed side gussets',
      'Reinforced bar-tacked kangaroo pocket',
    ],
  },

  // ATELIER
  {
    id: 'atl-asymmetric-blazer',
    sku: 'VR-AT-201',
    name: 'Asymmetric Architectural Blazer',
    collection: 'atelier',
    collectionLabel: 'Atelier',
    line: 'womenswear',
    category: 'outerwear',
    outfitSlot: 'outerwear',
    price: 1480,
    shortDescription: 'Raw-edge canvas-interlined wool jacket with extended geometric shoulders and offset horn closure.',
    materials: '100% Barathea Virgin Wool · Cupro Bemberg Lining',
    fit: 'Sculpted waist, exaggerated shoulder',
    care: 'Specialist couture dry clean',
    availability: 'Atelier Edition',
    colors: [
      { name: 'Deep Charcoal', hex: '#2A2B2F', fabricType: 'wool' },
      { name: 'Obsidian', hex: '#111113', fabricType: 'wool' },
      { name: 'Burgundy', hex: '#5C1E26', fabricType: 'wool' },
    ],
    sizes: [
      { label: '34', available: false },
      { label: '36', available: true },
      { label: '38', available: true },
      { label: '40', available: true },
      { label: '42', available: true },
    ],
    image: IMAGES.rawForm,
    imageAlt: 'Model in VÉRION asymmetric architectural charcoal wool blazer beside concrete column',
    imageFocus: 'top',
    model3dType: 'blazer',
    fabricType: 'wool',
    details: [
      'Hand-basted horsehair chest canvas',
      'Exposed raw-cut structural seam bindings',
      'Custom carved buffalo horn offset buttons',
      'Full silk-feel cupro lining with internal pocket',
    ],
    featured: true,
  },
  {
    id: 'atl-ivory-overcoat',
    sku: 'VR-AT-204',
    name: 'Double-Faced Cashmere Monolith Coat',
    collection: 'atelier',
    collectionLabel: 'Atelier',
    line: 'womenswear',
    category: 'outerwear',
    outfitSlot: 'outerwear',
    price: 2250,
    shortDescription: 'Unlined hand-finished double-faced wool-cashmere coat with sweeping architectural lapel and storm vent.',
    materials: '70% Virgin Wool, 30% Inner Mongolian Cashmere · 680gsm',
    fit: 'Elongated fluid drape',
    care: 'Dry clean only',
    availability: 'Limited Run',
    colors: [
      { name: 'Warm Ivory', hex: '#F3F0E8', fabricType: 'wool' },
      { name: 'Chocolate', hex: '#4A3528', fabricType: 'wool' },
      { name: 'Obsidian', hex: '#121214', fabricType: 'wool' },
    ],
    sizes: [
      { label: 'XS/S', available: true },
      { label: 'M/L', available: true },
      { label: 'XL', available: false },
    ],
    image: IMAGES.heroAtelier,
    imageAlt: 'Model walking in VÉRION warm ivory double-faced cashmere coat inside travertine hall',
    imageFocus: 'top',
    model3dType: 'coat',
    fabricType: 'wool',
    details: [
      '100% hand-blind-stitched split seams',
      'Sculpted high collar stand with concealed hook',
      'Deep angled welt pockets',
      'Numbered woven atelier provenance label',
    ],
    featured: true,
  },
  {
    id: 'atl-pleated-trouser',
    sku: 'VR-AT-209',
    name: 'Knife-Pleat Wide Atelier Trouser',
    collection: 'atelier',
    collectionLabel: 'Atelier',
    line: 'unisex',
    category: 'trousers',
    outfitSlot: 'trousers',
    price: 690,
    shortDescription: 'Architectural deep-pleated wide trousers engineered for kinetic volume and razor-sharp drape.',
    materials: '100% High-Twist Japanese Wool Gabardine',
    fit: 'High-waisted, dramatic wide column',
    care: 'Dry clean only',
    availability: 'In Stock',
    colors: [
      { name: 'Deep Charcoal', hex: '#25262A', fabricType: 'wool' },
      { name: 'Warm Ivory', hex: '#EFECE3', fabricType: 'wool' },
    ],
    sizes: [
      { label: '44', available: true },
      { label: '46', available: true },
      { label: '48', available: true },
      { label: '50', available: false },
    ],
    image: IMAGES.rawForm,
    imageAlt: 'Model wearing VÉRION wide knife-pleat charcoal wool trousers',
    imageFocus: 'center',
    model3dType: 'trousers',
    fabricType: 'wool',
    details: [
      'Twelve continuous pressed vertical knife pleats',
      'Extended tab hook-and-bar waistband',
      'Half-lined to the knee in breathable cupro',
    ],
  },
  {
    id: 'atl-draped-tunic',
    sku: 'VR-AT-212',
    name: 'Asymmetric Poplin Statement Shirt',
    collection: 'atelier',
    collectionLabel: 'Atelier',
    line: 'womenswear',
    category: 'dresses',
    outfitSlot: 'top',
    price: 540,
    shortDescription: 'Layered handkerchief-hem crisp cotton poplin shirt-tunic designed to peek beneath structured suiting.',
    materials: '100% Compact-Spun Swiss Cotton Poplin',
    fit: 'Asymmetric draped silhouette',
    care: 'Cool wash, steam press',
    availability: 'In Stock',
    colors: [
      { name: 'Warm Ivory', hex: '#F6F4EF', fabricType: 'cotton' },
      { name: 'Obsidian', hex: '#151517', fabricType: 'cotton' },
    ],
    sizes: [
      { label: '34', available: true },
      { label: '36', available: true },
      { label: '38', available: true },
      { label: '40', available: false },
    ],
    image: IMAGES.rawForm,
    imageAlt: 'Layered ivory poplin asymmetric tunic beneath charcoal jacket',
    imageFocus: 'center',
    model3dType: 'dress',
    fabricType: 'cotton',
    details: [
      'Concealed mother-of-pearl front placket',
      'Elongated French-cuff sleeves',
      'Architectural multi-point handkerchief hem',
    ],
  },

  // TECHWEAR
  {
    id: 'tch-membrane-parka',
    sku: 'VR-TC-301',
    name: '3L Membrane Storm Shell',
    collection: 'techwear',
    collectionLabel: 'Techwear',
    line: 'menswear',
    category: 'outerwear',
    outfitSlot: 'outerwear',
    price: 1190,
    shortDescription: 'Waterproof, breathable three-layer technical shell with articulated elbows and sealed YKK AquaGuard zips.',
    materials: '3-Layer ePTFE Bonded Ripstop Nylon · 28,000mm Hydrostatic Head',
    fit: 'Articulated ergonomic cut',
    care: 'Technical wash, tumble low to reactivate DWR',
    availability: 'In Stock',
    colors: [
      { name: 'Obsidian', hex: '#0F0F10', fabricType: 'tech' },
      { name: 'Forest Green', hex: '#1F362C', fabricType: 'tech' },
      { name: 'Muted Olive', hex: '#535844', fabricType: 'tech' },
    ],
    sizes: [
      { label: 'S', available: true },
      { label: 'M', available: true },
      { label: 'L', available: true },
      { label: 'XL', available: true },
    ],
    image: IMAGES.afterDark,
    imageAlt: 'Model in VÉRION obsidian technical 3-layer storm parka in dark architectural corridor',
    imageFocus: 'top',
    model3dType: 'parka',
    fabricType: 'tech',
    details: [
      '13mm ultrasonic welded interior seam tape',
      'Three-point storm hood with laminated brim',
      'Laser-perforated underarm ventilation gussets',
      'Anodized matte gunmetal dual-slider zipper',
    ],
    featured: true,
  },
  {
    id: 'tch-utility-vest',
    sku: 'VR-TC-305',
    name: 'Modular Cordura Utility Vest',
    collection: 'techwear',
    collectionLabel: 'Techwear',
    line: 'unisex',
    category: 'outerwear',
    outfitSlot: 'outerwear',
    price: 680,
    shortDescription: 'Ballistic nylon modular chest rig featuring magnetic Fidlock buckles and weatherproof gusset pockets.',
    materials: '500D Cordura Nylon & Matte Anodized Aluminum Hardware',
    fit: 'Adjustable harness straps',
    care: 'Spot clean only',
    availability: 'Limited Run',
    colors: [
      { name: 'Obsidian', hex: '#111114', fabricType: 'tech' },
      { name: 'Muted Olive', hex: '#4B503E', fabricType: 'tech' },
    ],
    sizes: [
      { label: 'One Size', available: true },
    ],
    image: IMAGES.afterDark,
    imageAlt: 'Model wearing VÉRION modular utility vest layered over technical shell',
    imageFocus: 'top',
    model3dType: 'vest',
    fabricType: 'tech',
    details: [
      'Quick-release magnetic Fidlock sternum clasps',
      'Four bellowed waterproof cargo compartments',
      'Detachable carabiner modular anchor loops',
    ],
  },
  {
    id: 'tch-cargo-trouser',
    sku: 'VR-TC-309',
    name: 'Articulated Ripstop Cargo Trouser',
    collection: 'techwear',
    collectionLabel: 'Techwear',
    line: 'menswear',
    category: 'trousers',
    outfitSlot: 'trousers',
    price: 590,
    shortDescription: 'Four-way stretch DWR-treated cargo trousers with articulated knee darts and concealed zip pockets.',
    materials: '72% Polyamide, 28% Elastane · Schoeller Dynamic Weave',
    fit: 'Tapered articulated cut',
    care: 'Cold wash gentle',
    availability: 'In Stock',
    colors: [
      { name: 'Obsidian', hex: '#101012', fabricType: 'tech' },
      { name: 'Deep Charcoal', hex: '#28292D', fabricType: 'tech' },
    ],
    sizes: [
      { label: '28', available: true },
      { label: '30', available: true },
      { label: '32', available: true },
      { label: '34', available: false },
    ],
    image: IMAGES.afterDark,
    imageAlt: 'Model wearing VÉRION articulated black technical cargo trousers',
    imageFocus: 'center',
    model3dType: 'trousers',
    fabricType: 'tech',
    details: [
      'Integrated webbed nylon belt with aluminum cobra buckle',
      'Dual slanted zip-gusset thigh pockets',
      'Elasticated ankle drawcord cinch',
    ],
  },

  // STREET
  {
    id: 'str-cropped-work-jacket',
    sku: 'VR-ST-401',
    name: 'Garment-Dyed Canvas Work Jacket',
    collection: 'street',
    collectionLabel: 'Street',
    line: 'unisex',
    category: 'outerwear',
    outfitSlot: 'outerwear',
    price: 620,
    shortDescription: 'Boxy cropped utility jacket in enzyme-washed Japanese duck canvas with oversized bellows pockets.',
    materials: '100% Organic 14oz Cotton Duck Canvas',
    fit: 'Cropped boxy silhouette',
    care: 'Cold wash inside out',
    availability: 'In Stock',
    colors: [
      { name: 'Deep Charcoal', hex: '#2E2F33', fabricType: 'cotton' },
      { name: 'Chocolate', hex: '#4A3528', fabricType: 'cotton' },
      { name: 'Forest Green', hex: '#1F362C', fabricType: 'cotton' },
    ],
    sizes: [
      { label: 'S', available: true },
      { label: 'M', available: true },
      { label: 'L', available: true },
      { label: 'XL', available: true },
    ],
    image: IMAGES.newPerspective,
    imageAlt: 'Model walking in VÉRION charcoal cropped canvas work jacket over sand hoodie',
    imageFocus: 'top',
    model3dType: 'blazer',
    fabricType: 'cotton',
    details: [
      'Two-way brushed nickel Riri front zipper',
      'Triple-needle felled architectural seams',
      'Twin flap chest pockets with concealed snaps',
    ],
    featured: true,
  },
  {
    id: 'str-selvedge-denim',
    sku: 'VR-ST-406',
    name: 'Relaxed 14oz Selvedge Carpenter Jean',
    collection: 'street',
    collectionLabel: 'Street',
    line: 'menswear',
    category: 'trousers',
    outfitSlot: 'trousers',
    price: 410,
    shortDescription: 'Wide straight-leg denim woven on vintage shuttle looms in Okayama with subtle utility paneling.',
    materials: '100% Japanese Red-Line Selvedge Cotton · 14oz',
    fit: 'Relaxed straight cut',
    care: 'Hand wash cold, line dry',
    availability: 'In Stock',
    colors: [
      { name: 'Midnight Indigo', hex: '#1E2D45', fabricType: 'cotton' },
      { name: 'Obsidian Wash', hex: '#1B1C20', fabricType: 'cotton' },
    ],
    sizes: [
      { label: '28', available: true },
      { label: '30', available: true },
      { label: '32', available: true },
      { label: '34', available: true },
    ],
    image: IMAGES.newPerspective,
    imageAlt: 'Models walking in VÉRION relaxed indigo selvedge denim trousers',
    imageFocus: 'center',
    model3dType: 'trousers',
    fabricType: 'cotton',
    details: [
      'Custom engraved matte silver rivets',
      'Reinforced double-layer utility side pocket',
      'Chain-stitched hem on Union Special machine',
    ],
  },

  // FORMAL
  {
    id: 'frm-midnight-blazer',
    sku: 'VR-FM-501',
    name: 'Midnight Double-Breasted Blazer',
    collection: 'formal',
    collectionLabel: 'Formal',
    line: 'menswear',
    category: 'outerwear',
    outfitSlot: 'outerwear',
    price: 1650,
    shortDescription: 'Peak-lapel double-breasted tailored jacket crafted from Super 150s midnight-blue wool.',
    materials: '100% Super 150s Biella Virgin Wool · Silk Satin Lining',
    fit: 'Tailored modern Italian block',
    care: 'Dry clean only',
    availability: 'In Stock',
    colors: [
      { name: 'Midnight Blue', hex: '#192338', fabricType: 'wool' },
      { name: 'Obsidian', hex: '#101012', fabricType: 'wool' },
      { name: 'Burgundy', hex: '#5C1E26', fabricType: 'wool' },
    ],
    sizes: [
      { label: '46', available: true },
      { label: '48', available: true },
      { label: '50', available: true },
      { label: '52', available: true },
      { label: '54', available: false },
    ],
    image: IMAGES.formalTailoring,
    imageAlt: 'Model seated on travertine bench in VÉRION midnight blue double-breasted blazer',
    imageFocus: 'top',
    model3dType: 'blazer',
    fabricType: 'wool',
    details: [
      'Full floating horsehair canvas construction',
      'Six brushed antique brass buttons',
      'Working four-button surgeon cuffs',
      'Hand-finished pick stitching along peak lapels',
    ],
    featured: true,
  },
  {
    id: 'frm-obsidian-suit',
    sku: 'VR-FM-504',
    name: 'Obsidian Architectural Suit Jacket',
    collection: 'formal',
    collectionLabel: 'Formal',
    line: 'menswear',
    category: 'outerwear',
    outfitSlot: 'outerwear',
    price: 1520,
    shortDescription: 'Minimalist two-button sharp shoulder blazer designed for tonal monochrome evening silhouettes.',
    materials: '100% High-Density Wool Cavalry Twill',
    fit: 'Structured sharp shoulder',
    care: 'Dry clean only',
    availability: 'In Stock',
    colors: [
      { name: 'Obsidian', hex: '#0F0F10', fabricType: 'wool' },
      { name: 'Deep Charcoal', hex: '#232428', fabricType: 'wool' },
    ],
    sizes: [
      { label: '46', available: true },
      { label: '48', available: true },
      { label: '50', available: true },
      { label: '52', available: false },
    ],
    image: IMAGES.heroAtelier,
    imageAlt: 'Male model in VÉRION obsidian architectural suit inside brutalist hall',
    imageFocus: 'top',
    model3dType: 'blazer',
    fabricType: 'wool',
    details: [
      'High-gorge narrow notched lapel',
      'Concealed welt ticket pocket',
      'Internal twin document pockets',
    ],
  },
  {
    id: 'frm-barathea-trouser',
    sku: 'VR-FM-509',
    name: 'Tapered Barathea Formal Trouser',
    collection: 'formal',
    collectionLabel: 'Formal',
    line: 'menswear',
    category: 'trousers',
    outfitSlot: 'trousers',
    price: 580,
    shortDescription: 'Crisp tailored trousers with a clean flat front, side tab waist adjusters, and subtle cuff break.',
    materials: '100% Super 150s Wool Barathea',
    fit: 'Tailored slim-tapered leg',
    care: 'Dry clean only',
    availability: 'In Stock',
    colors: [
      { name: 'Deep Charcoal', hex: '#26272B', fabricType: 'wool' },
      { name: 'Midnight Blue', hex: '#192338', fabricType: 'wool' },
      { name: 'Obsidian', hex: '#0F0F10', fabricType: 'wool' },
    ],
    sizes: [
      { label: '46', available: true },
      { label: '48', available: true },
      { label: '50', available: true },
      { label: '52', available: true },
    ],
    image: IMAGES.formalTailoring,
    imageAlt: 'Model wearing VÉRION tailored charcoal wool formal trousers',
    imageFocus: 'center',
    model3dType: 'trousers',
    fabricType: 'wool',
    details: [
      'Side-cinch brushed gunmetal waist adjusters',
      'Pressed permanent front crease',
      'Half-lined front leg in silk-blend cupro',
    ],
  },

  // FOOTWEAR & ACCESSORIES
  {
    id: 'acc-monolith-boot',
    sku: 'VR-FW-601',
    name: 'Monolith Calfskin Combat Boot',
    collection: 'atelier',
    collectionLabel: 'Footwear',
    line: 'unisex',
    category: 'footwear',
    outfitSlot: 'footwear',
    price: 890,
    shortDescription: 'Architectural ankle boot sculpted from vegetable-tanned full-grain calfskin on a custom Vibram commando sole.',
    materials: '100% Italian Full-Grain Calfskin · Goodyear Welted',
    fit: 'True to European sizing',
    care: 'Nourish with neutral beeswax cream',
    availability: 'In Stock',
    colors: [
      { name: 'Obsidian', hex: '#101012', fabricType: 'leather' },
      { name: 'Chocolate', hex: '#4A3528', fabricType: 'leather' },
    ],
    sizes: [
      { label: '38', available: true },
      { label: '39', available: true },
      { label: '40', available: true },
      { label: '41', available: true },
      { label: '42', available: true },
      { label: '43', available: true },
      { label: '44', available: false },
    ],
    image: IMAGES.footwearAccessories,
    imageAlt: 'VÉRION sculpted obsidian calfskin boots on travertine plinth',
    imageFocus: 'center',
    model3dType: 'boot',
    fabricType: 'leather',
    details: [
      '360-degree Goodyear storm welt construction',
      'Rear concealed YKK Excella metal zipper',
      'Anatomical cork footbed molding to stride',
    ],
    featured: true,
  },
  {
    id: 'acc-minimal-trainer',
    sku: 'VR-FW-604',
    name: 'Atelier Low Calfskin Trainer',
    collection: 'street',
    collectionLabel: 'Footwear',
    line: 'unisex',
    category: 'footwear',
    outfitSlot: 'footwear',
    price: 520,
    shortDescription: 'Clean low-profile court trainer crafted in tonal nubuck and nappa leather with Margom rubber cupsole.',
    materials: 'Nappa Calfskin & Suede Upper · Natural Rubber Sole',
    fit: 'True to size',
    care: 'Wipe with damp cloth',
    availability: 'In Stock',
    colors: [
      { name: 'Warm Ivory', hex: '#F0EDE5', fabricType: 'leather' },
      { name: 'Obsidian', hex: '#141416', fabricType: 'leather' },
    ],
    sizes: [
      { label: '38', available: true },
      { label: '40', available: true },
      { label: '41', available: true },
      { label: '42', available: true },
      { label: '43', available: true },
    ],
    image: IMAGES.newPerspective,
    imageAlt: 'Minimalist ivory leather trainers worn in motion',
    imageFocus: 'center',
    model3dType: 'trainer',
    fabricType: 'leather',
    details: [
      'Hand-stitched sidewall Margom cupsole',
      'Supple unbleached calfskin interior lining',
      'Waxed organic cotton flat laces',
    ],
  },
  {
    id: 'acc-crossbody-bag',
    sku: 'VR-BG-701',
    name: 'Architectural Box Crossbody Bag',
    collection: 'atelier',
    collectionLabel: 'Accessories',
    line: 'unisex',
    category: 'bags',
    outfitSlot: 'accessory',
    price: 1120,
    shortDescription: 'Structured bridle-leather crossbody with a custom brushed gunmetal clasp and suede-lined interior.',
    materials: '100% Vegetable-Tanned Box Calfskin · Brushed Titanium Clasp',
    fit: 'Adjustable shoulder drop (42–56cm)',
    care: 'Store in dust bag away from direct heat',
    availability: 'Limited Run',
    colors: [
      { name: 'Obsidian', hex: '#121215', fabricType: 'leather' },
      { name: 'Warm Ivory', hex: '#EAE6DC', fabricType: 'leather' },
      { name: 'Burgundy', hex: '#5C1E26', fabricType: 'leather' },
    ],
    sizes: [
      { label: 'One Size', available: true },
    ],
    image: IMAGES.footwearAccessories,
    imageAlt: 'VÉRION structured black leather crossbody bag with gunmetal clasp on stone',
    imageFocus: 'center',
    model3dType: 'bag',
    fabricType: 'leather',
    details: [
      'Hand-painted five-coat edge sealing',
      'Machined brushed gunmetal push-lock closure',
      'Twin accordion interior compartments',
    ],
    featured: true,
  },
  {
    id: 'acc-titanium-eyewear',
    sku: 'VR-AC-801',
    name: 'No. 04 Titanium Frame Sunglasses',
    collection: 'formal',
    collectionLabel: 'Accessories',
    line: 'unisex',
    category: 'accessories',
    outfitSlot: 'accessory',
    price: 460,
    shortDescription: 'Featherweight Japanese beta-titanium oval frames fitted with anti-reflective smoke CR-39 lenses.',
    materials: '100% Japanese Beta-Titanium · Zeiss Category 3 Lenses',
    fit: 'Universal bridge (49-21-145)',
    care: 'Clean with microfiber cloth',
    availability: 'In Stock',
    colors: [
      { name: 'Brushed Silver', hex: '#A8A8AD', fabricType: 'metal' },
      { name: 'Matte Obsidian', hex: '#1E1F22', fabricType: 'metal' },
    ],
    sizes: [
      { label: 'One Size', available: true },
    ],
    image: IMAGES.footwearAccessories,
    imageAlt: 'VÉRION minimalist titanium sunglasses on travertine plinth',
    imageFocus: 'center',
    model3dType: 'eyewear',
    fabricType: 'metal',
    details: [
      '14g ultra-lightweight beta-titanium chassis',
      'Custom engraved temple tips',
      '100% UVA/UVB optical mineral-grade tint',
    ],
  },
];

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'stillness',
    number: '01',
    title: 'STILLNESS',
    subtitle: 'Minimalist Neutrals & Natural Daylight',
    setting: 'Limestone Gallery · Morning Light',
    collectionId: 'essentials',
    image: IMAGES.stillness,
    imageAlt: 'Campaign 01 Stillness — model in warm ivory cashmere coat and taupe wool trousers',
    palette: ['#F6F4EF', '#E5E2DA', '#8E8377', '#4A3528'],
    featuredProductIds: ['atl-ivory-overcoat', 'ess-merino-knit', 'ess-relaxed-trouser'],
  },
  {
    id: 'after-dark',
    number: '02',
    title: 'AFTER DARK',
    subtitle: 'Protective Membranes & Nocturnal Precision',
    setting: 'Monolithic Concrete Corridor · Night',
    collectionId: 'techwear',
    image: IMAGES.afterDark,
    imageAlt: 'Campaign 02 After Dark — model in matte black technical shell and utility vest',
    palette: ['#0F0F10', '#1A1A1D', '#535844', '#B4B1AA'],
    featuredProductIds: ['tch-membrane-parka', 'tch-utility-vest', 'tch-cargo-trouser'],
  },
  {
    id: 'raw-form',
    number: '03',
    title: 'RAW FORM',
    subtitle: 'Architectural Tailoring & Deconstructed Volume',
    setting: 'Brutalist Concrete Rotunda · Sculpted Shadow',
    collectionId: 'atelier',
    image: IMAGES.rawForm,
    imageAlt: 'Campaign 03 Raw Form — model in asymmetric charcoal jacket and wide pleated trousers',
    palette: ['#2A2B2F', '#F6F4EF', '#8E8377', '#0F0F10'],
    featuredProductIds: ['atl-asymmetric-blazer', 'atl-draped-tunic', 'atl-pleated-trouser'],
  },
  {
    id: 'new-perspective',
    number: '04',
    title: 'NEW PERSPECTIVE',
    subtitle: 'Kinetic Streetwear & Urban Stride',
    setting: 'Brutalist Courtyard · Overcast Daylight',
    collectionId: 'street',
    image: IMAGES.newPerspective,
    imageAlt: 'Campaign 04 New Perspective — two models walking in cropped canvas jacket, hoodies, and denim',
    palette: ['#D2C6B2', '#2E2F33', '#1E2D45', '#F6F4EF'],
    featuredProductIds: ['str-cropped-work-jacket', 'ess-loopback-hoodie', 'str-selvedge-denim'],
  },
];

export const RUNWAY_LOOKS: RunwayLook[] = [
  {
    id: 'look-01',
    lookNumber: 'LOOK 01',
    title: 'The Ivory Monolith',
    collectionId: 'atelier',
    collectionName: 'Atelier',
    modelDescription: 'Tailored warm ivory double-faced cashmere overcoat layered over fine stone merino knit and wide wool trousers.',
    silhouetteNote: 'Elongated vertical line with sweeping architectural lapels',
    image: IMAGES.heroAtelier,
    imageAlt: 'Look 01 — Ivory double-faced cashmere coat and obsidian suit in brutalist hall',
    archetype: 'coat',
    primaryColor: '#F3F0E8',
    secondaryColor: '#D8D2C5',
    fabricType: 'wool',
    productIds: ['atl-ivory-overcoat', 'ess-merino-knit', 'ess-relaxed-trouser'],
  },
  {
    id: 'look-02',
    lookNumber: 'LOOK 02',
    title: 'Nocturnal Shield',
    collectionId: 'techwear',
    collectionName: 'Techwear',
    modelDescription: 'Three-layer waterproof storm shell paired with modular Cordura chest harness and articulated ripstop cargo trousers.',
    silhouetteNote: 'Ergonomic utility layering with ultrasonic seam geometry',
    image: IMAGES.afterDark,
    imageAlt: 'Look 02 — Matte black 3L storm parka and modular utility vest',
    archetype: 'parka',
    primaryColor: '#121215',
    secondaryColor: '#535844',
    fabricType: 'tech',
    productIds: ['tch-membrane-parka', 'tch-utility-vest', 'tch-cargo-trouser'],
  },
  {
    id: 'look-03',
    lookNumber: 'LOOK 03',
    title: 'Asymmetric Tension',
    collectionId: 'atelier',
    collectionName: 'Atelier',
    modelDescription: 'Raw-seam charcoal architectural wool jacket worn over draped Swiss poplin tunic and twelve-pleat wide trousers.',
    silhouetteNote: 'Exaggerated shoulder geometry balanced by fluid lower volume',
    image: IMAGES.rawForm,
    imageAlt: 'Look 03 — Asymmetric charcoal wool blazer and knife-pleat trousers',
    archetype: 'blazer',
    primaryColor: '#2A2B2F',
    secondaryColor: '#F6F4EF',
    fabricType: 'wool',
    productIds: ['atl-asymmetric-blazer', 'atl-draped-tunic', 'atl-pleated-trouser'],
  },
  {
    id: 'look-04',
    lookNumber: 'LOOK 04',
    title: 'Midnight Tailoring',
    collectionId: 'formal',
    collectionName: 'Formal',
    modelDescription: 'Super 150s midnight-blue double-breasted blazer styled with extra-fine charcoal turtleneck and barathea trousers.',
    silhouetteNote: 'Sharp peak lapels with soft-draping Italian shoulder',
    image: IMAGES.formalTailoring,
    imageAlt: 'Look 04 — Midnight blue double-breasted tailored blazer and charcoal trousers',
    archetype: 'blazer',
    primaryColor: '#192338',
    secondaryColor: '#26272B',
    fabricType: 'wool',
    productIds: ['frm-midnight-blazer', 'ess-merino-knit', 'frm-barathea-trouser'],
  },
  {
    id: 'look-05',
    lookNumber: 'LOOK 05',
    title: 'Limestone Silence',
    collectionId: 'essentials',
    collectionName: 'Essentials',
    modelDescription: 'Minimalist warm ivory overcoat layered above neutral merino knitwear, fluid taupe wool trousers, and chocolate leather boots.',
    silhouetteNote: 'Pure tonal gradient from ivory to warm taupe',
    image: IMAGES.stillness,
    imageAlt: 'Look 05 — Warm ivory coat and stone merino turtleneck in limestone gallery',
    archetype: 'coat',
    primaryColor: '#E5E2DA',
    secondaryColor: '#8E8377',
    fabricType: 'wool',
    productIds: ['ess-merino-knit', 'ess-relaxed-trouser', 'acc-monolith-boot'],
  },
  {
    id: 'look-06',
    lookNumber: 'LOOK 06',
    title: 'Brutalist Stride',
    collectionId: 'street',
    collectionName: 'Street',
    modelDescription: 'Garment-dyed cropped canvas workwear jacket over 520gsm sand French terry hoodie and Okayama selvedge denim.',
    silhouetteNote: 'Boxy cropped upper proportion paired with straight indigo leg',
    image: IMAGES.newPerspective,
    imageAlt: 'Look 06 — Cropped canvas workwear jacket, sand hoodie, and selvedge denim',
    archetype: 'hoodie',
    primaryColor: '#D2C6B2',
    secondaryColor: '#1E2D45',
    fabricType: 'cotton',
    productIds: ['str-cropped-work-jacket', 'ess-loopback-hoodie', 'str-selvedge-denim'],
  },
];

export const FASHION_WORLD_STORIES: EditorialStory[] = [
  {
    id: 'material-science-twill',
    kicker: 'Material Research',
    title: 'Double-Faced Wool & Ultrasonic Membranes',
    excerpt: 'Inside our Milan and Zurich textile labs where traditional Biella virgin wool meets weather-sealed technical lamination.',
    archetype: 'parka',
    colorHex: '#1F362C',
    fabricType: 'tech',
    yaw: -0.62,
    zoom: 1.48,
    bgHex: '#DFDBD1',
    imageAlt: 'Macro 3D study of 3-layer forest green ripstop storm membrane and sealed seam construction',
    readTime: '4 min read',
    materialSpec: '680gsm Wool-Cashmere · 28k Waterproof Membrane',
  },
  {
    id: 'architecture-of-proportion',
    kicker: 'Design Essay',
    title: 'Proportion as Spatial Architecture',
    excerpt: 'How travertine colonnades, negative space, and shadow geometry inform VÉRION shoulder lines and trouser pleats.',
    archetype: 'blazer',
    colorHex: '#5C1E26',
    fabricType: 'wool',
    yaw: 0.82,
    zoom: 1.45,
    bgHex: '#E5E1D8',
    imageAlt: 'Macro 3D study of burgundy Barathea virgin wool peak lapel and tailored shoulder structure',
    readTime: '3 min read',
    materialSpec: 'Atelier Block Study · Autumn/Winter',
  },
  {
    id: 'objects-of-permanence',
    kicker: 'Craft & Hardware',
    title: 'Goodyear Welts & Brushed Beta-Titanium',
    excerpt: 'Examining the tactile weight of custom milled gunmetal clasps, Goodyear storm welts, and featherweight Japanese titanium.',
    archetype: 'bag',
    colorHex: '#4A3528',
    fabricType: 'leather',
    yaw: -0.48,
    zoom: 1.38,
    bgHex: '#E8E4DA',
    imageAlt: 'Macro 3D study of chocolate bridle calfskin bag and brushed gunmetal clasp hardware',
    readTime: '5 min read',
    materialSpec: 'Full-Grain Calfskin · Grade-5 Titanium',
  },
];
