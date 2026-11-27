export type NavSectionId =
  | 'discover'
  | 'collections'
  | 'womenswear'
  | 'menswear'
  | 'footwear'
  | 'accessories'
  | 'runway'
  | 'outfit-studio'
  | 'campaigns'
  | 'fashion-world'
  | 'about';

export interface NavItem {
  id: NavSectionId;
  label: string;
  targetElementId: string;
  description: string;
}

export const PRIMARY_TOP_NAV: NavItem[] = [
  {
    id: 'discover',
    label: 'Discover',
    targetElementId: 'hero',
    description: 'Architectural Flagship & Opening Campaign',
  },
  {
    id: 'collections',
    label: 'Collections',
    targetElementId: 'collections',
    description: 'Essentials, Atelier, Techwear, Street & Formal',
  },
  {
    id: 'runway',
    label: 'Runway',
    targetElementId: 'runway',
    description: 'Interactive 3D Architectural Colonnade Show',
  },
  {
    id: 'outfit-studio',
    label: 'Outfit Studio',
    targetElementId: 'outfit-studio',
    description: 'Interactive 3D Garment Styling Atelier',
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    targetElementId: 'campaigns',
    description: 'Stillness, After Dark, Raw Form & New Perspective',
  },
];

export const FULL_INDEX_NAV: NavItem[] = [
  {
    id: 'discover',
    label: 'Discover',
    targetElementId: 'hero',
    description: 'Form. Fabric. Future.',
  },
  {
    id: 'collections',
    label: 'Collections',
    targetElementId: 'collections',
    description: 'Full Seasonal & Permanent Archive',
  },
  {
    id: 'womenswear',
    label: 'Womenswear',
    targetElementId: 'collections',
    description: 'Dresses, Tailored Sets, Knitwear & Outerwear',
  },
  {
    id: 'menswear',
    label: 'Menswear',
    targetElementId: 'collections',
    description: 'Architectural Tailoring, Shirts & Outerwear',
  },
  {
    id: 'footwear',
    label: 'Footwear',
    targetElementId: 'footwear-accessories',
    description: 'Sculpted Leather Boots & Minimalist Trainers',
  },
  {
    id: 'accessories',
    label: 'Accessories',
    targetElementId: 'footwear-accessories',
    description: 'Structured Bags, Titanium Eyewear & Hardware',
  },
  {
    id: 'runway',
    label: 'Runway',
    targetElementId: 'runway',
    description: '3D Spatial Presentation & Lookbook',
  },
  {
    id: 'outfit-studio',
    label: 'Outfit Studio',
    targetElementId: 'outfit-studio',
    description: 'Live 3D Silhouette Pairing',
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    targetElementId: 'campaigns',
    description: 'Four Visual Chapters',
  },
  {
    id: 'fashion-world',
    label: 'Fashion World',
    targetElementId: 'fashion-world',
    description: 'Editorial Stories & Material Research',
  },
  {
    id: 'about',
    label: 'About',
    targetElementId: 'about',
    description: 'The House Philosophy & Craft',
  },
];
