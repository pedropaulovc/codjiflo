import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { writeFileSync } from "fs";

// Plugin to create 404.html for GitHub Pages SPA routing in subdirectories
// Uses a redirect script to preserve the route path
function create404Html(): Plugin {
  return {
    name: 'create-404-html',
    closeBundle() {
      const notFoundPath = resolve(__dirname, 'dist/404.html');
      // This 404.html redirects to the SPA root with the path as a query param
      // The SPA then reads this and navigates to the correct route
      const redirectHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <script>
      // GitHub Pages SPA redirect for subdirectory deployments
      // Converts /codjiflo/pr-10/login to /codjiflo/pr-10/?p=/login
      var base = location.pathname.split('/').slice(0, 3).join('/');
      var path = location.pathname.slice(base.length) || '/';
      var search = location.search;
      var hash = location.hash;
      location.replace(base + '/?p=' + encodeURIComponent(path + search + hash));
    </script>
  </head>
  <body>
    Redirecting...
  </body>
</html>`;
      try {
        writeFileSync(notFoundPath, redirectHtml);
        console.log('Created 404.html with redirect for GitHub Pages');
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
