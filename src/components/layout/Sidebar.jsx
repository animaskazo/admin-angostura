import { NavLink } from 'react-router-dom';
import {
  Calendar, Building2, BookOpen,
  Settings, Plus, Users,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Calendario', icon: Calendar, end: true },
  { to: '/properties', label: 'Propiedades', icon: Building2 },
  { to: '/bookings', label: 'Reservas', icon: BookOpen },
  { to: '/guests', label: 'Huéspedes', icon: Users },
  { to: '/settings', label: 'Configuración', icon: Settings },
];

function NavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-accent text-primary font-semibold'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        )
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export function Sidebar() {
  const setNewBookingModalOpen = useStore((s) => s.setNewBookingModalOpen);

  return (
    <aside className="fixed top-0 left-0 w-[240px] h-screen bg-card border-r border-border flex flex-col py-5 z-[100]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pb-5 border-b border-border mb-4">
        <div className="w-10 h-10 overflow-hidden rounded-[8px] flex items-center justify-center bg-white">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="text-[15px] font-bold tracking-tight leading-tight">Complejo Angostura</div>
          <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Administración</div>
        </div>
      </div>

      {/* New Booking */}
      <div className="px-4 mb-4">
        <button
          onClick={() => setNewBookingModalOpen(true)}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-white rounded-[10px] text-sm font-semibold transition-all duration-200 hover:bg-[hsl(211,100%,44%)] hover:-translate-y-px hover:shadow-apple-blue"
        >
          <Plus size={16} />
          <span>Nueva Reserva</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-1 mt-2">
          Gestión
        </p>
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>
    </aside>
  );
}
