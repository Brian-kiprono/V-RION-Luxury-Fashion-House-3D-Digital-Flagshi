import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { FabricMaterialType, Model3DArchetype } from '../data/catalog';
import { createContactShadowTexture } from './fabricTextures';
import { buildGarmentModel, disposeObject3D } from './garmentModels';

export interface StudioRenderRequest {
  key: string;
  archetype: Model3DArchetype;
  colorHex: string;
  secondaryHex?: string;
  fabricType: FabricMaterialType;
  yaw?: number;
  pitch?: number;
  zoom?: number;
  bgHex?: string;
}

const renderCache = new Map<string, string>();
const pendingCallbacks = new Map<string, Array<(dataUrl: string) => void>>();
const queue: StudioRenderRequest[] = [];
let processing = false;

interface SharedContext {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  envTex: THREE.Texture;
  shadowTex: THREE.Texture;
  plinth: THREE.Mesh;
  shadowPlane: THREE.Mesh;
  maxAniso: number;
}

let shared: SharedContext | null = null;
let contextUnavailable = false;

function getSharedContext(): SharedContext | null {
  if (contextUnavailable) return null;
  if (shared) return shared;

  try {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    const width = 420;
    const height = 540;
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#EAE6DC');

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 30);

    const hemi = new THREE.HemisphereLight('#f6f8fc', '#9d9588', 0.88);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight('#fff8ee', 2.25);
    keyLight.position.set(3.2, 4.4, 3.8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#c9d3e2', 1.1);
    rimLight.position.set(-3.0, 2.4, -3.0);
    scene.add(rimLight);

    const plinthGeo = new THREE.CylinderGeometry(0.85, 0.92, 0.12, 40);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: '#DCD7CC',
      roughness: 0.78,
      metalness: 0.04,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.set(0, -1.12, 0);
    scene.add(plinth);

    const shadowTex = createContactShadowTexture();
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.55, 1.55).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.45,
      }),
    );
    shadowPlane.position.set(0, -1.05, 0);
    scene.add(shadowPlane);

    const maxAniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    shared = {
      renderer,
      scene,
      camera,
      envTex,
      shadowTex,
      plinth,
      shadowPlane,
      maxAniso,
    };
    return shared;
  } catch {
    contextUnavailable = true;
    return null;
  }
}

function processQueue() {
  if (processing || queue.length === 0) return;
  processing = true;

  const step = () => {
    const req = queue.shift();
    if (!req) {
      processing = false;
      return;
    }

    if (renderCache.has(req.key)) {
      const cached = renderCache.get(req.key)!;
      pendingCallbacks.get(req.key)?.forEach((cb) => cb(cached));
      pendingCallbacks.delete(req.key);
      requestAnimationFrame(step);
      return;
    }

    const ctx = getSharedContext();
    if (!ctx) {
      pendingCallbacks.delete(req.key);
      processing = false;
      return;
    }

    const { renderer, scene, camera, maxAniso } = ctx;
    scene.background = new THREE.Color(req.bgHex || '#EAE6DC');

    const model = buildGarmentModel({
      archetype: req.archetype,
      colorHex: req.colorHex,
      secondaryHex: req.secondaryHex,
      fabricType: req.fabricType,
      maxAnisotropy: maxAniso,
    });

    // Frame camera around bounding box cleanly
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    const yaw = req.yaw ?? 0.52;
    const pitch = req.pitch ?? 0.14;
    const maxDim = Math.max(size.x, size.y * 1.05, size.z, 0.7);
    const dist = (maxDim * 2.15) / (req.zoom ?? 1);

    camera.position.set(
      center.x + Math.sin(yaw) * Math.cos(pitch) * dist,
      center.y + Math.sin(pitch) * dist + 0.04,
      center.z + Math.cos(yaw) * Math.cos(pitch) * dist,
    );
    camera.lookAt(center.x, center.y - 0.04, center.z);

    // Align plinth beneath garment bottom
    ctx.plinth.position.y = box.min.y - 0.16;
    ctx.shadowPlane.position.y = box.min.y - 0.09;

    scene.add(model);
    renderer.render(scene, camera);
    const dataUrl = renderer.domElement.toDataURL('image/webp', 0.9);
    scene.remove(model);
    disposeObject3D(model);

    renderCache.set(req.key, dataUrl);
    pendingCallbacks.get(req.key)?.forEach((cb) => cb(dataUrl));
    pendingCallbacks.delete(req.key);

    if (queue.length > 0) {
      requestAnimationFrame(step);
    } else {
      processing = false;
    }
  };

  requestAnimationFrame(step);
}

export function requestStudioRender(
  req: StudioRenderRequest,
  onReady: (dataUrl: string) => void,
) {
  const existing = renderCache.get(req.key);
  if (existing) {
    onReady(existing);
    return;
  }

  const list = pendingCallbacks.get(req.key);
  if (list) {
    list.push(onReady);
    return;
  }

  pendingCallbacks.set(req.key, [onReady]);
  queue.push(req);
  processQueue();
}

export function getCachedStudioRender(key: string): string | undefined {
  return renderCache.get(key);
}
