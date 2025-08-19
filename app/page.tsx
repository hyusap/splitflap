"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, memo } from "react";

interface SplitFlapHalfProps {
  letter: string;
  isTop: boolean;
  className?: string;
}

function SplitFlapHalf({
  letter = "A",
  isTop = true,
  className = "",
}: SplitFlapHalfProps) {
  return (
    <div
      className={cn(
        "bg-[#222222] text-white h-8 w-12 overflow-hidden relative shadow-[0px_1px_0px_0px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      <div
        className={`text-4xl font-bold h-16 w-12 flex items-center justify-center absolute ${
          isTop ? "top-0" : "-top-8"
        }`}
      >
        {letter}
      </div>
    </div>
  );
}

const AnimatedSplitFlap = memo(function AnimatedSplitFlap({
  currentLetter = "A",
  nextLetter = "B",
  perspective = 100,
  completion = 0,
}: {
  currentLetter: string;
  nextLetter: string;
  perspective?: number;
  completion?: number;
}) {
  // Physics-based pendulum easing - matches real split-flap motion
  const pendulumEase = (t: number) => {
    // sin²(πt/2) gives natural pendulum motion from 0° to 90°
    const sineValue = Math.sin((Math.PI * t) / 2);
    return sineValue * sineValue;
  };

  return (
    <div className="bg-[#0E0E0E] p-2 pb-4 flex flex-col gap-0.5 z-50">
      <div
        className="relative"
        style={{
          perspective: `${perspective}px`,
        }}
      >
        {/* Background top half */}
        <div className="absolute">
          <SplitFlapHalf letter={completion > 0 ? nextLetter : currentLetter} isTop={true} />
        </div>

        {/* Rotating top half */}
        <div
          style={{
            transform: `rotateX(${completion <= 50 ? pendulumEase(completion / 50) * -88 : -88}deg)`,
            transformOrigin: "bottom",
            transformStyle: "preserve-3d",
            opacity: completion >= 50 ? 0 : 1,
            transition: "opacity 0.1s",
          }}
        >
          <SplitFlapHalf letter={currentLetter} isTop={true} />
        </div>
      </div>

      {/* Bottom half with layered cards behind it */}
      <div
        className="relative"
        style={{
          perspective: `${perspective}px`,
        }}
      >
        {/* Rotating down element (bottom side of same card) - starts at 50% */}
        {completion > 50 && (
          <div
            className="absolute z-10"
            style={{
              transform: `rotateX(${88 - pendulumEase((completion - 50) / 50) * 88}deg)`,
              transformOrigin: "top",
              transformStyle: "preserve-3d",
            }}
          >
            <SplitFlapHalf letter={nextLetter} isTop={false} />
          </div>
        )}
        {/* Background layers - only for bottom half */}
        <div className="absolute top-2">
          <SplitFlapHalf
            letter={currentLetter}
            isTop={false}
            className="bg-[#171717] shadow-none"
          />
        </div>
        <div className="absolute top-1.5">
          <SplitFlapHalf
            letter={currentLetter}
            isTop={false}
            className="bg-[#1B1B1B]"
          />
        </div>
        <div className="absolute top-1">
          <SplitFlapHalf
            letter={currentLetter}
            isTop={false}
            className="bg-[#1F1F1F]"
          />
        </div>

        {/* Main bottom half */}
        <div className="relative">
          <SplitFlapHalf letter={currentLetter} isTop={false} />
        </div>
      </div>
    </div>
  );
});


// Individual reel component that manages its own state
const IndividualReel = memo(function IndividualReel({ 
  targetLetter = "",
  autoStart = false
}: { 
  targetLetter?: string;
  autoStart?: boolean;
}) {
  const [currentLetter, setCurrentLetter] = useState(" ");
  const [nextLetter, setNextLetter] = useState("A");
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  
  const letters = " ABCDEFGHIJKLMNOPQRSTUVWXYZ9876543210".split(""); // Start with space, numbers descending for countdowns
  const perspective = 100;

  // Auto-animate to target letter on mount
  useEffect(() => {
    if (!autoStart || !targetLetter || targetLetter === " " || isAnimating) return;

    let animationId: number;
    let timeoutId: NodeJS.Timeout;
    let delayTimeoutId: NodeJS.Timeout;

    const animateStep = (current: string, target: string) => {
      if (current === target) return;

      setIsAnimating(true);
      setAnimationProgress(0);

      const currentIndex = letters.indexOf(current);
      const nextIndex = (currentIndex + 1) % letters.length;
      const next = letters[nextIndex];
      setNextLetter(next);

      const startTime = Date.now();
      const duration = 200;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1) * 100;

        setAnimationProgress(progress);

        if (progress < 100) {
          animationId = requestAnimationFrame(animate);
        } else {
          // Animation complete
          setCurrentLetter(next);
          setAnimationProgress(0);
          
          if (next === target) {
            setIsAnimating(false);
            return;
          }
          
          // Continue to next letter
          timeoutId = setTimeout(() => {
            animateStep(next, target);
          }, 50);
        }
      };

      animationId = requestAnimationFrame(animate);
    };

    // Add a small random delay before starting (0-500ms)
    const randomDelay = Math.random() * 500;
    delayTimeoutId = setTimeout(() => {
      animateStep(currentLetter, targetLetter);
    }, randomDelay);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (timeoutId) clearTimeout(timeoutId);
      if (delayTimeoutId) clearTimeout(delayTimeoutId);
    };
  }, [autoStart, targetLetter]);

  return (
    <div
      className="flex items-center justify-center"
    >
      <AnimatedSplitFlap
        currentLetter={currentLetter}
        nextLetter={nextLetter}
        perspective={perspective}
        completion={animationProgress}
      />
    </div>
  );
});

// Layout engine types
interface TextPlacement {
  row: number;
  col: number;
  text: string;
}

interface RowContent {
  left?: string;
  right?: string;
}

// Layout engine to convert row definitions to reel positions
function createLayout(rows: RowContent[], cols: number): TextPlacement[] {
  const placements: TextPlacement[] = [];
  
  rows.forEach((row, rowIndex) => {
    // Place left-aligned text
    if (row.left) {
      row.left.split('').forEach((char, charIndex) => {
        placements.push({
          row: rowIndex,
          col: charIndex,
          text: char
        });
      });
    }
    
    // Place right-aligned text
    if (row.right) {
      const rightChars = row.right.split('');
      rightChars.forEach((char, charIndex) => {
        placements.push({
          row: rowIndex,
          col: cols - rightChars.length + charIndex,
          text: char
        });
      });
    }
  });
  
  return placements;
}

function applyLayout(placements: TextPlacement[], totalReels: number, cols: number): string[] {
  const reels = new Array(totalReels).fill(" ");
  
  placements.forEach(placement => {
    const index = placement.row * cols + placement.col;
    if (index < totalReels) {
      reels[index] = placement.text;
    }
  });
  
  return reels;
}

export default function Home() {
  const [reelGrid, setReelGrid] = useState<{ rows: number; cols: number; total: number }>({ 
    rows: 0, 
    cols: 0, 
    total: 0 
  });

  useEffect(() => {
    const calculateGrid = () => {
      // Reel dimensions including gap
      const reelWidth = 60;
      const reelHeight = 90;
      const gap = 6;
      
      // Get viewport dimensions with some padding for the centered container
      const padding = 40; // Padding around the entire grid
      const availableWidth = window.innerWidth - padding * 2;
      const availableHeight = window.innerHeight - padding * 2;
      
      // Calculate how many reels fit horizontally
      // First reel doesn't need left gap, so: width = reelWidth * n + gap * (n - 1)
      // Solving: availableWidth = reelWidth * n + gap * (n - 1)
      // availableWidth = n * (reelWidth + gap) - gap
      // n = (availableWidth + gap) / (reelWidth + gap)
      const cols = Math.floor((availableWidth + gap) / (reelWidth + gap));
      
      // Calculate how many reels fit vertically
      const rows = Math.floor((availableHeight + gap) / (reelHeight + gap));
      
      setReelGrid({
        rows: Math.max(1, rows),
        cols: Math.max(1, cols),
        total: Math.max(1, rows) * Math.max(1, cols)
      });
    };

    calculateGrid();
    window.addEventListener('resize', calculateGrid);
    
    return () => window.removeEventListener('resize', calculateGrid);
  }, []);

  // Generate random times for the buses
  const generateRandomTime = () => {
    const minutes = Math.floor(Math.random() * 60);
    if (minutes < 10) {
      return `${minutes} MIN`;
    } else {
      return `${Math.floor(minutes / 10)}${minutes % 10}MIN`;
    }
  };

  // Define the bus routes and their times
  const busRoutes: RowContent[] = [
    { left: "51B N", right: generateRandomTime() },
    { left: "51B S", right: generateRandomTime() },
    { left: "79  N", right: generateRandomTime() },
    { left: "79  S", right: generateRandomTime() },
    { left: "YEL W", right: generateRandomTime() },
    { left: "RED S", right: generateRandomTime() },
  ];

  // Create layout and apply it to generate reel values
  const layoutPlacements = createLayout(busRoutes, reelGrid.cols);
  const reels = applyLayout(layoutPlacements, reelGrid.total, reelGrid.cols);
  
  return (
    <main className="bg-[#181818] h-screen w-screen overflow-hidden flex items-center justify-center">
      <div 
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${reelGrid.cols}, 60px)`,
          gridTemplateRows: `repeat(${reelGrid.rows}, 90px)`,
        }}
      >
        {reels.map((letter, i) => (
          <IndividualReel 
            key={i}
            targetLetter={letter}
            autoStart={true}
          />
        ))}
      </div>
    </main>
  );
}
