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

function sampleRidgeHeight(
  x: number,
  lz: number,
  spec: RidgeSpec,
  simplified = false
) {
  const tz = 1 - (lz + spec.depth / 2) / spec.depth;
  const envZ = Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, tz * 1.05))), 0.9);
  const flank = smoothstep(spec.gap * 0.4, spec.gap * 1.7, Math.abs(x));
  const peakiness =
    0.55 + 0.9 * valueNoise(x * 0.035 + spec.seed, spec.seed * 0.1, spec.seed);
  const r = ridged(x * 0.06 + spec.seed * 3.1, lz * 0.08, spec.seed, simplified ? 4 : 6);
  const detail =
    ridged(x * 0.32, lz * 0.32, spec.seed + 5, simplified ? 2 : 4) * 0.24;
  const crag = simplified
    ? 0
    : ridged(x * 0.85, lz * 0.85, spec.seed + 19, 4) * 0.11;
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

interface RidgeField {
  spec: RidgeSpec;
  segX: number;
  segZ: number;
  heights: Float32Array;
}

function buildFrontRidgeField(
  segX: number,
  segZ: number,
  simplified: boolean
): RidgeField {
  const cols = segX + 1;
  const rows = segZ + 1;
  const heights = new Float32Array(cols * rows);
  const { width, depth } = FRONT_RIDGE_SPEC;

  for (let iz = 0; iz <= segZ; iz++) {
    const lz = -depth / 2 + (iz / segZ) * depth;
    for (let ix = 0; ix <= segX; ix++) {
      const x = -width / 2 + (ix / segX) * width;
      heights[iz * cols + ix] = sampleRidgeHeight(
        x,
        lz,
        FRONT_RIDGE_SPEC,
        simplified
      ).h;
    }
  }

  return { spec: FRONT_RIDGE_SPEC, segX, segZ, heights };
}

function sampleFrontField(field: RidgeField, x: number, lz: number) {
  const { width, depth, baseY } = field.spec;
  const { segX, segZ, heights } = field;
  const cols = segX + 1;

  const fx = Math.min(segX, Math.max(0, ((x + width / 2) / width) * segX));
  const fz = Math.min(segZ, Math.max(0, ((lz + depth / 2) / depth) * segZ));

  const ix0 = Math.floor(fx);
  const iz0 = Math.floor(fz);
  const ix1 = Math.min(segX, ix0 + 1);
  const iz1 = Math.min(segZ, iz0 + 1);
  const tx = fx - ix0;
  const tz = fz - iz0;

  const h00 = heights[iz0 * cols + ix0]!;
  const h10 = heights[iz0 * cols + ix1]!;
  const h01 = heights[iz1 * cols + ix0]!;
  const h11 = heights[iz1 * cols + ix1]!;

  const h0 = h00 + (h10 - h00) * tx;
  const h1 = h01 + (h11 - h01) * tx;
  const h = h0 + (h1 - h0) * tz;
  return { h, y: baseY + h };
}

/* ---------- geometry merging helpers to slash draw calls ---------- */
function mergeGeometries(
  geos: THREE.BufferGeometry[],
  includeUv = false
): THREE.BufferGeometry {
  const nonIndexed = geos.map((g) => {
    const ni = g.index ? g.toNonIndexed() : g;
    if (ni !== g) g.dispose();
    if (!ni.attributes["normal"]) ni.computeVertexNormals();
    return ni;
  });

  const totalVerts = nonIndexed.reduce(
    (sum, g) => sum + g.attributes["position"]!.count,
    0
  );
  const posArr = new Float32Array(totalVerts * 3);
  const normArr = new Float32Array(totalVerts * 3);
  const uvArr = includeUv ? new Float32Array(totalVerts * 2) : null;

  let offset = 0;
  for (const g of nonIndexed) {
    const p = g.attributes["position"] as THREE.BufferAttribute;
    const n = g.attributes["normal"] as THREE.BufferAttribute;
    posArr.set(p.array as Float32Array, offset * 3);
    normArr.set(n.array as Float32Array, offset * 3);
    if (uvArr && g.attributes["uv"]) {
      const u = g.attributes["uv"] as THREE.BufferAttribute;
      uvArr.set(u.array as Float32Array, offset * 2);
    }
    offset += p.count;
    g.dispose();
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(normArr, 3));
  if (uvArr) {
    merged.setAttribute("uv", new THREE.BufferAttribute(uvArr, 2));
  }
  return merged;
}

function mergeColoredGeometries(
  parts: Array<{
    geo: THREE.BufferGeometry;
    color: string;
    pos?: [number, number, number];
    rot?: [number, number, number];
  }>
): THREE.BufferGeometry {
  const mat = new THREE.Matrix4();
  const euler = new THREE.Euler();
  const quat = new THREE.Quaternion();
  const vecPos = new THREE.Vector3();
  const oneScale = new THREE.Vector3(1, 1, 1);

  const prepared = parts.map((part) => {
    const ni = part.geo.index ? part.geo.toNonIndexed() : part.geo;
    if (ni !== part.geo) part.geo.dispose();
    if (part.pos || part.rot) {
      vecPos.set(...(part.pos ?? [0, 0, 0]));
      euler.set(...(part.rot ?? [0, 0, 0]));
      quat.setFromEuler(euler);
      mat.compose(vecPos, quat, oneScale);
      ni.applyMatrix4(mat);
    }
    if (!ni.attributes["normal"]) ni.computeVertexNormals();
    return { geo: ni, color: new THREE.Color(part.color) };
  });

  const totalVerts = prepared.reduce(
    (sum, item) => sum + item.geo.attributes["position"]!.count,
    0
  );
  const posArr = new Float32Array(totalVerts * 3);
  const normArr = new Float32Array(totalVerts * 3);
  const colArr = new Float32Array(totalVerts * 3);

  let offset = 0;
  for (const { geo, color } of prepared) {
    const p = geo.attributes["position"] as THREE.BufferAttribute;
    const n = geo.attributes["normal"] as THREE.BufferAttribute;
    posArr.set(p.array as Float32Array, offset * 3);
    normArr.set(n.array as Float32Array, offset * 3);
    for (let v = 0; v < p.count; v++) {
      const idx = (offset + v) * 3;
      colArr[idx] = color.r;
      colArr[idx + 1] = color.g;
      colArr[idx + 2] = color.b;
    }
    offset += p.count;
    geo.dispose();
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(normArr, 3));
  merged.setAttribute("color", new THREE.BufferAttribute(colArr, 3));
  return merged;
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
  for (let i = 0; i < 40; i++) {
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
  for (let i = 0; i < 28; i++) {
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

  for (let i = 0; i < 220; i++) {
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
  field?: RidgeField;
  simplified?: boolean;
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
  field,
  simplified = false,
}: RidgeProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, depth, segX, segZ);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes["position"] as THREE.BufferAttribute;
    const spec: RidgeSpec = { z, width, depth, amp, gap, baseY, seed };
    let heights: Float32Array;
    if (field) {
      heights = field.heights;
      for (let i = 0; i < pos.count; i++) {
        pos.setY(i, baseY + (heights[i] ?? 0));
      }
    } else {
      const computed = new Float32Array(pos.count);
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const lz = pos.getZ(i);
        const sampled = sampleRidgeHeight(x, lz, spec, simplified);
        computed[i] = sampled.h;
        pos.setY(i, sampled.y);
      }
      heights = computed;
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
  }, [z, width, depth, amp, gap, baseY, seed, snowLine, segX, segZ, terrainStyle, field, simplified]);

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
  return mergeGeometries(tiers);
}

/* ---------- Authentic Khumbu Hillside Details: Granite Boulders, Snow Mounds & Frosted Pines ---------- */
function HillsideDetails({
  compact,
  frontField,
}: {
  compact: boolean;
  frontField: RidgeField;
}) {
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
      const c = sampleFrontField(frontField, x, lz);
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
      const c = sampleFrontField(frontField, x, lz);
      const hn = c.h / FRONT_RIDGE_SPEC.amp;
      if (hn < 0.05 || hn > 0.58) continue;

      const dx = sampleFrontField(frontField, x + 0.7, lz).y - c.y;
      const dz = sampleFrontField(frontField, x, lz + 0.7).y - c.y;
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
      const c = sampleFrontField(frontField, x, lz);
      const hn = c.h / FRONT_RIDGE_SPEC.amp;
      if (hn < 0.08 || hn > 0.48) continue;

      const dx = sampleFrontField(frontField, x + 0.8, lz).y - c.y;
      const dz = sampleFrontField(frontField, x, lz + 0.8).y - c.y;
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
  }, [maxBoulders, maxScrubs, maxPines, maxBoulderAttempts, maxScrubAttempts, maxPineAttempts, frontField]);

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
function KhumbuChorten({ frontField }: { frontField: RidgeField }) {
  const chortenX = -12.8;
  const chortenZ = -3.8;

  const baseY = useMemo(
    () => sampleFrontField(frontField, chortenX, chortenZ - FRONT_RIDGE_SPEC.z).y,
    [frontField, chortenX, chortenZ]
  );

  const chortenGeo = useMemo(() => {
    return mergeColoredGeometries([
      { geo: new THREE.BoxGeometry(2.3, 1.35, 2.3), color: "#585f66", pos: [0, -0.45, 0] },
      { geo: new THREE.BoxGeometry(1.65, 0.28, 1.65), color: "#676e75", pos: [0, 0.34, 0] },
      { geo: new THREE.BoxGeometry(1.05, 0.38, 1.05), color: "#ebe6dc", pos: [0, 0.66, 0] },
      { geo: new THREE.CylinderGeometry(0.38, 0.46, 0.45, 10), color: "#f2ede4", pos: [0, 1.05, 0] },
      { geo: new THREE.BoxGeometry(0.34, 0.22, 0.34), color: "#d4a644", pos: [0, 1.36, 0] },
      { geo: new THREE.ConeGeometry(0.2, 0.56, 8), color: "#d4a644", pos: [0, 1.72, 0] },
      { geo: new THREE.CylinderGeometry(0.018, 0.028, 2.7, 5), color: "#4e3d2e", pos: [0.92, 1.35, 0.3] },
      { geo: new THREE.PlaneGeometry(0.18, 0.24), color: "#34679a", pos: [1.02, 2.35, 0.3], rot: [0, 0.2, -0.06] },
      { geo: new THREE.PlaneGeometry(0.18, 0.24), color: "#ede8dc", pos: [1.02, 2.08, 0.3], rot: [0, 0.2, -0.06] },
      { geo: new THREE.PlaneGeometry(0.18, 0.24), color: "#b83c32", pos: [1.02, 1.81, 0.3], rot: [0, 0.2, -0.06] },
      { geo: new THREE.PlaneGeometry(0.18, 0.24), color: "#2a6b48", pos: [1.02, 1.54, 0.3], rot: [0, 0.2, -0.06] },
      { geo: new THREE.PlaneGeometry(0.18, 0.24), color: "#d6a334", pos: [1.02, 1.27, 0.3], rot: [0, 0.2, -0.06] },
    ]);
  }, []);

  useEffect(() => () => chortenGeo.dispose(), [chortenGeo]);

  return (
    <mesh position={[chortenX, baseY, chortenZ]} geometry={chortenGeo}>
      <meshLambertMaterial vertexColors side={THREE.DoubleSide} />
    </mesh>
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
const FLAG_VERT_SHADER = /* glsl */ `
  uniform float uTime;
  attribute vec3 aCenter;
  attribute vec3 aColor;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vFogDepth;

  void main() {
    float flutter = sin(uTime * 2.8 + aPhase) * 0.26;
    float rx = 0.18 + flutter;
    float ry = flutter * 0.25;
    float cx = cos(rx);
    float sx = sin(rx);
    float cy = cos(ry);
    float sy = sin(ry);

    vec3 p = position;
    vec3 px = vec3(p.x, p.y * cx - p.z * sx, p.y * sx + p.z * cx);
    vec3 pxy = vec3(px.x * cy + px.z * sy, px.y, -px.x * sy + px.z * cy);

    vec4 mvPosition = modelViewMatrix * vec4(aCenter + pxy, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    vColor = aColor;
    vFogDepth = -mvPosition.z;
  }
`;

const FLAG_FRAG_SHADER = /* glsl */ `
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec3 vColor;
  varying float vFogDepth;

  void main() {
    float fogFactor = clamp((vFogDepth - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
    vec3 col = mix(vColor, uFogColor, fogFactor);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function SuspensionBridge({
  compact,
  frontField,
}: {
  compact: boolean;
  frontField: RidgeField;
}) {
  const bridgeZ = -1.5;
  const halfSpan = 10.6;
  const deckHalfW = 0.46;
  const towerHeight = 2.85;
  const cableSag = 1.72;
  const deckSag = 0.34;
  const plankCount = compact ? 24 : 36;
  const hangerPairs = compact ? 10 : 16;
  const flagCount = compact ? 26 : 48;

  const flagMatRef = useRef<THREE.ShaderMaterial>(null);
  const deckRef = useRef<THREE.InstancedMesh>(null);
  const hangerRef = useRef<THREE.InstancedMesh>(null);
  const flagElapsedRef = useRef(0);

  const wireMeshTex = useMemo(
    () => (compact ? null : makeWireMeshTexture()),
    [compact]
  );

  const {
    steelGeo,
    stoneGeo,
    cableGeo,
    meshSideGeo,
    deckData,
    hangerData,
    deckPanelGeo,
    hangerGeo,
    flagGeo,
  } = useMemo(() => {
    const lGround = sampleFrontField(
      frontField,
      -halfSpan,
      bridgeZ - FRONT_RIDGE_SPEC.z
    ).y;
    const rGround = sampleFrontField(
      frontField,
      halfSpan,
      bridgeZ - FRONT_RIDGE_SPEC.z
    ).y;
    const baseDeckY = Math.max(lGround, rGround, 1.55) + 0.16;
    const topY = baseDeckY + towerHeight;
    const leftFootY = Math.min(lGround - 1.2, baseDeckY - 2.3);
    const rightFootY = Math.min(rGround - 1.2, baseDeckY - 2.3);
    const leftTowerPierH = baseDeckY + towerHeight - leftFootY;
    const rightTowerPierH = baseDeckY + towerHeight - rightFootY;
    const leftTowerCenterY = leftFootY + leftTowerPierH / 2;
    const rightTowerCenterY = rightFootY + rightTowerPierH / 2;

    const zOffsets = [-deckHalfW, deckHalfW];

    const cableParts: THREE.BufferGeometry[] = [];
    const meshSides: THREE.BufferGeometry[] = [];
    const steelParts: THREE.BufferGeometry[] = [];

    for (const zOff of zOffsets) {
      const zPos = bridgeZ + zOff;

      const lCol = new THREE.BoxGeometry(0.16, leftTowerPierH, 0.16);
      lCol.translate(-halfSpan, leftTowerCenterY, zPos);
      steelParts.push(lCol);

      const rCol = new THREE.BoxGeometry(0.16, rightTowerPierH, 0.16);
      rCol.translate(halfSpan, rightTowerCenterY, zPos);
      steelParts.push(rCol);

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

      cableParts.push(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(mainPts), compact ? 16 : 24, 0.038, compact ? 4 : 5, false),
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
        sampleFrontField(frontField, leftAnchorX, bridgeZ - FRONT_RIDGE_SPEC.z).y -
        0.15;
      cableParts.push(
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
        sampleFrontField(frontField, rightAnchorX, bridgeZ - FRONT_RIDGE_SPEC.z).y -
        0.15;
      cableParts.push(
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

    // Header beams & mid crossbars
    const lh = new THREE.BoxGeometry(0.18, 0.14, deckHalfW * 2 + 0.24);
    lh.translate(-halfSpan, baseDeckY + towerHeight - 0.1, bridgeZ);
    const rh = new THREE.BoxGeometry(0.18, 0.14, deckHalfW * 2 + 0.24);
    rh.translate(halfSpan, baseDeckY + towerHeight - 0.1, bridgeZ);
    const lm = new THREE.BoxGeometry(0.12, 0.1, deckHalfW * 2 + 0.14);
    lm.translate(-halfSpan, baseDeckY + 1.05, bridgeZ);
    const rm = new THREE.BoxGeometry(0.12, 0.1, deckHalfW * 2 + 0.14);
    rm.translate(halfSpan, baseDeckY + 1.05, bridgeZ);
    steelParts.push(lh, rh, lm, rm);

    // X-cross bracing struts inside left and right steel portal towers (desktop only)
    if (!compact) {
      for (const towerX of [-halfSpan, halfSpan]) {
        const yLow = baseDeckY + 1.05;
        const yHigh = topY - 0.12;
        steelParts.push(
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

      // Wind-guy lateral stabilizing steel cables from mid-span down to gorge rock walls
      cableParts.push(
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
        )
      );
    }

    // Stone-masonry pier abutments
    const lStone = new THREE.BoxGeometry(1.45, 1.5, 1.55);
    lStone.translate(-halfSpan - 0.4, baseDeckY - 0.6, bridgeZ);
    const rStone = new THREE.BoxGeometry(1.45, 1.5, 1.55);
    rStone.translate(halfSpan + 0.4, baseDeckY - 0.6, bridgeZ);

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

    // Traditional weathered Tibetan Lungta prayer flags merged into 1 static GPU-animated geometry
    const flagColors = [
      new THREE.Color("#34679a"),
      new THREE.Color("#ede8dc"),
      new THREE.Color("#b83c32"),
      new THREE.Color("#2a6b48"),
      new THREE.Color("#d6a334"),
    ];
    const vertsPerFlag = 6;
    const fPos = new Float32Array(flagCount * vertsPerFlag * 3);
    const fCenter = new Float32Array(flagCount * vertsPerFlag * 3);
    const fColor = new Float32Array(flagCount * vertsPerFlag * 3);
    const fPhase = new Float32Array(flagCount * vertsPerFlag);
    const hw = 0.105;
    const hh = 0.075;
    const localQuad: Array<[number, number]> = [
      [-hw, -hh],
      [hw, -hh],
      [hw, hh],
      [-hw, -hh],
      [hw, hh],
      [-hw, hh],
    ];

    for (let i = 0; i < flagCount; i++) {
      const sideIdx = i % 2;
      const t = 0.06 + (Math.floor(i / 2) / Math.ceil(flagCount / 2)) * 0.88;
      const fx = -halfSpan + t * (halfSpan * 2);
      const fz = bridgeZ + (sideIdx === 0 ? -deckHalfW : deckHalfW);
      const fy = topY - cableSag * Math.sin(Math.PI * t) - 0.1;
      const col = flagColors[i % flagColors.length]!;
      const phase = i * 0.52;

      for (let v = 0; v < vertsPerFlag; v++) {
        const vi = i * vertsPerFlag + v;
        const [lx, ly] = localQuad[v]!;
        fPos[vi * 3] = lx;
        fPos[vi * 3 + 1] = ly;
        fPos[vi * 3 + 2] = 0;

        fCenter[vi * 3] = fx;
        fCenter[vi * 3 + 1] = fy;
        fCenter[vi * 3 + 2] = fz;

        fColor[vi * 3] = col.r;
        fColor[vi * 3 + 1] = col.g;
        fColor[vi * 3 + 2] = col.b;

        fPhase[vi] = phase;
      }
    }

    const fGeo = new THREE.BufferGeometry();
    fGeo.setAttribute("position", new THREE.BufferAttribute(fPos, 3));
    fGeo.setAttribute("aCenter", new THREE.BufferAttribute(fCenter, 3));
    fGeo.setAttribute("aColor", new THREE.BufferAttribute(fColor, 3));
    fGeo.setAttribute("aPhase", new THREE.BufferAttribute(fPhase, 1));

    return {
      steelGeo: mergeGeometries(steelParts),
      stoneGeo: mergeGeometries([lStone, rStone]),
      cableGeo: mergeGeometries(cableParts),
      meshSideGeo: meshSides.length > 0 ? mergeGeometries(meshSides, true) : null,
      deckData: decks,
      hangerData: hangers,
      deckPanelGeo: new THREE.BoxGeometry(0.56, 0.045, deckHalfW * 2 + 0.04),
      hangerGeo: new THREE.CylinderGeometry(0.013, 0.013, 1, 4),
      flagGeo: fGeo,
    };
  }, [bridgeZ, compact, plankCount, hangerPairs, flagCount, frontField]);

  const flagShaderArgs = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uFogColor: { value: new THREE.Color(FOG_COLOR) },
        uFogNear: { value: 18 },
        uFogFar: { value: 108 },
      },
      vertexShader: FLAG_VERT_SHADER,
      fragmentShader: FLAG_FRAG_SHADER,
      side: THREE.DoubleSide,
    }),
    []
  );

  useEffect(() => {
    const dMesh = deckRef.current;
    const hMesh = hangerRef.current;
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
  }, [deckData, hangerData]);

  useFrame((_, rawDelta) => {
    const mat = flagMatRef.current;
    if (!mat || !heroState.inView || heroState.reducedMotion) return;
    const dt = Math.min(rawDelta, 0.05);
    flagElapsedRef.current += dt;
    mat.uniforms["uTime"]!.value = flagElapsedRef.current;
  });

  const bridgeMats = useMemo(() => {
    const makeMetal = (color: string, roughness: number, metalness: number) =>
      compact
        ? new THREE.MeshLambertMaterial({ color })
        : new THREE.MeshStandardMaterial({ color, roughness, metalness });

    return {
      steelMat: makeMetal("#8f9ca6", 0.35, 0.68),
      stoneMat: new THREE.MeshLambertMaterial({ color: "#5c6268" }),
      cableMat: makeMetal("#6e7c86", 0.4, 0.72),
      meshSideMat:
        !compact && wireMeshTex
          ? new THREE.MeshStandardMaterial({
              map: wireMeshTex,
              transparent: true,
              alphaTest: 0.12,
              side: THREE.DoubleSide,
              roughness: 0.45,
              metalness: 0.55,
            })
          : null,
      deckMat: makeMetal("#7b8690", 0.45, 0.58),
      hangerMat: makeMetal("#7d8a94", 0.4, 0.65),
    };
  }, [wireMeshTex, compact]);

  useEffect(() => {
    return () => {
      wireMeshTex?.dispose();
      steelGeo.dispose();
      stoneGeo.dispose();
      cableGeo.dispose();
      meshSideGeo?.dispose();
      deckPanelGeo.dispose();
      hangerGeo.dispose();
      flagGeo.dispose();
      Object.values(bridgeMats).forEach((m) => m?.dispose());
    };
  }, [
    wireMeshTex,
    steelGeo,
    stoneGeo,
    cableGeo,
    meshSideGeo,
    deckPanelGeo,
    hangerGeo,
    flagGeo,
    bridgeMats,
  ]);

  return (
    <group>
      {/* Galvanized Steel Portal Towers & Bracing */}
      <mesh geometry={steelGeo} material={bridgeMats.steelMat} />

      {/* Stone-Masonry Pier Abutments */}
      <mesh geometry={stoneGeo} material={bridgeMats.stoneMat} />

      {/* Main Steel Cables, Handrails, Back-stays & Wind Guys */}
      <mesh geometry={cableGeo} material={bridgeMats.cableMat} />

      {/* Galvanized Wire-Mesh Safety Sides */}
      {!compact && meshSideGeo && bridgeMats.meshSideMat && (
        <mesh geometry={meshSideGeo} material={bridgeMats.meshSideMat} />
      )}

      {/* Corrugated Galvanized Steel Walkway Deck & Vertical Suspender Rods */}
      <instancedMesh
        ref={deckRef}
        args={[deckPanelGeo, bridgeMats.deckMat, deckData.length]}
      />
      <instancedMesh
        ref={hangerRef}
        args={[hangerGeo, bridgeMats.hangerMat, hangerData.length]}
      />

      {/* GPU-animated Prayer Flags (Lungta) */}
      <mesh geometry={flagGeo} frustumCulled={false}>
        <shaderMaterial ref={flagMatRef} args={[flagShaderArgs]} />
      </mesh>
    </group>
  );
}

/* ---------- procedural cloud texture ---------- */
function makeCloudTexture(seed: number) {
  const size = 96;
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
  const farCount = Math.max(1, Math.round(count * 0.7));
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
  const specs = useMemo(() => buildClouds(compact ? 2 : 8), [compact]);
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  const lastCamPosRef = useRef(new THREE.Vector3(Infinity, Infinity, Infinity));
  const camera = useThree((s) => s.camera);

  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  useFrame((_, rawDelta) => {
    if (!heroState.inView) return;
    const dt = Math.min(rawDelta, 0.05);
    const camMoved = camera.position.distanceToSquared(lastCamPosRef.current) > 0.01;
    if (camMoved) {
      lastCamPosRef.current.copy(camera.position);
    }
    for (let i = 0; i < specs.length; i++) {
      const c = specs[i]!;
      const sprite = refs.current[i];
      if (!sprite) continue;
      if (!heroState.reducedMotion) {
        sprite.position.x += c.speed * dt;
        if (sprite.position.x > 55) sprite.position.x -= 110;
      }
      if (camMoved) {
        const dSq = sprite.position.distanceToSquared(camera.position);
        const mat = sprite.material as THREE.SpriteMaterial;
        mat.opacity = c.o * smoothstep(0.36, 25, dSq);
      }
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
  uniform float uMaxPointSize;
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
    gl_PointSize = min(uMaxPointSize, uSize * (300.0 / max(1.0, -mvPosition.z)));
  }
`;

const SNOW_FRAG_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d2 = dot(uv, uv);
    float alpha = smoothstep(0.25, 0.03, d2) * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
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
  colorHex: string,
  opacity: number,
  size: number,
  maxPointSize: number,
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
      uMaxPointSize: { value: maxPointSize },
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

  const nearCount = compact ? 140 : 460;
  const farCount = compact ? 0 : 280;
  const maxPointSize = compact ? 7.0 : 11.0;

  const { nearGeo, farGeo, nearArgs, farArgs } = useMemo(() => {
    const nGeo = buildSnowGeometry(nearCount, 99, 26, -3.5, 14.5, -26, 20, 1.35, 1.15, 0.55);
    const nArgs = makeSnowShaderArgs("#ffffff", 0.88, 0.22, maxPointSize, 26, -3.5, 14.5, 0.28);
    if (farCount === 0) {
      return { nearGeo: nGeo, farGeo: null, nearArgs: nArgs, farArgs: null };
    }
    const fGeo = buildSnowGeometry(farCount, 313, 36, -2.5, 16.5, -48, -12, 0.85, 0.75, 0.4);
    const fArgs = makeSnowShaderArgs("#edf5ff", 0.62, 0.15, maxPointSize, 36, -2.5, 16.5, 0.2);
    return { nearGeo: nGeo, farGeo: fGeo, nearArgs: nArgs, farArgs: fArgs };
  }, [nearCount, farCount, maxPointSize]);

  useEffect(() => {
    return () => {
      nearGeo.dispose();
      farGeo?.dispose();
    };
  }, [nearGeo, farGeo]);

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
  const doneRef = useRef(false);
  const gl = useThree((s) => s.gl);
  useFrame(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    gl.domElement.closest("[data-scene]")?.setAttribute("data-scene-ready", "true");
    onReady?.();
  });
  return null;
}

/* ---------- smart frame pacer (60fps active / 30fps idle on mobile, 60fps cap on desktop) ---------- */
function FrameScheduler({
  active,
  compact,
}: {
  active: boolean;
  compact: boolean;
}) {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    if (!active) return;

    let raf = 0;
    let lastRender = 0;

    const tick = (now: number) => {
      if (document.hidden || !heroState.inView) {
        raf = 0;
        return;
      }

      if (heroState.reducedMotion) {
        if (now - heroState.lastActivityAt < 400 && now - lastRender >= 15) {
          lastRender = now;
          invalidate();
        }
      } else {
        const isActiveInput = now - heroState.lastActivityAt < 450;
        const minInterval = !compact || isActiveInput ? 15 : 31;
        if (now - lastRender >= minInterval) {
          lastRender = now;
          invalidate();
        }
      }

      raf = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!document.hidden && heroState.inView && !raf) {
        invalidate();
        lastRender = performance.now();
        raf = window.requestAnimationFrame(tick);
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (raf) {
          window.cancelAnimationFrame(raf);
          raf = 0;
        }
      } else {
        startLoop();
      }
    };

    startLoop();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [active, compact, invalidate]);

  return null;
}

/* ---------- glacial Dudh Koshi river underneath the bridge ---------- */
function makeRiverTextures(withFoam: boolean) {
  const w = 128;
  const h = 256;

  const waterCanvas = document.createElement("canvas");
  waterCanvas.width = w;
  waterCanvas.height = h;
  const wCtx = waterCanvas.getContext("2d")!;

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

  const waterMap = new THREE.CanvasTexture(waterCanvas);
  waterMap.colorSpace = THREE.SRGBColorSpace;
  waterMap.wrapS = THREE.RepeatWrapping;
  waterMap.wrapT = THREE.RepeatWrapping;
  waterMap.repeat.set(1.6, 12);

  let foamMap: THREE.CanvasTexture | null = null;
  if (withFoam) {
    const foamCanvas = document.createElement("canvas");
    foamCanvas.width = w;
    foamCanvas.height = h;
    const fCtx = foamCanvas.getContext("2d")!;

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

    foamMap = new THREE.CanvasTexture(foamCanvas);
    foamMap.colorSpace = THREE.SRGBColorSpace;
    foamMap.wrapS = THREE.RepeatWrapping;
    foamMap.wrapT = THREE.RepeatWrapping;
    foamMap.repeat.set(1.2, 16);
  }

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

function GlacialRiver({
  compact,
  frontField,
}: {
  compact: boolean;
  frontField: RidgeField;
}) {
  const bankBoulderRef = useRef<THREE.InstancedMesh>(null);
  const rapidBoulderRef = useRef<THREE.InstancedMesh>(null);
  const waterMatRef = useRef<THREE.MeshLambertMaterial | THREE.MeshStandardMaterial>(null);
  const foamMatRef = useRef<THREE.MeshLambertMaterial>(null);

  const { waterMap, foamMap } = useMemo(() => makeRiverTextures(!compact), [compact]);
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
      const terrainY = sampleFrontField(frontField, bx, bz - FRONT_RIDGE_SPEC.z).y;
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
  }, [maxBankRocks, maxRapidRocks, frontField]);

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
      foamMap?.dispose();
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
      {!compact && foamMap && (
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
  const segX = compact ? 36 : 76;
  const segZ = compact ? 20 : 40;
  const { map, bumpMap } = useMemo(() => makeTerrainDetailTextures(!compact), [compact]);
  const frontField = useMemo(
    () => buildFrontRidgeField(segX, segZ, compact),
    [segX, segZ, compact]
  );

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
        simplified
      />

      {/* Front Khumbu Terrain: Snow-Covered Winter Ridge, Exposed Granite, Glacial River, Frosted Pines, Chorten & Steel Bridge */}
      <Ridge
        {...FRONT_RIDGE_SPEC}
        snowLine={0.12}
        segX={segX}
        segZ={segZ}
        terrainStyle="foothill"
        detailMap={map}
        bumpMap={compact ? null : bumpMap}
        field={frontField}
        simplified={compact}
      />
      <GlacialRiver compact={compact} frontField={frontField} />
      <HillsideDetails compact={compact} frontField={frontField} />
      <KhumbuChorten frontField={frontField} />
      <SuspensionBridge compact={compact} frontField={frontField} />
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
      frameloop="demand"
      dpr={compact ? 0.75 : [1, 1.25]}
      gl={{
        alpha: true,
        antialias: false,
        stencil: false,
        powerPreference: compact ? "default" : "high-performance",
      }}
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
      <FrameScheduler active={active} compact={compact} />
      <ReadySignal onReady={onReady} />
    </Canvas>
  );
}
