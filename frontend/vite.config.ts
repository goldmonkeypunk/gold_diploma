import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },

  /* Передаємо мінімальний tsconfig прямо в esbuild,
     щоб не читав tsconfig.node.json з диска */
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        target: "ESNext",
        module: "ESNext",
        jsx: "react-jsx",
        strict: true,
        useDefineForClassFields: true
      }
    }
  }
});
