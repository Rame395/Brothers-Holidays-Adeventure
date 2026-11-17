"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { heroState } from "./heroStore";
import { mulberry32, ridged, smoothstep, valueNoise } from "./terrain";

/* ---------- feel constants ---------- */
const CAM_START = new THREE.Vector3(0, 2.6, 16);
const FLY_DISTANCE = 34; // how far the camera travels into the range on scroll
const MOUSE_SHIFT_X = 2.4;
const MOUSE_SHIFT_Y = 0.9;
const MOUSE_DAMP = 2.2;
const ROLL = 0.035;
const FOG_COLOR = "#8e9fb3";

/* ---------- mountain ridge layer ---------- */
type RidgeProps = {
  z: number;
  width: number;
  depth: number;
  amp: number;
  gap: number;
  baseY: number;
  seed: number;
  snowLine: number;
  segX?: number;
  segZ?: number;
};

function Ridge({ z, width, depth, amp, gap, baseY, seed, snowLine, segX = 280, segZ = 90 }: RidgeProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, depth, segX, segZ);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes["position"] as THREE.BufferAttribute;
    const heights = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const lz = pos.getZ(i);
      const tz = 1 - (lz + depth / 2) / depth; // 0 front, 1 back
      const envZ = Math.pow(Math.sin(Math.PI * Math.min(1, tz * 1.05)), 0.9);
      const flank = smoothstep(gap * 0.4, gap * 1.7, Math.abs(x));
      const peakiness = 0.55 + 0.9 * valueNoise(x * 0.035 + seed, seed * 0.1, seed);
      const r = ridged(x * 0.06 + seed * 3.1, lz * 0.08, seed);
      const detail = ridged(x * 0.32, lz * 0.32, seed + 5, 4) * 0.16;
      const h = (0.1 + 0.9 * flank) * envZ * amp * peakiness * (0.25 + r * 1.1) + detail * amp * envZ;
      heights[i] = h;
      pos.setY(i, baseY + h);
    }
    geo.computeVertexNormals();

    const normals = geo.attributes["normal"] as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const rockDark = new THREE.Color("#1d2128");
    const rockWarm = new THREE.Color("#4a4038");
    const snow = new THREE.Color("#eef1f4");
    const snowShade = new THREE.Color("#b9c6d6");
    const tmp = new THREE.Color();
    const tmp2 = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const hn = (heights[i] ?? 0) / amp;
      const ny = normals.getY(i);
      const n = valueNoise(pos.getX(i) * 0.4, pos.getZ(i) * 0.4, seed + 9);
      tmp.lerpColors(rockDark, rockWarm, n * 0.8);
      const snowAmt =
        smoothstep(snowLine - 0.12, snowLine + 0.08, hn + (ny - 0.7) * 0.5 + (n - 0.5) * 0.25) *
        smoothstep(0.55, 0.82, ny);
      tmp2.lerpColors(snowShade, snow, smoothstep(0.6, 0.95, ny));
      tmp.lerp(tmp2, snowAmt);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [width, depth, amp, gap, baseY, seed, snowLine, segX, segZ]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} position={[0, 0, z]}>
      <meshStandardMaterial vertexColors roughness={0.92} metalness={0} />
    </mesh>
  );
}

/* ---------- procedural textures ---------- */
function makeCloudTexture(seed: number) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const rand = mulberry32(seed);
  for (let i = 0; i < 22; i++) {
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
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------- clouds ---------- */
type CloudSpec = { x: number; y: number; z: number; s: number; o: number; speed: number; rot: number; tex: number };

function buildClouds(): CloudSpec[] {
  const rand = mulberry32(42);
  const list: CloudSpec[] = [];
  // valley sea of cloud
  for (let i = 0; i < 70; i++) {
    list.push({
      x: (rand() - 0.5) * 100,
      y: -2.4 + rand() * 4,
      z: -75 + rand() * 80,
      s: 10 + rand() * 16,
      o: 0.35 + rand() * 0.45,
      speed: 0.15 + rand() * 0.35,
      rot: (rand() - 0.5) * 0.3,
      tex: Math.floor(rand() * 3),
    });
  }
  // dense bank the camera flies into at the end of the scroll
  for (let i = 0; i < 26; i++) {
    list.push({
      x: (rand() - 0.5) * 22,
      y: -0.5 + rand() * 4.5,
      z: -28 + rand() * 14,
      s: 7 + rand() * 9,
      o: 0.55 + rand() * 0.35,
      speed: 0.1 + rand() * 0.2,
      rot: rand() * Math.PI * 2,
      tex: Math.floor(rand() * 3),
    });
  }
  return list;
}

function Clouds() {
  const textures = useMemo(() => [makeCloudTexture(1), makeCloudTexture(7), makeCloudTexture(13)], []);
  const specs = useMemo(buildClouds, []);
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  const camera = useThree((s) => s.camera);

  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    specs.forEach((c, i) => {
      const sprite = refs.current[i];
      if (!sprite) return;
      if (!heroState.reducedMotion) {
        sprite.position.x += c.speed * dt;
        if (sprite.position.x > 55) sprite.position.x -= 110;
      }
      const d = sprite.position.distanceTo(camera.position);
      const mat = sprite.material as THREE.SpriteMaterial;
      mat.opacity = c.o * smoothstep(0.6, 5, d);
    });
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
            color="#fbf3e6"
            fog
          />
        </sprite>
      ))}
    </group>
  );
}

/* ---------- drifting ice crystals / dust ---------- */
const PARTICLE_COUNT = 1400;

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const dot = useMemo(makeDotTexture, []);
  const { positions, speeds } = useMemo(() => {
    const rand = mulberry32(99);
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const speeds = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (rand() - 0.5) * 50;
      positions[i * 3 + 1] = -2 + rand() * 14;
      positions[i * 3 + 2] = -45 + rand() * 62;
      speeds[i] = 0.3 + rand() * 0.9;
    }
    return { positions, speeds };
  }, []);
  const camera = useThree((s) => s.camera);

  useEffect(() => () => dot.dispose(), [dot]);

  useFrame((state, rawDelta) => {
    if (!ref.current || heroState.reducedMotion) return;
    const dt = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const attr = ref.current.geometry.attributes["position"] as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const camZ = camera.position.z;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const s = speeds[i] ?? 1;
      const ix = i * 3;
      let x = arr[ix] ?? 0;
      let y = arr[ix + 1] ?? 0;
      let z = arr[ix + 2] ?? 0;
      x += (0.6 + Math.sin(t * 0.3 + i) * 0.25) * s * dt;
      y -= 0.12 * s * dt;
      if (x > 25) x -= 50;
      if (y < -2) y += 14;
      if (z > camZ + 2) z -= 60;
      else if (z < camZ - 58) z += 60;
      arr[ix] = x;
      arr[ix + 1] = y;
      arr[ix + 2] = z;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={dot}
        size={0.09}
        sizeAttenuation
        transparent
        depthWrite={false}
        opacity={0.75}
        color="#ffe1ad"
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ---------- the one stepper: camera flight ---------- */
function CameraRig() {
  const smooth = useRef({ mx: 0, my: 0, p: 0 });
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const cam = state.camera;
    const s = smooth.current;
    const k = 1 - Math.exp(-MOUSE_DAMP * dt);
    s.mx += (heroState.mouseX - s.mx) * k;
    s.my += (heroState.mouseY - s.my) * k;
    s.p += (heroState.progress - s.p) * (1 - Math.exp(-6 * dt));

    const t = heroState.reducedMotion ? 0 : state.clock.elapsedTime;
    const fly = 1 - Math.pow(1 - s.p, 1.6);

    cam.position.set(
      CAM_START.x + Math.sin(t * 0.07) * 1.1 + s.mx * MOUSE_SHIFT_X,
      CAM_START.y + Math.sin(t * 0.11) * 0.3 + s.my * MOUSE_SHIFT_Y + Math.sin(s.p * Math.PI) * 1.2 - s.p * 1.1,
      CAM_START.z - fly * FLY_DISTANCE - Math.sin(t * 0.05) * 0.8,
    );
    lookTarget.set(s.mx * 4, 5.2 + s.my * 1.5 - s.p * 3, cam.position.z - 60);
    cam.lookAt(lookTarget);
    cam.rotateZ(-s.mx * ROLL + Math.sin(t * 0.09) * 0.006);
  });

  return null;
}

function ReadySignal() {
  const frames = useRef(0);
  const gl = useThree((s) => s.gl);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 3) gl.domElement.closest("[data-scene]")?.setAttribute("data-scene-ready", "true");
  });
  return null;
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 50, near: 0.1, far: 320, position: CAM_START.toArray() }}
      style={{ background: "transparent" }}
    >
      <fog attach="fog" args={[FOG_COLOR, 16, 105]} />
      <hemisphereLight args={["#cddbec", "#1b2230", 0.75]} />
      <directionalLight position={[-30, 22, -8]} intensity={2.8} color="#ffd29a" />
      <directionalLight position={[18, 12, -70]} intensity={1.1} color="#ffe7c7" />

      <Ridge z={-50} width={230} depth={44} amp={15} gap={20} baseY={-4.5} seed={23} snowLine={0.45} />
      <Ridge z={-6} width={160} depth={64} amp={12} gap={10} baseY={-3.4} seed={7} snowLine={0.6} segZ={140} />

      <Clouds />
      <Particles />
      <CameraRig />
      <ReadySignal />
    </Canvas>
  );
}
