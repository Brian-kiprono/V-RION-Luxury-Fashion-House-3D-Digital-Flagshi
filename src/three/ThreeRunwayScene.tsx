import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { RunwayLook } from '../data/catalog';
import { createContactShadowTexture, createTravertineTexture } from './fabricTextures';
import { buildGarmentModel, disposeObject3D } from './garmentModels';

export type RunwayCameraAngle = 'catwalk' | 'balcony' | 'tracking';

interface ThreeRunwaySceneProps {
  looks: RunwayLook[];
  activeIndex: number;
  isPlaying: boolean;
  cameraAngle: RunwayCameraAngle;
  className?: string;
}

const CAMERA_TARGETS: Record<RunwayCameraAngle, { pos: [number, number, number]; look: [number, number, number] }> = {
  catwalk: { pos: [0, 1.35, 6.2], look: [0, 0.9, -2.5] },
  balcony: { pos: [5.4, 3.6, 5.8], look: [0, 0.7, -3.5] },
  tracking: { pos: [-2.6, 1.25, 3.2], look: [0, 0.95, 0] },
};

const _camGoal = new THREE.Vector3();
const _lookGoal = new THREE.Vector3();

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

export const ThreeRunwayScene: React.FC<ThreeRunwaySceneProps> = ({
  looks,
  activeIndex,
  isPlaying,
  cameraAngle,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);

  const stateRef = useRef({
    activeIndex,
    isPlaying,
    cameraAngle,
    camTransition: false,
    stageRotation: 0,
  });

  const sceneRefs = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    lookPedestals: THREE.Group[];
    spotTarget?: THREE.Object3D;
    maxAniso: number;
  }>({ lookPedestals: [], maxAniso: 4 });

  useEffect(() => {
    stateRef.current.activeIndex = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    stateRef.current.isPlaying = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    stateRef.current.cameraAngle = cameraAngle;
    const cfg = CAMERA_TARGETS[cameraAngle];
    _camGoal.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
    _lookGoal.set(cfg.look[0], cfg.look[1], cfg.look[2]);
    stateRef.current.camTransition = true;
  }, [cameraAngle]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    const w = Math.max(container.clientWidth, 320);
    const h = Math.max(container.clientHeight, 320);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
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
    const bgHex = '#111113';
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.045);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 80);
    camera.position.set(0, 1.35, 6.2);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0.9, -2.5);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 2.6;
    controls.maxDistance = 12;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.minPolarAngle = Math.PI * 0.14;

    const onControlStart = () => {
      stateRef.current.camTransition = false;
    };
    controls.addEventListener('start', onControlStart);

    // Architectural Runway Lighting
    const hemi = new THREE.HemisphereLight('#d6dde8', '#23201c', 0.55);
    scene.add(hemi);

    const keySpot = new THREE.SpotLight('#fff6e8', 38, 30, Math.PI / 5, 0.55, 1.5);
    keySpot.position.set(0, 7.5, 4.0);
    keySpot.castShadow = !isSoftwareGl;
    keySpot.shadow.mapSize.set(1024, 1024);
    keySpot.shadow.bias = -0.0004;
    scene.add(keySpot);
    scene.add(keySpot.target);

    const backRim = new THREE.DirectionalLight('#b4c4dc', 1.15);
    backRim.position.set(-4, 5, -14);
    scene.add(backRim);

    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const travertineTex = createTravertineTexture(maxAniso);

    // Runway Floor & Elevated Catwalk
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#1b1b1e',
      roughness: 0.72,
      metalness: 0.08,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const catwalkMat = new THREE.MeshStandardMaterial({
      map: travertineTex,
      color: '#cfc9bc',
      roughness: 0.58,
      metalness: 0.05,
    });
    const catwalk = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.16, 28), catwalkMat);
    catwalk.position.set(0, 0.08, -7);
    catwalk.receiveShadow = true;
    scene.add(catwalk);

    // Recessed Runway Edge Light Strips (Instanced-like crisp bars)
    const stripGeo = new THREE.BoxGeometry(0.04, 0.02, 27.6);
    const stripMat = new THREE.MeshBasicMaterial({ color: '#ece7db' });
    for (const side of [-1, 1]) {
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(side * 1.56, 0.165, -7);
      scene.add(strip);
    }

    // Brutalist Concrete Colonnade Pillars (InstancedMesh > 10 objects)
    const pillarGeo = new THREE.BoxGeometry(0.75, 8.5, 0.75);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: '#2b2b2f',
      roughness: 0.88,
      metalness: 0.04,
    });
    const pillarCount = 14;
    const pillars = new THREE.InstancedMesh(pillarGeo, pillarMat, pillarCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < pillarCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const zPos = 3.5 - Math.floor(i / 2) * 3.8;
      dummy.position.set(side * 4.2, 4.25, zPos);
      dummy.updateMatrix();
      pillars.setMatrixAt(i, dummy.matrix);
    }
    pillars.instanceMatrix.needsUpdate = true;
    pillars.computeBoundingSphere();
    scene.add(pillars);

    // Overhead Architectural Beams
    const beamGeo = new THREE.BoxGeometry(9.2, 0.42, 0.55);
    const beams = new THREE.InstancedMesh(beamGeo, pillarMat, 7);
    for (let i = 0; i < 7; i++) {
      dummy.position.set(0, 7.6, 3.5 - i * 3.8);
      dummy.updateMatrix();
      beams.setMatrixAt(i, dummy.matrix);
    }
    beams.instanceMatrix.needsUpdate = true;
    beams.computeBoundingSphere();
    scene.add(beams);

    // Build 3D Garment Sculptures along the Runway
    const shadowTex = createContactShadowTexture();
    const lookPedestals: THREE.Group[] = [];
    const pedGeo = new THREE.CylinderGeometry(0.68, 0.72, 0.1, 36);
    const pedMat = new THREE.MeshStandardMaterial({ color: '#27272a', roughness: 0.5 });

    looks.forEach((look, idx) => {
      const holder = new THREE.Group();
      const garment = buildGarmentModel({
        archetype: look.archetype,
        colorHex: look.primaryColor,
        secondaryHex: look.secondaryColor,
        fabricType: look.fabricType,
        maxAnisotropy: maxAniso,
      });
      garment.position.y = 1.25;
      holder.add(garment);

      const ped = new THREE.Mesh(pedGeo, pedMat);
      ped.position.y = 0.21;
      ped.receiveShadow = true;
      holder.add(ped);

      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 1.4).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.6 }),
      );
      shadow.position.y = 0.27;
      holder.add(shadow);

      holder.position.set(0, 0, -idx * 3.8);
      scene.add(holder);
      lookPedestals.push(holder);
    });

    sceneRefs.current = {
      scene,
      camera,
      controls,
      lookPedestals,
      spotTarget: keySpot.target,
      maxAniso,
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();

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
        if (st === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick(now = performance.now()) {
      if (disposed) return;
      const delta = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const activeIdx = stateRef.current.activeIndex;
      const total = lookPedestals.length;

      // Position active look at foreground stage z = 1.6, others staggered back smoothly
      for (let i = 0; i < total; i++) {
        const rel = (i - activeIdx + total) % total;
        const targetZ = rel === 0 ? 1.6 : -rel * 3.6;
        const targetX = rel === 0 ? 0 : (rel % 2 === 0 ? -0.95 : 0.95);
        const targetScale = rel === 0 ? 1.08 : 0.86;
        const holder = lookPedestals[i];

        holder.position.z = THREE.MathUtils.damp(holder.position.z, targetZ, 4.5, delta);
        holder.position.x = THREE.MathUtils.damp(holder.position.x, targetX, 4.5, delta);
        const s = THREE.MathUtils.damp(holder.scale.x, targetScale, 4.5, delta);
        holder.scale.setScalar(s);

        if (rel === 0 && stateRef.current.isPlaying && !reducedMotion) {
          holder.children[0].rotation.y += delta * 0.45;
        }
      }

      if (stateRef.current.camTransition) {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _camGoal.x, 4, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _camGoal.y, 4, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _camGoal.z, 4, delta);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, _lookGoal.x, 4, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _lookGoal.y, 4, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _lookGoal.z, 4, delta);

        if (camera.position.distanceTo(_camGoal) < 0.02) {
          stateRef.current.camTransition = false;
        }
      }

      keySpot.target.position.set(0, 1.2, 1.6);
      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(() => tick());
      else frameId = requestAnimationFrame(tick);
    }

    tick();

    const resizeObserver = new ResizeObserver(() => {
      if (!container || disposed) return;
      const cw = Math.max(container.clientWidth, 300);
      const ch = Math.max(container.clientHeight, 300);
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
    });
    resizeObserver.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', onControlStart);
      controls.dispose();
      canvas.removeEventListener('webglcontextlost', onLost);

      lookPedestals.forEach((p) => disposeObject3D(p));
      floorMat.dispose();
      catwalkMat.dispose();
      travertineTex.dispose();
      stripGeo.dispose();
      stripMat.dispose();
      pillarGeo.dispose();
      pillarMat.dispose();
      beamGeo.dispose();
      pedGeo.dispose();
      pedMat.dispose();
      shadowTex.dispose();
      envTex.dispose();
      renderer.dispose();
    };
  }, [looks]);

  if (webglError) {
    return (
      <div className={`flex items-center justify-center bg-[#111113] text-[#F6F4EF] p-8 ${className}`}>
        <p className="text-sm text-[#B4B1AA]">
          3D Runway stage requires WebGL. Use the editorial lookbook panel to inspect looks.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#111113] ${className}`}>
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
