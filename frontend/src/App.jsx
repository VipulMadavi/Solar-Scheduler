import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import DevicesPage from "./pages/DevicesPage";
import SettingsPage from "./pages/SettingsPage";
import HistoricalDataPage from "./pages/HistoricalDataPage";

import { ToastProvider } from "./components/Toast";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-slate-950 text-slate-100 font-sans transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 bg-gray-100 text-gray-900">
            <Navbar />

            <main>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/devices" element={<DevicesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/historical-data" element={<HistoricalDataPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}
