import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const repoName = (process.env.GITHUB_REPOSITORY || "").split("/")[1];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Use repo subpath only for GitHub Pages CI deploys.
  base: process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
