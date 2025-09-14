"use client";

import { useState } from "react";
import { AnimatedSplitFlap } from "@/lib/components/SplitFlap";

export default function FlapDebugPage() {
  const [currentLetter, setCurrentLetter] = useState("A");
  const [nextLetter, setNextLetter] = useState("B");
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  const letters = " ABCDEFGHIJKLMNOPQRSTUVWXYZ9876543210".split("");

  const handleClick = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimationProgress(0);

    // Get next letter in sequence
    const currentIndex = letters.indexOf(currentLetter);
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
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        setCurrentLetter(next);
        setAnimationProgress(0);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <main className="bg-[#181818] h-screen w-screen overflow-hidden flex flex-col items-center justify-center gap-8">
      <h1 className="text-white text-2xl font-bold">Split-Flap Debug</h1>

      <div className="flex items-center justify-center">
        <AnimatedSplitFlap
          currentLetter={currentLetter}
          nextLetter={nextLetter}
          perspective={100}
          completion={animationProgress}
        />
      </div>

      <button
        onClick={handleClick}
        disabled={isAnimating}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
      >
        {isAnimating ? "Flipping..." : "Click to Flip"}
      </button>

      <div className="text-white text-center">
        <p>Current: {currentLetter === " " ? "(space)" : currentLetter}</p>
        <p>Next: {nextLetter === " " ? "(space)" : nextLetter}</p>
        <p>Progress: {Math.round(animationProgress)}%</p>
      </div>
    </main>
  );
}