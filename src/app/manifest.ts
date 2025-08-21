import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ai-chat",
    short_name: "ai-chat",
    description: "ai-chat",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#1d1d1d",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
