import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ascent — SSC CGL preparation",
    short_name: "Ascent",
    description:
      "Track your SSC CGL syllabus, revisions, mocks and daily study habit.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#5b6ee1",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
