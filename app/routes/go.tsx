import { buildInstanceUrl, resolveObject } from "~/helpers/resolve";
import type { Route } from "./+types/go";

import Preview from "~/go/preview/Preview";
import Actions from "~/go/Actions";
import About from "~/go/About";

export async function loader({ params, request }: Route.LoaderArgs) {
  // Sanity check domain name
  if (!params.instance || !params.instance.includes("."))
    throw new Error("Invalid instance");

  return resolveObject(resolveQFromParams(params), request.signal);
}

export default function Go({ loaderData, params }: Route.ComponentProps) {
  const link = resolveQFromParams(params);

  return (
    <>
      <link rel="canonical" href={link} />
      <About url={link} />
      <Preview data={loaderData} url={link} />
      <Actions url={link} />
    </>
  );
}

function resolveInstanceUrlFromParams(params: Route.LoaderArgs["params"]) {
  return buildInstanceUrl(params.instance);
}

function resolveQFromParams(params: Route.LoaderArgs["params"]) {
  return `${resolveInstanceUrlFromParams(params)}/${params["*"]}`;
}
