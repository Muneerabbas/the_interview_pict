"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion, useMotionValue, useSpring, useAnimationFrame, animate, useVelocity } from "framer-motion";
import { Send, ArrowUpRight, Loader2, MousePointer2, Move, Layers, Zap } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import Navbar from "../../components/Navbar";
import VisualTaleCard from "../../components/VisualTaleCard";
import { useRouter } from "next/navigation";

// Constants for the Virtual Grid
const ITEM_WIDTH = 400;
const ITEM_HEIGHT = 380;
const GAP = 24;
const GRID_COLS_SIZE = ITEM_WIDTH + GAP;
const GRID_ROWS_SIZE = ITEM_HEIGHT + GAP;

// Helper to generate massive static data for the canvas
const generateStaticTales = (count) => {
  const images = [
    "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1481487196290-c152efe083f5?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522071823991-b9671f30c46f?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1000&auto=format&fit=crop",
  ];

  const titles = [
    "Nexus", "Pulse", "Synthetica", "Aether", "Glimmer", "Vortex", "Horizon", "Catalyst", "Prism", "Echo"
  ];

  const names = ["Aarav", "Neha", "Ishan", "Sanya", "Rohan", "Kavya", "Arjun", "Mira", "Vikram"];

  return Array.from({ length: count }, (_, i) => ({
    _id: `s-${i}`,
    title: `${titles[i % titles.length]} #${i + 1}`,
    profileName: names[i % names.length],
    views: `${(Math.random() * 9 + 1).toFixed(1)}k`,
    likes: Array(Math.floor(Math.random() * 500) + 50).fill(0),
    image: images[i % images.length],
    gridX: (i % 20), // 20 columns wide
    gridY: Math.floor(i / 20),
  }));
};

const STATIC_TALES = generateStaticTales(400); // 20x20 massive grid

export default function TalesCanvasPage() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const canvasRef = useRef(null);

  // Tracking mouse movement for the follow-drift effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Physical mouse tracking for cursor UI
  const absMouseX = useMotionValue(0);
  const absMouseY = useMotionValue(0);

  // Grid position values
  const x = useMotionValue(-500);
  const y = useMotionValue(-500);

  // FIXED: Moving Hooks to top level for silky consistency
  const smoothX = useSpring(x, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(y, { damping: 50, stiffness: 400 });
  const cursorX = useSpring(absMouseX, { damping: 60, stiffness: 1000 });
  const cursorY = useSpring(absMouseY, { damping: 60, stiffness: 1000 });

  // Viewport state
  const [viewport, setViewport] = useState({ w: 1920, h: 1080 });
  const [isInsideGrid, setIsInsideGrid] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateSize = () => setViewport({ w: window.innerWidth, h: window.innerHeight * 0.7 });
    updateSize();
    window.addEventListener("resize", updateSize);

    const handleMouseMove = (e) => {
      absMouseX.set(e.clientX);
      absMouseY.set(e.clientY);

      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / (window.innerHeight * 0.7)) * 2 - 1;
      mouseX.set(nx);
      mouseY.set(ny);
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Heavy Optimization: Debounced Search Input
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const filteredTales = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return STATIC_TALES;
    return STATIC_TALES.filter(tale =>
      tale.title.toLowerCase().includes(query) ||
      tale.profileName.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // High-Performance Virtualization State
  const [visibleItems, setVisibleItems] = useState([]);
  const lastUpdatePos = useRef({ x: 0, y: 0 });
  const lastUpdateTime = useRef(0);

  useAnimationFrame((time, delta) => {
    if (!isInsideGrid) return;

    // Smooth Physics Integration
    const speed = 0.0012;
    const dx = mouseX.get();
    const dy = mouseY.get();
    const threshold = 0.08;
    const driftX = Math.abs(dx) > threshold ? dx * speed * delta : 0;
    const driftY = Math.abs(dy) > threshold ? dy * speed * delta : 0;

    x.set(x.get() - driftX * 100);
    y.set(y.get() - driftY * 100);

    const curX = x.get();
    const curY = y.get();

    // Proper Optimization: Frame throttling (max 30Hz for state updates) + 120px threshold
    const now = performance.now();
    if (now - lastUpdateTime.current < 32) return;

    const distMoved = Math.sqrt(
      Math.pow(curX - lastUpdatePos.current.x, 2) +
      Math.pow(curY - lastUpdatePos.current.y, 2)
    );

    if (distMoved < 120 && visibleItems.length > 0) return;

    lastUpdatePos.current = { x: curX, y: curY };
    lastUpdateTime.current = now;

    const startCol = Math.floor(-curX / GRID_COLS_SIZE) - 2;
    const endCol = Math.floor((-curX + viewport.w) / GRID_COLS_SIZE) + 2;
    const startRow = Math.floor(-curY / GRID_ROWS_SIZE) - 2;
    const endRow = Math.floor((-curY + viewport.h) / GRID_ROWS_SIZE) + 2;

    const visible = [];
    const GRID_DIM = 20;

    for (let col = startCol; col <= endCol; col++) {
      for (let row = startRow; row <= endRow; row++) {
        const internalIndex = (Math.abs(row * GRID_DIM + col)) % (filteredTales.length || 1);
        const tale = filteredTales[internalIndex];
        if (tale) {
          visible.push({ id: `tale-${col}-${row}`, data: tale, globalX: col, globalY: row });
        }
      }
    }
    setVisibleItems(visible);
  });

  const handleCardClick = useCallback((id) => {
    router.push(`/single/${id}`);
  }, [router]);

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen bg-[#020617] font-sans overflow-hidden">
      <Navbar showThemeToggle />

      {/* Dynamic Cursor UI - Silky follow logic */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: isInsideGrid ? 1 : 0,
          scale: isHovering ? 1.8 : 1,
          backgroundColor: isHovering ? "rgba(34, 211, 238, 0.1)" : "rgba(255, 255, 255, 0.02)",
          borderColor: isHovering ? "rgba(34, 211, 238, 0.8)" : "rgba(255, 255, 255, 0.2)"
        }}
        className="pointer-events-none fixed z-[100] h-10 w-10 rounded-full border border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-[2px] transition-all duration-700 ease-out"
        style={{
          x: cursorX,
          y: cursorY,
          left: 0,
          top: 0,
          translateX: "-50%",
          translateY: "-50%"
        }}
      >
        <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,1)]" />
      </motion.div>

      {/* Interactive Grid Viewport - Highly Optimized */}
      <div className="mx-12 mb-16 -mt-1">
        <section
          onMouseEnter={() => setIsInsideGrid(true)}
          onMouseLeave={() => setIsInsideGrid(false)}
          className="relative h-[70vh] w-full overflow-hidden cursor-none rounded-[4rem] bg-black/40"
        >
          {/* Visual Layer Masks */}
          <div className="absolute inset-0 z-40 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 65% 55% at 50% 50%, transparent 65%, rgba(2, 6, 23, 0.95) 100%)",
              boxShadow: "inset 0 0 180px 40px rgba(2, 6, 23, 1)"
            }} />

          <div className="absolute inset-0 z-30 pointer-events-none backdrop-blur-[16px]"
            style={{
              WebkitMaskImage: "radial-gradient(ellipse 75% 55% at 50% 50%, transparent 50%, black 100%)",
              maskImage: "radial-gradient(ellipse 75% 55% at 50% 50%, transparent 50%, black 100%)"
            }} />

          {/* Background Detail */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.05),transparent_50%)]" />
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
              style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "120px 120px" }} />
          </div>

          {/* Infinite Grid Container (GPU Accelerated) */}
          <motion.div
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ x: smoothX, y: smoothY, willChange: "transform" }}
          >
            {visibleItems.map(item => (
              <div
                key={item.id}
                className="absolute pointer-events-auto"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => handleCardClick(item.data._id)}
                style={{
                  left: item.globalX * GRID_COLS_SIZE,
                  top: item.globalY * GRID_ROWS_SIZE,
                  width: ITEM_WIDTH,
                  height: ITEM_HEIGHT,
                  contain: "content"
                }}
              >
                <VisualTaleCard profile={item.data} disableLink />
              </div>
            ))}
          </motion.div>

          {/* Cinematic Professional Search Interface */}

        </section>
      </div>

      {/* Discovery Area */}
      <div className="relative z-10 px-8 py-16 text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400/50 mb-4 block">Endless Narratives</span>
        <h2 className="text-5xl font-black text-white mb-8 tracking-tighter">Discover PICT's Legacy</h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-12 text-lg leading-relaxed">
          Journey through the boundless grid of student experiences. Each square represents a milestone in someone's career.
        </p>
        <Link
          href="/post/tale"
          className="group inline-flex items-center gap-6 rounded-full bg-white px-12 py-8 text-[13px] font-black uppercase tracking-[0.3em] text-slate-950 shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all hover:scale-105 hover:bg-cyan-400"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white group-hover:scale-110 group-hover:rotate-12 transition-transform">
            <Send size={14} strokeWidth={3} />
          </div>
          Share Your Tale
        </Link>
      </div>

      <style jsx global>{`
        body {
          user-select: none;
          background: #020617;
        }
      `}</style>
    </main>
  );
}
