import { Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/': 'Dashboard',
  '/timeline': 'Timeline de Reservas',
  '/properties': 'Propiedades',
  '/bookings': 'Reservas',
  '/settings': 'Configuración',
};

export function Topbar() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Complejo Admin';

  return (
    <header className="fixed top-0 left-[240px] right-0 h-[60px] bg-card/80 backdrop-blur-xl border-b border-border flex items-center gap-4 px-8 z-50">
      <div className="shrink-0">
        <h1 className="text-[15px] font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="flex-1 flex justify-center max-w-xl mx-auto">
        <div className="relative flex items-center w-full">
          <Search size={13} className="absolute left-3 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar reservas, huéspedes..."
            className="w-full h-8 pl-8 pr-4 bg-secondary border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button className="relative w-9 h-9 flex items-center justify-center bg-secondary border border-border rounded-[10px] text-muted-foreground hover:bg-card hover:text-foreground transition-all duration-150 hover:shadow-apple-sm">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3B30] rounded-full border-[1.5px] border-card" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[#5856D6] flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:opacity-85 transition-opacity">
          A
        </div>
      </div>
    </header>
  );
}
