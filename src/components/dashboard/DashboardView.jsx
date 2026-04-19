import { TrendingUp, Calendar, Building2, ArrowUpRight, ArrowDownRight, LogIn, LogOut, Wrench, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import { statusConfig } from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';

function KpiCard({ label, value, suffix = '', icon: Icon, change, iconBg, iconColor }) {
  const isPositive = change >= 0;
  return (
    <Card className="hover:shadow-apple-md hover:-translate-y-0.5 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm text-muted-foreground font-medium">{label}</span>
          <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${iconBg}`}>
            <Icon size={17} className={iconColor} />
          </div>
        </div>
        <div className="text-[30px] font-bold tracking-tight leading-none">
          {value}
          {suffix && <span className="text-xl font-semibold text-muted-foreground ml-1">{suffix}</span>}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isPositive ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
            {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            <span>{Math.abs(change)}% vs mes anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentBookings({ bookings, properties }) {
  const recent = bookings.slice(0, 5);
  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Reservas recientes</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {recent.map((b) => {
          const prop = properties.find((p) => p.id === b.propertyId);
          return (
            <div
              key={b.id}
              className="flex items-center gap-3 px-6 py-4 border-b border-border last:border-0 hover:bg-background transition-colors cursor-pointer"
            >
              <div className="w-11 h-11 rounded-[10px] overflow-hidden shrink-0 bg-secondary">
                {prop && <img src={prop.image} alt={prop.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{b.guestName}</div>
                <div className="text-xs text-muted-foreground">{prop?.name} · {b.nights} noches</div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <StatusBadge status={b.status} size="sm" />
                <span className="text-sm font-semibold">
                  {b.totalAmount > 0 ? formatCurrency(b.totalAmount) : '—'}
                </span>
              </div>
            </div>
          );
        })}
        {recent.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">Sin reservas recientes</div>
        )}
      </CardContent>
    </Card>
  );
}

function TodayActivity({ stats }) {
  const rows = [
    { icon: LogIn,    label: 'Check-ins hoy',     value: stats.checkInsToday,   bg: 'bg-[#E8F8ED]', color: 'text-[#34C759]' },
    { icon: LogOut,   label: 'Check-outs hoy',    value: stats.checkOutsToday,  bg: 'bg-[#E1EFFF]', color: 'text-primary' },
    { icon: Wrench,   label: 'En mantenimiento',  value: stats.maintenanceUnits, bg: 'bg-[#FFECEA]', color: 'text-[#FF3B30]' },
    { icon: Building2,label: 'Disponibles',        value: stats.availableUnits,  bg: 'bg-secondary',  color: 'text-muted-foreground' },
  ];
  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Actividad de hoy</CardTitle>
          <span className="text-xs text-muted-foreground capitalize">
            {format(new Date(), "d 'de' MMMM", { locale: es })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-5 flex flex-col gap-3">
        {rows.map(({ icon: Icon, label, value, bg, color }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-[8px] ${bg} ${color} flex items-center justify-center`}>
                <Icon size={15} />
              </div>
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <span className="text-lg font-bold">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function OccupancyBar({ properties }) {
  const total = properties.length;
  const byStatus = {
    occupied:    properties.filter(p => p.status === 'occupied').length,
    confirmed:   properties.filter(p => p.status === 'confirmed').length,
    maintenance: properties.filter(p => p.status === 'maintenance').length,
    cleaning:    properties.filter(p => p.status === 'cleaning').length,
    available:   properties.filter(p => p.status === 'available').length,
  };

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Distribución de unidades</CardTitle>
          <span className="text-xs text-muted-foreground">{total} propiedades</span>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {total === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">Sin datos</div>
        ) : (
          <>
            <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-4">
              {Object.entries(byStatus).map(([status, count]) => {
                if (!count) return null;
                const config = statusConfig[status];
                return (
                  <div
                    key={status}
                    className="rounded-full transition-opacity hover:opacity-75"
                    style={{ width: `${(count / total) * 100}%`, background: config.color }}
                    title={`${config.label}: ${count}`}
                  />
                );
              })}
            </div>
            <div className="flex flex-col gap-2">
              {Object.entries(byStatus).filter(([, v]) => v > 0).map(([status, count]) => {
                const config = statusConfig[status];
                return (
                  <div key={status} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: config.color }} />
                    <span className="text-xs text-muted-foreground flex-1">{config.label}</span>
                    <strong className="text-xs font-semibold">{count}</strong>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardView() {
  const properties = useStore(s => s.properties);
  const bookings   = useStore(s => s.bookings);
  const loading    = useStore(s => s.loading);

  // Calcular KPIs dinámicamente
  const today = new Date().toISOString().slice(0, 10);
  const occupied    = properties.filter(p => p.status === 'occupied').length;
  const available   = properties.filter(p => p.status === 'available').length;
  const maintenance = properties.filter(p => p.status === 'maintenance').length;
  const occupancyRate = properties.length > 0
    ? Math.round(((occupied + properties.filter(p => p.status === 'confirmed').length) / properties.length) * 100)
    : 0;

  const activeBookings = bookings.filter(b => b.status === 'occupied' || b.status === 'confirmed').length;

  const monthlyRevenue = bookings
    .filter(b => b.createdAt?.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const checkInsToday  = bookings.filter(b => b.checkIn  === today).length;
  const checkOutsToday = bookings.filter(b => b.checkOut === today).length;

  const stats = { occupancyRate, monthlyRevenue, activeBookings, availableUnits: available, checkInsToday, checkOutsToday, maintenanceUnits: maintenance };

  if (loading && properties.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh] gap-3 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-[1400px] flex flex-col gap-8">
      <div>
        <h1 className="text-[30px] font-bold tracking-tight">Buen día, Admin 👋</h1>
        <p className="text-sm text-muted-foreground mt-1 capitalize">
          {format(new Date(), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Ocupación actual"   value={stats.occupancyRate} suffix="%" icon={TrendingUp}   change={8}  iconBg="bg-[#E1EFFF]" iconColor="text-primary" />
        <KpiCard label="Ingresos del mes"   value={formatCurrency(stats.monthlyRevenue)}      icon={ArrowUpRight} change={12} iconBg="bg-[#E8F8ED]" iconColor="text-[#34C759]" />
        <KpiCard label="Reservas activas"   value={stats.activeBookings}   icon={Calendar}  iconBg="bg-[#f0ebff]" iconColor="text-[#7c3aed]" />
        <KpiCard label="Unidades disponibles" value={stats.availableUnits} icon={Building2} iconBg="bg-[#FFF3E0]" iconColor="text-[#FF9500]" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-[1fr_380px] gap-4 items-start">
        <RecentBookings bookings={bookings} properties={properties} />
        <div className="flex flex-col gap-4">
          <TodayActivity stats={stats} />
          <OccupancyBar properties={properties} />
        </div>
      </div>
    </div>
  );
}
