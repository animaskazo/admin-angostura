import { LogOut, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';

const pageTitles = {
  '/': 'Timeline de Reservas',
  '/properties': 'Gestión de Propiedades',
  '/bookings': 'Historial de Reservas',
  '/guests': 'Base de Datos de Huéspedes',
  '/settings': 'Configuración del Sistema',
};

export function Topbar() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Panel de Administración';
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);

  return (
    <header className="fixed top-0 left-[240px] right-0 h-[60px] bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-8 z-50">
      <div className="shrink-0">
        <h1 className="text-[14px] font-bold tracking-tight text-foreground uppercase opacity-80">{title}</h1>
      </div>

      <div className="flex-1 flex justify-center max-w-lg mx-auto px-6">
        <div className="relative flex items-center w-full">
          <Search size={13} className="absolute left-3 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full h-8 pl-8 pr-4 bg-secondary/50 border border-border rounded-lg text-[13px] text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/5"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-0.5">Admin</span>
          <span className="text-[12px] font-medium text-foreground opacity-80">{user?.email || 'Administrador'}</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 h-9 bg-white border border-border rounded-lg text-[#FF3B30] text-[12px] font-bold hover:bg-[#FF3B30]/10 hover:border-[#FF3B30]/20 transition-all duration-200 active:scale-95 shadow-sm"
        >
          <LogOut size={14} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
}
