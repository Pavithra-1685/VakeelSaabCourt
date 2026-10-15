import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App.tsx";
import { AuthProvider } from "./app/context/AuthContext";
import { AuthModal } from "./app/components/auth/AuthModal";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <AuthModal />
    </AuthProvider>
  </BrowserRouter>
);