import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// --- GLSL Shaders ---

// We need a standard noise function to create organic textures.
// This is Simplex 3D Noise.
const noiseChunk = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod7(p)p
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod7(j)N
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}
`;

const vertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  uniform float uSpeed;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Larger, slower waves for the overall shape
    float wave1 = sin(pos.x * 1.5 + uTime * uSpeed * 0.8) * 0.8;
    float wave2 = cos(pos.x * 2.5 - uTime * uSpeed * 1.2) * 0.3;

    pos.z += wave1 + wave2;
    // Slight bend upwards at edges
    pos.y += pow(abs(uv.x - 0.5), 2.0) * 2.0;

    vElevation = pos.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColorLow;
  uniform vec3 uColorHigh;
  uniform float uOpacity;
  uniform float uTime;

  varying vec2 vUv;
  varying float vElevation;

  ${noiseChunk}

  void main() {
    // 1. Base vertical fade (fade out top and bottom boundaries)
    float baseAlpha = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.6, vUv.y);

    // 2. Generate Wispy Texture using Noise
    // We stretch the noise horizontally (vUv.x * 8.0) to create streaks.
    // We animate z-dimension with time to make the texture flow.
    float noise1 = snoise(vec3(vUv.x * 8.0 + uTime * 0.2, vUv.y * 3.0, uTime * 0.4));
    float noise2 = snoise(vec3(vUv.x * 12.0 - uTime * 0.3, vUv.y * 6.0, uTime * 0.3 + 10.0));

    // Combine noise layers and remap from [-1,1] to [0,1] range
    float combinedNoise = (noise1 + noise2) * 0.5 + 0.5;

    // Increase contrast to create sharper "ribbons"
    float wispAlpha = smoothstep(0.3, 0.7, combinedNoise);

    // 3. Color mixing based on elevation (z-depth from vertex shader)
    vec3 color = mix(uColorLow, uColorHigh, smoothstep(-1.0, 1.0, vElevation));

    // Final alpha combines base fade, wispy texture, and global opacity setting
    float finalAlpha = baseAlpha * wispAlpha * uOpacity;

    gl_FragColor = vec4(color, finalAlpha);
  }
`;

// --- Component: Stars ---
const Stars = ({ count = 1500 }) => {
  const points = useRef<THREE.Points>(null);

  // Generate random positions for stars within a box
  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spread stars out wide (x: -50 to 50, y: -30 to 50, z: -30 to -5)
      pos[i3] = (Math.random() - 0.5) * 100;
      pos[i3 + 1] = (Math.random() - 0.5) * 80 + 10;
      pos[i3 + 2] = (Math.random() - 0.5) * 30 - 20;
    }
    return pos;
  });

  useFrame((state) => {
    // Slowly rotate the starfield
    if (points.current) {
      points.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      {/* PointsMaterial is efficient for thousands of dots */}
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        sizeAttenuation={true} // Distant stars look smaller
        transparent
        opacity={0.8}
        fog={false}
      />
    </points>
  );
};

// --- Component: Aurora Curtain ---
type AuroraProps = {
  intensity: number; // K-Index (0-9)
  isActive: boolean;
};

const AuroraCurtain = ({ intensity, isActive }: AuroraProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const config = useMemo(() => {
    // Higher intensity = brighter, redder, faster colors
    const isHighActivity = intensity >= 5;
    return {
      // Southern hemisphere colors often feature strong greens and deep reds/purples
      colorLow: new THREE.Color(isHighActivity ? "#00ff99" : "#00cca3"),
      colorHigh: new THREE.Color(isHighActivity ? "#ff0033" : "#7a00cc"),
      speed: isActive ? 1.2 : 0.4,
      opacity: isActive ? 0.85 : 0.35,
    };
  }, [intensity, isActive]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: config.speed },
      uColorLow: { value: config.colorLow },
      uColorHigh: { value: config.colorHigh },
      uOpacity: { value: config.opacity },
    }),
    [config],
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      material.uniforms.uSpeed.value = config.speed;
      material.uniforms.uColorLow.value = config.colorLow;
      material.uniforms.uColorHigh.value = config.colorHigh;
      material.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        material.uniforms.uOpacity.value,
        config.opacity,
        0.05,
      );
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 5, -15]} rotation={[0.3, 0, 0]}>
      {/* A very wide, tall plane with high segmentation for smooth noise */}
      <planeGeometry args={[40, 20, 256, 128]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

// --- Main Exported Component ---
export const AuroraBackground = (props: AuroraProps) => {
  return (
    <div className="absolute inset-0 w-full h-full bg-slate-950">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        {/* Optional: Add very subtle fog to fade distant stars */}
        <fog attach="fog" args={["#020617", 10, 60]} />
        <color attach="background" args={["#020617"]} />

        <Stars count={2000} />
        <AuroraCurtain {...props} />
      </Canvas>

      {/* Vignette Overlay for cinematic effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_10%,#020617_120%)] mix-blend-multiply" />
    </div>
  );
};
