import clsx from "clsx";

type AuroraHeroProps = {
  active: boolean;
  summary: string;
  kValue: number;
};

export const AuroraHero = ({ active, summary, kValue }: AuroraHeroProps) => {
  return (
    <div className="flex flex-col items-center text-center space-y-6 max-w-2xl animate-in fade-in zoom-in duration-1000">
      {/* Status Pill */}
      <div
        className={clsx(
          "px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase border backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]",
          active
            ? "bg-green-500/20 border-green-400 text-green-300 shadow-green-900/40"
            : "bg-slate-800/40 border-slate-600 text-slate-400",
        )}
      >
        {active ? "Aurora Active" : "Low Activity"}
      </div>

      {/* Main Title */}
      <h1 className="text-6xl md:text-8xl pr-1 font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-2xl">
        K {kValue.toFixed(1)}
      </h1>

      {/* Summary Text */}
      <p className="text-lg md:text-xl text-slate-200 font-light leading-relaxed drop-shadow-md">
        {summary}
      </p>

      {/* Southern Hemisphere Instruction */}
      {active && (
        <p className="text-sm font-semibold text-teal-300 animate-pulse">
          Look South • Horizon View Recommended
        </p>
      )}
    </div>
  );
};
