import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp, RotateCcw, Layers, Sun } from 'lucide-react';
import type { FabricMaterialType, Model3DArchetype } from '../data/catalog';
import { createContactShadowTexture } from './fabricTextures';
import { applyGarmentExplosion, buildGarmentModel, disposeObject3D } from './garmentModels';

export type CameraPreset = 'front' | 'quarter' | 'side' | 'back' | 'detail';
export type LightingPreset = 'gallery' | 'runway' | 'studio';

interface ThreeGarmentViewerProps {
  archetype: Model3DArchetype;
  colorHex: string;
  secondaryHex?: string;
  fabricType: FabricMaterialType;
  label?: string;
  compact?: boolean;
  className?: string;
}

const CAMERA_PRESETS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  front: { pos: [0, 0.15, 2.7], target: [0, -0.05, 0] },
  quarter: { pos: [1.85, 0.35, 2.05], target: [0, -0.05, 0] },
  side: { pos: [2.65, 0.15, 0.05], target: [0, -0.05, 0] },
  back: { pos: [0, 0.15, -2.7], target: [0, -0.05, 0] },
  detail: { pos: [0.55, 0.38, 1.35], target: [0, 0.2, 0.1] },
};

const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();

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

export const ThreeGarmentViewer: React.FC<ThreeGarmentViewerProps> = ({
  archetype,
  colorHex,
  secondaryHex,
  fabricType,
  label,
  compact = false,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('quarter');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('gallery');
  const [autoRotate, setAutoRotate] = useState(true);
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const stateRef = useRef({
    explodeTarget: 0,
    explodeCurrent: 0,
    autoRotate: true,
    cameraTransitionActive: false,
    lightingPreset: 'gallery' as LightingPreset,
  });

  const sceneRefs = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    renderer?: THREE.WebGLRenderer;
    garmentGroup?: THREE.Group;
    keyLight?: THREE.DirectionalLight;
    rimLight?: THREE.DirectionalLight;
    hemiLight?: THREE.HemisphereLight;
    requestRender?: () => void;
    maxAniso: number;
  }>({ maxAniso: 4 });

  // Sync interactive controls into ref without tearing down WebGL context
  useEffect(() => {
    stateRef.current.explodeTarget = explodeFactor;
    sceneRefs.current.requestRender?.();
  }, [explodeFactor]);

  useEffect(() => {
    stateRef.current.autoRotate = autoRotate;
    if (sceneRefs.current.controls) {
      sceneRefs.current.controls.autoRotate = autoRotate && !detectSoftwareGl();
    }
    sceneRefs.current.requestRender?.();
  }, [autoRotate]);

  useEffect(() => {
    stateRef.current.lightingPreset = lightingPreset;
    const { scene, keyLight, rimLight, hemiLight, requestRender } = sceneRefs.current;
    if (!scene || !keyLight || !rimLight || !hemiLight) return;

    if (lightingPreset === 'runway') {
      scene.background = new THREE.Color('#141416');
      keyLight.intensity = 2.6;
      keyLight.color.set('#fff5e6');
      rimLight.intensity = 1.6;
      rimLight.color.set('#b8c6db');
      hemiLight.intensity = 0.55;
    } else if (lightingPreset === 'studio') {
      scene.background = new THREE.Color('#E9E5DC');
      keyLight.intensity = 1.9;
      keyLight.color.set('#ffffff');
      rimLight.intensity = 0.9;
      rimLight.color.set('#e6ebf2');
      hemiLight.intensity = 0.9;
    } else {
      scene.background = new THREE.Color('#EFECE4');
      keyLight.intensity = 2.15;
      keyLight.color.set('#fff8ee');
      rimLight.intensity = 1.05;
      rimLight.color.set('#cbd4e1');
      hemiLight.intensity = 0.78;
    }
    requestRender?.();
  }, [lightingPreset]);

  const applyCameraPreset = (preset: CameraPreset) => {
    setCameraPreset(preset);
    const def = CAMERA_PRESETS[preset];
    _targetPos.set(def.pos[0], def.pos[1], def.pos[2]);
    _targetLook.set(def.target[0], def.target[1], def.target[2]);
    stateRef.current.cameraTransitionActive = true;
    sceneRefs.current.requestRender?.();
  };

  // Initialize WebGL scene once
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
        alpha: false,
      });
    } catch {
      setWebglError(true);
      return;
    }

    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 300);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.setAttribute('tabindex', '0');
    canvas.setAttribute('aria-label', `Interactive 3D garment viewer for ${label || archetype}`);

    container.innerHTML = '';
    container.appendChild(canvas);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const onContextRestored = () => {
      setWebglError(false);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#EFECE4');

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 40);
    camera.position.set(1.85, 0.35, 2.05);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, -0.05, 0);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 1.0;
    controls.maxDistance = 4.6;
    controls.minPolarAngle = Math.PI * 0.18;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.autoRotate = stateRef.current.autoRotate && !isSoftwareGl && !reducedMotion;
    controls.autoRotateSpeed = 0.85;

    // 3-Point Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#f2f4f8', '#9e978b', 0.78);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#fff8ee', 2.15);
    keyLight.position.set(3.2, 4.5, 3.6);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 14;
    keyLight.shadow.camera.left = -2;
    keyLight.shadow.camera.right = 2;
    keyLight.shadow.camera.top = 2;
    keyLight.shadow.camera.bottom = -2;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#cbd4e1', 1.05);
    rimLight.position.set(-3.0, 2.5, -3.2);
    scene.add(rimLight);

    // Subtle Architectural Plinth & Contact Shadow Plane
    const plinthGeo = new THREE.CylinderGeometry(0.95, 1.02, 0.14, 48);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: '#DFDBD1',
      roughness: 0.75,
      metalness: 0.04,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.set(0, -1.16, 0);
    plinth.receiveShadow = true;
    scene.add(plinth);

    const shadowTex = createContactShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(1.75, 1.75);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.52,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.position.set(0, -1.07, 0);
    scene.add(shadowPlane);

    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const garmentGroup = buildGarmentModel({
      archetype,
      colorHex,
      secondaryHex,
      fabricType,
      maxAnisotropy: maxAniso,
    });
    scene.add(garmentGroup);

    sceneRefs.current = {
      scene,
      camera,
      controls,
      renderer,
      garmentGroup,
      keyLight,
      rimLight,
      hemiLight,
      maxAniso,
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // On-demand / paced rendering loop
    let frameId = 0;
    let disposed = false;
    let renderBusy = false;
    let renderDirty = false;
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
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        if (disposed) return;
        const delta = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;
        renderDirty = false;

        // Smooth camera preset glide
        if (stateRef.current.cameraTransitionActive) {
          camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetPos.x, 7, delta);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetPos.y, 7, delta);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetPos.z, 7, delta);
          controls.target.x = THREE.MathUtils.damp(controls.target.x, _targetLook.x, 7, delta);
          controls.target.y = THREE.MathUtils.damp(controls.target.y, _targetLook.y, 7, delta);
          controls.target.z = THREE.MathUtils.damp(controls.target.z, _targetLook.z, 7, delta);

          if (camera.position.distanceTo(_targetPos) < 0.015) {
            camera.position.copy(_targetPos);
            controls.target.copy(_targetLook);
            stateRef.current.cameraTransitionActive = false;
          } else {
            renderDirty = true;
          }
        }

        // Smooth exploded-view transition
        const activeGroup = sceneRefs.current.garmentGroup;
        if (
          activeGroup &&
          Math.abs(stateRef.current.explodeCurrent - stateRef.current.explodeTarget) > 0.002
        ) {
          stateRef.current.explodeCurrent = THREE.MathUtils.damp(
            stateRef.current.explodeCurrent,
            stateRef.current.explodeTarget,
            9,
            delta,
          );
          applyGarmentExplosion(activeGroup, stateRef.current.explodeCurrent);
          renderDirty = true;
        }

        controls.update();
        if (controls.autoRotate && !isSoftwareGl) {
          renderDirty = true;
        }

        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty && !disposed) requestRender();
        };

        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    sceneRefs.current.requestRender = requestRender;

    const onControlStart = () => {
      stateRef.current.cameraTransitionActive = false;
    };
    const onControlChange = () => {
      requestRender();
    };
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('change', onControlChange);

    // Keyboard rotation & zoom accessibility
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (sceneRefs.current.garmentGroup) {
          sceneRefs.current.garmentGroup.rotation.y -= 0.2;
          requestRender();
        }
      } else if (e.key === 'ArrowRight') {
        if (sceneRefs.current.garmentGroup) {
          sceneRefs.current.garmentGroup.rotation.y += 0.2;
          requestRender();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        applyCameraPreset('quarter');
        setExplodeFactor(0);
      }
    };
    canvas.addEventListener('keydown', onKeyDown);

    const resizeObserver = new ResizeObserver(() => {
      if (!container || disposed) return;
      const w = Math.max(container.clientWidth, 240);
      const h = Math.max(container.clientHeight, 240);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    });
    resizeObserver.observe(container);

    requestRender();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('change', onControlChange);
      controls.dispose();
      canvas.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      if (sceneRefs.current.garmentGroup) {
        disposeObject3D(sceneRefs.current.garmentGroup);
      }
      plinthGeo.dispose();
      plinthMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      envTex.dispose();
      renderer.dispose();
    };
  }, []);

  // Swap 3D garment model seamlessly when archetype, color, or fabric changes
  useEffect(() => {
    const { scene, garmentGroup, maxAniso, requestRender } = sceneRefs.current;
    if (!scene) return;

    const prevRotY = garmentGroup ? garmentGroup.rotation.y : 0;
    if (garmentGroup) {
      scene.remove(garmentGroup);
      disposeObject3D(garmentGroup);
    }

    const nextGroup = buildGarmentModel({
      archetype,
      colorHex,
      secondaryHex,
      fabricType,
      maxAnisotropy: maxAniso,
    });
    nextGroup.rotation.y = prevRotY;
    applyGarmentExplosion(nextGroup, stateRef.current.explodeCurrent);
    scene.add(nextGroup);
    sceneRefs.current.garmentGroup = nextGroup;
    requestRender?.();
  }, [archetype, colorHex, secondaryHex, fabricType]);

  if (webglError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-[#EFECE4] border border-[#0F0F10]/10 p-8 text-center ${className}`}
      >
        <div
          className="w-24 h-24 rounded-full mb-4 border border-[#0F0F10]/15"
          style={{ backgroundColor: colorHex }}
        />
        <p className="font-display text-2xl text-[#0F0F10]">{label || '3D Garment Preview'}</p>
        <p className="text-xs text-[#78756E] mt-2 max-w-xs">
          WebGL hardware acceleration is unavailable in this browser context. Photographic studio view remains active.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#EFECE4] select-none ${className}`}>
      {/* Isolated empty mount container for WebGL canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top-Left Minimal Spec Label */}
      {label && (
        <div className="pointer-events-none absolute top-4 left-4 z-10 flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase text-[#0F0F10]/70 bg-[#F6F4EF]/90 px-3 py-1.5 border border-[#0F0F10]/10">
          <span>3D Atelier Model</span>
          <span aria-hidden="true">·</span>
          <span className="font-medium text-[#0F0F10]">{label}</span>
        </div>
      )}

      {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion, no backdrop-filter over WebGL) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex flex-col items-center px-3">
        <button
          type="button"
          onClick={() => setDockCollapsed((v) => !v)}
          className="pointer-events-auto mb-1.5 inline-flex items-center gap-1.5 bg-[#0F0F10] text-[#F6F4EF] px-3 py-1 text-[10px] tracking-[0.16em] uppercase hover:bg-[#1A1A1D] transition-colors cursor-pointer"
          aria-expanded={!dockCollapsed}
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3 h-3" />
              <span>Show 3D Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              <span>Hide Controls</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="pointer-events-auto w-full max-w-[660px] bg-[#F6F4EF]/95 border border-[#0F0F10]/15 px-3.5 py-2.5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Camera Angles */}
              <div className="flex items-center gap-1">
                {(['front', 'quarter', 'side', 'back', 'detail'] as CameraPreset[]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyCameraPreset(preset)}
                    className={`px-2 py-1 text-[11px] uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      cameraPreset === preset
                        ? 'bg-[#0F0F10] text-[#F6F4EF]'
                        : 'text-[#0F0F10]/70 hover:text-[#0F0F10] hover:bg-[#E5E2DA]/60'
                    }`}
                  >
                    {preset === 'quarter' ? '3/4' : preset}
                  </button>
                ))}
              </div>

              {/* Exploded Construction Slider */}
              {!compact && (
                <label className="flex items-center gap-2 text-[11px] text-[#0F0F10]/80 whitespace-nowrap">
                  <Layers className="w-3.5 h-3.5 text-[#0F0F10]/60" />
                  <span>Construction</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={explodeFactor}
                    onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                    className="w-20 accent-[#0F0F10] cursor-pointer"
                    aria-label="Explode garment construction layers"
                  />
                </label>
              )}

              {/* Lighting & Reset */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setLightingPreset((p) =>
                      p === 'gallery' ? 'runway' : p === 'runway' ? 'studio' : 'gallery',
                    )
                  }
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-[#0F0F10]/80 hover:bg-[#E5E2DA]/70 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  title="Switch 3D lighting rig"
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span className="capitalize">{lightingPreset}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAutoRotate((v) => !v)}
                  className={`px-2 py-1 text-[11px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    autoRotate
                      ? 'bg-[#E5E2DA] text-[#0F0F10]'
                      : 'text-[#0F0F10]/65 hover:text-[#0F0F10]'
                  }`}
                >
                  {autoRotate ? 'Spin On' : 'Spin Off'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    applyCameraPreset('quarter');
                    setExplodeFactor(0);
                  }}
                  className="p-1.5 text-[#0F0F10]/70 hover:text-[#0F0F10] transition-colors cursor-pointer"
                  aria-label="Reset 3D camera"
                  title="Reset view (R)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
