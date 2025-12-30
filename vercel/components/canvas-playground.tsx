"use client";

import {
  memo,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import { useApp } from "./app-provider";

interface PlaygroundNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  kind: "node" | "spark" | "trail" | "constellation";
  hue: number;
  age: number;
  colorTheme: string;
  constellationId?: number; // Track which constellation this node belongs to
  constellationIndex?: number; // Index into CONSTELLATIONS array for connection data
  starIndex?: number; // Index within constellation.stars array for connection mapping
  phase?: number; // For algorithmic movement
  // 3D rotation for individual constellations
  rotation3D?: { x: number; y: number; z: number };
  baseX?: number; // Original position before 3D transform
  baseY?: number;
  // Neural network properties
  connections?: number[]; // Indices of connected nodes
  activation?: number; // For neural network patterns
  layer?: number; // For fractal/lattice structures
}

// Real constellation data (normalized coordinates 0-1)
interface Constellation {
  name: string;
  stars: { x: number; y: number; magnitude?: number }[];
  connections: [number, number][];
  type?: "constellation" | "nebula" | "cluster"; // Visual type
  density?: number; // For clusters/nebula
}

const CONSTELLATIONS: Constellation[] = [
  // Zodiac Constellations (12)
  {
    name: "Aries",
    type: "constellation",
    stars: [
      { x: 0.2, y: 0.3, magnitude: 0.7 },
      { x: 0.25, y: 0.35, magnitude: 0.6 },
      { x: 0.3, y: 0.4, magnitude: 0.8 },
      { x: 0.28, y: 0.45, magnitude: 0.5 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  {
    name: "Taurus",
    type: "constellation",
    stars: [
      { x: 0.4, y: 0.25, magnitude: 0.9 }, // Aldebaran
      { x: 0.45, y: 0.3, magnitude: 0.6 },
      { x: 0.5, y: 0.35, magnitude: 0.7 },
      { x: 0.55, y: 0.3, magnitude: 0.6 },
      { x: 0.6, y: 0.25, magnitude: 0.5 },
      { x: 0.48, y: 0.4, magnitude: 0.6 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [1, 5],
      [2, 5],
    ],
  },
  {
    name: "Gemini",
    type: "constellation",
    stars: [
      { x: 0.3, y: 0.2, magnitude: 0.8 }, // Castor
      { x: 0.35, y: 0.25, magnitude: 0.7 },
      { x: 0.4, y: 0.3, magnitude: 0.6 },
      { x: 0.5, y: 0.2, magnitude: 0.9 }, // Pollux
      { x: 0.55, y: 0.25, magnitude: 0.7 },
      { x: 0.6, y: 0.3, magnitude: 0.6 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [3, 4],
      [4, 5],
      [1, 4],
    ],
  },
  {
    name: "Cancer",
    type: "constellation",
    stars: [
      { x: 0.35, y: 0.4, magnitude: 0.5 },
      { x: 0.4, y: 0.45, magnitude: 0.6 },
      { x: 0.45, y: 0.5, magnitude: 0.7 },
      { x: 0.5, y: 0.45, magnitude: 0.6 },
      { x: 0.55, y: 0.4, magnitude: 0.5 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [0, 4],
    ],
  },
  {
    name: "Leo",
    type: "constellation",
    stars: [
      { x: 0.25, y: 0.3, magnitude: 0.9 }, // Regulus
      { x: 0.3, y: 0.35, magnitude: 0.7 },
      { x: 0.35, y: 0.4, magnitude: 0.6 },
      { x: 0.4, y: 0.45, magnitude: 0.7 },
      { x: 0.45, y: 0.5, magnitude: 0.6 },
      { x: 0.3, y: 0.5, magnitude: 0.5 },
      { x: 0.2, y: 0.4, magnitude: 0.6 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 1],
      [0, 6],
    ],
  },
  {
    name: "Virgo",
    type: "constellation",
    stars: [
      { x: 0.4, y: 0.15, magnitude: 0.8 }, // Spica
      { x: 0.45, y: 0.2, magnitude: 0.6 },
      { x: 0.5, y: 0.25, magnitude: 0.7 },
      { x: 0.55, y: 0.3, magnitude: 0.6 },
      { x: 0.6, y: 0.35, magnitude: 0.5 },
      { x: 0.5, y: 0.4, magnitude: 0.6 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 5],
    ],
  },
  {
    name: "Libra",
    type: "constellation",
    stars: [
      { x: 0.45, y: 0.35, magnitude: 0.7 },
      { x: 0.5, y: 0.4, magnitude: 0.8 },
      { x: 0.55, y: 0.35, magnitude: 0.7 },
      { x: 0.5, y: 0.3, magnitude: 0.6 },
      { x: 0.48, y: 0.45, magnitude: 0.5 },
      { x: 0.52, y: 0.45, magnitude: 0.5 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [1, 3],
      [1, 4],
      [1, 5],
    ],
  },
  {
    name: "Scorpius",
    type: "constellation",
    stars: [
      { x: 0.5, y: 0.2, magnitude: 0.9 }, // Antares
      { x: 0.52, y: 0.3, magnitude: 0.7 },
      { x: 0.54, y: 0.4, magnitude: 0.6 },
      { x: 0.56, y: 0.5, magnitude: 0.7 },
      { x: 0.58, y: 0.6, magnitude: 0.6 },
      { x: 0.6, y: 0.7, magnitude: 0.5 },
      { x: 0.48, y: 0.3, magnitude: 0.6 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [0, 6],
      [1, 6],
    ],
  },
  {
    name: "Sagittarius",
    type: "constellation",
    stars: [
      { x: 0.4, y: 0.5, magnitude: 0.7 },
      { x: 0.45, y: 0.55, magnitude: 0.6 },
      { x: 0.5, y: 0.6, magnitude: 0.8 },
      { x: 0.55, y: 0.55, magnitude: 0.6 },
      { x: 0.6, y: 0.5, magnitude: 0.7 },
      { x: 0.5, y: 0.45, magnitude: 0.5 },
      { x: 0.48, y: 0.65, magnitude: 0.6 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 5],
      [2, 6],
    ],
  },
  {
    name: "Capricornus",
    type: "constellation",
    stars: [
      { x: 0.35, y: 0.5, magnitude: 0.6 },
      { x: 0.4, y: 0.55, magnitude: 0.7 },
      { x: 0.45, y: 0.6, magnitude: 0.6 },
      { x: 0.5, y: 0.55, magnitude: 0.5 },
      { x: 0.55, y: 0.5, magnitude: 0.6 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  {
    name: "Aquarius",
    type: "constellation",
    stars: [
      { x: 0.3, y: 0.4, magnitude: 0.7 },
      { x: 0.35, y: 0.45, magnitude: 0.6 },
      { x: 0.4, y: 0.5, magnitude: 0.7 },
      { x: 0.45, y: 0.45, magnitude: 0.6 },
      { x: 0.5, y: 0.4, magnitude: 0.5 },
      { x: 0.55, y: 0.45, magnitude: 0.6 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
  },
  {
    name: "Pisces",
    type: "constellation",
    stars: [
      { x: 0.25, y: 0.5, magnitude: 0.6 },
      { x: 0.3, y: 0.55, magnitude: 0.7 },
      { x: 0.35, y: 0.6, magnitude: 0.6 },
      { x: 0.6, y: 0.4, magnitude: 0.7 },
      { x: 0.65, y: 0.45, magnitude: 0.6 },
      { x: 0.7, y: 0.5, magnitude: 0.5 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [3, 4],
      [4, 5],
      [1, 4],
    ],
  },
  // Classic Constellations
  {
    name: "Orion",
    type: "constellation",
    stars: [
      { x: 0.45, y: 0.3, magnitude: 0.5 }, // Betelgeuse
      { x: 0.55, y: 0.7, magnitude: 0.3 }, // Rigel
      { x: 0.48, y: 0.5, magnitude: 0.8 }, // Belt star 1
      { x: 0.5, y: 0.5, magnitude: 0.8 }, // Belt star 2
      { x: 0.52, y: 0.5, magnitude: 0.8 }, // Belt star 3
      { x: 0.42, y: 0.4, magnitude: 0.7 }, // Shoulder
      { x: 0.58, y: 0.4, magnitude: 0.7 }, // Shoulder
    ],
    connections: [
      [0, 5],
      [5, 2],
      [2, 3],
      [3, 4],
      [4, 6],
      [6, 1],
      [2, 1],
    ],
  },
  {
    name: "Ursa Major",
    type: "constellation",
    stars: [
      { x: 0.3, y: 0.4, magnitude: 0.6 },
      { x: 0.35, y: 0.35, magnitude: 0.6 },
      { x: 0.4, y: 0.35, magnitude: 0.6 },
      { x: 0.45, y: 0.4, magnitude: 0.6 },
      { x: 0.42, y: 0.5, magnitude: 0.5 },
      { x: 0.35, y: 0.5, magnitude: 0.5 },
      { x: 0.32, y: 0.55, magnitude: 0.5 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 0],
    ],
  },
  {
    name: "Cassiopeia",
    type: "constellation",
    stars: [
      { x: 0.4, y: 0.3, magnitude: 0.6 },
      { x: 0.45, y: 0.25, magnitude: 0.6 },
      { x: 0.5, y: 0.3, magnitude: 0.7 },
      { x: 0.55, y: 0.25, magnitude: 0.6 },
      { x: 0.6, y: 0.3, magnitude: 0.6 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  {
    name: "Cygnus",
    type: "constellation",
    stars: [
      { x: 0.5, y: 0.2, magnitude: 0.5 }, // Deneb
      { x: 0.5, y: 0.5, magnitude: 0.6 }, // Center
      { x: 0.4, y: 0.55, magnitude: 0.7 }, // Wing
      { x: 0.6, y: 0.55, magnitude: 0.7 }, // Wing
      { x: 0.5, y: 0.7, magnitude: 0.6 }, // Tail
    ],
    connections: [
      [0, 1],
      [1, 2],
      [1, 3],
      [1, 4],
    ],
  },
  // Dense Star Clusters
  {
    name: "Pleiades",
    type: "cluster",
    density: 0.9,
    stars: Array.from({ length: 25 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 25;
      const radius = (0.05 + Math.random() * 0.1) * (i % 3 === 0 ? 1.5 : 1);
      return {
        x: 0.5 + Math.cos(angle) * radius,
        y: 0.5 + Math.sin(angle) * radius,
        magnitude: 0.3 + Math.random() * 0.7,
      };
    }),
    connections: [],
  },
  {
    name: "Hyades",
    type: "cluster",
    density: 0.8,
    stars: Array.from({ length: 30 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 30;
      const radius = (0.08 + Math.random() * 0.12) * (i % 4 === 0 ? 1.3 : 1);
      return {
        x: 0.5 + Math.cos(angle) * radius,
        y: 0.5 + Math.sin(angle) * radius,
        magnitude: 0.4 + Math.random() * 0.6,
      };
    }),
    connections: [],
  },
  // Nebula
  {
    name: "Orion Nebula",
    type: "nebula",
    density: 0.7,
    stars: Array.from({ length: 40 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 40;
      const radius =
        (0.1 + Math.random() * 0.15) * (1 + Math.sin(angle * 3) * 0.3);
      return {
        x: 0.5 + Math.cos(angle) * radius,
        y: 0.5 + Math.sin(angle) * radius,
        magnitude: 0.2 + Math.random() * 0.8,
      };
    }),
    connections: [],
  },
  {
    name: "Eagle Nebula",
    type: "nebula",
    density: 0.75,
    stars: Array.from({ length: 35 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 35;
      const radius =
        (0.12 + Math.random() * 0.18) * (1 + Math.cos(angle * 2) * 0.4);
      return {
        x: 0.5 + Math.cos(angle) * radius,
        y: 0.5 + Math.sin(angle) * radius,
        magnitude: 0.3 + Math.random() * 0.7,
      };
    }),
    connections: [],
  },
  {
    name: "Crab Nebula",
    type: "nebula",
    density: 0.65,
    stars: Array.from({ length: 50 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 50;
      const radius =
        (0.08 + Math.random() * 0.2) * (1 + Math.sin(angle * 5) * 0.2);
      return {
        x: 0.5 + Math.cos(angle) * radius,
        y: 0.5 + Math.sin(angle) * radius,
        magnitude: 0.25 + Math.random() * 0.75,
      };
    }),
    connections: [],
  },
];

const COLOR_THEMES: Record<string, [number, number, number]> = {
  red: [255, 93, 125],
  green: [93, 255, 125],
  blue: [127, 180, 255],
  gold: [255, 215, 0],
  current: [127, 180, 255], // Will be set dynamically
};

const THEME_COLORS: Record<string, [number, number, number]> = {
  sovereign: [127, 180, 255],
  pipeline: [255, 181, 90],
  mesh: [255, 93, 125],
  interface: [200, 220, 255],
  research: [170, 210, 255],
  startup: [255, 200, 135],
  ip: [255, 135, 170],
  privacy: [170, 255, 220],
  neutral: [127, 180, 255],
};

// Performance constants
const MAX_NODES = 80;
const MAX_SPARKS = 25;
const MAX_TRAILS = 20;
const MAX_CONSTELLATIONS = 5;

export interface CanvasPlaygroundHandle {
  resetConstellation: () => void;
  dropConstellation: (x?: number, y?: number) => void;
}

const CanvasPlaygroundInner = forwardRef<CanvasPlaygroundHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<PlaygroundNode[]>([]);
  const pointerRef = useRef({
    x: 0,
    y: 0,
    down: false,
    lastX: 0,
    lastY: 0,
    velocity: { x: 0, y: 0 },
    trail: [] as { x: number; y: number; age: number }[],
    pinchDistance: 0,
    pinchStart: 0,
    isPinching: false,
    touchIds: [] as number[],
  });
  const dimensionsRef = useRef({ W: 0, H: 0 });
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef(performance.now());
  const connectionFrameRef = useRef(0);
  const constellationIdRef = useRef(0);
  const [selectedColor, setSelectedColor] = useState<string>("current");
  // Track which constellation to drop next
  const nextConstellationIndexRef = useRef(0);
  // Track 3D rotation for each constellation
  const constellationRotationsRef = useRef<
    Map<number, { x: number; y: number; z: number }>
  >(new Map());
  // Track which constellation is being rotated (right-click/two-finger)
  const rotatingConstellationIdRef = useRef<number | null>(null);
  // Pulse color rotation
  const pulseColorIndexRef = useRef(0);
  const pulseColorRotationRef = useRef(0);

  // New state for interactivity features
  const [clickCount, setClickCount] = useState(0);
  // Use refs for values that don't need to trigger re-renders but are used in event handlers
  const rotation3DRef = useRef({ x: 0, y: 0, z: 0 });
  const isRotatingRef = useRef(false);
  const currentConstellationRef = useRef(0);
  const rotationStartRef = useRef({ x: 0, y: 0 });

  // Keep state versions for UI display only
  const [rotation3D, setRotation3D] = useState({ x: 0, y: 0, z: 0 });
  const [isRotating, setIsRotating] = useState(false);
  const [currentConstellation, setCurrentConstellation] = useState(0);

  // Mobile gesture tracking
  const touchStateRef = useRef({
    touches: [] as { id: number; x: number; y: number }[],
    lastPinchDistance: 0,
    lastRotationAngle: 0,
  });
  // Long press detection
  const longPressTimerRef = useRef<number | null>(null);
  const longPressThreshold = 500; // 500ms
  const longPressActiveRef = useRef(false);
  // Warping/fractal effects
  const warpEffectRef = useRef<{
    active: boolean;
    centerX: number;
    centerY: number;
    intensity: number;
    time: number;
  }>({ active: false, centerX: 0, centerY: 0, intensity: 0, time: 0 });

  const { mode, theme, sealPulse, burst, toggleMode, pulseSeal, spawnBurst } =
    useApp();

  // Update current color theme based on app theme
  useEffect(() => {
    COLOR_THEMES.current = THEME_COLORS[theme] || THEME_COLORS.neutral;
  }, [theme]);

  const colorOptions = ["red", "green", "blue", "gold", "current"];

  const getColorForTheme = useCallback(
    (colorTheme: string): [number, number, number] => {
      if (colorTheme === "current") {
        return THEME_COLORS[theme] || THEME_COLORS.neutral;
      }
      return COLOR_THEMES[colorTheme] || COLOR_THEMES.blue;
    },
    [theme],
  );

  const makeNode = useCallback(
    (
      x: number,
      y: number,
      vx = 0,
      vy = 0,
      kind: "node" | "spark" | "trail" | "constellation" = "node",
      colorTheme = selectedColor,
      constellationId?: number,
    ): PlaygroundNode => {
      const baseR = kind === "trail" ? 1.5 : kind === "spark" ? 2 : 2.5;
      return {
        x,
        y,
        vx: vx + (Math.random() - 0.5) * (kind === "spark" ? 1.5 : 0.4),
        vy: vy + (Math.random() - 0.5) * (kind === "spark" ? 1.5 : 0.4),
        r: baseR + Math.random() * (kind === "trail" ? 0.8 : 1.5),
        life:
          kind === "trail"
            ? 300 // Slowed down significantly (was 50)
            : kind === "spark"
              ? 800 + Math.random() * 400 // Much longer life (was 150-250)
              : Number.POSITIVE_INFINITY,
        kind,
        hue: Math.random() * 40 - 20,
        age: 0,
        colorTheme,
        constellationId,
        phase: Math.random() * Math.PI * 2, // For algorithmic patterns
      };
    },
    [selectedColor],
  );

  const dropConstellation = useCallback(
    (x?: number, y?: number) => {
      const { W, H } = dimensionsRef.current;
      if (W === 0 || H === 0) return;

      const cx = x ?? W * 0.5;
      const cy = y ?? H * 0.5;
      const colorTheme = selectedColor;

      // Show swaths of night sky - drop 3-5 constellations in a region
      const swathCount = 3 + Math.floor(Math.random() * 3); // 3-5 constellations
      const swathSpread = Math.min(W, H) * 0.4; // Spread area

      for (let s = 0; s < swathCount; s++) {
        const constellationId = constellationIdRef.current++;

        // Rotate through actual constellations
        const constellationIndex = nextConstellationIndexRef.current;
        nextConstellationIndexRef.current =
          (nextConstellationIndexRef.current + 1) % CONSTELLATIONS.length;

        const constellation = CONSTELLATIONS[constellationIndex];
        const scale = Math.min(W, H) * (0.2 + Math.random() * 0.15);

        // Offset position within swath
        const offsetX = (Math.random() - 0.5) * swathSpread;
        const offsetY = (Math.random() - 0.5) * swathSpread;
        const swathX = cx + offsetX;
        const swathY = cy + offsetY;

        // Initialize 3D rotation for this constellation
        constellationRotationsRef.current.set(constellationId, {
          x: 0,
          y: 0,
          z: 0,
        });

        // Create nodes from actual constellation data
        constellation.stars.forEach((star, starIndex) => {
          const baseX = swathX + (star.x - 0.5) * scale;
          const baseY = swathY + (star.y - 0.5) * scale;
          const magnitude = star.magnitude || 0.5;

          // Adjust size based on type
          let nodeSize = 2.5 + magnitude * 3;
          if (constellation.type === "nebula") {
            nodeSize *= 0.6 + magnitude * 0.4; // Smaller, more varied
          } else if (constellation.type === "cluster") {
            nodeSize *= 0.4 + magnitude * 0.6; // Dense, smaller stars
          }

          const node = makeNode(
            baseX,
            baseY,
            0,
            0,
            "constellation",
            colorTheme,
            constellationId,
          );
          node.r = nodeSize;
          node.constellationIndex = constellationIndex;
          node.starIndex = starIndex;
          node.baseX = baseX;
          node.baseY = baseY;
          node.rotation3D = { x: 0, y: 0, z: 0 };
          nodesRef.current.push(node);
        });
      }

      // Enforce limits - remove oldest constellations if needed (allow more for swaths)
      const constellations = new Set(
        nodesRef.current
          .map((n) => n.constellationId)
          .filter((id) => id !== undefined),
      );
      if (constellations.size > MAX_CONSTELLATIONS * 2) {
        const sortedIds = Array.from(constellations).sort();
        const toRemove = sortedIds.slice(
          0,
          sortedIds.length - MAX_CONSTELLATIONS * 2,
        );
        toRemove.forEach((id) => {
          constellationRotationsRef.current.delete(id);
        });
        nodesRef.current = nodesRef.current.filter(
          (n) => !toRemove.includes(n.constellationId ?? -1),
        );
      }
    },
    [makeNode, selectedColor],
  );

  const resetConstellation = useCallback(() => {
    const { W, H } = dimensionsRef.current;
    if (W === 0 || H === 0) return;

    nodesRef.current = [];
    constellationIdRef.current = 0;
    dropConstellation();
  }, [dropConstellation]);

  useImperativeHandle(ref, () => ({
    resetConstellation,
    dropConstellation,
  }));

  const spawnCluster = useCallback(
    (x: number, y: number, count: number, vx = 0, vy = 0) => {
      // Reduce particle count on mobile for performance
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const adjustedCount = isMobile ? Math.floor(count * 0.6) : count;

      for (let i = 0; i < adjustedCount; i++) {
        const angle = (Math.PI * 2 * i) / adjustedCount + Math.random() * 0.5;
        const dist = 10 + Math.random() * 30;
        const nx = x + Math.cos(angle) * dist;
        const ny = y + Math.sin(angle) * dist;
        nodesRef.current.push(
          makeNode(
            nx,
            ny,
            vx * 0.25 + Math.cos(angle) * 0.4,
            vy * 0.25 + Math.sin(angle) * 0.4,
            "spark",
            selectedColor,
          ),
        );
      }
      // Cap nodes - lower limit on mobile
      const maxNodes = isMobile ? 150 : 300;
      if (nodesRef.current.length > maxNodes) {
        nodesRef.current.splice(0, nodesRef.current.length - maxNodes);
      }
    },
    [makeNode, selectedColor],
  );

  const spawnConstellation = useCallback(
    (
      constellationIndex: number,
      centerX: number,
      centerY: number,
      scale = 100,
    ) => {
      // Use dropConstellation to spawn swaths instead of single constellation
      dropConstellation(centerX, centerY);
    },
    [dropConstellation],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Enable hardware acceleration and optimize for mobile
    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true, // Reduces input latency on mobile
      willReadFrequently: false,
    });
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();

      // Optimize DPR for performance on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

      const W = Math.floor(rect.width);
      const H = Math.floor(rect.height);

      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      dimensionsRef.current = { W, H };

      // Seed initial constellation with fewer nodes on mobile
      if (nodesRef.current.length === 0) {
        const nodeCount = isMobile ? 15 : 25;
        for (let i = 0; i < nodeCount; i++) {
          nodesRef.current.push(
            makeNode(Math.random() * W, Math.random() * H, 0, 0, "node"),
          );
        }
      }
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener("resize", resize);

    const getCanvasCoords = (e: MouseEvent | TouchEvent, index = 0) => {
      const rect = canvas.getBoundingClientRect();
      const t =
        "touches" in e ? e.touches[index] || e.changedTouches[index] : null;
      const clientX = t ? t.clientX : (e as MouseEvent).clientX;
      const clientY = t ? t.clientY : (e as MouseEvent).clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const getDistance = (touch1: Touch, touch2: Touch) => {
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const coords = getCanvasCoords(e);
      pointerRef.current.down = true;
      pointerRef.current.x = coords.x;
      pointerRef.current.y = coords.y;
      pointerRef.current.lastX = coords.x;
      pointerRef.current.lastY = coords.y;
      pointerRef.current.velocity = { x: 0, y: 0 };
      pointerRef.current.trail = [];

      // Long press detection for touch events
      if ("touches" in e && e.touches.length === 1) {
        longPressActiveRef.current = false;
        longPressTimerRef.current = window.setTimeout(() => {
          longPressActiveRef.current = true;
          // Schrodinger twist / ripple effect
          warpEffectRef.current = {
            active: true,
            centerX: coords.x,
            centerY: coords.y,
            intensity: 1.0,
            time: 0,
          };
          // Create ripple effect
          for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const dist = 30 + Math.random() * 20;
            const nx = coords.x + Math.cos(angle) * dist;
            const ny = coords.y + Math.sin(angle) * dist;
            nodesRef.current.push(
              makeNode(
                nx,
                ny,
                Math.cos(angle) * 2,
                Math.sin(angle) * 2,
                "spark",
                selectedColor,
              ),
            );
          }
        }, longPressThreshold);
      } else {
        // Mouse click - increment click count
        setClickCount((prev) => prev + 1);

        // Every 5 clicks, spawn a constellation
        if ((clickCount + 1) % 5 === 0) {
          const nextConstellation =
            (currentConstellationRef.current + 1) % CONSTELLATIONS.length;
          currentConstellationRef.current = nextConstellation;
          setCurrentConstellation(nextConstellation);
          spawnConstellation(
            currentConstellationRef.current,
            coords.x,
            coords.y,
            120,
          );
        } else {
          // Spawn initial burst on click
          spawnCluster(coords.x, coords.y, 8);
        }
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const coords = getCanvasCoords(e);
      rotationStartRef.current = { x: coords.x, y: coords.y };

      // Find which constellation is under the pointer
      const nodes = nodesRef.current;
      let foundConstellationId: number | null = null;
      let minDist = Infinity;

      for (const node of nodes) {
        if (
          node.kind === "constellation" &&
          node.constellationId !== undefined
        ) {
          const dx = node.x - coords.x;
          const dy = node.y - coords.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100 && dist < minDist) {
            minDist = dist;
            foundConstellationId = node.constellationId;
          }
        }
      }

      rotatingConstellationIdRef.current = foundConstellationId;
      isRotatingRef.current = true;
      setIsRotating(true);
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const coords = getCanvasCoords(e);

      // Handle 3D rotation (individual constellation or global)
      if (isRotatingRef.current && e instanceof MouseEvent) {
        const dx = coords.x - rotationStartRef.current.x;
        const dy = coords.y - rotationStartRef.current.y;

        if (rotatingConstellationIdRef.current !== null) {
          // Rotate individual constellation
          const rot = constellationRotationsRef.current.get(
            rotatingConstellationIdRef.current,
          );
          if (rot) {
            rot.x += dy * 0.01;
            rot.y += dx * 0.01;
            constellationRotationsRef.current.set(
              rotatingConstellationIdRef.current,
              rot,
            );
          }
        } else {
          // Rotate entire canvas
          rotation3DRef.current = {
            x: rotation3DRef.current.x + dy * 0.01,
            y: rotation3DRef.current.y + dx * 0.01,
            z: rotation3DRef.current.z,
          };
          setRotation3D(rotation3DRef.current);
        }
        rotationStartRef.current = { x: coords.x, y: coords.y };
        return;
      }

      if (pointerRef.current.down) {
        const dx = coords.x - pointerRef.current.lastX;
        const dy = coords.y - pointerRef.current.lastY;
        const speed = Math.sqrt(dx * dx + dy * dy);

        pointerRef.current.velocity.x =
          pointerRef.current.velocity.x * 0.7 + dx * 0.3;
        pointerRef.current.velocity.y =
          pointerRef.current.velocity.y * 0.7 + dy * 0.3;

        pointerRef.current.trail.push({ x: coords.x, y: coords.y, age: 0 });
        if (pointerRef.current.trail.length > 30) {
          pointerRef.current.trail.shift();
        }

        if (
          speed > 2 &&
          nodesRef.current.filter((n) => n.kind === "trail").length < MAX_TRAILS
        ) {
          nodesRef.current.push(
            makeNode(
              coords.x,
              coords.y,
              pointerRef.current.velocity.x * 0.08,
              pointerRef.current.velocity.y * 0.08,
              "trail",
              selectedColor,
            ),
          );
        }

        // Enhanced force application with constellation grouping
        const nodes = nodesRef.current;
        const attractionRadius = 150;
        const repulsionRadius = 60;

        for (let i = 0; i < nodes.length; i += 1) {
          const n = nodes[i];
          const ndx = n.x - coords.x;
          const ndy = n.y - coords.y;
          const distSq = ndx * ndx + ndy * ndy;

          if (distSq < attractionRadius * attractionRadius && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const normalizedDx = ndx / dist;
            const normalizedDy = ndy / dist;

            // Stronger force for nodes in the same constellation
            const sameConstellation = n.constellationId !== undefined;
            const forceMultiplier = sameConstellation ? 1.3 : 1.0;

            if (speed > 12 && distSq < repulsionRadius * repulsionRadius) {
              const force =
                (1 - dist / repulsionRadius) * 0.6 * forceMultiplier;
              n.vx += normalizedDx * force * (speed * 0.04);
              n.vy += normalizedDy * force * (speed * 0.04);
            } else if (speed < 6) {
              const force =
                (1 - dist / attractionRadius) * 0.12 * forceMultiplier;
              n.vx -= normalizedDx * force;
              n.vy -= normalizedDy * force;
            } else {
              const force =
                (1 - dist / attractionRadius) * 0.08 * forceMultiplier;
              n.vx += normalizedDy * force * Math.sign(dx) * 0.5;
              n.vy -= normalizedDx * force * Math.sign(dx) * 0.5;
            }
          }
        }

        if (speed > 15 && Math.random() > 0.6) {
          spawnCluster(
            coords.x,
            coords.y,
            2,
            pointerRef.current.velocity.x,
            pointerRef.current.velocity.y,
          );
        }

        pointerRef.current.lastX = coords.x;
        pointerRef.current.lastY = coords.y;
      }

      pointerRef.current.x = coords.x;
      pointerRef.current.y = coords.y;
    };

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      // Clear long press timer
      if (longPressTimerRef.current !== null) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      // Handle touch release - if long press was active, don't trigger click
      if ("touches" in e && longPressActiveRef.current) {
        longPressActiveRef.current = false;
        pointerRef.current.down = false;
        return;
      }

      if (pointerRef.current.down) {
        if (pointerRef.current.isPinching) {
          pointerRef.current.isPinching = false;
          pointerRef.current.touchIds = [];
        } else {
          const vx = pointerRef.current.velocity.x;
          const vy = pointerRef.current.velocity.y;
          const speed = Math.sqrt(vx * vx + vy * vy);

          if (speed > 4) {
            const coords = getCanvasCoords(e);
            spawnCluster(
              coords.x,
              coords.y,
              Math.min(12, Math.floor(speed * 0.8)),
              vx * 0.4,
              vy * 0.4,
            );
          }
        }
      }
      pointerRef.current.down = false;
      isRotatingRef.current = false;
      setIsRotating(false);
      rotatingConstellationIdRef.current = null;
    };

    // Advanced touch gesture handlers for mobile
    const onTouchStart = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      touchStateRef.current.touches = Array.from(e.touches).map((t) => ({
        id: t.identifier,
        x: t.clientX - rect.left,
        y: t.clientY - rect.top,
      }));

      if (e.touches.length === 1) {
        // Single touch - treat as click
        onPointerDown(e);
      } else if (e.touches.length === 2) {
        // Two-finger gesture - calculate initial distance and angle
        const [t1, t2] = touchStateRef.current.touches;
        const centerX = (t1.x + t2.x) / 2;
        const centerY = (t1.y + t2.y) / 2;

        // Find which constellation is under the center point
        const nodes = nodesRef.current;
        let foundConstellationId: number | null = null;
        let minDist = Infinity;

        for (const node of nodes) {
          if (
            node.kind === "constellation" &&
            node.constellationId !== undefined
          ) {
            const dx = node.x - centerX;
            const dy = node.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100 && dist < minDist) {
              minDist = dist;
              foundConstellationId = node.constellationId;
            }
          }
        }

        rotatingConstellationIdRef.current = foundConstellationId;

        const dx = t2.x - t1.x;
        const dy = t2.y - t1.y;
        touchStateRef.current.lastPinchDistance = Math.sqrt(dx * dx + dy * dy);
        touchStateRef.current.lastRotationAngle = Math.atan2(dy, dx);
        isRotatingRef.current = true;
        setIsRotating(true);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const currentTouches = Array.from(e.touches).map((t) => ({
        id: t.identifier,
        x: t.clientX - rect.left,
        y: t.clientY - rect.top,
      }));

      if (e.touches.length === 1) {
        // Single touch - treat as drag
        onPointerMove(e);
      } else if (e.touches.length === 2) {
        // Two-finger gestures
        const [t1, t2] = currentTouches;
        const dx = t2.x - t1.x;
        const dy = t2.y - t1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Warping/stretching and fractal build/bloom effect
        if (touchStateRef.current.lastPinchDistance > 0) {
          const pinchDelta = distance - touchStateRef.current.lastPinchDistance;
          const centerX = (t1.x + t2.x) / 2;
          const centerY = (t1.y + t2.y) / 2;

          // Activate warp effect
          warpEffectRef.current = {
            active: true,
            centerX,
            centerY,
            intensity: Math.min(2.0, Math.abs(pinchDelta) * 0.01),
            time: 0,
          };

          // Fractal build/bloom - create branching particles
          if (Math.abs(pinchDelta) > 5) {
            const branchCount = Math.min(
              15,
              Math.floor(Math.abs(pinchDelta) / 3),
            );
            for (let i = 0; i < branchCount; i++) {
              const angle =
                (Math.PI * 2 * i) / branchCount + Math.random() * 0.3;
              const dist = 20 + Math.random() * 30;
              const nx = centerX + Math.cos(angle) * dist;
              const ny = centerY + Math.sin(angle) * dist;
              const speed = 1 + Math.random() * 2;
              nodesRef.current.push(
                makeNode(
                  nx,
                  ny,
                  Math.cos(angle) * speed,
                  Math.sin(angle) * speed,
                  "spark",
                  selectedColor,
                ),
              );
            }
          }
        }

        // Two-finger rotation
        if (touchStateRef.current.lastRotationAngle !== 0) {
          const angleDelta = angle - touchStateRef.current.lastRotationAngle;

          if (rotatingConstellationIdRef.current !== null) {
            // Rotate individual constellation
            const rot = constellationRotationsRef.current.get(
              rotatingConstellationIdRef.current,
            );
            if (rot) {
              rot.x += Math.sin(angleDelta) * 0.5;
              rot.y += Math.cos(angleDelta) * 0.5;
              constellationRotationsRef.current.set(
                rotatingConstellationIdRef.current,
                rot,
              );
            }
          } else {
            // Rotate entire canvas
            rotation3DRef.current = {
              x: rotation3DRef.current.x + Math.sin(angleDelta) * 0.5,
              y: rotation3DRef.current.y + Math.cos(angleDelta) * 0.5,
              z: rotation3DRef.current.z,
            };
            setRotation3D(rotation3DRef.current);
          }
        }

        touchStateRef.current.lastPinchDistance = distance;
        touchStateRef.current.lastRotationAngle = angle;
      }

      touchStateRef.current.touches = currentTouches;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        touchStateRef.current.touches = [];
        touchStateRef.current.lastPinchDistance = 0;
        touchStateRef.current.lastRotationAngle = 0;
        isRotatingRef.current = false;
        setIsRotating(false);
        rotatingConstellationIdRef.current = null;
        onPointerUp(e);
      } else if (e.touches.length === 1) {
        // Reset to single touch
        const rect = canvas.getBoundingClientRect();
        touchStateRef.current.touches = Array.from(e.touches).map((t) => ({
          id: t.identifier,
          x: t.clientX - rect.left,
          y: t.clientY - rect.top,
        }));
        touchStateRef.current.lastPinchDistance = 0;
        touchStateRef.current.lastRotationAngle = 0;
        isRotatingRef.current = false;
        setIsRotating(false);
        rotatingConstellationIdRef.current = null;
      }
    };

    canvas.addEventListener("mousedown", onPointerDown);
    canvas.addEventListener("mousemove", onPointerMove);
    canvas.addEventListener("mouseup", onPointerUp);
    canvas.addEventListener("mouseleave", onPointerUp);
    canvas.addEventListener("contextmenu", onContextMenu);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);

    // Page visibility optimization
    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastTimeRef.current = performance.now();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Animation loop with performance optimizations
    const step = (t: number) => {
      // Skip rendering if page is hidden
      if (!isVisible) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }

      const dt = Math.min(0.05, (t - lastTimeRef.current) / 1000);
      lastTimeRef.current = t;

      const { W, H } = dimensionsRef.current;
      if (W === 0 || H === 0) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(5, 8, 20, 0.3)";
      ctx.fillRect(0, 0, W, H);

      // Apply 3D rotation transforms only when actively rotating
      ctx.save();
      const rot = rotation3DRef.current;
      const isRotating = isRotatingRef.current;

      // Only apply global 3D transform if actively rotating (not by default)
      if (isRotating && (Math.abs(rot.x) > 0.01 || Math.abs(rot.y) > 0.01)) {
        ctx.translate(W / 2, H / 2);
        const cosX = Math.cos(rot.x);
        const cosY = Math.cos(rot.y);
        // Apply rotation matrix (simplified 3D to 2D projection)
        const scale = 0.5 + 0.5 * cosX;
        ctx.scale(scale * cosY, scale);
        ctx.translate(-W / 2, -H / 2);
      }

      const nodes = nodesRef.current;
      const isLive = mode === "live";
      const currentPulse = sealPulse;
      const currentBurst = burst;
      const maxDist = isLive ? 160 : 120;
      const pulseBoost = 1 + currentPulse * 0.3;
      const effectiveMaxDist = maxDist * pulseBoost;

      // Update trail (slowed down fade)
      const trail = pointerRef.current.trail;
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age += dt * 20; // Slower aging (was 60)
        if (trail[i].age > 300) {
          // Longer life (was 25)
          trail.splice(i, 1);
        }
      }

      if (pointerRef.current.down && trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        const [r, g, b] = getColorForTheme(selectedColor);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.25)`;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Burst effect
      if (currentBurst > 0.5) {
        const cx = W * 0.5;
        const cy = H * 0.5;
        const burstCount = Math.min(10, Math.floor(currentBurst * 8));
        for (let i = 0; i < burstCount; i++) {
          const angle = (Math.PI * 2 * i) / burstCount + Math.random() * 0.2;
          const speed = 1.5 + Math.random() * 2;
          const nx = cx + Math.cos(angle) * 15;
          const ny = cy + Math.sin(angle) * 15;
          nodesRef.current.push(
            makeNode(
              nx,
              ny,
              Math.cos(angle) * speed,
              Math.sin(angle) * speed,
              "spark",
              selectedColor,
            ),
          );
        }
      }

      // Update nodes with algorithmic patterns for live mode
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        n.age += dt * 60;

        const friction = n.kind === "trail" ? 0.91 : 0.97;
        n.vx *= friction;
        n.vy *= friction;

        // Apply 3D rotation to constellation nodes
        if (
          n.kind === "constellation" &&
          n.constellationId !== undefined &&
          n.baseX !== undefined &&
          n.baseY !== undefined
        ) {
          const rot = constellationRotationsRef.current.get(n.constellationId);
          if (rot) {
            // Calculate center of constellation
            const constellationNodes = nodes.filter(
              (other) =>
                other.constellationId === n.constellationId &&
                other.kind === "constellation",
            );
            let centerX = 0;
            let centerY = 0;
            for (const other of constellationNodes) {
              if (other.baseX !== undefined && other.baseY !== undefined) {
                centerX += other.baseX;
                centerY += other.baseY;
              }
            }
            centerX /= constellationNodes.length;
            centerY /= constellationNodes.length;

            // Apply 3D rotation transform
            const dx = n.baseX - centerX;
            const dy = n.baseY - centerY;
            const cosX = Math.cos(rot.x);
            const sinX = Math.sin(rot.x);
            const cosY = Math.cos(rot.y);
            const sinY = Math.sin(rot.y);

            // 3D rotation matrix (simplified)
            const rotatedX = dx * cosY - dy * sinX * sinY;
            const rotatedY = dy * cosX + dx * sinY * cosX;
            const scale = 0.8 + 0.2 * Math.cos(rot.z);

            n.x = centerX + rotatedX * scale;
            n.y = centerY + rotatedY * scale;
          }
        }

        if (n.kind === "node") {
          // Neural lattice network patterns in live mode
          if (isLive && n.phase !== undefined) {
            const time = t * 0.001;

            // Initialize neural network properties if needed
            if (n.connections === undefined) {
              n.connections = [];
              n.activation = Math.random();
              n.layer = Math.floor(Math.random() * 3);
            }

            // Neural lattice movement - nodes form small-world network patterns
            const layer = n.layer ?? 0;
            const latticeRadius = 25 + layer * 15;
            const latticeSpeed = 0.5 + layer * 0.2;

            // Circular lattice pattern (neural network topology)
            const latticeX =
              Math.cos(n.phase + time * latticeSpeed) * latticeRadius;
            const latticeY =
              Math.sin(n.phase + time * latticeSpeed) * latticeRadius;

            // Fractal growth pattern - nodes attract to form clusters
            let clusterX = 0;
            let clusterY = 0;
            let clusterCount = 0;
            for (const other of nodes) {
              if (
                other.kind === "node" &&
                other !== n &&
                (other.layer ?? 0) === layer
              ) {
                const dx = other.x - n.x;
                const dy = other.y - n.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 80) {
                  clusterX += other.x;
                  clusterY += other.y;
                  clusterCount++;
                }
              }
            }
            if (clusterCount > 0) {
              clusterX /= clusterCount;
              clusterY /= clusterCount;
              const dx = clusterX - n.x;
              const dy = clusterY - n.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 0) {
                const attraction = 0.05;
                n.vx += (dx / dist) * attraction;
                n.vy += (dy / dist) * attraction;
              }
            }

            // Apply lattice movement
            n.vx += latticeX * 0.08;
            n.vy += latticeY * 0.08;

            // Activation wave (neural network firing pattern)
            n.activation = Math.sin(time * 2 + n.phase) * 0.5 + 0.5;
          } else {
            // Calm mode - gentle drift
            const driftIntensity = 0.015;
            n.vx += (Math.random() - 0.5) * driftIntensity;
            n.vy += (Math.random() - 0.5) * driftIntensity;
          }
        }

        // Pulse effect - rotate through colors with dispersed patterns
        if (currentPulse > 0.3) {
          // Rotate color index during pulse
          pulseColorRotationRef.current += dt * 2;
          if (pulseColorRotationRef.current > 1) {
            pulseColorRotationRef.current = 0;
            pulseColorIndexRef.current =
              (pulseColorIndexRef.current + 1) % colorOptions.length;
          }

          // Apply dispersed pulse pattern (multi-colored network)
          const pulsePhase = pulseColorRotationRef.current;
          const colorIndex =
            (pulseColorIndexRef.current +
              Math.floor(
                (Math.sqrt((n.x - W * 0.5) ** 2 + (n.y - H * 0.5) ** 2) / 200) *
                  colorOptions.length,
              )) %
            colorOptions.length;
          const pulseColor = colorOptions[colorIndex];
          if (pulseColor !== "current") {
            n.colorTheme = pulseColor;
          }

          // Radial pulse force with dispersion
          const dx = n.x - W * 0.5;
          const dy = n.y - H * 0.5;
          const distSq = dx * dx + dy * dy;
          if (distSq > 0) {
            const dist = Math.sqrt(distSq);
            const angle = Math.atan2(dy, dx);
            // Dispersed pattern - nodes move in spiral pattern
            const spiralAngle = angle + pulsePhase * Math.PI * 2;
            const pulseForce = currentPulse * 0.15;
            n.vx += Math.cos(spiralAngle) * pulseForce * dt * 60;
            n.vy += Math.sin(spiralAngle) * pulseForce * dt * 60;
          }
        }

        // Apply warp effect (warping/stretching)
        if (warpEffectRef.current.active) {
          const warp = warpEffectRef.current;
          const dx = n.x - warp.centerX;
          const dy = n.y - warp.centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            const warpFactor = 1 + warp.intensity * Math.exp(-dist / 100);
            n.vx += (dx / dist) * (warpFactor - 1) * 0.1;
            n.vy += (dy / dist) * (warpFactor - 1) * 0.1;
          }
          warp.time += dt;
          if (warp.time > 0.5) {
            warp.intensity *= 0.95; // Fade out
            if (warp.intensity < 0.1) {
              warp.active = false;
            }
          }
        }

        n.x += n.vx;
        n.y += n.vy;

        const margin = 15;
        if (n.x < margin) {
          n.x = margin;
          n.vx *= -0.4;
        } else if (n.x > W - margin) {
          n.x = W - margin;
          n.vx *= -0.4;
        }
        if (n.y < margin) {
          n.y = margin;
          n.vy *= -0.4;
        } else if (n.y > H - margin) {
          n.y = H - margin;
          n.vy *= -0.4;
        }

        if (n.life !== Number.POSITIVE_INFINITY) {
          n.life -= 20 * dt; // Slower fade (was 60)
          if (n.life <= 0) {
            nodes.splice(i, 1);
            continue;
          }
        }

        // Simplified merging
        if (n.kind === "spark" && n.age > 50) {
          for (let j = 0; j < nodes.length; j++) {
            if (i === j || nodes[j].kind !== "node") continue;
            const other = nodes[j];
            const dx = n.x - other.x;
            const dy = n.y - other.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < 144) {
              other.vx = (other.vx + n.vx * 0.25) * 0.85;
              other.vy = (other.vy + n.vy * 0.25) * 0.85;
              other.r = Math.min(5, other.r + 0.08);
              nodes.splice(i, 1);
              break;
            }
          }
        }
      }

      // Enforce particle caps
      const currentNodes = nodesRef.current;
      const sparks = currentNodes.filter((n) => n.kind === "spark");
      const trails = currentNodes.filter((n) => n.kind === "trail");
      const regularNodes = currentNodes.filter(
        (n) => n.kind === "node" || n.kind === "constellation",
      );

      // Prune excess sparks
      if (sparks.length > MAX_SPARKS) {
        sparks.sort((a, b) => a.age - b.age); // Remove oldest first
        const toRemove = sparks.slice(0, sparks.length - MAX_SPARKS);
        nodesRef.current = nodesRef.current.filter(
          (n) => !toRemove.includes(n),
        );
      }

      // Prune excess trails
      const currentTrails = nodesRef.current.filter((n) => n.kind === "trail");
      if (currentTrails.length > MAX_TRAILS) {
        currentTrails.sort((a, b) => a.age - b.age); // Remove oldest first
        const toRemove = currentTrails.slice(
          0,
          currentTrails.length - MAX_TRAILS,
        );
        nodesRef.current = nodesRef.current.filter(
          (n) => !toRemove.includes(n),
        );
      }

      // Prune excess total nodes (prioritize keeping constellations)
      const finalNodes = nodesRef.current;
      if (finalNodes.length > MAX_NODES) {
        // Sort by priority: keep constellations, then nodes, then others
        const sorted = [...finalNodes].sort((a, b) => {
          if (a.kind === "constellation" && b.kind !== "constellation")
            return -1;
          if (a.kind !== "constellation" && b.kind === "constellation")
            return 1;
          if (a.kind === "node" && b.kind !== "node") return -1;
          if (a.kind !== "node" && b.kind === "node") return 1;
          return a.age - b.age; // Remove oldest of same kind
        });
        nodesRef.current = sorted.slice(0, MAX_NODES);
      }

      // Draw constellation connections first
      const constellationNodes = new Map<number, PlaygroundNode[]>();
      nodes.forEach((node) => {
        if (
          node.kind === "constellation" &&
          node.constellationId !== undefined &&
          node.constellationIndex !== undefined
        ) {
          if (!constellationNodes.has(node.constellationId)) {
            constellationNodes.set(node.constellationId, []);
          }
          constellationNodes.get(node.constellationId)!.push(node);
        }
      });

      // Draw constellation connections using CONSTELLATIONS data
      constellationNodes.forEach((constNodes, constellationId) => {
        if (constNodes.length === 0) return;
        const firstNode = constNodes[0];
        if (
          firstNode.constellationIndex === undefined ||
          firstNode.starIndex === undefined
        )
          return;

        const constellation = CONSTELLATIONS[firstNode.constellationIndex];
        if (!constellation) return;

        // Create map of starIndex -> node for quick lookup
        const nodeMap = new Map<number, PlaygroundNode>();
        constNodes.forEach((node) => {
          if (node.starIndex !== undefined) {
            nodeMap.set(node.starIndex, node);
          }
        });

        // Draw connections
        const [r, g, b] = getColorForTheme(firstNode.colorTheme);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
        ctx.lineWidth = 2;

        constellation.connections.forEach(([startIdx, endIdx]) => {
          const start = nodeMap.get(startIdx);
          const end = nodeMap.get(endIdx);
          if (start && end) {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
          }
        });
      });

      // Draw connections with glow effect
      let linkCount = 0;
      ctx.lineWidth = 1;
      const maxDistSq = effectiveMaxDist * effectiveMaxDist;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (a.kind === "trail" || a.kind === "constellation") continue;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          if (b.kind === "trail" || b.kind === "constellation") continue;

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const t01 = 1 - dist / effectiveMaxDist;
            const baseAlpha =
              (a.kind === "spark" || b.kind === "spark" ? 0.15 : 0.22) *
              pulseBoost;
            const alpha = t01 * baseAlpha;

            // Use node's color theme
            const [rA, gA, bA] = getColorForTheme(a.colorTheme);
            const [rB, gB, bB] = getColorForTheme(b.colorTheme);

            // Blend colors if different themes
            const rFinal = (rA + rB) * 0.5;
            const gFinal = (gA + gB) * 0.5;
            const bFinal = (bA + bB) * 0.5;

            ctx.strokeStyle = `rgba(${rFinal}, ${gFinal}, ${bFinal}, ${alpha})`;
            ctx.lineWidth = 0.8 + t01 * 0.4;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes with their color themes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.kind === "trail") {
          const alpha = Math.max(0, n.life / 300) * 0.5; // Adjusted for longer life
          const [r, g, b] = getColorForTheme(n.colorTheme);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * (n.life / 300), 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        let alpha = 1;
        let radius = n.r;

        if (n.kind === "spark") {
          alpha = Math.min(1, n.life / 800) * 0.7; // Adjusted for longer life
        }

        const [r, g, b] = getColorForTheme(n.colorTheme);
        const hueShift = n.hue;
        const rGlow = Math.min(255, Math.max(0, r + hueShift * 0.3));
        const gGlow = Math.min(255, Math.max(0, g + hueShift * 0.2));
        const bGlow = Math.min(255, Math.max(0, b + hueShift * 0.35));

        const glowRadius = radius * (2.5 + currentPulse * 1.2);
        const gradient = ctx.createRadialGradient(
          n.x,
          n.y,
          0,
          n.x,
          n.y,
          glowRadius,
        );
        gradient.addColorStop(
          0,
          `rgba(${rGlow}, ${gGlow}, ${bGlow}, ${alpha * (0.4 + currentPulse * 0.25)})`,
        );
        gradient.addColorStop(
          0.7,
          `rgba(${rGlow}, ${gGlow}, ${bGlow}, ${alpha * 0.15})`,
        );
        gradient.addColorStop(1, `rgba(${rGlow}, ${gGlow}, ${bGlow}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        const coreR = Math.min(255, Math.max(180, 200 + hueShift * 0.4));
        const coreG = Math.min(255, Math.max(200, 220 + hueShift * 0.25));
        const coreB = Math.min(255, Math.max(220, 255 + hueShift * 0.35));
        ctx.fillStyle = `rgba(${coreR}, ${coreG}, ${coreB}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius * (1 + currentPulse * 0.15), 0, Math.PI * 2);
        ctx.fill();
      }

      if (pointerRef.current.down) {
        const { x, y, velocity } = pointerRef.current;
        const speed = Math.sqrt(
          velocity.x * velocity.x + velocity.y * velocity.y,
        );
        const radius = speed > 12 ? 70 : 150;
        const [r, g, b] = getColorForTheme(selectedColor);

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(
          0,
          `rgba(${r}, ${g}, ${b}, ${speed > 12 ? 0.12 : 0.06})`,
        );
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Restore canvas state after 3D transforms
      ctx.restore();

      frameRef.current = requestAnimationFrame(step);
    };

    return () => {
      cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      canvas.removeEventListener("mousedown", onPointerDown);
      canvas.removeEventListener("mousemove", onPointerMove);
      canvas.removeEventListener("mouseup", onPointerUp);
      canvas.removeEventListener("mouseleave", onPointerUp);
      canvas.removeEventListener("contextmenu", onContextMenu);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [
    makeNode,
    spawnCluster,
    spawnConstellation,
    theme,
    mode,
    selectedColor,
    getColorForTheme,
    resetConstellation,
    dropConstellation,
    sealPulse,
    burst,
  ]);

  return (
    <section className="panel relative" ref={containerRef}>
      <div className="fade" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="m-0 text-sm tracking-[0.18em] uppercase text-[rgba(212,223,245,0.90)]">
            Constellation Canvas
          </h3>
          <p className="m-0 mt-1 text-xs text-muted leading-relaxed">
            <span className="hidden sm:inline">
              Drag slowly to attract • Drag fast to scatter • Right-click + drag
              to rotate 3D
            </span>
            <span className="sm:hidden">
              Tap to spawn • Long press for ripple • 2 fingers to warp & bloom
            </span>
          </p>
          <p className="m-0 mt-1 text-xs text-[rgba(127,180,255,0.8)] font-mono">
            Clicks: {clickCount} • Every 5 clicks spawns{" "}
            {CONSTELLATIONS[currentConstellationRef.current].name}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {/* Color selector button */}
          <button
            onClick={() => {
              const currentIndex = colorOptions.indexOf(selectedColor);
              const nextIndex = (currentIndex + 1) % colorOptions.length;
              setSelectedColor(colorOptions[nextIndex]);
            }}
            className="btn alt text-[11px] px-3 py-2 flex items-center gap-1.5"
            title="Change color theme"
          >
            <div className="flex gap-0.5">
              {colorOptions.map((color) => {
                const [r, g, b] =
                  color === "current"
                    ? getColorForTheme("current")
                    : COLOR_THEMES[color];
                const isActive = selectedColor === color;
                return (
                  <div
                    key={color}
                    className={`w-2 h-2 rounded-full transition-all ${
                      isActive ? "ring-1 ring-white/40 scale-125" : "opacity-50"
                    }`}
                    style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                  />
                );
              })}
            </div>
          </button>
          <button
            onClick={toggleMode}
            className="btn alt text-[11px] px-3 py-2"
          >
            Mode: {mode === "calm" ? "Calm" : "Live"}
          </button>
          <button onClick={pulseSeal} className="btn alt text-[11px] px-3 py-2">
            Pulse
          </button>
          <button
            onClick={spawnBurst}
            className="btn alt text-[11px] px-3 py-2"
          >
            Burst
          </button>
          <button
            onClick={() => setClickCount(0)}
            className="btn alt text-[11px] px-3 py-2"
            title="Reset click counter"
          >
            Reset Clicks
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-[280px] sm:h-[360px] rounded-xl cursor-crosshair touch-none"
        style={{
          background: "rgba(5, 8, 20, 0.5)",
          willChange: "transform",
          transform: "translateZ(0)",
          maxWidth: "100%",
          maxHeight: "100vh",
          objectFit: "contain",
        }}
      />
    </section>
  );
});

CanvasPlaygroundInner.displayName = "CanvasPlayground";

export const CanvasPlayground = memo(CanvasPlaygroundInner);
