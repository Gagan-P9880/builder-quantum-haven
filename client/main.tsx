import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./global.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

// Check if root already exists to prevent createRoot warning
const existingRoot = (container as any)._reactRoot;

if (existingRoot) {
  // If root exists, just re-render
  existingRoot.render(<App />);
} else {
  // Create new root and store reference
  const root = createRoot(container);
  (container as any)._reactRoot = root;
  root.render(<App />);
}

// Handle hot module replacement
if (import.meta.hot) {
  import.meta.hot.accept(['./App.tsx'], () => {
    // Re-render the app when modules are updated
    const root = (container as any)._reactRoot;
    if (root) {
      root.render(<App />);
    }
  });
}
