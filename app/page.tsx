import Image from "next/image";

interface SplitFlapHalfProps {
  letter: string;
  isTop: boolean;
}

function SplitFlapHalf({ letter = "A", isTop = true }: SplitFlapHalfProps) {
  return (
    <div className="bg-[#222222] text-white h-12 w-16 overflow-hidden relative">
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

function SplitFlapTile({ letter = "A" }: { letter: string }) {
  return (
    <div className="bg-[#0E0E0E] p-2 flex flex-col gap-0.5">
      <SplitFlapHalf letter={letter} isTop={true} />
      <SplitFlapHalf letter={letter} isTop={false} />
    </div>
  );
}

export default function Home() {
  return (
    <main className="bg-[#181818] h-screen w-screen flex items-center justify-center">
      <SplitFlapTile letter="C" />
    </main>
  );
}
