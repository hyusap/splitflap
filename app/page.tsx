"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState, useEffect, memo, useCallback } from "react";

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
        "bg-[#222222] text-white h-12 w-16 overflow-hidden relative shadow-[0px_1px_0px_0px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      <div
        className={`text-6xl font-bold h-24 w-16 flex items-center justify-center absolute ${
          isTop ? "top-0" : "-top-12"
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

function SplitFlapTile({ letter = "A" }: { letter: string }) {
  return (
    <div className="bg-[#0E0E0E] p-2 pb-4 flex flex-col gap-0.5">
      <SplitFlapHalf letter={letter} isTop={true} />

      {/* Bottom half with layered cards behind it */}
      <div className="relative">
        {/* Background layers - only for bottom half */}
        <div className="absolute top-2">
          <SplitFlapHalf
            letter={letter}
            isTop={false}
            className="bg-[#171717] shadow-none"
          />
        </div>
        <div className="absolute top-1.5">
          <SplitFlapHalf
            letter={letter}
            isTop={false}
            className="bg-[#1B1B1B]"
          />
        </div>
        <div className="absolute top-1">
          <SplitFlapHalf
            letter={letter}
            isTop={false}
            className="bg-[#1F1F1F]"
          />
        </div>

        {/* Main bottom half */}
        <div className="relative">
          <SplitFlapHalf letter={letter} isTop={false} />
        </div>
      </div>
    </div>
  );
}

interface ReelState {
  id: number;
  currentLetter: string;
  nextLetter: string;
  isAnimating: boolean;
  animationProgress: number;
}

// Individual reel component that manages its own state
const IndividualReel = memo(function IndividualReel({ 
  id, 
  targetLetter = "",
  autoStart = false
}: { 
  id: number; 
  targetLetter?: string;
  autoStart?: boolean;
}) {
  const [currentLetter, setCurrentLetter] = useState(" ");
  const [nextLetter, setNextLetter] = useState("A");
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  
  const letters = " ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""); // Start with space
  const perspective = 500;

  // Auto-animate to target letter on mount
  useEffect(() => {
    if (!autoStart || !targetLetter || targetLetter === " " || isAnimating) return;

    let animationId: number;
    let timeoutId: NodeJS.Timeout;

    const animateStep = (current: string, target: string) => {
      if (current === target) return;

      setIsAnimating(true);
      setAnimationProgress(0);

      const currentIndex = letters.indexOf(current);
      const nextIndex = (currentIndex + 1) % letters.length;
      const next = letters[nextIndex];
      setNextLetter(next);

      const startTime = Date.now();
      const duration = 400;

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
          }, 100);
        }
      };

      animationId = requestAnimationFrame(animate);
    };

    // Start animation with random delay
    const delay = Math.random() * 2000;
    const initialTimeout = setTimeout(() => {
      animateStep(currentLetter, targetLetter);
    }, delay);

    return () => {
      clearTimeout(initialTimeout);
      if (animationId) cancelAnimationFrame(animationId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [autoStart, targetLetter]); // Removed problematic dependencies

  const handleClick = () => {
    if (isAnimating) return;

    // Manual click advances one letter at a time
    setIsAnimating(true);
    setAnimationProgress(0);

    const startTime = Date.now();
    const duration = 400;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1) * 100;

      setAnimationProgress(progress);

      if (progress < 100) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        const currentIndex = letters.indexOf(nextLetter);
        const nextIndex = (currentIndex + 1) % letters.length;
        
        setCurrentLetter(nextLetter);
        setNextLetter(letters[nextIndex]);
        setIsAnimating(false);
        setAnimationProgress(0);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer flex items-center justify-center"
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

export default function Home() {
  return (
    <main className="bg-[#181818] h-screen w-screen overflow-hidden flex items-center justify-center">
      <IndividualReel 
        id={0} 
        targetLetter="H"
        autoStart={true}
      />
    </main>
  );
}
