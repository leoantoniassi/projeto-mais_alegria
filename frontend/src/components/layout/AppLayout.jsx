import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

export default function AppLayout() {
  // Estado para controlar a abertura do menu no mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Ajuste da margem: sem margem no mobile, md:ml-64 no desktop */}
      <main className="transition-all duration-300 md:ml-64 min-h-screen flex flex-col">
        {/* Passamos a função para abrir o menu ao TopNav */}
        <TopNav onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Ajuste do padding: p-4 no celular, p-8 no desktop */}
        <div className="p-4 md:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
