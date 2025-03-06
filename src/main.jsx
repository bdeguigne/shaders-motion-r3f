import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ReactLenis } from "lenis/react";
import Canvas from "./components/3D/Canvas";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ReactLenis root>
      <App />
      <Canvas />
    </ReactLenis>
  </StrictMode>
);
