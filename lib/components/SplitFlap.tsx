import { cn } from "@/lib/utils";

export interface SplitFlapHalfProps {
  letter: string;
  isTop: boolean;
  className?: string;
}

export function SplitFlapHalf({
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

export interface AnimatedSplitFlapProps {
  currentLetter: string;
  nextLetter: string;
  perspective?: number;
  completion?: number;
}

export function AnimatedSplitFlap({
  currentLetter = "A",
  nextLetter = "B",
  perspective = 100,
  completion = 0,
}: AnimatedSplitFlapProps) {
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
}