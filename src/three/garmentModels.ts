import * as THREE from 'three';
import type { FabricMaterialType, Model3DArchetype } from '../data/catalog';
import { createGarmentMaterial, createHardwareMaterial } from './fabricTextures';

export interface GarmentModelOptions {
  archetype: Model3DArchetype;
  colorHex: string;
  secondaryHex?: string;
  fabricType: FabricMaterialType;
  maxAnisotropy?: number;
}

function tagExplode(obj: THREE.Object3D, x: number, y: number, z: number, partLabel: string) {
  obj.userData.basePos = obj.position.clone();
  obj.userData.explodeOffset = new THREE.Vector3(x, y, z);
  obj.userData.partLabel = partLabel;
}

function createLatheTorso(
  radii: Array<[number, number]>,
  xScale: number,
  zScale: number,
  material: THREE.Material,
  radialSegments = 36,
): THREE.Mesh {
  const points = radii.map(([r, y]) => new THREE.Vector2(r, y));
  const geo = new THREE.LatheGeometry(points, radialSegments);
  // Elliptical human torso cross-section + subtle fabric fold modulation
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    const pz = pos.getZ(i);
    const angle = Math.atan2(pz, px);
    const fold = 1 + Math.sin(angle * 6 + py * 2.5) * 0.018;
    pos.setX(i, px * xScale * fold);
    pos.setZ(i, pz * zScale * fold);
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createSleeve(
  points: THREE.Vector3[],
  radiusStart: number,
  radiusEnd: number,
  material: THREE.Material,
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, 20, radiusStart, 18, false);
  const pos = geo.attributes.position;
  const center = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const u = Math.min(1, Math.max(0, Math.floor(i / 19) / 20));
    curve.getPoint(u, center);
    const t = THREE.MathUtils.lerp(1, radiusEnd / radiusStart, u);
    pos.setX(i, center.x + (pos.getX(i) - center.x) * t);
    pos.setY(i, center.y + (pos.getY(i) - center.y) * t);
    pos.setZ(i, center.z + (pos.getZ(i) - center.z) * t);
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createBeveledPanel(
  pts: Array<[number, number]>,
  depth: number,
  material: THREE.Material,
): THREE.Mesh {
  const shape = new THREE.Shape();
  shape.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    shape.lineTo(pts[i][0], pts[i][1]);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.006,
    bevelSegments: 2,
  });
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createNeckLabel(hardwareMat: THREE.Material): THREE.Mesh {
  const labelGeo = new THREE.BoxGeometry(0.11, 0.032, 0.006);
  const labelMat = new THREE.MeshStandardMaterial({
    color: '#EAE6DC',
    roughness: 0.7,
    metalness: 0.05,
  });
  const mesh = new THREE.Mesh(labelGeo, [
    hardwareMat,
    hardwareMat,
    hardwareMat,
    hardwareMat,
    labelMat,
    labelMat,
  ]);
  return mesh;
}

export function buildGarmentModel(opts: GarmentModelOptions): THREE.Group {
  const root = new THREE.Group();
  const maxAniso = opts.maxAnisotropy ?? 4;
  const mainMat = createGarmentMaterial(opts.colorHex, opts.fabricType, maxAniso);
  const accentMat = createGarmentMaterial(
    opts.secondaryHex || opts.colorHex,
    opts.fabricType === 'tech' ? 'tech' : 'wool',
    maxAniso,
  );
  const contrastLiningMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#232327'),
    roughness: 0.45,
    metalness: 0.05,
    sheen: 0.9,
    side: THREE.DoubleSide,
  });
  const hardwareMat = createHardwareMaterial(opts.fabricType === 'tech' ? '#5c6068' : '#9c8c74');
  const stitchMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(opts.colorHex).lerp(new THREE.Color('#ffffff'), 0.22),
    roughness: 0.75,
  });

  switch (opts.archetype) {
    case 'coat':
    case 'blazer': {
      const isCoat = opts.archetype === 'coat';
      const hemY = isCoat ? -0.95 : -0.45;
      const body = createLatheTorso(
        [
          [isCoat ? 0.46 : 0.34, hemY],
          [isCoat ? 0.39 : 0.32, hemY * 0.45],
          [0.27, 0.02],
          [0.32, 0.36],
          [0.35, 0.56],
          [0.16, 0.65],
        ],
        1.18,
        0.72,
        mainMat,
      );
      tagExplode(body, 0, 0, 0, 'Main Shell');
      root.add(body);

      // Inner lining shell
      const lining = createLatheTorso(
        [
          [isCoat ? 0.43 : 0.31, hemY + 0.04],
          [0.25, 0.02],
          [0.3, 0.36],
          [0.15, 0.63],
        ],
        1.12,
        0.66,
        contrastLiningMat,
      );
      tagExplode(lining, 0, 0, -0.35, 'Cupro Lining');
      root.add(lining);

      // Architectural Collar Stand
      const collar = createLatheTorso(
        [
          [0.16, 0.62],
          [0.18, 0.71],
          [0.15, 0.74],
        ],
        1.05,
        0.88,
        mainMat,
      );
      tagExplode(collar, 0, 0.25, 0, 'Collar Stand');
      root.add(collar);

      // Left & Right Peak Lapels
      const leftLapel = createBeveledPanel(
        [
          [0, 0],
          [-0.14, 0.36],
          [-0.04, 0.42],
          [0.03, 0.06],
        ],
        0.018,
        mainMat,
      );
      leftLapel.position.set(-0.04, 0.2, 0.24);
      leftLapel.rotation.set(-0.18, -0.22, 0.06);
      tagExplode(leftLapel, -0.22, 0.12, 0.25, 'Peak Lapel L');
      root.add(leftLapel);

      const rightLapel = createBeveledPanel(
        [
          [0, 0],
          [0.14, 0.36],
          [0.04, 0.42],
          [-0.03, 0.06],
        ],
        0.018,
        mainMat,
      );
      rightLapel.position.set(0.04, 0.2, 0.24);
      rightLapel.rotation.set(-0.18, 0.22, -0.06);
      tagExplode(rightLapel, 0.22, 0.12, 0.25, 'Peak Lapel R');
      root.add(rightLapel);

      // Articulated Sleeves + Shoulder Caps
      const sleeveL = createSleeve(
        [
          new THREE.Vector3(-0.37, 0.52, 0),
          new THREE.Vector3(-0.49, 0.18, 0.03),
          new THREE.Vector3(-0.52, -0.22, 0.08),
        ],
        0.135,
        0.092,
        mainMat,
      );
      tagExplode(sleeveL, -0.35, 0.05, 0, 'Articulated Sleeve L');
      root.add(sleeveL);

      const sleeveR = createSleeve(
        [
          new THREE.Vector3(0.37, 0.52, 0),
          new THREE.Vector3(0.49, 0.18, 0.03),
          new THREE.Vector3(0.52, -0.22, 0.08),
        ],
        0.135,
        0.092,
        mainMat,
      );
      tagExplode(sleeveR, 0.35, 0.05, 0, 'Articulated Sleeve R');
      root.add(sleeveR);

      // Pocket Flaps
      for (const side of [-1, 1]) {
        const pocket = createBeveledPanel(
          [
            [-0.08, 0],
            [0.08, 0],
            [0.08, -0.045],
            [-0.08, -0.045],
          ],
          0.015,
          accentMat,
        );
        pocket.position.set(side * 0.2, -0.06, 0.24);
        pocket.rotation.y = side * 0.25;
        tagExplode(pocket, side * 0.18, -0.08, 0.28, 'Welt Pocket Flap');
        root.add(pocket);
      }

      // Horn / Brass Buttons
      const btnCount = isCoat ? 3 : 4;
      for (let b = 0; b < btnCount; b++) {
        const btnGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.01, 18);
        btnGeo.rotateX(Math.PI / 2);
        const btn = new THREE.Mesh(btnGeo, hardwareMat);
        const row = isCoat ? b : Math.floor(b / 2);
        const col = isCoat ? 0.03 : (b % 2 === 0 ? -0.075 : 0.075);
        btn.position.set(col, 0.16 - row * 0.14, 0.25);
        tagExplode(btn, 0, 0, 0.42, 'Custom Horn Button');
        root.add(btn);
      }

      // Neck Label
      const label = createNeckLabel(hardwareMat);
      label.position.set(0, 0.57, -0.1);
      tagExplode(label, 0, 0.35, -0.25, 'Atelier Neck Label');
      root.add(label);
      break;
    }

    case 'parka':
    case 'hoodie': {
      const isParka = opts.archetype === 'parka';
      const body = createLatheTorso(
        [
          [isParka ? 0.41 : 0.37, isParka ? -0.58 : -0.44],
          [0.37, -0.15],
          [0.35, 0.25],
          [0.36, 0.54],
          [0.17, 0.63],
        ],
        1.16,
        0.78,
        mainMat,
      );
      tagExplode(body, 0, 0, 0, isParka ? '3L Waterproof Shell' : '520gsm French Terry Body');
      root.add(body);

      // Sculpted Storm Hood
      const hoodGeo = new THREE.SphereGeometry(0.22, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.72);
      const hood = new THREE.Mesh(hoodGeo, mainMat);
      hood.scale.set(1.0, 1.15, 1.12);
      hood.position.set(0, 0.74, -0.05);
      hood.rotation.x = -0.25;
      hood.castShadow = true;
      tagExplode(hood, 0, 0.32, -0.12, 'Articulated Storm Hood');
      root.add(hood);

      // Sleeves
      for (const side of [-1, 1]) {
        const sleeve = createSleeve(
          [
            new THREE.Vector3(side * 0.37, 0.5, 0),
            new THREE.Vector3(side * 0.51, 0.16, 0.04),
            new THREE.Vector3(side * 0.55, -0.24, 0.09),
          ],
          0.145,
          0.095,
          mainMat,
        );
        tagExplode(sleeve, side * 0.34, 0.04, 0, 'Raglan Sleeve');
        root.add(sleeve);
      }

      if (isParka) {
        // Center AquaGuard Zip Placket & Slider
        const zipStrip = new THREE.Mesh(new THREE.BoxGeometry(0.025, 1.12, 0.02), hardwareMat);
        zipStrip.position.set(0, 0.03, 0.28);
        tagExplode(zipStrip, 0, 0, 0.38, 'AquaGuard Zip Track');
        root.add(zipStrip);

        const pull = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.06, 0.022), hardwareMat);
        pull.position.set(0, 0.45, 0.305);
        tagExplode(pull, 0, 0.1, 0.48, 'Anodized Pull Tab');
        root.add(pull);

        // Twin Cargo Chest Pockets
        for (const side of [-1, 1]) {
          const chestPkt = createBeveledPanel(
            [
              [-0.075, -0.09],
              [0.075, -0.09],
              [0.075, 0.09],
              [-0.075, 0.09],
            ],
            0.035,
            accentMat,
          );
          chestPkt.position.set(side * 0.17, 0.23, 0.25);
          chestPkt.rotation.y = side * 0.22;
          tagExplode(chestPkt, side * 0.22, 0.05, 0.32, 'Bellowed Utility Pocket');
          root.add(chestPkt);
        }
      } else {
        // Kangaroo Pocket + Ribbed Hem
        const kangaroo = createBeveledPanel(
          [
            [-0.2, -0.12],
            [0.2, -0.12],
            [0.14, 0.08],
            [-0.14, 0.08],
          ],
          0.026,
          mainMat,
        );
        kangaroo.position.set(0, -0.22, 0.27);
        tagExplode(kangaroo, 0, -0.05, 0.35, 'Bar-Tacked Kangaroo Pocket');
        root.add(kangaroo);

        const hemRib = createLatheTorso(
          [
            [0.36, -0.49],
            [0.37, -0.43],
          ],
          1.16,
          0.78,
          stitchMat,
        );
        tagExplode(hemRib, 0, -0.22, 0, '2x2 Heavy Rib Hem');
        root.add(hemRib);
      }

      const label = createNeckLabel(hardwareMat);
      label.position.set(0, 0.55, -0.1);
      tagExplode(label, 0, 0.34, -0.2, 'Woven Neck Label');
      root.add(label);
      break;
    }

    case 'vest': {
      const body = createLatheTorso(
        [
          [0.36, -0.32],
          [0.35, 0.1],
          [0.34, 0.45],
          [0.19, 0.56],
        ],
        1.12,
        0.74,
        mainMat,
      );
      tagExplode(body, 0, 0, 0, '500D Cordura Chassis');
      root.add(body);

      for (const side of [-1, 1]) {
        const rigPkt = createBeveledPanel(
          [
            [-0.09, -0.1],
            [0.09, -0.1],
            [0.09, 0.1],
            [-0.09, 0.1],
          ],
          0.048,
          accentMat,
        );
        rigPkt.position.set(side * 0.18, -0.08, 0.25);
        rigPkt.rotation.y = side * 0.2;
        tagExplode(rigPkt, side * 0.25, 0, 0.35, 'Modular Cargo Pouch');
        root.add(rigPkt);

        const strap = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.28, 0.03), hardwareMat);
        strap.position.set(side * 0.18, 0.48, 0.14);
        strap.rotation.x = -0.3;
        tagExplode(strap, side * 0.12, 0.25, 0.1, 'Webbed Shoulder Strap');
        root.add(strap);
      }

      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.055, 0.035), hardwareMat);
      buckle.position.set(0, 0.16, 0.28);
      tagExplode(buckle, 0, 0, 0.46, 'Fidlock Magnetic Buckle');
      root.add(buckle);
      break;
    }

    case 'tee': {
      const body = createLatheTorso(
        [
          [0.34, -0.44],
          [0.32, 0.0],
          [0.33, 0.42],
          [0.34, 0.54],
          [0.15, 0.62],
        ],
        1.14,
        0.68,
        mainMat,
      );
      tagExplode(body, 0, 0, 0, 'Combed Jersey Body');
      root.add(body);

      const collar = createLatheTorso(
        [
          [0.15, 0.6],
          [0.165, 0.67],
          [0.145, 0.68],
        ],
        1.05,
        0.85,
        stitchMat,
      );
      tagExplode(collar, 0, 0.24, 0, 'Mock-Rib Collar');
      root.add(collar);

      for (const side of [-1, 1]) {
        const sleeve = createSleeve(
          [
            new THREE.Vector3(side * 0.34, 0.49, 0),
            new THREE.Vector3(side * 0.48, 0.31, 0.02),
          ],
          0.135,
          0.125,
          mainMat,
        );
        tagExplode(sleeve, side * 0.28, 0.08, 0, 'Dropped Sleeve');
        root.add(sleeve);
      }

      const label = createNeckLabel(hardwareMat);
      label.position.set(0, 0.56, -0.09);
      tagExplode(label, 0, 0.3, -0.22, 'Woven Label');
      root.add(label);
      break;
    }

    case 'dress': {
      const bodice = createLatheTorso(
        [
          [0.48, -0.98],
          [0.38, -0.45],
          [0.24, 0.08],
          [0.3, 0.42],
          [0.15, 0.62],
        ],
        1.12,
        0.74,
        mainMat,
      );
      tagExplode(bodice, 0, 0, 0, 'Asymmetric Draped Shell');
      root.add(bodice);

      for (const side of [-1, 1]) {
        const sleeve = createSleeve(
          [
            new THREE.Vector3(side * 0.31, 0.47, 0),
            new THREE.Vector3(side * 0.44, 0.14, 0.03),
            new THREE.Vector3(side * 0.47, -0.22, 0.06),
          ],
          0.115,
          0.075,
          mainMat,
        );
        tagExplode(sleeve, side * 0.3, 0.04, 0, 'French-Cuff Sleeve');
        root.add(sleeve);
      }

      const placket = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.62, 0.02), stitchMat);
      placket.position.set(0, 0.28, 0.22);
      tagExplode(placket, 0, 0, 0.35, 'Hidden Placket');
      root.add(placket);
      break;
    }

    case 'trousers': {
      // Contoured Waistband
      const waist = createLatheTorso(
        [
          [0.31, 0.44],
          [0.31, 0.54],
        ],
        1.14,
        0.74,
        mainMat,
      );
      tagExplode(waist, 0, 0.24, 0, 'Extended Tab Waistband');
      root.add(waist);

      // Left & Right Architectural Leg Columns
      for (const side of [-1, 1]) {
        const leg = createLatheTorso(
          [
            [0.17, -0.88],
            [0.18, -0.35],
            [0.2, 0.15],
            [0.21, 0.46],
          ],
          0.95,
          0.92,
          mainMat,
          28,
        );
        leg.position.x = side * 0.16;
        tagExplode(leg, side * 0.22, -0.05, 0, side < 0 ? 'Left Pleated Column' : 'Right Pleated Column');
        root.add(leg);

        // Pressed Front Crease / Seam Accent
        const seam = new THREE.Mesh(new THREE.BoxGeometry(0.012, 1.28, 0.015), stitchMat);
        seam.position.set(side * 0.16, -0.22, 0.19);
        tagExplode(seam, side * 0.22, -0.05, 0.22, 'Pressed Knife Pleat');
        root.add(seam);
      }

      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.045, 0.025), hardwareMat);
      buckle.position.set(0, 0.49, 0.235);
      tagExplode(buckle, 0, 0.26, 0.34, 'Hook & Bar Hardware');
      root.add(buckle);
      break;
    }

    case 'boot':
    case 'trainer': {
      const isBoot = opts.archetype === 'boot';
      // Sculpted Rubber Outsole
      const sole = createBeveledPanel(
        [
          [-0.16, -0.05],
          [0.16, -0.05],
          [0.44, -0.02],
          [0.45, 0.045],
          [-0.17, 0.045],
        ],
        0.22,
        new THREE.MeshStandardMaterial({ color: '#141416', roughness: 0.78 }),
      );
      sole.position.set(-0.14, -0.36, -0.11);
      tagExplode(sole, 0, -0.22, 0, isBoot ? 'Vibram Commando Sole' : 'Margom Rubber Cupsole');
      root.add(sole);

      // Sculpted Leather Vamp & Toe Box
      const vampGeo = new THREE.CapsuleGeometry(0.115, 0.34, 12, 24);
      vampGeo.rotateZ(Math.PI / 2);
      const vamp = new THREE.Mesh(vampGeo, mainMat);
      vamp.scale.set(1.0, 0.78, 0.96);
      vamp.position.set(0.06, -0.22, 0);
      vamp.castShadow = true;
      tagExplode(vamp, 0.12, 0.02, 0, 'Full-Grain Calfskin Vamp');
      root.add(vamp);

      // Shaft / Heel Counter
      const shaftH = isBoot ? 0.46 : 0.15;
      const shaft = createLatheTorso(
        [
          [0.12, -0.22],
          [0.112, -0.22 + shaftH],
        ],
        1.05,
        0.92,
        mainMat,
        28,
      );
      shaft.position.set(-0.14, 0, 0);
      tagExplode(shaft, -0.14, 0.2, 0, isBoot ? 'Ankle Shaft' : 'Padded Heel Collar');
      root.add(shaft);

      // Rear Metallic Zip / Pull Tab
      const zip = new THREE.Mesh(
        new THREE.BoxGeometry(0.018, isBoot ? 0.38 : 0.12, 0.02),
        hardwareMat,
      );
      zip.position.set(-0.26, isBoot ? 0.02 : -0.14, 0);
      tagExplode(zip, -0.32, 0.12, 0, 'Excella Rear Zip');
      root.add(zip);
      break;
    }

    case 'bag': {
      // Main Structured Box Body
      const body = createBeveledPanel(
        [
          [-0.42, -0.28],
          [0.42, -0.28],
          [0.42, 0.26],
          [-0.42, 0.26],
        ],
        0.18,
        mainMat,
      );
      body.position.set(0, -0.04, -0.09);
      tagExplode(body, 0, 0, -0.15, 'Bridle Leather Body');
      root.add(body);

      // Folded Front Flap
      const flap = createBeveledPanel(
        [
          [-0.425, -0.18],
          [0.425, -0.18],
          [0.425, 0.14],
          [-0.425, 0.14],
        ],
        0.028,
        mainMat,
      );
      flap.position.set(0, 0.08, 0.1);
      flap.rotation.x = -0.06;
      tagExplode(flap, 0, 0.18, 0.24, 'Hand-Edged Front Flap');
      root.add(flap);

      // Machined Titanium Push-Lock Clasp
      const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.085, 0.04), hardwareMat);
      clasp.position.set(0, -0.08, 0.13);
      tagExplode(clasp, 0, 0.08, 0.44, 'Brushed Titanium Clasp');
      root.add(clasp);

      // Curved Crossbody Strap
      const strapCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.43, 0.18, 0),
        new THREE.Vector3(-0.4, 0.58, 0),
        new THREE.Vector3(0, 0.72, 0),
        new THREE.Vector3(0.4, 0.58, 0),
        new THREE.Vector3(0.43, 0.18, 0),
      ]);
      const strap = new THREE.Mesh(new THREE.TubeGeometry(strapCurve, 32, 0.022, 10, false), mainMat);
      strap.castShadow = true;
      tagExplode(strap, 0, 0.34, 0, 'Adjustable Leather Strap');
      root.add(strap);
      break;
    }

    case 'eyewear': {
      // Dual Titanium Lens Rims
      for (const side of [-1, 1]) {
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.014, 14, 36), hardwareMat);
        rim.scale.set(1.18, 0.88, 1);
        rim.position.set(side * 0.25, 0.02, 0.15);
        tagExplode(rim, side * 0.18, 0.05, 0.2, 'Beta-Titanium Rim');
        root.add(rim);

        const lensMat = new THREE.MeshPhysicalMaterial({
          color: '#1b1d22',
          roughness: 0.08,
          metalness: 0.15,
          transparent: true,
          opacity: 0.72,
          clearcoat: 1.0,
        });
        const lens = new THREE.Mesh(new THREE.CircleGeometry(0.17, 32), lensMat);
        lens.scale.set(1.15, 0.85, 1);
        lens.position.set(side * 0.25, 0.02, 0.15);
        tagExplode(lens, side * 0.18, 0.05, 0.34, 'Zeiss CR-39 Lens');
        root.add(lens);

        // Temple Arms
        const templeCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * 0.45, 0.04, 0.14),
          new THREE.Vector3(side * 0.46, 0.04, -0.38),
          new THREE.Vector3(side * 0.44, -0.06, -0.52),
        ]);
        const temple = new THREE.Mesh(new THREE.TubeGeometry(templeCurve, 18, 0.011, 8, false), hardwareMat);
        tagExplode(temple, side * 0.28, 0, -0.15, 'Engraved Temple Arm');
        root.add(temple);
      }
      // Bridge
      const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 10), hardwareMat);
      bridge.rotation.z = Math.PI / 2;
      bridge.position.set(0, 0.05, 0.15);
      tagExplode(bridge, 0, 0.16, 0.24, 'Sculpted Nose Bridge');
      root.add(bridge);
      break;
    }
  }

  return root;
}

export function applyGarmentExplosion(group: THREE.Group, factor: number) {
  group.traverse((child) => {
    if (child.userData.basePos && child.userData.explodeOffset) {
      const base = child.userData.basePos as THREE.Vector3;
      const offset = child.userData.explodeOffset as THREE.Vector3;
      child.position.set(
        base.x + offset.x * factor,
        base.y + offset.y * factor,
        base.z + offset.z * factor,
      );
    }
  });
}

export function disposeObject3D(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.geometry?.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else if (mesh.material) {
        mesh.material.dispose();
      }
    }
  });
}
