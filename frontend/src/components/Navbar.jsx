import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Server, Settings, Sun, Moon, Database } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function Navbar() {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    const isActive = (path) => location.pathname === path;

    const NavItem = ({ to, icon, label }) => (
        <Link
            to={to}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive(to)
                ? "bg-cyan-900/50 text-cyan-600 dark:text-cyan-400"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </Link>
    );

    return (
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-900/20">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            className="w-5 h-5 text-white"
                            strokeWidth={2.5}
                        >
                            <path d="M12 2v20M2 12h20" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                        Solar Scheduler
                    </h1>
                </div>

                {/* Navigation Links */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                    <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
                    <NavItem to="/devices" icon={<Server size={18} />} label="Devices" />
                    <NavItem to="/historical-data" icon={<Database size={18} />} label="History" />
                    <NavItem to="/settings" icon={<Settings size={18} />} label="Settings" />
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Toggle Theme"
                    >
                        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Status Indicator */}
                    <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        System Online
                    </div>
                </div>
            </div>
        </nav>
    );
}
