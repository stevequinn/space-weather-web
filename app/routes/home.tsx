import type { Route } from "./+types/home";
import { bomApi } from "~/api/.server";
import { AuroraHero } from "~/aurora/AuroraHero";
import { AuroraGrid } from "~/aurora/AuroraGrid";
import { AuroraBackground } from "~/aurora/AuroraBackground";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Space Weather!" },
    { name: "description", content: "Auroras and CME's yo" },
  ];
}

// Server only loader function
export async function loader({ params }: Route.LoaderArgs) {
  const auroraStorm = await bomApi.checkAuroraStorm();
  return auroraStorm;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { summary, active, k_index, alert, watch, outlook } = loaderData;

  // k_index.value = 3;

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* Three.js Layer - Z-Index 0 */}
      <div className="absolute inset-0 z-0">
        {/* Pass intensity based on K-Index */}
        <AuroraBackground intensity={k_index.value} isActive={active} />
      </div>

      {/* Content Layer - Z-Index 10 */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 space-y-12">
        {/* Hero Section */}
        <AuroraHero active={active} summary={summary} kValue={k_index.value} />

        {/* Data Grid */}
        <AuroraGrid alert={alert} watch={watch} outlook={outlook} />
      </main>
    </div>
  );
}
