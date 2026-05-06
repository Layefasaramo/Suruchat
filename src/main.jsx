import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Toaster
      toastOptions={{
        style: {
          background: "#1a1a2e", // Match your primary-900
          color: "#fff",
          border: "1px solid #4ecca3", // Match your accent color
        },
        success: {
          iconTheme: {
            primary: "#4ecca3",
            secondary: "#1a1a2e",
          },
        },
      }}
    />
    ,
  </StrictMode>,
);
