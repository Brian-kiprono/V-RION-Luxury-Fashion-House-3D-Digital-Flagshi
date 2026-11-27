import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { Product } from '../data/catalog';
import { createContactShadowTexture } from './fabricTextures';
import { buildGarmentModel, disposeObject3D } from './garmentModels';

interface ThreeOutfitStageProps {
  outerwear: Product | null;
  top: Product | null;
  trousers: Product | null;
  footwear: Product | null;
  accessory: Product | null;
  colorOverrides: Record<string, string | undefined>;
  className?: string;
}

function detectSoftwareGl(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export const ThreeOutfitStage: React.FC<ThreeOutfitStageProps> = ({
  outerwear,
  top,
  trousers,
  footwear,
  accessory,
  colorOverrides,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);

  const refs = useRef<{
    scene?: THREE.Scene;
    ensembleGroup?: THREE.Group;
    requestRender?: () => void;
    maxAniso: number;
  }>({ maxAniso: 4 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !isSoftwareGl, powerPreference: 'high-performance' });
    } catch {
      setWebglError(true);
      return;
    }

    const w = Math.max(container.clientWidth, 300);
    const h = Math.max(container.clientHeight, 320);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(canvas);

    const onLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    canvas.addEventListener('webglcontextlost', onLost);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#EAE6DC');

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 40);
    camera.position.set(1.5, 0.55, 3.85);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, -0.05, 0);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.0;
    controls.maxDistance = 6.2;
    controls.minPolarAngle = Math.PI * 0.2;
    controls.maxPolarAngle = Math.PI * 0.58;

    const hemi = new THREE.HemisphereLight('#f6f8fb', '#9f988c', 0.85);
    scene.add(hemi);

    const key = new THREE.DirectionalLight('#fff8ed', 2.2);
    key.position.set(3.5, 5, 4);
    key.castShadow = !isSoftwareGl;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0005;
    scene.add(key);

    const rim = new THREE.DirectionalLight('#cbd5e1', 1.0);
    rim.position.set(-3, 3, -3);
    scene.add(rim);

    // Studio Plinth
    const plinthGeo = new THREE.CylinderGeometry(1.15, 1.22, 0.14, 48);
    const plinthMat = new THREE.MeshStandardMaterial({ color: '#D7D2C6', roughness: 0.78 });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -1.42;
    plinth.receiveShadow = true;
    scene.add(plinth);

    const shadowTex = createContactShadowTexture();
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 2.1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.48 }),
    );
    shadowPlane.position.y = -1.34;
    scene.add(shadowPlane);

    const ensembleGroup = new THREE.Group();
    scene.add(ensembleGroup);

    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    refs.current = { scene, ensembleGroup, maxAniso };

    if (!isSoftwareGl) renderer.compile(scene, camera);

    let frameId = 0;
    let disposed = false;
    let busy = false;
    let dirty = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const poll = () => {
        if (disposed) {
          gl.deleteSync(sync);
          return;
        }
        const st = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (st === gl.UNSIGNALED) frameId = window.setTimeout(poll, 5);
        else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (disposed) return;
      if (busy) {
        dirty = true;
        return;
      }
      busy = true;
      frameId = requestAnimationFrame(() => {
        if (disposed) return;
        dirty = false;
        controls.update();
        renderer.render(scene, camera);
        const done = () => {
          busy = false;
          if (dirty && !disposed) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    refs.current.requestRender = requestRender;
    controls.addEventListener('change', requestRender);

    const ro = new ResizeObserver(() => {
      if (!container || disposed) return;
      const cw = Math.max(container.clientWidth, 260);
      const ch = Math.max(container.clientHeight, 260);
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
      requestRender();
    });
    ro.observe(container);

    requestRender();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      ro.disconnect();
      controls.removeEventListener('change', requestRender);
      controls.dispose();
      canvas.removeEventListener('webglcontextlost', onLost);
      disposeObject3D(ensembleGroup);
      plinthGeo.dispose();
      plinthMat.dispose();
      shadowTex.dispose();
      envTex.dispose();
      renderer.dispose();
    };
  }, []);

  // Rebuild coordinated 3D outfit composition whenever selection or color changes
  useEffect(() => {
    const { ensembleGroup, maxAniso, requestRender } = refs.current;
    if (!ensembleGroup) return;

    while (ensembleGroup.children.length > 0) {
      const child = ensembleGroup.children[0];
      ensembleGroup.remove(child);
      disposeObject3D(child);
    }

    if (trousers) {
      const col = colorOverrides.trousers || trousers.colors[0].hex;
      const tMesh = buildGarmentModel({
        archetype: 'trousers',
        colorHex: col,
        fabricType: trousers.fabricType,
        maxAnisotropy: maxAniso,
      });
      tMesh.position.set(0, -0.35, 0);
      tMesh.scale.setScalar(0.95);
      ensembleGroup.add(tMesh);
    }

    if (top) {
      const col = colorOverrides.top || top.colors[0].hex;
      const topMesh = buildGarmentModel({
        archetype: top.model3dType,
        colorHex: col,
        fabricType: top.fabricType,
        maxAnisotropy: maxAniso,
      });
      topMesh.position.set(0, 0.36, 0);
      topMesh.scale.setScalar(outerwear ? 0.92 : 1.0);
      ensembleGroup.add(topMesh);
    }

    if (outerwear) {
      const col = colorOverrides.outerwear || outerwear.colors[0].hex;
      const outMesh = buildGarmentModel({
        archetype: outerwear.model3dType,
        colorHex: col,
        fabricType: outerwear.fabricType,
        maxAnisotropy: maxAniso,
      });
      outMesh.position.set(0, 0.38, 0.02);
      outMesh.scale.setScalar(1.03);
      ensembleGroup.add(outMesh);
    }

    if (footwear) {
      const col = colorOverrides.footwear || footwear.colors[0].hex;
      for (const side of [-1, 1]) {
        const shoe = buildGarmentModel({
          archetype: footwear.model3dType,
          colorHex: col,
          fabricType: footwear.fabricType,
          maxAnisotropy: maxAniso,
        });
        shoe.scale.setScalar(0.42);
        shoe.position.set(side * 0.19, -1.17, 0.05);
        shoe.rotation.y = Math.PI / 2 - side * 0.14;
        ensembleGroup.add(shoe);
      }
    }

    if (accessory) {
      const col = colorOverrides.accessory || accessory.colors[0].hex;
      const acc = buildGarmentModel({
        archetype: accessory.model3dType,
        colorHex: col,
        fabricType: accessory.fabricType,
        maxAnisotropy: maxAniso,
      });
      if (accessory.model3dType === 'eyewear') {
        acc.scale.setScalar(0.32);
        acc.position.set(0, 1.15, 0.05);
      } else {
        acc.scale.setScalar(0.45);
        acc.position.set(0.62, -0.15, 0.12);
        acc.rotation.y = -0.35;
      }
      ensembleGroup.add(acc);
    }

    requestRender?.();
  }, [outerwear, top, trousers, footwear, accessory, colorOverrides]);

  if (webglError) {
    return (
      <div className={`flex items-center justify-center bg-[#EAE6DC] p-6 text-center ${className}`}>
        <p className="text-xs text-[#78756E]">3D Ensemble Stage unavailable without WebGL.</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#EAE6DC] ${className}`}>
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="pointer-events-none absolute top-4 left-4 text-[11px] tracking-[0.16em] uppercase text-[#0F0F10]/70 bg-[#F6F4EF]/90 px-3 py-1.5 border border-[#0F0F10]/10">
        Live 3D Silhouette · Drag to Orbit
      </div>
    </div>
  );
};
