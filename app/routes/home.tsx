import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { bomApi } from "~/api.server";
import { Aurora } from "~/aurora/aurora";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Space Weather!" },
    { name: "description", content: "Auroras and CME's yo" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const auroraStorm = await bomApi.checkAuroraStorm();
  return auroraStorm;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { summary, active, k_index, alert, watch, outlook } = loaderData;

  if (summary) {
    return <Aurora summary={loaderData.summary} />;
  }

  return <Welcome />;
}
