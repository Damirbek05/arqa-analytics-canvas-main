import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Для GitHub Pages: если репозиторий не в корне, используем имя репозитория как base
  // Можно переопределить через переменную окружения VITE_BASE_PATH
  // Если VITE_BASE_PATH установлен, используем его, иначе определяем автоматически
  let base = '/';
  if (process.env.VITE_BASE_PATH) {
    base = process.env.VITE_BASE_PATH;
  } else if (process.env.GITHUB_REPOSITORY) {
    // В GitHub Actions используем имя репозитория
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1];
    base = `/${repoName}/`;
  }

  return {
    base,
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
  };
});
