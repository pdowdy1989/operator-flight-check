import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { JobProvider } from "./context/JobContext";
import { DocumentProvider } from "./context/DocumentContext";
import "leaflet/dist/leaflet.css";
import "./styles/global.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <JobProvider>
          <DocumentProvider>
            <ToastProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </ToastProvider>
          </DocumentProvider>
        </JobProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
