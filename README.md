# VÉRION — Form. Fabric. Future.

Digital flagship store, interactive 3D garment atelier, architectural runway, and editorial universe for **VÉRION**, an original contemporary luxury fashion house.

## Features

- **Architectural Hero & Editorial Universe**: Full-bleed campaign photography paired with GSAP scroll-driven choreography and restrained luxury typography.
- **Interactive 3D Garment Atelier**: Genuine Three.js WebGL garment inspection with procedural PBR fabric weaves (wool twill, ripstop nylon, full-grain calfskin, French terry, brushed gunmetal), colorway switching, exploded construction layer separation, camera presets, and touch/mouse/keyboard orbit controls.
- **Signature 3D Architectural Runway**: Minimalist brutalist colonnade runway in Three.js pairing spatial catwalk silhouettes with editorial campaign photography, collection switching, keyboard navigation, and pause/resume controls.
- **Seven Coherent Collections + Footwear & Accessories**: Essentials, Atelier, Techwear, Street, Formal, Womenswear, and Menswear alongside sculpted footwear, leather bags, and hardware accessories.
- **Interactive Outfit Styling Studio**: Mix and match Outerwear, Tops, Trousers, Footwear, and Accessories in a live 3D ensemble stage with local look persistence (`localStorage`) and one-click add-to-bag.
- **Editorial Campaigns & Fashion World**: Four distinct visual campaigns (*Stillness*, *After Dark*, *Raw Form*, *New Perspective*), material archive, and brand philosophy.
- **Demonstration E-Commerce**: Multi-axis filtering, instant search, size availability validation, persistent wishlist, shopping bag drawer, and non-transactional demonstration checkout.

## Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **3D Rendering**: Three.js (`WebGLRenderer`, `RoomEnvironment`, `PMREMGenerator`, `OrbitControls`, `MeshPhysicalMaterial`, procedural `CanvasTexture`)
- **Motion**: GSAP + ScrollTrigger, Motion (`motion/react`)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

## Installation

```bash
npm install
```

## Development

Start the local development server on port 3000:

```bash
npm run dev
```

Type-check the codebase:

```bash
npm run lint
```

## Build

Create an optimized production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```text
├── index.html                  # HTML entry & Google Fonts (Cormorant Garamond, Plus Jakarta Sans, JetBrains Mono)
├── metadata.json               # Applet metadata
├── LICENSE                     # Code license & third-party asset exclusion notice
├── README.md                   # Project documentation
└── src/
    ├── assets/images/          # Compressed progressive editorial photography
    ├── data/
    │   ├── catalog.ts          # Collections, products, campaigns, runway looks, editorial stories
    │   └── navigation.ts       # Site navigation routes & brand metadata
    ├── three/
    │   ├── fabricTextures.ts   # Procedural PBR weave/grain CanvasTextures & materials
    │   ├── garmentModels.ts    # Multi-part sculpted 3D garment geometries & exploded layers
    │   ├── ThreeGarmentViewer.tsx  # Interactive 3D product & detail inspector
    │   ├── ThreeRunwayScene.tsx    # Architectural 3D runway environment
    │   └── ThreeOutfitStage.tsx    # Live 3D multi-garment outfit ensemble viewer
    ├── context/
    │   └── StoreContext.tsx    # Local persistence for bag, wishlist, saved outfits & UI state
    ├── components/
    │   ├── Navbar.tsx          # Minimal 3-zone top navigation & full-screen index menu
    │   ├── HeroSection.tsx     # Architectural opening campaign & scroll reveal
    │   ├── RunwaySection.tsx   # Interactive 3D runway & lookbook viewer
    │   ├── CatalogSection.tsx  # Filterable collection & category showcase
    │   ├── OutfitBuilder.tsx   # Interactive outfit styling studio
    │   ├── CampaignsSection.tsx# Editorial campaigns & Fashion World stories
    │   ├── AboutSection.tsx    # Brand philosophy & craftsmanship principles
    │   ├── ProductModal.tsx    # Full product detail experience with 3D/Photo toggle
    │   ├── BagDrawer.tsx       # Shopping bag, quantity steppers & demo checkout
    │   ├── WishlistDrawer.tsx  # Saved pieces drawer
    │   ├── SearchModal.tsx     # Instant catalog search
    │   ├── SafeImage.tsx       # Resilient image component with graceful fallback
    │   └── Footer.tsx          # Minimalist editorial footer
    ├── App.tsx                 # Main application shell & view routing
    └── index.css               # Tailwind v4 theme variables & editorial utilities
```

## Asset Attribution & Licensing

- All original source code, 3D procedural geometry generators, procedural fabric shaders/textures, and brand copy for the fictional **VÉRION** fashion house are licensed under the terms in `LICENSE`.
- All product specifications, SKU numbers, inventory availability, and pricing are demonstration data created solely for showcase purposes. No real payment processing or order fulfillment occurs.
- Editorial photography assets in `src/assets/images/` are locally bundled, compressed progressive JPEGs generated specifically for this demonstration project and are excluded from open-source redistribution of third-party likenesses or trademarks.
