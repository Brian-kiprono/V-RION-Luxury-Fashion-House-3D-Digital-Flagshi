import * as THREE from 'three';
import type { FabricMaterialType } from '../data/catalog';

interface FabricTextureBundle {
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  dispose: () => void;
}

const textureCache = new Map<FabricMaterialType, FabricTextureBundle>();

function createCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not acquire 2D canvas context for procedural fabric texture');
  }
  return [canvas, ctx];
}

function generateWoolMaps(maxAnisotropy: number): FabricTextureBundle {
  const size = 256;
  const [bumpCanvas, bCtx] = createCanvas(size);
  const [roughCanvas, rCtx] = createCanvas(size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);
  rCtx.fillStyle = '#d4d4d4';
  rCtx.fillRect(0, 0, size, size);

  // Diagonal wool twill weave
  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const diag = ((x + y) % 8) / 8;
      const noise = ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1 + 1) % 1;
      const lum = Math.floor(110 + diag * 45 + noise * 18);
      bCtx.fillStyle = `rgb(${lum},${lum},${lum})`;
      bCtx.fillRect(x, y, 2, 2);

      const rLum = Math.floor(195 + diag * 30 + noise * 20);
      rCtx.fillStyle = `rgb(${rLum},${rLum},${rLum})`;
      rCtx.fillRect(x, y, 2, 2);
    }
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(6, 6);
  bumpMap.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(6, 6);
  roughnessMap.anisotropy = maxAnisotropy;

  return {
    bumpMap,
    roughnessMap,
    dispose: () => {
      bumpMap.dispose();
      roughnessMap.dispose();
    },
  };
}

function generateTechRipstopMaps(maxAnisotropy: number): FabricTextureBundle {
  const size = 256;
  const [bumpCanvas, bCtx] = createCanvas(size);
  const [roughCanvas, rCtx] = createCanvas(size);

  bCtx.fillStyle = '#787878';
  bCtx.fillRect(0, 0, size, size);
  rCtx.fillStyle = '#686868';
  rCtx.fillRect(0, 0, size, size);

  // Ripstop micro-grid
  const step = 16;
  bCtx.strokeStyle = '#a8a8a8';
  bCtx.lineWidth = 2;
  rCtx.strokeStyle = '#484848';
  rCtx.lineWidth = 2;

  for (let i = 0; i <= size; i += step) {
    bCtx.beginPath();
    bCtx.moveTo(i, 0);
    bCtx.lineTo(i, size);
    bCtx.moveTo(0, i);
    bCtx.lineTo(size, i);
    bCtx.stroke();

    rCtx.beginPath();
    rCtx.moveTo(i, 0);
    rCtx.lineTo(i, size);
    rCtx.moveTo(0, i);
    rCtx.lineTo(size, i);
    rCtx.stroke();
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(10, 10);
  bumpMap.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(10, 10);
  roughnessMap.anisotropy = maxAnisotropy;

  return {
    bumpMap,
    roughnessMap,
    dispose: () => {
      bumpMap.dispose();
      roughnessMap.dispose();
    },
  };
}

function generateLeatherMaps(maxAnisotropy: number): FabricTextureBundle {
  const size = 256;
  const [bumpCanvas, bCtx] = createCanvas(size);
  const [roughCanvas, rCtx] = createCanvas(size);

  bCtx.fillStyle = '#707070';
  bCtx.fillRect(0, 0, size, size);
  rCtx.fillStyle = '#7c7c7c';
  rCtx.fillRect(0, 0, size, size);

  // Pebbled calfskin grain
  for (let i = 0; i < 1600; i++) {
    const px = ((Math.sin(i * 19.17) * 43758.5) % 1 + 1) % 1 * size;
    const py = ((Math.cos(i * 47.53) * 29384.1) % 1 + 1) % 1 * size;
    const rad = 1.5 + (i % 3);
    const val = 135 + (i % 55);
    bCtx.fillStyle = `rgba(${val},${val},${val},0.45)`;
    bCtx.beginPath();
    bCtx.arc(px, py, rad, 0, Math.PI * 2);
    bCtx.fill();

    const rVal = 85 + (i % 45);
    rCtx.fillStyle = `rgba(${rVal},${rVal},${rVal},0.4)`;
    rCtx.beginPath();
    rCtx.arc(px, py, rad, 0, Math.PI * 2);
    rCtx.fill();
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(5, 5);
  bumpMap.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(5, 5);
  roughnessMap.anisotropy = maxAnisotropy;

  return {
    bumpMap,
    roughnessMap,
    dispose: () => {
      bumpMap.dispose();
      roughnessMap.dispose();
    },
  };
}

function generateCottonMaps(maxAnisotropy: number): FabricTextureBundle {
  const size = 256;
  const [bumpCanvas, bCtx] = createCanvas(size);
  const [roughCanvas, rCtx] = createCanvas(size);

  bCtx.fillStyle = '#828282';
  bCtx.fillRect(0, 0, size, size);
  rCtx.fillStyle = '#e5e5e5';
  rCtx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 3) {
    for (let x = 0; x < size; x += 2) {
      const rib = (x % 4 === 0) ? 18 : -12;
      const lum = Math.min(255, Math.max(0, 128 + rib + ((y % 6) * 3)));
      bCtx.fillStyle = `rgb(${lum},${lum},${lum})`;
      bCtx.fillRect(x, y, 2, 3);
    }
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(8, 8);
  bumpMap.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(8, 8);
  roughnessMap.anisotropy = maxAnisotropy;

  return {
    bumpMap,
    roughnessMap,
    dispose: () => {
      bumpMap.dispose();
      roughnessMap.dispose();
    },
  };
}

function generateMetalMaps(maxAnisotropy: number): FabricTextureBundle {
  const size = 256;
  const [bumpCanvas, bCtx] = createCanvas(size);
  const [roughCanvas, rCtx] = createCanvas(size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);
  rCtx.fillStyle = '#404040';
  rCtx.fillRect(0, 0, size, size);

  // Fine brushed directional grain
  for (let y = 0; y < size; y++) {
    const shade = 115 + Math.floor(((Math.sin(y * 31.7) * 43758.5) % 1 + 1) % 1 * 25);
    bCtx.fillStyle = `rgb(${shade},${shade},${shade})`;
    bCtx.fillRect(0, y, size, 1);

    const rShade = 45 + Math.floor(((Math.cos(y * 17.3) * 19384.5) % 1 + 1) % 1 * 35);
    rCtx.fillStyle = `rgb(${rShade},${rShade},${rShade})`;
    rCtx.fillRect(0, y, size, 1);
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(4, 4);
  bumpMap.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(4, 4);
  roughnessMap.anisotropy = maxAnisotropy;

  return {
    bumpMap,
    roughnessMap,
    dispose: () => {
      bumpMap.dispose();
      roughnessMap.dispose();
    },
  };
}

export function getFabricMaps(type: FabricMaterialType, maxAnisotropy = 4): FabricTextureBundle {
  const existing = textureCache.get(type);
  if (existing) return existing;

  let bundle: FabricTextureBundle;
  switch (type) {
    case 'wool':
      bundle = generateWoolMaps(maxAnisotropy);
      break;
    case 'tech':
      bundle = generateTechRipstopMaps(maxAnisotropy);
      break;
    case 'leather':
      bundle = generateLeatherMaps(maxAnisotropy);
      break;
    case 'metal':
      bundle = generateMetalMaps(maxAnisotropy);
      break;
    case 'cotton':
    default:
      bundle = generateCottonMaps(maxAnisotropy);
      break;
  }
  textureCache.set(type, bundle);
  return bundle;
}

export function createGarmentMaterial(
  colorHex: string,
  fabricType: FabricMaterialType,
  maxAnisotropy = 4,
): THREE.MeshPhysicalMaterial {
  const maps = getFabricMaps(fabricType, maxAnisotropy);
  const baseColor = new THREE.Color(colorHex);

  switch (fabricType) {
    case 'wool':
      return new THREE.MeshPhysicalMaterial({
        color: baseColor,
        roughness: 0.85,
        metalness: 0.02,
        sheen: 0.78,
        sheenRoughness: 0.65,
        sheenColor: baseColor.clone().lerp(new THREE.Color('#ffffff'), 0.25),
        bumpMap: maps.bumpMap,
        bumpScale: 0.008,
        roughnessMap: maps.roughnessMap,
        side: THREE.DoubleSide,
      });
    case 'tech':
      return new THREE.MeshPhysicalMaterial({
        color: baseColor,
        roughness: 0.42,
        metalness: 0.14,
        clearcoat: 0.22,
        clearcoatRoughness: 0.4,
        bumpMap: maps.bumpMap,
        bumpScale: 0.007,
        roughnessMap: maps.roughnessMap,
        side: THREE.DoubleSide,
      });
    case 'leather':
      return new THREE.MeshPhysicalMaterial({
        color: baseColor,
        roughness: 0.46,
        metalness: 0.06,
        clearcoat: 0.28,
        clearcoatRoughness: 0.36,
        bumpMap: maps.bumpMap,
        bumpScale: 0.009,
        roughnessMap: maps.roughnessMap,
        side: THREE.DoubleSide,
      });
    case 'metal':
      return new THREE.MeshPhysicalMaterial({
        color: baseColor,
        roughness: 0.22,
        metalness: 0.92,
        anisotropy: 0.8,
        bumpMap: maps.bumpMap,
        bumpScale: 0.004,
        roughnessMap: maps.roughnessMap,
      });
    case 'cotton':
    default:
      return new THREE.MeshPhysicalMaterial({
        color: baseColor,
        roughness: 0.92,
        metalness: 0.0,
        sheen: 0.45,
        sheenRoughness: 0.85,
        sheenColor: baseColor.clone().lerp(new THREE.Color('#ffffff'), 0.18),
        bumpMap: maps.bumpMap,
        bumpScale: 0.006,
        roughnessMap: maps.roughnessMap,
        side: THREE.DoubleSide,
      });
  }
}

export function createHardwareMaterial(colorHex = '#8a8d94'): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    metalness: 0.94,
    roughness: 0.2,
    anisotropy: 0.8,
  });
}

export function createTravertineTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const size = 512;
  const [canvas, ctx] = createCanvas(size);

  ctx.fillStyle = '#ddd7cb';
  ctx.fillRect(0, 0, size, size);

  // Subtle horizontal travertine veining
  for (let y = 0; y < size; y += 2) {
    const vein = Math.sin(y * 0.09) * 8 + Math.cos(y * 0.23) * 5;
    const tone = Math.min(240, Math.max(195, Math.floor(220 + vein)));
    ctx.fillStyle = `rgb(${tone},${tone - 5},${tone - 13})`;
    ctx.fillRect(0, y, size, 2);
  }

  // Natural travertine pores
  for (let i = 0; i < 400; i++) {
    const px = ((Math.sin(i * 12.7) * 43758.5) % 1 + 1) % 1 * size;
    const py = ((Math.cos(i * 29.1) * 19384.2) % 1 + 1) % 1 * size;
    const w = 3 + (i % 12);
    ctx.fillStyle = 'rgba(130, 122, 109, 0.18)';
    ctx.fillRect(px, py, w, 1.5);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const [canvas, ctx] = createCanvas(size);
  const grad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(12, 12, 14, 0.45)');
  grad.addColorStop(0.55, 'rgba(12, 12, 14, 0.16)');
  grad.addColorStop(1, 'rgba(12, 12, 14, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
