import { Outlet } from "@tanstack/react-router";
import Navbar from "./Navbar";
import { useTheme } from "../contexts/ThemeContext";

export default function Layout() {
  const { isLight } = useTheme();

  return (
    <div
      className={`min-h-screen overflow-x-hidden ${
        isLight ? "bg-[#f5f7fb] text-slate-900" : "bg-black text-white"
      }`}
    >
      <Navbar />
      <main className="overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
