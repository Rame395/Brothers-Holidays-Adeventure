"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { heroState } from "./heroStore";
import { mulberry32, ridged, smoothstep, valueNoise } from "./terrain";

/* ---------- camera & world constants ---------- */
const CAM_START = new THREE.Vector3(0, 2.6, 16);
const FLY_DISTANCE = 34;
const MOUSE_SHIFT_X = 2.4;
const MOUSE_SHIFT_Y = 0.9;
const MOUSE_DAMP = 2.2;
const ROLL = 0.035;
const FOG_COLOR = "#aec4da";

/* ---------- shared deterministic terrain sampler ---------- */
interface RidgeSpec {
  z: number;
  width: number;
  depth: number;
  amp: number;
  gap: number;
  baseY: number;
  seed: number;
}

const BACK_RIDGE_SPEC: RidgeSpec = {
  z: -50,
  width: 230,
  depth: 44,
  amp: 15,
  gap: 20,
  baseY: -4.5,
  seed: 23,
};

const FRONT_RIDGE_SPEC: RidgeSpec = {
  z: -6,
  width: 160,
  depth: 64,
  amp: 12,
  gap: 10,
  baseY: -3.4,
  seed: 7,
};

function riverCenterX(zWorld: number): number {
  return Math.sin(zWorld * 0.085) * 1.9 + Math.cos(zWorld * 0.16) * 0.65;
}

function riverSurfaceY(zWorld: number): number {
  return -1.65 - ((zWorld + 36) / 56) * 1.0;
}

function sampleRidgeHeight(x: number, lz: number, spec: RidgeSpec) {
  const tz = 1 - (lz + spec.depth / 2) / spec.depth;
  const envZ = Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, tz * 1.05))), 0.9);
  const flank = smoothstep(spec.gap * 0.4, spec.gap * 1.7, Math.abs(x));
  const peakiness =
    0.55 + 0.9 * valueNoise(x * 0.035 + spec.seed, spec.seed * 0.1, spec.seed);
  const r = ridged(x * 0.06 + spec.seed * 3.1, lz * 0.08, spec.seed);
  const detail = ridged(x * 0.32, lz * 0.32, spec.seed + 5, 4) * 0.24;
  const crag = ridged(x * 0.85, lz * 0.85, spec.seed + 19, 4) * 0.11;
  const baseH =
    (0.1 + 0.9 * flank) * envZ * spec.amp * peakiness * (0.25 + r * 1.1) +
    (detail + crag) * spec.amp * envZ;
  const slopeMask = smoothstep(0.15, 0.72, r) * (0.35 + 0.65 * flank);
  const ledges = Math.sin(baseH * 1.8) * 0.12 * envZ * slopeMask * 3.2;
  let h = Math.max(0.05, baseH + ledges);

  if (spec.seed === FRONT_RIDGE_SPEC.seed) {
    const zWorld = spec.z + lz;
    const dist = Math.abs(x - riverCenterX(zWorld));
    const gorgeT = smoothstep(1.8, 6.2, dist);
    const bedH = riverSurfaceY(zWorld) - 0.65 - spec.baseY;
    h = bedH + (h - bedH) * gorgeT;
  }

  return { h, y: spec.baseY + h };
}

/* ---------- procedural micro-detail terrain & wire-mesh textures ---------- */
function makeTerrainDetailTextures(withBump: boolean) {
  const size = 128;
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext("2d")!;

  cCtx.fillStyle = "#e8e8e8";
  cCtx.fillRect(0, 0, size, size);

  let bCtx: CanvasRenderingContext2D | null = null;
  let bumpCanvas: HTMLCanvasElement | null = null;
  if (withBump) {
    bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    bCtx = bumpCanvas.getContext("2d");
    if (bCtx) {
      bCtx.fillStyle = "#808080";
      bCtx.fillRect(0, 0, size, size);
    }
  }

  const rand = mulberry32(417);

  // Broad rock/moss mottling
  for (let i = 0; i < 80; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 2 + rand() * 7;
    const shade = Math.round(205 + rand() * 48);
    cCtx.fillStyle = `rgba(${shade}, ${shade}, ${Math.max(198, shade - 2)}, 0.24)`;
    cCtx.beginPath();
    cCtx.arc(x, y, r, 0, Math.PI * 2);
    cCtx.fill();

    if (bCtx) {
      const bVal = Math.round(90 + rand() * 90);
      bCtx.fillStyle = `rgba(${bVal}, ${bVal}, ${bVal}, 0.22)`;
      bCtx.beginPath();
      bCtx.arc(x, y, r, 0, Math.PI * 2);
      bCtx.fill();
    }
  }

  // Sharp rocky scree flecks, granite crevices & coarse alpine gravel specks
  cCtx.strokeStyle = "rgba(38, 40, 46, 0.45)";
  if (bCtx) {
    bCtx.strokeStyle = "rgba(18, 20, 24, 0.72)";
  }
  for (let i = 0; i < 50; i++) {
    let cx = rand() * size;
    let cy = rand() * size;
    cCtx.lineWidth = 0.7 + rand() * 0.9;
    cCtx.beginPath();
    cCtx.moveTo(cx, cy);
    if (bCtx) {
      bCtx.lineWidth = 0.9 + rand() * 1.1;
      bCtx.beginPath();
      bCtx.moveTo(cx, cy);
    }
    const steps = 2 + Math.floor(rand() * 3);
    for (let s = 0; s < steps; s++) {
      cx += (rand() - 0.5) * 9;
      cy += (rand() - 0.5) * 7;
      cCtx.lineTo(cx, cy);
      if (bCtx) bCtx.lineTo(cx, cy);
    }
    cCtx.stroke();
    if (bCtx) bCtx.stroke();
  }

  for (let i = 0; i < 420; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const w = 1.0 + rand() * 1.8;
    const h = 1.0 + rand() * 1.6;
    const tone = rand() > 0.35 ? Math.round(218 + rand() * 37) : Math.round(145 + rand() * 40);
    cCtx.fillStyle = `rgba(${tone}, ${tone}, ${tone}, 0.48)`;
    cCtx.fillRect(x, y, w, h);

    if (bCtx) {
      const bump = rand() > 0.42 ? Math.round(205 + rand() * 50) : Math.round(18 + rand() * 52);
      bCtx.fillStyle = `rgba(${bump}, ${bump}, ${bump}, 0.68)`;
      bCtx.fillRect(x, y, w, h);
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(24, 18);

  let bumpMap: THREE.CanvasTexture | null = null;
  if (bumpCanvas) {
    bumpMap = new THREE.CanvasTexture(bumpCanvas);
    bumpMap.wrapS = THREE.RepeatWrapping;
    bumpMap.wrapT = THREE.RepeatWrapping;
    bumpMap.repeat.set(24, 18);
  }

  return { map, bumpMap };
}

function makeWireMeshTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(205, 217, 226, 0.92)";
  ctx.lineWidth = 6;

  // Seamless diamond wire chainlink strokes
  const drawDiag = (ox: number) => {
    ctx.beginPath();
    ctx.moveTo(ox, 0);
    ctx.lineTo(ox + size, size);
    ctx.moveTo(ox + size, 0);
    ctx.lineTo(ox, size);
    ctx.stroke();
  };
  drawDiag(-size);
  drawDiag(0);
  drawDiag(size);

  // Subtle horizontal tension wire along top & middle
  ctx.strokeStyle = "rgba(180, 194, 205, 0.9)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.lineTo(size, 3);
  ctx.moveTo(0, size / 2);
  ctx.lineTo(size, size / 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(28, 2);
  return tex;
}

/* ---------- mountain / hillside ridge layer ---------- */
type RidgeProps = RidgeSpec & {
  snowLine: number;
  segX?: number;
  segZ?: number;
  terrainStyle: "foothill" | "alpine";
  detailMap: THREE.CanvasTexture;
  bumpMap?: THREE.CanvasTexture | null;
};

function Ridge({
  z,
  width,
  depth,
  amp,
  gap,
  baseY,
  seed,
  snowLine,
  segX = 76,
  segZ = 40,
  terrainStyle,
  detailMap,
  bumpMap = null,
}: RidgeProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, depth, segX, segZ);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes["position"] as THREE.BufferAttribute;
    const heights = new Float32Array(pos.count);
    const spec: RidgeSpec = { z, width, depth, amp, gap, baseY, seed };

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const lz = pos.getZ(i);
      const sampled = sampleRidgeHeight(x, lz, spec);
      heights[i] = sampled.h;
      pos.setY(i, sampled.y);
    }
    geo.computeVertexNormals();

    const normals = geo.attributes["normal"] as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);

    const rockDark = new THREE.Color("#232e3a");
    const rockGranite = new THREE.Color("#4b5b6b");
    const wetRiverRock = new THREE.Color("#1d2a35");
    const snowShadow = new THREE.Color("#a9c0d8");
    const snowMid = new THREE.Color("#dce8f5");
    const snowBright = new THREE.Color("#f4f9ff");
    const packedTrailSnow = new THREE.Color("#c6d6e6");
    const snow = new THREE.Color("#eef4fa");
    const snowShade = new THREE.Color("#b4c5d7");

    const tmp = new THREE.Color();
    const tmpPack = new THREE.Color();
    const tmpSnow = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const hn = (heights[i] ?? 0) / amp;
      const ny = normals.getY(i);
      const x = pos.getX(i);
      const lz = pos.getZ(i);
      const zWorld = z + lz;

      const n = valueNoise(x * 0.35, lz * 0.35, seed + 9);
      const patch = valueNoise(x * 0.19 + 4.1, lz * 0.19 - 2.3, seed + 33);

      if (terrainStyle === "foothill") {
        // Exposed dark granite on steep cliffs & gorge walls
        tmp.lerpColors(rockDark, rockGranite, n * 0.85);

        // Layered, wind-sculpted snowpack on gentle & moderate slopes
        tmpPack.lerpColors(snowShadow, snowMid, smoothstep(0.5, 0.82, ny));
        tmpPack.lerp(snowBright, smoothstep(0.78, 0.97, ny) * (0.55 + 0.45 * patch));
        tmpPack.lerp(snowShadow, smoothstep(0.62, 0.9, n) * 0.25);
        const snowCover =
          smoothstep(0.42, 0.62, ny + (patch - 0.5) * 0.12) *
          (0.88 + 0.12 * smoothstep(0.2, 0.8, n));
        tmp.lerp(tmpPack, snowCover);

        // Packed-snow trekking trail winding along left approach toward bridge abutment
        if (zWorld > -10 && zWorld < 11 && x < -9.2 && x > -18.5) {
          const trailCenterX = -11.4 - Math.sin((zWorld + 1.5) * 0.25) * 1.4;
          const distTrail = Math.abs(x - trailCenterX);
          const trailMask =
            (1 - smoothstep(0.35, 1.05, distTrail)) * smoothstep(0.6, 0.82, ny);
          tmp.lerp(packedTrailSnow, trailMask * 0.7);
        }

        // Dark wet icy slate right at the glacial river edge
        const riverDist = Math.abs(x - riverCenterX(zWorld));
        if (riverDist < 3.4) {
          const wetMask = 1 - smoothstep(1.9, 3.4, riverDist);
          tmp.lerp(wetRiverRock, wetMask * 0.9);
        }

        // Extra bright snow accumulation on upper ridges
        const frostAmt =
          smoothstep(snowLine - 0.04, snowLine + 0.16, hn + (ny - 0.75) * 0.35) *
          smoothstep(0.5, 0.85, ny);
        tmpSnow.lerpColors(snowShade, snow, smoothstep(0.6, 0.95, ny));
        tmp.lerp(tmpSnow, frostAmt * 0.7);
      } else {
        // Massive snow-covered Khumbu granite faces in background
        tmp.lerpColors(rockDark, rockGranite, n * 0.72);
        const snowAmt =
          smoothstep(snowLine - 0.12, snowLine + 0.08, hn + (ny - 0.7) * 0.5 + (n - 0.5) * 0.25) *
          smoothstep(0.54, 0.82, ny);
        tmpSnow.lerpColors(snowShade, snow, smoothstep(0.6, 0.95, ny));
        tmp.lerp(tmpSnow, snowAmt);
      }

      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [z, width, depth, amp, gap, baseY, seed, snowLine, segX, segZ, terrainStyle]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} position={[0, 0, z]}>
      {bumpMap ? (
        <meshLambertMaterial
          vertexColors
          map={detailMap}
          bumpMap={bumpMap}
          bumpScale={terrainStyle === "foothill" ? 0.65 : 0.42}
        />
      ) : (
        <meshLambertMaterial vertexColors map={detailMap} />
      )}
    </mesh>
  );
}

/* ---------- merged pine silhouette ---------- */
function buildPineFoliageGeometry(): THREE.BufferGeometry {
  const tiers = [
    new THREE.ConeGeometry(0.3, 0.58, 7),
    new THREE.ConeGeometry(0.24, 0.5, 7),
    new THREE.ConeGeometry(0.16, 0.42, 7),
  ];
  tiers[0].translate(0, 0.48, 0);
  tiers[1].translate(0, 0.76, 0);
  tiers[2].translate(0, 1.02, 0);

  const nonIndexed = tiers.map((t) => {
    const g = t.index ? t.toNonIndexed() : t;
    t.dispose();
    return g;
  });

  const totalVerts = nonIndexed.reduce(
    (sum, g) => sum + g.attributes["position"].count,
    0
  );
  const posArr = new Float32Array(totalVerts * 3);
  const normArr = new Float32Array(totalVerts * 3);

  let offset = 0;
  for (const g of nonIndexed) {
    const p = g.attributes["position"] as THREE.BufferAttribute;
    const n = g.attributes["normal"] as THREE.BufferAttribute;
    posArr.set(p.array as Float32Array, offset * 3);
    normArr.set(n.array as Float32Array, offset * 3);
    offset += p.count;
    g.dispose();
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(normArr, 3));
  return merged;
}

/* ---------- Authentic Khumbu Hillside Details: Granite Boulders, Snow Mounds & Frosted Pines ---------- */
function HillsideDetails({ compact }: { compact: boolean }) {
  const boulderRef = useRef<THREE.InstancedMesh>(null);
  const scrubRef = useRef<THREE.InstancedMesh>(null);
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const foliageRef = useRef<THREE.InstancedMesh>(null);

  const boulderGeo = useMemo(() => new THREE.DodecahedronGeometry(0.45, 0), []);
  const scrubGeo = useMemo(() => new THREE.IcosahedronGeometry(0.32, 0), []);
  const trunkGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.03, 0.052, 0.42, 5);
    g.translate(0, 0.21, 0);
    return g;
  }, []);
  const foliageGeo = useMemo(() => buildPineFoliageGeometry(), []);

  const maxBoulders = compact ? 24 : 85;
  const maxScrubs = compact ? 28 : 100;
  const maxPines = compact ? 20 : 55;
  const maxBoulderAttempts = compact ? 250 : 700;
  const maxScrubAttempts = compact ? 300 : 800;
  const maxPineAttempts = compact ? 250 : 700;

  const { boulders, scrubs, pines } = useMemo(() => {
    const rand = mulberry32(2028);

    const boulderList: {
      pos: THREE.Vector3;
      rot: THREE.Euler;
      scale: THREE.Vector3;
      color: THREE.Color;
    }[] = [];
    const scrubList: {
      pos: THREE.Vector3;
      rot: THREE.Euler;
      scale: THREE.Vector3;
      color: THREE.Color;
    }[] = [];
    const pineList: {
      x: number;
      y: number;
      z: number;
      scale: number;
      rotY: number;
      color: THREE.Color;
    }[] = [];

    const rockColors = [
      new THREE.Color("#6d7e8f"),
      new THREE.Color("#8a9dad"),
      new THREE.Color("#556473"),
      new THREE.Color("#a7bacb"),
    ];
    const scrubColors = [
      new THREE.Color("#d6e4f2"),
      new THREE.Color("#bfd2e5"),
      new THREE.Color("#e8f2fc"),
      new THREE.Color("#aec4da"),
    ];
    const pineColors = [
      new THREE.Color("#2b4a4b"),
      new THREE.Color("#3f6163"),
      new THREE.Color("#5d7e82"),
      new THREE.Color("#88a5ab"),
    ];

    const nearForbiddenZone = (x: number, z: number) => {
      // Clear bridge walkway/towers, Chorten terrace, and rocky glacial riverbanks
      if (Math.abs(x) < 12.2 && Math.abs(z - -1.5) < 3.2) return true;
      if (Math.hypot(x - -12.8, z - -3.8) < 2.3) return true;
      if (Math.abs(x - riverCenterX(z)) < 4.2) return true;
      return false;
    };

    // 1. Himalayan Granite Boulders along gorge walls, trailside & hills
    let attempts = 0;
    while (boulderList.length < maxBoulders && attempts < maxBoulderAttempts) {
      attempts += 1;
      const side = rand() > 0.5 ? 1 : -1;
      const x = side * (3.5 + rand() * 28);
      const z = -22 + rand() * 31;
      if (nearForbiddenZone(x, z)) continue;

      const lz = z - FRONT_RIDGE_SPEC.z;
      const c = sampleRidgeHeight(x, lz, FRONT_RIDGE_SPEC);
      const hn = c.h / FRONT_RIDGE_SPEC.amp;
      if (hn > 0.65) continue;

      const s = 0.5 + rand() * 1.15;
      boulderList.push({
        pos: new THREE.Vector3(x, c.y - 0.14 * s, z),
        rot: new THREE.Euler(rand() * 1.4, rand() * Math.PI * 2, rand() * 1.4),
        scale: new THREE.Vector3(s * (0.9 + rand() * 0.5), s * (0.55 + rand() * 0.4), s * (0.85 + rand() * 0.5)),
        color: rockColors[Math.floor(rand() * rockColors.length)]!,
      });
    }

    // 2. Frosted snow mounds & juniper drifts
    attempts = 0;
    while (scrubList.length < maxScrubs && attempts < maxScrubAttempts) {
      attempts += 1;
      const side = rand() > 0.5 ? 1 : -1;
      const x = side * (5.2 + rand() * 30);
      const z = -24 + rand() * 33;
      if (nearForbiddenZone(x, z)) continue;

      const lz = z - FRONT_RIDGE_SPEC.z;
      const c = sampleRidgeHeight(x, lz, FRONT_RIDGE_SPEC);
      const hn = c.h / FRONT_RIDGE_SPEC.amp;
      if (hn < 0.05 || hn > 0.58) continue;

      const dx = sampleRidgeHeight(x + 0.7, lz, FRONT_RIDGE_SPEC).y - c.y;
      const dz = sampleRidgeHeight(x, lz + 0.7, FRONT_RIDGE_SPEC).y - c.y;
      if (Math.hypot(dx, dz) / 0.7 > 0.76) continue;

      const s = 0.65 + rand() * 0.95;
      scrubList.push({
        pos: new THREE.Vector3(x, c.y + 0.06, z),
        rot: new THREE.Euler(rand() * 0.4, rand() * Math.PI * 2, rand() * 0.4),
        scale: new THREE.Vector3(s * 1.15, s * (0.48 + rand() * 0.3), s),
        color: scrubColors[Math.floor(rand() * scrubColors.length)]!,
      });
    }

    // 3. Sparse Hillside Pines in loose lower-slope pockets
    attempts = 0;
    while (pineList.length < maxPines && attempts < maxPineAttempts) {
      attempts += 1;
      const side = rand() > 0.5 ? 1 : -1;
      const x = side * (7.2 + rand() * 32);
      const z = -26 + rand() * 34;
      if (nearForbiddenZone(x, z)) continue;

      const lz = z - FRONT_RIDGE_SPEC.z;
      const c = sampleRidgeHeight(x, lz, FRONT_RIDGE_SPEC);
      const hn = c.h / FRONT_RIDGE_SPEC.amp;
      if (hn < 0.08 || hn > 0.48) continue;

      const dx = sampleRidgeHeight(x + 0.8, lz, FRONT_RIDGE_SPEC).y - c.y;
      const dz = sampleRidgeHeight(x, lz + 0.8, FRONT_RIDGE_SPEC).y - c.y;
      if (Math.hypot(dx, dz) / 0.8 > 0.68) continue;

      const clusterNoise = valueNoise(x * 0.24, z * 0.24, 51);
      if (clusterNoise < 0.48) continue;

      pineList.push({
        x,
        y: c.y - 0.05,
        z,
        scale: 0.72 + rand() * 0.62,
        rotY: rand() * Math.PI * 2,
        color: pineColors[Math.floor(rand() * pineColors.length)]!,
      });
    }

    return { boulders: boulderList, scrubs: scrubList, pines: pineList };
  }, [maxBoulders, maxScrubs, maxPines, maxBoulderAttempts, maxScrubAttempts, maxPineAttempts]);

  useEffect(() => {
    const dummy = new THREE.Object3D();

    if (boulderRef.current) {
      boulders.forEach((b, i) => {
        dummy.position.copy(b.pos);
        dummy.rotation.copy(b.rot);
        dummy.scale.copy(b.scale);
        dummy.updateMatrix();
        boulderRef.current!.setMatrixAt(i, dummy.matrix);
        boulderRef.current!.setColorAt(i, b.color);
      });
      boulderRef.current.instanceMatrix.needsUpdate = true;
      if (boulderRef.current.instanceColor) boulderRef.current.instanceColor.needsUpdate = true;
    }

    if (scrubRef.current) {
      scrubs.forEach((s, i) => {
        dummy.position.copy(s.pos);
        dummy.rotation.copy(s.rot);
        dummy.scale.copy(s.scale);
        dummy.updateMatrix();
        scrubRef.current!.setMatrixAt(i, dummy.matrix);
        scrubRef.current!.setColorAt(i, s.color);
      });
      scrubRef.current.instanceMatrix.needsUpdate = true;
      if (scrubRef.current.instanceColor) scrubRef.current.instanceColor.needsUpdate = true;
    }

    if (trunkRef.current && foliageRef.current) {
      pines.forEach((p, i) => {
        dummy.position.set(p.x, p.y, p.z);
        dummy.rotation.set(0, p.rotY, 0);
        dummy.scale.setScalar(p.scale);
        dummy.updateMatrix();
        trunkRef.current!.setMatrixAt(i, dummy.matrix);
        foliageRef.current!.setMatrixAt(i, dummy.matrix);
        foliageRef.current!.setColorAt(i, p.color);
      });
      trunkRef.current.instanceMatrix.needsUpdate = true;
      foliageRef.current.instanceMatrix.needsUpdate = true;
      if (foliageRef.current.instanceColor) foliageRef.current.instanceColor.needsUpdate = true;
    }
  }, [boulders, scrubs, pines]);

  useEffect(() => {
    return () => {
      boulderGeo.dispose();
      scrubGeo.dispose();
      trunkGeo.dispose();
      foliageGeo.dispose();
    };
  }, [boulderGeo, scrubGeo, trunkGeo, foliageGeo]);

  return (
    <group>
      {boulders.length > 0 && (
        <instancedMesh ref={boulderRef} args={[boulderGeo, undefined, boulders.length]}>
          <meshLambertMaterial />
        </instancedMesh>
      )}
      {scrubs.length > 0 && (
        <instancedMesh ref={scrubRef} args={[scrubGeo, undefined, scrubs.length]}>
          <meshLambertMaterial />
        </instancedMesh>
      )}
      {pines.length > 0 && (
        <>
          <instancedMesh ref={trunkRef} args={[trunkGeo, undefined, pines.length]}>
            <meshLambertMaterial color="#4a433d" />
          </instancedMesh>
          <instancedMesh ref={foliageRef} args={[foliageGeo, undefined, pines.length]}>
            <meshLambertMaterial />
          </instancedMesh>
        </>
      )}
    </group>
  );
}

/* ---------- Sherpa Stone-Terraced Chorten / Stupa Overlooking the Gorge ---------- */
function KhumbuChorten() {
  const chortenX = -12.8;
  const chortenZ = -3.8;

  const baseY = useMemo(
    () =>
      sampleRidgeHeight(
        chortenX,
        chortenZ - FRONT_RIDGE_SPEC.z,
        FRONT_RIDGE_SPEC
      ).y,
    [chortenX, chortenZ]
  );

  return (
    <group position={[chortenX, baseY, chortenZ]}>
      {/* Dry-stone masonry retaining terrace embedded deeply into the hillside */}
      <mesh position={[0, -0.45, 0]}>
        <boxGeometry args={[2.3, 1.35, 2.3]} />
        <meshLambertMaterial color="#585f66" />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[1.65, 0.28, 1.65]} />
        <meshLambertMaterial color="#676e75" />
      </mesh>

      {/* Whitewashed plinth & rounded stupa dome */}
      <mesh position={[0, 0.66, 0]}>
        <boxGeometry args={[1.05, 0.38, 1.05]} />
        <meshLambertMaterial color="#ebe6dc" />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.38, 0.46, 0.45, 10]} />
        <meshLambertMaterial color="#f2ede4" />
      </mesh>

      {/* Square bronze/gold harmika */}
      <mesh position={[0, 1.36, 0]}>
        <boxGeometry args={[0.34, 0.22, 0.34]} />
        <meshStandardMaterial color="#d4a644" roughness={0.45} metalness={0.4} />
      </mesh>

      {/* Golden conical spire */}
      <mesh position={[0, 1.72, 0]}>
        <coneGeometry args={[0.2, 0.56, 8]} />
        <meshStandardMaterial color="#d4a644" roughness={0.38} metalness={0.5} />
      </mesh>

      {/* Tall wooden prayer-flag pole with vertical Lungta color cloth */}
      <mesh position={[0.92, 1.35, 0.3]}>
        <cylinderGeometry args={[0.018, 0.028, 2.7, 5]} />
        <meshLambertMaterial color="#4e3d2e" />
      </mesh>
      {[
        { dy: 2.35, c: "#34679a" },
        { dy: 2.08, c: "#ede8dc" },
        { dy: 1.81, c: "#b83c32" },
        { dy: 1.54, c: "#2a6b48" },
        { dy: 1.27, c: "#d6a334" },
      ].map((flag, i) => (
        <mesh key={i} position={[1.02, flag.dy, 0.3]} rotation={[0, 0.2, -0.06]}>
          <planeGeometry args={[0.18, 0.24]} />
          <meshLambertMaterial color={flag.c} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- Wire-mesh ribbon side geometry helper ---------- */
function buildMeshSideGeometry(
  bridgeZ: number,
  zOff: number,
  halfSpan: number,
  baseDeckY: number,
  deckSag: number,
  railHeight = 0.84,
  segments = 28
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = -halfSpan + t * (halfSpan * 2);
    const yBot = baseDeckY + 0.04 - deckSag * Math.sin(Math.PI * t);
    const yTop = yBot + railHeight;
    const zPos = bridgeZ + zOff;

    positions.push(x, yBot, zPos);
    positions.push(x, yTop, zPos);
    uvs.push(t, 0);
    uvs.push(t, 1);

    if (i < segments) {
      const idx = i * 2;
      indices.push(idx, idx + 1, idx + 2);
      indices.push(idx + 1, idx + 3, idx + 2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/* ---------- Authentic Nepali Galvanized Steel Suspension Bridge (HELVETAS / Hillary style) ---------- */
function SuspensionBridge({ compact }: { compact: boolean }) {
  const bridgeZ = -1.5;
  const halfSpan = 10.6;
  const deckHalfW = 0.46;
  const towerHeight = 2.85;
  const cableSag = 1.72;
  const deckSag = 0.34;
  const plankCount = compact ? 24 : 36;
  const hangerPairs = compact ? 10 : 16;
  const flagCount = compact ? 26 : 48;

  const flagRef = useRef<THREE.InstancedMesh>(null);
  const deckRef = useRef<THREE.InstancedMesh>(null);
  const hangerRef = useRef<THREE.InstancedMesh>(null);
  const flagElapsedRef = useRef(0);
  const flagThrottleRef = useRef(0);
  const frameDummy = useMemo(() => new THREE.Object3D(), []);

  const wireMeshTex = useMemo(() => makeWireMeshTexture(), []);

  const {
    deckY,
    leftFootY,
    rightFootY,
    mainCableGeos,
    handrailGeos,
    backStayGeos,
    windGuyGeos,
    meshSideGeos,
    crossBraceGeos,
    deckData,
    hangerData,
    flagSpecs,
    deckPanelGeo,
    hangerGeo,
    flagGeo,
  } = useMemo(() => {
    const lGround = sampleRidgeHeight(
      -halfSpan,
      bridgeZ - FRONT_RIDGE_SPEC.z,
      FRONT_RIDGE_SPEC
    ).y;
    const rGround = sampleRidgeHeight(
      halfSpan,
      bridgeZ - FRONT_RIDGE_SPEC.z,
      FRONT_RIDGE_SPEC
    ).y;
    const baseDeckY = Math.max(lGround, rGround, 1.55) + 0.16;
    const topY = baseDeckY + towerHeight;

    const zOffsets = [-deckHalfW, deckHalfW];

    const mainCables: THREE.TubeGeometry[] = [];
    const handrails: THREE.TubeGeometry[] = [];
    const backStays: THREE.TubeGeometry[] = [];
    const meshSides: THREE.BufferGeometry[] = [];

    for (const zOff of zOffsets) {
      const zPos = bridgeZ + zOff;
      const mainPts: THREE.Vector3[] = [];
      const railPts: THREE.Vector3[] = [];
      const lowerCurbPts: THREE.Vector3[] = [];

      const steps = compact ? 18 : 26;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = -halfSpan + t * (halfSpan * 2);
        const sag = Math.sin(Math.PI * t);
        mainPts.push(new THREE.Vector3(x, topY - cableSag * sag, zPos));
        railPts.push(new THREE.Vector3(x, baseDeckY + 0.88 - deckSag * sag, zPos));
        lowerCurbPts.push(new THREE.Vector3(x, baseDeckY + 0.05 - deckSag * sag, zPos));
      }

      mainCables.push(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(mainPts), compact ? 16 : 24, 0.038, compact ? 4 : 5, false)
      );
      handrails.push(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPts), compact ? 14 : 20, 0.02, 4, false),
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lowerCurbPts), compact ? 14 : 20, 0.022, 4, false)
      );

      if (!compact) {
        meshSides.push(
          buildMeshSideGeometry(bridgeZ, zOff, halfSpan, baseDeckY, deckSag, 0.84, 20)
        );
      }

      // Anchor back-stays embedded into stone hill shoulders
      const leftAnchorX = -halfSpan - 4.4;
      const leftAnchorY =
        sampleRidgeHeight(leftAnchorX, bridgeZ - FRONT_RIDGE_SPEC.z, FRONT_RIDGE_SPEC).y -
        0.15;
      backStays.push(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(-halfSpan, topY, zPos),
            new THREE.Vector3(leftAnchorX, leftAnchorY, zPos),
          ]),
          6,
          0.032,
          4,
          false
        )
      );

      const rightAnchorX = halfSpan + 4.4;
      const rightAnchorY =
        sampleRidgeHeight(rightAnchorX, bridgeZ - FRONT_RIDGE_SPEC.z, FRONT_RIDGE_SPEC).y -
        0.15;
      backStays.push(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(halfSpan, topY, zPos),
            new THREE.Vector3(rightAnchorX, rightAnchorY, zPos),
          ]),
          6,
          0.032,
          4,
          false
        )
      );
    }

    // Wind-guy lateral stabilizing steel cables from mid-span down to gorge rock walls (desktop only)
    const windGuys: THREE.TubeGeometry[] = compact
      ? []
      : [
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(-3.2, baseDeckY - deckSag * 0.85, bridgeZ - deckHalfW),
              new THREE.Vector3(-7.5, baseDeckY - 1.8, bridgeZ - 5.2),
            ]),
            6,
            0.016,
            4,
            false
          ),
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(3.2, baseDeckY - deckSag * 0.85, bridgeZ - deckHalfW),
              new THREE.Vector3(7.5, baseDeckY - 1.8, bridgeZ - 5.2),
            ]),
            6,
            0.016,
            4,
            false
          ),
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(-3.2, baseDeckY - deckSag * 0.85, bridgeZ + deckHalfW),
              new THREE.Vector3(-7.5, baseDeckY - 1.8, bridgeZ + 5.2),
            ]),
            6,
            0.016,
            4,
            false
          ),
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(3.2, baseDeckY - deckSag * 0.85, bridgeZ + deckHalfW),
              new THREE.Vector3(7.5, baseDeckY - 1.8, bridgeZ + 5.2),
            ]),
            6,
            0.016,
            4,
            false
          ),
        ];

    // X-cross bracing struts inside left and right steel portal towers (desktop only)
    const crossBraces: THREE.TubeGeometry[] = [];
    if (!compact) {
      for (const towerX of [-halfSpan, halfSpan]) {
        const yLow = baseDeckY + 1.05;
        const yHigh = topY - 0.12;
        crossBraces.push(
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(towerX, yLow, bridgeZ - deckHalfW),
              new THREE.Vector3(towerX, yHigh, bridgeZ + deckHalfW),
            ]),
            4,
            0.026,
            4,
            false
          ),
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(towerX, yHigh, bridgeZ - deckHalfW),
              new THREE.Vector3(towerX, yLow, bridgeZ + deckHalfW),
            ]),
            4,
            0.026,
            4,
            false
          )
        );
      }
    }

    // Corrugated galvanized steel walkway grating panels
    const decks: { pos: THREE.Vector3; rotZ: number }[] = [];
    for (let i = 0; i < plankCount; i++) {
      const t = (i + 0.5) / plankCount;
      const x = -halfSpan + t * (halfSpan * 2);
      const y = baseDeckY - deckSag * Math.sin(Math.PI * t);
      const dyDx = (-deckSag * Math.PI * Math.cos(Math.PI * t)) / (halfSpan * 2);
      decks.push({ pos: new THREE.Vector3(x, y, bridgeZ), rotZ: Math.atan(dyDx) });
    }

    // Vertical galvanized steel suspender rods
    const hangers: { pos: THREE.Vector3; height: number }[] = [];
    for (let i = 1; i <= hangerPairs; i++) {
      const t = i / (hangerPairs + 1);
      const x = -halfSpan + t * (halfSpan * 2);
      const sag = Math.sin(Math.PI * t);
      const cableY = topY - cableSag * sag;
      const dY = baseDeckY - deckSag * sag;
      const h = Math.max(0.25, cableY - dY);
      const midY = dY + h / 2;
      hangers.push({ pos: new THREE.Vector3(x, midY, bridgeZ - deckHalfW), height: h });
      hangers.push({ pos: new THREE.Vector3(x, midY, bridgeZ + deckHalfW), height: h });
    }

    // Traditional weathered Tibetan Lungta prayer flags along main cables & handrails
    const flagColors = [
      new THREE.Color("#34679a"),
      new THREE.Color("#ede8dc"),
      new THREE.Color("#b83c32"),
      new THREE.Color("#2a6b48"),
      new THREE.Color("#d6a334"),
    ];
    const flags: { x: number; y: number; z: number; color: THREE.Color; phase: number }[] = [];
    for (let i = 0; i < flagCount; i++) {
      const sideIdx = i % 2;
      const t = 0.06 + (Math.floor(i / 2) / Math.ceil(flagCount / 2)) * 0.88;
      const x = -halfSpan + t * (halfSpan * 2);
      const z = bridgeZ + (sideIdx === 0 ? -deckHalfW : deckHalfW);
      const cableY = topY - cableSag * Math.sin(Math.PI * t);
      flags.push({
        x,
        y: cableY - 0.1,
        z,
        color: flagColors[i % flagColors.length]!,
        phase: i * 0.52,
      });
    }

    return {
      deckY: baseDeckY,
      leftFootY: Math.min(lGround - 1.2, baseDeckY - 2.3),
      rightFootY: Math.min(rGround - 1.2, baseDeckY - 2.3),
      mainCableGeos: mainCables,
      handrailGeos: handrails,
      backStayGeos: backStays,
      windGuyGeos: windGuys,
      meshSideGeos: meshSides,
      crossBraceGeos: crossBraces,
      deckData: decks,
      hangerData: hangers,
      flagSpecs: flags,
      deckPanelGeo: new THREE.BoxGeometry(0.56, 0.045, deckHalfW * 2 + 0.04),
      hangerGeo: new THREE.CylinderGeometry(0.013, 0.013, 1, 4),
      flagGeo: new THREE.PlaneGeometry(0.21, 0.15),
    };
  }, [bridgeZ, compact, plankCount, hangerPairs, flagCount]);

  useEffect(() => {
    const dMesh = deckRef.current;
    const hMesh = hangerRef.current;
    const fMesh = flagRef.current;
    const dummy = new THREE.Object3D();

    if (dMesh) {
      deckData.forEach((p, i) => {
        dummy.position.copy(p.pos);
        dummy.rotation.set(0, 0, p.rotZ);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        dMesh.setMatrixAt(i, dummy.matrix);
      });
      dMesh.instanceMatrix.needsUpdate = true;
    }

    if (hMesh) {
      hangerData.forEach((h, i) => {
        dummy.position.copy(h.pos);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, h.height, 1);
        dummy.updateMatrix();
        hMesh.setMatrixAt(i, dummy.matrix);
      });
      hMesh.instanceMatrix.needsUpdate = true;
    }

    if (fMesh) {
      flagSpecs.forEach((f, i) => {
        dummy.position.set(f.x, f.y, f.z);
        dummy.rotation.set(0.18, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        fMesh.setMatrixAt(i, dummy.matrix);
        fMesh.setColorAt(i, f.color);
      });
      fMesh.instanceMatrix.needsUpdate = true;
      if (fMesh.instanceColor) fMesh.instanceColor.needsUpdate = true;
    }
  }, [deckData, hangerData, flagSpecs]);

  useFrame((_, rawDelta) => {
    const fMesh = flagRef.current;
    if (!fMesh || !heroState.inView || heroState.reducedMotion) return;
    const dt = Math.min(rawDelta, 0.05);
    flagElapsedRef.current += dt;
    flagThrottleRef.current += dt;
    const minStep = compact ? 0.1 : 0.06;
    if (flagThrottleRef.current < minStep) return;
    flagThrottleRef.current = 0;

    const t = flagElapsedRef.current;
    for (let i = 0; i < flagSpecs.length; i++) {
      const f = flagSpecs[i]!;
      const flutter = Math.sin(t * 2.8 + f.phase) * 0.26;
      frameDummy.position.set(f.x, f.y, f.z);
      frameDummy.rotation.set(0.18 + flutter, flutter * 0.25, 0);
      frameDummy.scale.set(1, 1, 1);
      frameDummy.updateMatrix();
      fMesh.setMatrixAt(i, frameDummy.matrix);
    }
    fMesh.instanceMatrix.needsUpdate = true;
  });

  const bridgeMats = useMemo(() => {
    const makeMetal = (color: string, roughness: number, metalness: number) =>
      compact
        ? new THREE.MeshLambertMaterial({ color })
        : new THREE.MeshStandardMaterial({ color, roughness, metalness });

    return {
      steelMat: makeMetal("#8f9ca6", 0.35, 0.68),
      steelDarkMat: makeMetal("#828f99", 0.38, 0.65),
      stoneMat: new THREE.MeshLambertMaterial({ color: "#5c6268" }),
      cableMat: makeMetal("#6e7c86", 0.4, 0.72),
      handrailMat: makeMetal("#7d8b95", 0.42, 0.65),
      backStayMat: makeMetal("#6a7882", 0.4, 0.7),
      windGuyMat: makeMetal("#5d6a74", 0.45, 0.6),
      meshSideMat: compact
        ? null
        : new THREE.MeshStandardMaterial({
            map: wireMeshTex,
            transparent: true,
            alphaTest: 0.12,
            side: THREE.DoubleSide,
            roughness: 0.45,
            metalness: 0.55,
          }),
      deckMat: makeMetal("#7b8690", 0.45, 0.58),
      hangerMat: makeMetal("#7d8a94", 0.4, 0.65),
      flagMat: new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }),
    };
  }, [wireMeshTex, compact]);

  useEffect(() => {
    return () => {
      wireMeshTex.dispose();
      mainCableGeos.forEach((g) => g.dispose());
      handrailGeos.forEach((g) => g.dispose());
      backStayGeos.forEach((g) => g.dispose());
      windGuyGeos.forEach((g) => g.dispose());
      meshSideGeos.forEach((g) => g.dispose());
      crossBraceGeos.forEach((g) => g.dispose());
      deckPanelGeo.dispose();
      hangerGeo.dispose();
      flagGeo.dispose();
      Object.values(bridgeMats).forEach((m) => m?.dispose());
    };
  }, [
    wireMeshTex,
    mainCableGeos,
    handrailGeos,
    backStayGeos,
    windGuyGeos,
    meshSideGeos,
    crossBraceGeos,
    deckPanelGeo,
    hangerGeo,
    flagGeo,
    bridgeMats,
  ]);

  const leftTowerPierH = deckY + towerHeight - leftFootY;
  const rightTowerPierH = deckY + towerHeight - rightFootY;
  const leftTowerCenterY = leftFootY + leftTowerPierH / 2;
  const rightTowerCenterY = rightFootY + rightTowerPierH / 2;

  return (
    <group>
      {/* Galvanized Steel Portal Tower Columns */}
      {[-deckHalfW, deckHalfW].map((zOff) => (
        <group key={`col-${zOff}`}>
          <mesh
            position={[-halfSpan, leftTowerCenterY, bridgeZ + zOff]}
            material={bridgeMats.steelMat}
          >
            <boxGeometry args={[0.16, leftTowerPierH, 0.16]} />
          </mesh>
          <mesh
            position={[halfSpan, rightTowerCenterY, bridgeZ + zOff]}
            material={bridgeMats.steelMat}
          >
            <boxGeometry args={[0.16, rightTowerPierH, 0.16]} />
          </mesh>
        </group>
      ))}

      {/* Portal Header Beams + Mid Crossbar + X-Bracing */}
      <mesh position={[-halfSpan, deckY + towerHeight - 0.1, bridgeZ]} material={bridgeMats.steelMat}>
        <boxGeometry args={[0.18, 0.14, deckHalfW * 2 + 0.24]} />
      </mesh>
      <mesh position={[halfSpan, deckY + towerHeight - 0.1, bridgeZ]} material={bridgeMats.steelMat}>
        <boxGeometry args={[0.18, 0.14, deckHalfW * 2 + 0.24]} />
      </mesh>
      <mesh position={[-halfSpan, deckY + 1.05, bridgeZ]} material={bridgeMats.steelDarkMat}>
        <boxGeometry args={[0.12, 0.1, deckHalfW * 2 + 0.14]} />
      </mesh>
      <mesh position={[halfSpan, deckY + 1.05, bridgeZ]} material={bridgeMats.steelDarkMat}>
        <boxGeometry args={[0.12, 0.1, deckHalfW * 2 + 0.14]} />
      </mesh>
      {!compact &&
        crossBraceGeos.map((geo, idx) => (
          <mesh key={`xb-${idx}`} geometry={geo} material={bridgeMats.steelDarkMat} />
        ))}

      {/* Stone-Masonry Pier Abutments */}
      <mesh position={[-halfSpan - 0.4, deckY - 0.6, bridgeZ]} material={bridgeMats.stoneMat}>
        <boxGeometry args={[1.45, 1.5, 1.55]} />
      </mesh>
      <mesh position={[halfSpan + 0.4, deckY - 0.6, bridgeZ]} material={bridgeMats.stoneMat}>
        <boxGeometry args={[1.45, 1.5, 1.55]} />
      </mesh>

      {/* Main Steel Cables, Handrails, Back-stays & Wind Guys */}
      {mainCableGeos.map((geo, idx) => (
        <mesh key={`mc-${idx}`} geometry={geo} material={bridgeMats.cableMat} />
      ))}
      {handrailGeos.map((geo, idx) => (
        <mesh key={`hr-${idx}`} geometry={geo} material={bridgeMats.handrailMat} />
      ))}
      {backStayGeos.map((geo, idx) => (
        <mesh key={`bs-${idx}`} geometry={geo} material={bridgeMats.backStayMat} />
      ))}
      {!compact &&
        windGuyGeos.map((geo, idx) => (
          <mesh key={`wg-${idx}`} geometry={geo} material={bridgeMats.windGuyMat} />
        ))}

      {/* Galvanized Wire-Mesh Safety Sides */}
      {!compact &&
        bridgeMats.meshSideMat &&
        meshSideGeos.map((geo, idx) => (
          <mesh key={`ms-${idx}`} geometry={geo} material={bridgeMats.meshSideMat!} />
        ))}

      {/* Corrugated Galvanized Steel Walkway Deck & Vertical Suspender Rods */}
      <instancedMesh
        ref={deckRef}
        args={[deckPanelGeo, bridgeMats.deckMat, deckData.length]}
      />
      <instancedMesh
        ref={hangerRef}
        args={[hangerGeo, bridgeMats.hangerMat, hangerData.length]}
      />

      {/* Prayer Flags (Lungta) */}
      <instancedMesh
        ref={flagRef}
        args={[flagGeo, bridgeMats.flagMat, flagSpecs.length]}
      />
    </group>
  );
}

/* ---------- procedural cloud & crystal textures ---------- */
function makeCloudTexture(seed: number) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const rand = mulberry32(seed);
  for (let i = 0; i < 12; i++) {
    const x = size * (0.2 + rand() * 0.6);
    const y = size * (0.38 + rand() * 0.28);
    const r = size * (0.1 + rand() * 0.2);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.42)");
    g.addColorStop(0.5, "rgba(255,255,255,0.16)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeDotTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.78)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------- valley mist clouds ---------- */
type CloudSpec = {
  x: number;
  y: number;
  z: number;
  s: number;
  o: number;
  speed: number;
  rot: number;
  tex: number;
};

function buildClouds(count: number): CloudSpec[] {
  const rand = mulberry32(42);
  const list: CloudSpec[] = [];
  const farCount = Math.max(2, Math.round(count * 0.7));
  const nearCount = Math.max(1, count - farCount);

  for (let i = 0; i < farCount; i++) {
    list.push({
      x: (rand() - 0.5) * 96,
      y: -2.2 + rand() * 3.8,
      z: -72 + rand() * 64,
      s: (12 + rand() * 16) * 1.22,
      o: 0.34 + rand() * 0.36,
      speed: 0.14 + rand() * 0.28,
      rot: (rand() - 0.5) * 0.3,
      tex: i % 2,
    });
  }
  for (let i = 0; i < nearCount; i++) {
    list.push({
      x: (rand() - 0.5) * 20,
      y: -0.4 + rand() * 4.0,
      z: -30 + rand() * 14,
      s: (8.5 + rand() * 9) * 1.22,
      o: 0.48 + rand() * 0.3,
      speed: 0.1 + rand() * 0.18,
      rot: rand() * Math.PI * 2,
      tex: i % 2,
    });
  }
  return list;
}

function Clouds({ compact }: { compact: boolean }) {
  const textures = useMemo(() => [makeCloudTexture(1), makeCloudTexture(7)], []);
  const specs = useMemo(() => buildClouds(compact ? 3 : 10), [compact]);
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  const camera = useThree((s) => s.camera);

  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  useFrame((_, rawDelta) => {
    if (!heroState.inView) return;
    const dt = Math.min(rawDelta, 0.05);
    for (let i = 0; i < specs.length; i++) {
      const c = specs[i]!;
      const sprite = refs.current[i];
      if (!sprite) continue;
      if (!heroState.reducedMotion) {
        sprite.position.x += c.speed * dt;
        if (sprite.position.x > 55) sprite.position.x -= 110;
      }
      const dSq = sprite.position.distanceToSquared(camera.position);
      const mat = sprite.material as THREE.SpriteMaterial;
      mat.opacity = c.o * smoothstep(0.36, 25, dSq);
    }
  });

  return (
    <group>
      {specs.map((c, i) => (
        <sprite
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[c.x, c.y, c.z]}
          scale={[c.s, c.s * 0.55, 1]}
        >
          <spriteMaterial
            map={textures[c.tex] ?? null}
            transparent
            depthWrite={false}
            opacity={c.o}
            rotation={c.rot}
            color="#f5f3ee"
            fog
          />
        </sprite>
      ))}
    </group>
  );
}

/* ---------- high-altitude GPU-driven 2-layer 3D falling snowfall ---------- */
const SNOW_VERT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uXSpan;
  uniform float uYMin;
  uniform float uYMax;
  uniform float uBreeze;
  uniform float uSize;
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aFreq;
  attribute float aDrift;

  void main() {
    float yRange = uYMax - uYMin;
    float yPos = uYMin + mod(position.y - uTime * aSpeed - uYMin, yRange);
    float xRange = uXSpan * 2.0;
    float rawX = position.x + uBreeze * uTime + sin(uTime * aFreq + aPhase) * aDrift;
    float xPos = -uXSpan + mod(rawX + uXSpan, xRange);

    vec4 mvPosition = modelViewMatrix * vec4(xPos, yPos, position.z, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = min(14.0, uSize * (300.0 / max(1.0, -mvPosition.z)));
  }
`;

const SNOW_FRAG_SHADER = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    float alpha = tex.a * uOpacity;
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(uColor * tex.rgb, alpha);
  }
`;

function buildSnowGeometry(
  count: number,
  seed: number,
  xSpan: number,
  yMin: number,
  yMax: number,
  zMin: number,
  zMax: number,
  vyBase: number,
  vySpread: number,
  driftBase: number
): THREE.BufferGeometry {
  const rand = mulberry32(seed);
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const phases = new Float32Array(count);
  const freqs = new Float32Array(count);
  const drifts = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rand() - 0.5) * xSpan * 2;
    positions[i * 3 + 1] = yMin + rand() * (yMax - yMin);
    positions[i * 3 + 2] = zMin + rand() * (zMax - zMin);
    speeds[i] = vyBase + rand() * vySpread;
    phases[i] = rand() * Math.PI * 2;
    freqs[i] = 0.9 + rand() * 1.3;
    drifts[i] = driftBase * (0.6 + rand() * 0.8);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geo.setAttribute("aFreq", new THREE.BufferAttribute(freqs, 1));
  geo.setAttribute("aDrift", new THREE.BufferAttribute(drifts, 1));
  return geo;
}

function makeSnowShaderArgs(
  dot: THREE.CanvasTexture,
  colorHex: string,
  opacity: number,
  size: number,
  xSpan: number,
  yMin: number,
  yMax: number,
  breeze: number
) {
  return {
    uniforms: {
      uTime: { value: 0 },
      uXSpan: { value: xSpan },
      uYMin: { value: yMin },
      uYMax: { value: yMax },
      uBreeze: { value: breeze },
      uSize: { value: size },
      uMap: { value: dot },
      uColor: { value: new THREE.Color(colorHex) },
      uOpacity: { value: opacity },
    },
    vertexShader: SNOW_VERT_SHADER,
    fragmentShader: SNOW_FRAG_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  };
}

function Particles({ compact }: { compact: boolean }) {
  const timeRef = useRef(0);
  const nearMatRef = useRef<THREE.ShaderMaterial>(null);
  const farMatRef = useRef<THREE.ShaderMaterial>(null);
  const dot = useMemo(() => makeDotTexture(), []);

  const nearCount = compact ? 240 : 520;
  const farCount = compact ? 0 : 340;

  const { nearGeo, farGeo, nearArgs, farArgs } = useMemo(() => {
    const nGeo = buildSnowGeometry(nearCount, 99, 26, -3.5, 14.5, -26, 20, 1.35, 1.15, 0.55);
    const nArgs = makeSnowShaderArgs(dot, "#ffffff", 0.88, 0.22, 26, -3.5, 14.5, 0.28);
    if (farCount === 0) {
      return { nearGeo: nGeo, farGeo: null, nearArgs: nArgs, farArgs: null };
    }
    const fGeo = buildSnowGeometry(farCount, 313, 36, -2.5, 16.5, -48, -12, 0.85, 0.75, 0.4);
    const fArgs = makeSnowShaderArgs(dot, "#edf5ff", 0.62, 0.15, 36, -2.5, 16.5, 0.2);
    return { nearGeo: nGeo, farGeo: fGeo, nearArgs: nArgs, farArgs: fArgs };
  }, [dot, nearCount, farCount]);

  useEffect(() => {
    return () => {
      nearGeo.dispose();
      farGeo?.dispose();
    };
  }, [nearGeo, farGeo]);

  useEffect(() => () => dot.dispose(), [dot]);

  useFrame((_, rawDelta) => {
    if (!heroState.inView || heroState.reducedMotion) return;
    const dt = Math.min(rawDelta, 0.05);
    timeRef.current += dt;
    const t = timeRef.current;
    if (nearMatRef.current) {
      nearMatRef.current.uniforms["uTime"]!.value = t;
    }
    if (!compact && farMatRef.current) {
      farMatRef.current.uniforms["uTime"]!.value = t;
    }
  });

  return (
    <group>
      <points geometry={nearGeo} frustumCulled={false}>
        <shaderMaterial ref={nearMatRef} args={[nearArgs]} />
      </points>
      {!compact && farGeo && farArgs && (
        <points geometry={farGeo} frustumCulled={false}>
          <shaderMaterial ref={farMatRef} args={[farArgs]} />
        </points>
      )}
    </group>
  );
}

/* ---------- camera flight & responsive FOV ---------- */
function CameraRig() {
  const smooth = useRef({ mx: 0, my: 0, p: 0 });
  const elapsedRef = useRef(0);
  const lastAspectBucketRef = useRef(-1);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, rawDelta) => {
    const persp = state.camera as THREE.PerspectiveCamera;
    if ("fov" in persp) {
      const aspect = state.size.width / Math.max(1, state.size.height);
      const bucket = aspect < 0.85 ? 0 : aspect < 1.15 ? 1 : 2;
      if (bucket !== lastAspectBucketRef.current) {
        lastAspectBucketRef.current = bucket;
        const nextFov = bucket === 0 ? 64 : bucket === 1 ? 56 : 50;
        if (persp.fov !== nextFov) {
          persp.fov = nextFov;
          persp.updateProjectionMatrix();
        }
      }
    }

    if (!heroState.inView) return;
    const dt = Math.min(rawDelta, 0.05);
    elapsedRef.current += dt;
    const cam = state.camera;
    const s = smooth.current;
    const k = 1 - Math.exp(-MOUSE_DAMP * dt);
    s.mx += (heroState.mouseX - s.mx) * k;
    s.my += (heroState.mouseY - s.my) * k;
    s.p += (heroState.progress - s.p) * (1 - Math.exp(-6 * dt));

    const t = heroState.reducedMotion ? 0 : elapsedRef.current;
    const fly = 1 - Math.pow(1 - s.p, 1.6);

    cam.position.set(
      CAM_START.x + Math.sin(t * 0.07) * 0.9 + s.mx * MOUSE_SHIFT_X,
      CAM_START.y +
        Math.sin(t * 0.11) * 0.25 +
        s.my * MOUSE_SHIFT_Y +
        Math.sin(s.p * Math.PI) * 1.4 -
        s.p * 0.9,
      CAM_START.z - fly * FLY_DISTANCE - Math.sin(t * 0.05) * 0.6
    );
    lookTarget.set(s.mx * 3.5, 4.9 + s.my * 1.4 - s.p * 2.8, cam.position.z - 60);
    cam.lookAt(lookTarget);
    cam.rotateZ(-s.mx * ROLL + Math.sin(t * 0.09) * 0.005);
  });

  return null;
}

function ReadySignal({ onReady }: { onReady?: () => void }) {
  const frames = useRef(0);
  const gl = useThree((s) => s.gl);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 1) {
      gl.domElement.closest("[data-scene]")?.setAttribute("data-scene-ready", "true");
      onReady?.();
    }
  });
  return null;
}

/* ---------- glacial Dudh Koshi river underneath the bridge ---------- */
function makeRiverTextures() {
  const w = 128;
  const h = 256;

  const waterCanvas = document.createElement("canvas");
  waterCanvas.width = w;
  waterCanvas.height = h;
  const wCtx = waterCanvas.getContext("2d")!;

  const foamCanvas = document.createElement("canvas");
  foamCanvas.width = w;
  foamCanvas.height = h;
  const fCtx = foamCanvas.getContext("2d")!;

  // Cross-stream glacial mineral base (darker channel banks, milky turquoise current center)
  const baseGrad = wCtx.createLinearGradient(0, 0, w, 0);
  baseGrad.addColorStop(0, "#1c424d");
  baseGrad.addColorStop(0.18, "#2a5e6b");
  baseGrad.addColorStop(0.5, "#4b8996");
  baseGrad.addColorStop(0.82, "#2a5e6b");
  baseGrad.addColorStop(1, "#1c424d");
  wCtx.fillStyle = baseGrad;
  wCtx.fillRect(0, 0, w, h);

  // Seamless vertical glacial current ribbons (periodic over H)
  const rand = mulberry32(909);
  for (let i = 0; i < 16; i++) {
    const baseX = (0.08 + rand() * 0.84) * w;
    const amp = 2 + rand() * 7;
    const cycles = 1 + Math.floor(rand() * 3);
    const phase = rand() * Math.PI * 2;
    const lineW = 1.5 + rand() * 7;
    const tonePick = rand();
    wCtx.strokeStyle =
      tonePick > 0.66
        ? "rgba(122, 177, 186, 0.42)"
        : tonePick > 0.3
          ? "rgba(75, 137, 150, 0.48)"
          : "rgba(30, 74, 86, 0.44)";
    wCtx.lineWidth = lineW;
    wCtx.lineCap = "round";
    wCtx.beginPath();
    for (let y = 0; y <= h; y += 8) {
      const px = baseX + Math.sin((y / h) * Math.PI * 2 * cycles + phase) * amp;
      if (y === 0) wCtx.moveTo(px, y);
      else wCtx.lineTo(px, y);
    }
    wCtx.stroke();
  }

  // Wrapped turbulent whitewater streaks baked into water surface
  wCtx.lineCap = "round";
  for (let i = 0; i < 100; i++) {
    const sx = (0.1 + rand() * 0.8) * w;
    const sy = rand() * h;
    const len = 8 + rand() * 24;
    const drift = (rand() - 0.5) * 8;
    const alpha = 0.14 + rand() * 0.34;
    wCtx.strokeStyle =
      rand() > 0.45 ? `rgba(224, 244, 247, ${alpha})` : `rgba(122, 177, 186, ${alpha})`;
    wCtx.lineWidth = 0.8 + rand() * 1.8;
    for (const oy of [0, -h, h]) {
      wCtx.beginPath();
      wCtx.moveTo(sx, sy + oy);
      wCtx.quadraticCurveTo(sx + drift * 0.6, sy + oy + len * 0.5, sx + drift, sy + oy + len);
      wCtx.stroke();
    }
  }

  // Translucent fast-moving whitewater foam froth overlay
  fCtx.lineCap = "round";
  for (let i = 0; i < 140; i++) {
    // Concentrate whitewater froth along central rapids and rock wakes
    const uSpread = (rand() + rand()) * 0.5;
    const sx = (0.08 + uSpread * 0.84) * w;
    const sy = rand() * h;
    const len = 6 + rand() * 22;
    const drift = (rand() - 0.5) * 10;
    const alpha = 0.18 + rand() * 0.58;
    fCtx.strokeStyle =
      rand() > 0.28 ? `rgba(244, 251, 255, ${alpha})` : `rgba(204, 235, 241, ${alpha})`;
    fCtx.lineWidth = 0.8 + rand() * 2;
    for (const oy of [0, -h, h]) {
      fCtx.beginPath();
      fCtx.moveTo(sx, sy + oy);
      fCtx.quadraticCurveTo(sx - drift * 0.5, sy + oy + len * 0.45, sx + drift, sy + oy + len);
      fCtx.stroke();
    }
  }

  // Extra bubbly foam crests wrapped across seam
  for (let i = 0; i < 80; i++) {
    const sx = (0.12 + rand() * 0.76) * w;
    const sy = rand() * h;
    const rx = 1 + rand() * 4;
    const ry = 1.5 + rand() * 6;
    const alpha = 0.16 + rand() * 0.42;
    fCtx.fillStyle = `rgba(245, 252, 255, ${alpha})`;
    for (const oy of [0, -h, h]) {
      fCtx.beginPath();
      fCtx.ellipse(sx, sy + oy, rx, ry, (rand() - 0.5) * 0.4, 0, Math.PI * 2);
      fCtx.fill();
    }
  }

  const waterMap = new THREE.CanvasTexture(waterCanvas);
  waterMap.colorSpace = THREE.SRGBColorSpace;
  waterMap.wrapS = THREE.RepeatWrapping;
  waterMap.wrapT = THREE.RepeatWrapping;
  waterMap.repeat.set(1.6, 12);

  const foamMap = new THREE.CanvasTexture(foamCanvas);
  foamMap.colorSpace = THREE.SRGBColorSpace;
  foamMap.wrapS = THREE.RepeatWrapping;
  foamMap.wrapT = THREE.RepeatWrapping;
  foamMap.repeat.set(1.2, 16);

  return { waterMap, foamMap };
}

function buildRiverRibbonGeometry(compact: boolean) {
  const zMin = -38;
  const zMax = 18;
  const segZ = compact ? 40 : 84;
  const segX = compact ? 2 : 4;
  const cols = segX + 1;
  const rows = segZ + 1;

  const positions = new Float32Array(rows * cols * 3);
  const uvs = new Float32Array(rows * cols * 2);
  const indices: number[] = [];

  for (let iz = 0; iz <= segZ; iz++) {
    const t = iz / segZ;
    const zw = zMin + t * (zMax - zMin);
    const rx = riverCenterX(zw);
    const ry = riverSurfaceY(zw);
    // Taper seamlessly into the deep mountain canyon so the river never has an abrupt cut edge
    const farTaper = smoothstep(zMin, zMin + 14, zw);
    const nearTaper = smoothstep(zMax, zMax - 4, zw);
    const halfW = (2.8 + 0.45 * Math.sin(zw * 0.18)) * (0.05 + 0.95 * farTaper) * (0.1 + 0.9 * nearTaper);

    for (let ix = 0; ix <= segX; ix++) {
      const u = ix / segX;
      const offsetFrac = (u - 0.5) * 2;
      const vx = rx + offsetFrac * halfW;
      // Slight arched center rapid swell
      const swell = (1 - offsetFrac * offsetFrac) * (0.045 + 0.025 * Math.sin(zw * 0.9)) * farTaper;
      const idx = iz * cols + ix;

      positions[idx * 3] = vx;
      positions[idx * 3 + 1] = ry + swell;
      positions[idx * 3 + 2] = zw;

      uvs[idx * 2] = u;
      uvs[idx * 2 + 1] = t;
    }
  }

  for (let iz = 0; iz < segZ; iz++) {
    for (let ix = 0; ix < segX; ix++) {
      const a = iz * cols + ix;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function buildAngularBoulderGeometry() {
  const geo = new THREE.IcosahedronGeometry(0.38, 1);
  const pos = geo.attributes["position"] as THREE.BufferAttribute;
  const rand = mulberry32(707);
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const scale = 0.82 + 0.36 * rand();
    pos.setXYZ(i, vx * scale, vy * (0.64 + 0.28 * rand()), vz * scale);
  }
  geo.computeVertexNormals();
  return geo;
}

function GlacialRiver({ compact }: { compact: boolean }) {
  const bankBoulderRef = useRef<THREE.InstancedMesh>(null);
  const rapidBoulderRef = useRef<THREE.InstancedMesh>(null);
  const waterMatRef = useRef<THREE.MeshLambertMaterial | THREE.MeshStandardMaterial>(null);
  const foamMatRef = useRef<THREE.MeshLambertMaterial>(null);

  const { waterMap, foamMap } = useMemo(() => makeRiverTextures(), []);
  const riverGeo = useMemo(() => buildRiverRibbonGeometry(compact), [compact]);
  const boulderGeo = useMemo(() => buildAngularBoulderGeometry(), []);

  const maxBankRocks = compact ? 18 : 48;
  const maxRapidRocks = compact ? 6 : 10;

  const { bankRocks, rapidRocks } = useMemo(() => {
    const rand = mulberry32(314);
    type RockInstance = {
      x: number;
      y: number;
      z: number;
      sx: number;
      sy: number;
      sz: number;
      rx: number;
      ry: number;
      rz: number;
      color: THREE.Color;
    };

    const bankPalette = [
      new THREE.Color("#262f37"),
      new THREE.Color("#37424c"),
      new THREE.Color("#1f272e"),
      new THREE.Color("#49535c"),
    ];

    const bankRocks: RockInstance[] = [];
    for (let i = 0; i < 110 && bankRocks.length < maxBankRocks; i++) {
      const bz = -31 + rand() * 44;
      const side = i % 2 === 0 ? -1 : 1;
      const dist = 1.7 + rand() * 1.7;
      const bx = riverCenterX(bz) + side * dist;
      const surfY = riverSurfaceY(bz);
      const terrainY = sampleRidgeHeight(bx, bz - FRONT_RIDGE_SPEC.z, FRONT_RIDGE_SPEC).y;
      if (terrainY < surfY - 0.9 || terrainY > surfY + 1.8) continue;

      const baseScale = 0.48 + rand() * 0.95;
      const sy = baseScale * (0.55 + rand() * 0.45);
      bankRocks.push({
        x: bx,
        y: Math.max(terrainY, surfY - 0.18) + sy * 0.14,
        z: bz,
        sx: baseScale * (0.9 + rand() * 0.55),
        sy,
        sz: baseScale * (0.9 + rand() * 0.55),
        rx: (rand() - 0.5) * 0.6,
        ry: rand() * Math.PI * 2,
        rz: (rand() - 0.5) * 0.6,
        color: bankPalette[Math.floor(rand() * bankPalette.length)]!,
      });
    }

    const rapidRocks: RockInstance[] = [];
    for (let i = 0; i < maxRapidRocks; i++) {
      const bz = -24 + i * (37 / maxRapidRocks) + (rand() - 0.5) * 1.4;
      const bx = riverCenterX(bz) + (rand() - 0.5) * 1.8;
      const surfY = riverSurfaceY(bz);
      const baseScale = 0.52 + rand() * 0.72;
      rapidRocks.push({
        x: bx,
        y: surfY - 0.04 + baseScale * 0.08,
        z: bz,
        sx: baseScale * (1.0 + rand() * 0.45),
        sy: baseScale * (0.52 + rand() * 0.35),
        sz: baseScale * (0.95 + rand() * 0.45),
        rx: (rand() - 0.5) * 0.4,
        ry: rand() * Math.PI * 2,
        rz: (rand() - 0.5) * 0.4,
        color: bankPalette[i % 2 === 0 ? 0 : 2]!,
      });
    }

    return { bankRocks, rapidRocks };
  }, [maxBankRocks, maxRapidRocks]);

  useEffect(() => {
    const dummy = new THREE.Object3D();

    if (bankBoulderRef.current) {
      bankRocks.forEach((b, i) => {
        dummy.position.set(b.x, b.y, b.z);
        dummy.rotation.set(b.rx, b.ry, b.rz);
        dummy.scale.set(b.sx, b.sy, b.sz);
        dummy.updateMatrix();
        bankBoulderRef.current!.setMatrixAt(i, dummy.matrix);
        bankBoulderRef.current!.setColorAt(i, b.color);
      });
      bankBoulderRef.current.instanceMatrix.needsUpdate = true;
      if (bankBoulderRef.current.instanceColor) {
        bankBoulderRef.current.instanceColor.needsUpdate = true;
      }
    }

    if (rapidBoulderRef.current) {
      rapidRocks.forEach((b, i) => {
        dummy.position.set(b.x, b.y, b.z);
        dummy.rotation.set(b.rx, b.ry, b.rz);
        dummy.scale.set(b.sx, b.sy, b.sz);
        dummy.updateMatrix();
        rapidBoulderRef.current!.setMatrixAt(i, dummy.matrix);
        rapidBoulderRef.current!.setColorAt(i, b.color);
      });
      rapidBoulderRef.current.instanceMatrix.needsUpdate = true;
      if (rapidBoulderRef.current.instanceColor) {
        rapidBoulderRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [bankRocks, rapidRocks]);

  useEffect(() => {
    return () => {
      waterMap.dispose();
      foamMap.dispose();
      riverGeo.dispose();
      boulderGeo.dispose();
    };
  }, [waterMap, foamMap, riverGeo, boulderGeo]);

  useFrame((_, dt) => {
    if (!heroState.inView || heroState.reducedMotion) return;
    const step = Math.min(dt, 0.05);
    const wMap = waterMatRef.current?.map;
    if (wMap) {
      wMap.offset.y = (wMap.offset.y - step * 0.48) % 1;
    }
    const fMap = foamMatRef.current?.map;
    if (fMap) {
      fMap.offset.y = (fMap.offset.y - step * 0.88) % 1;
    }
  });

  return (
    <group>
      {/* Flowing glacial Dudh Koshi water ribbon */}
      <mesh geometry={riverGeo}>
        {compact ? (
          <meshLambertMaterial ref={waterMatRef} map={waterMap} color="#d5eef2" />
        ) : (
          <meshStandardMaterial
            ref={waterMatRef}
            map={waterMap}
            color="#d5eef2"
            roughness={0.22}
            metalness={0.14}
          />
        )}
      </mesh>

      {/* Faster scrolling whitewater foam & rapids overlay (desktop only) */}
      {!compact && (
        <mesh geometry={riverGeo} position={[0, 0.04, 0]}>
          <meshLambertMaterial
            ref={foamMatRef}
            map={foamMap}
            color="#f4fbff"
            transparent
            opacity={0.82}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Wet dark riverbank boulders */}
      {bankRocks.length > 0 && (
        <instancedMesh ref={bankBoulderRef} args={[boulderGeo, undefined, bankRocks.length]}>
          <meshLambertMaterial />
        </instancedMesh>
      )}

      {/* Mid-stream whitewater rapids boulders */}
      {rapidRocks.length > 0 && (
        <instancedMesh ref={rapidBoulderRef} args={[boulderGeo, undefined, rapidRocks.length]}>
          <meshLambertMaterial />
        </instancedMesh>
      )}
    </group>
  );
}

function KhumbuLandscape({ compact }: { compact: boolean }) {
  const { map, bumpMap } = useMemo(() => makeTerrainDetailTextures(!compact), [compact]);

  useEffect(() => {
    return () => {
      map.dispose();
      bumpMap?.dispose();
    };
  }, [map, bumpMap]);

  return (
    <>
      {/* Back Alpine Glacial Peaks */}
      <Ridge
        {...BACK_RIDGE_SPEC}
        snowLine={0.26}
        segX={compact ? 28 : 56}
        segZ={compact ? 10 : 20}
        terrainStyle="alpine"
        detailMap={map}
      />

      {/* Front Khumbu Terrain: Snow-Covered Winter Ridge, Exposed Granite, Glacial River, Frosted Pines, Chorten & Steel Bridge */}
      <Ridge
        {...FRONT_RIDGE_SPEC}
        snowLine={0.12}
        segX={compact ? 36 : 76}
        segZ={compact ? 20 : 40}
        terrainStyle="foothill"
        detailMap={map}
        bumpMap={compact ? null : bumpMap}
      />
      <GlacialRiver compact={compact} />
      <HillsideDetails compact={compact} />
      <KhumbuChorten />
      <SuspensionBridge compact={compact} />
    </>
  );
}

export default function HeroScene({
  active = true,
  compact = false,
  onReady,
}: {
  active?: boolean;
  compact?: boolean;
  onReady?: () => void;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={compact ? 0.78 : [1, 1.25]}
      gl={{ alpha: true, antialias: false, stencil: false, powerPreference: "high-performance" }}
      camera={{ fov: compact ? 64 : 50, near: 0.1, far: 320, position: CAM_START.toArray() }}
      style={{ background: "transparent" }}
    >
      <fog attach="fog" args={[FOG_COLOR, 18, 108]} />
      <hemisphereLight args={["#e4f0ff", "#5d7690", compact ? 1.35 : 1.18]} />
      <directionalLight position={[-28, 26, -6]} intensity={2.15} color="#fff7ec" />
      {!compact && <directionalLight position={[18, 12, -70]} intensity={1.15} color="#dcebfa" />}

      <KhumbuLandscape compact={compact} />
      <Clouds compact={compact} />
      <Particles compact={compact} />
      <CameraRig />
      <ReadySignal onReady={onReady} />
    </Canvas>
  );
}
