"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

function AnimatedSplitFlap({
  letter = "A",
  perspective = 100,
  completion = 0,
}: {
  letter: string;
  perspective?: number;
  completion?: number;
}) {
  const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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
          <SplitFlapHalf letter="B" isTop={true} />
        </div>

        {/* Rotating top half */}
        <div
          style={{
            transform: `rotateX(${completion <= 50 ? easeInOutCubic(completion / 50) * -88 : -88}deg)`,
            transformOrigin: "bottom",
            transformStyle: "preserve-3d",
            opacity: completion >= 50 ? 0 : 1,
            transition: "opacity 0.1s",
          }}
        >
          <SplitFlapHalf letter="A" isTop={true} />
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
              transform: `rotateX(${88 - easeInOutCubic((completion - 50) / 50) * 88}deg)`,
              transformOrigin: "top",
              transformStyle: "preserve-3d",
            }}
          >
            <SplitFlapHalf letter="B" isTop={false} />
          </div>
        )}
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
          <SplitFlapHalf letter="A" isTop={false} />
        </div>
      </div>
    </div>
  );
}

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

export default function Home() {
  const [completion, setCompletion] = useState(0);
  const [perspective, setPerspective] = useState(100);

  return (
    <main className="bg-[#181818] h-screen w-screen flex flex-col items-center justify-center gap-8">
      <div className="flex items-center justify-center gap-2">
        <SplitFlapTile letter="A" />
        <AnimatedSplitFlap
          letter="B"
          perspective={perspective}
          completion={completion}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 bg-[#2A2A2A] p-4 rounded-lg">
          <label
            htmlFor="completion-slider"
            className="text-white text-sm font-medium"
          >
            Completion:
          </label>
          <input
            id="completion-slider"
            type="range"
            min="0"
            max="100"
            step="1"
            value={completion}
            onChange={(e) => setCompletion(Number(e.target.value))}
            className="w-64 h-2 bg-[#444444] rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-white text-sm min-w-[3rem]">{completion}%</span>
        </div>

        <div className="flex items-center gap-4 bg-[#2A2A2A] p-4 rounded-lg">
          <label
            htmlFor="perspective-slider"
            className="text-white text-sm font-medium"
          >
            Perspective:
          </label>
          <input
            id="perspective-slider"
            type="range"
            min="50"
            max="2000"
            step="10"
            value={perspective}
            onChange={(e) => setPerspective(Number(e.target.value))}
            className="w-64 h-2 bg-[#444444] rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-white text-sm min-w-[4rem]">
            {perspective}px
          </span>
        </div>
      </div>
    </main>
  );
}
