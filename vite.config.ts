import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable code splitting for better loading performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Three.js and React Three Fiber into their own chunks
          'three': ['three', '@react-three/fiber', '@react-three/drei'],
          // Separate vendor libraries
          'vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification (using esbuild - faster and built-in)
    minify: 'esbuild',
    // Optimize asset handling
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
}));
