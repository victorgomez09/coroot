import tailwindcss from "@tailwindcss/vite";
import Vue from "@vitejs/plugin-vue";
import path from "node:path";
import { defineConfig } from "vite";
import Layouts from "vite-plugin-vue-layouts-next";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [Layouts(), Vue(), tailwindcss()],
  optimizeDeps: {
    exclude: ["vue-router"],
  },
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
});
