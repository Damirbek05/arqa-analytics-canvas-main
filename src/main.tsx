import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Отладочная информация
console.log("BASE_URL:", import.meta.env.BASE_URL);
console.log("MODE:", import.meta.env.MODE);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error("Error rendering app:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Error loading application</h1>
      <p>${error instanceof Error ? error.message : String(error)}</p>
      <p>BASE_URL: ${import.meta.env.BASE_URL}</p>
    </div>
  `;
}
