import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { writeFileSync, readFileSync } from "fs";

// Plugin to create 404.html for GitHub Pages SPA routing
function create404Html(): Plugin {
  return {
    name: 'create-404-html',
    closeBundle() {
      const indexPath = resolve(__dirname, 'dist/index.html');
      const notFoundPath = resolve(__dirname, 'dist/404.html');
      try {
        const indexContent = readFileSync(indexPath, 'utf-8');
        writeFileSync(notFoundPath, indexContent);
        console.log('Created 404.html for GitHub Pages');
      } catch (err) {
        console.warn('Could not create 404.html:', err);
      }
    },
  };
}

// Debug configuration for manual testing with unminified, unbundled output
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), create404Html()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
      preserveEntrySignatures: 'strict',
    },
  },
});
