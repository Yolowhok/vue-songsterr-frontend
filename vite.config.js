import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";
export default defineConfig({
  plugins: [vue(), svgLoader()],
  server: {
    host: "0.0.0.0", // важный параметр — слушать на всех интерфейсах
    port: 5173, // можно изменить, если нужен другой порт
    strictPort: true, // не переключать порт, если он занят
    allowedHosts: ["school-beta.ru.tuna.am"],
  },
});
