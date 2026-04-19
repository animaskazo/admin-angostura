import { useState } from 'react';
import { addDays, format, differenceInCalendarDays, startOfDay, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Download, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { statusConfig } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CELL_W = 52;
const TODAY = startOfDay(new Date());
const DAYS_VISIBLE = 15;

const TYPE_INFO = {
  cabin: { label: 'CABAÑAS', emoji: '🏕️' },
  suite: { label: 'SUITES', emoji: '🛏️' },
  house: { label: 'CASAS', emoji: '🏡' },
  others: { label: 'OTROS', emoji: '🏷️' },
};

function getBlockStyle(booking, startDate) {
  const checkIn = startOfDay(parseISO(booking.checkIn));
  const checkOut = startOfDay(parseISO(booking.checkOut));
  const offsetDays = differenceInCalendarDays(checkIn, startDate);
  const durationDays = differenceInCalendarDays(checkOut, checkIn);
  const clampedOffset = Math.max(0, offsetDays);
  const clampedEnd = Math.min(DAYS_VISIBLE, offsetDays + durationDays);
  const visibleDays = clampedEnd - clampedOffset;
  if (visibleDays <= 0) return null;
  return {
    left: clampedOffset * CELL_W + 2,
    width: visibleDays * CELL_W - 4,
    isStart: offsetDays === clampedOffset,
  };
}

export function TimelineView() {
  const [startDate, setStartDate] = useState(TODAY);
  const [activeFilter, setActiveFilter] = useState('all');
  const setSelectedBooking = useStore((s) => s.setSelectedBooking);
  const setNewBookingModalOpen = useStore(s => s.setNewBookingModalOpen);
  const setPreselectedPropertyId = useStore(s => s.setPreselectedPropertyId);
  const setPreselectedCheckIn = useStore(s => s.setPreselectedCheckIn);
  const properties = useStore(s => s.properties);
  const allBookings = useStore(s => s.bookings);

  const handleCellClick = (property, day) => {
    setPreselectedPropertyId(property.id);
    setPreselectedCheckIn(format(day, 'yyyy-MM-dd'));
    setNewBookingModalOpen(true);
  };

  // Dynamic Filters
  const uniqueTypes = Array.from(new Set(properties.map(p => p.type)));
  const FILTERS = [
    { id: 'all', label: 'Todos', count: properties.length },
    ...uniqueTypes.map(type => ({
      id: type,
      label: TYPE_INFO[type]?.label || type.toUpperCase(),
      count: properties.filter(p => p.type === type).length
    }))
  ];

  const days = Array.from({ length: DAYS_VISIBLE }, (_, i) => addDays(startDate, i));
  const navigate = (dir) => setStartDate((d) => addDays(d, dir * 7));

  const filtered = activeFilter === 'all' ? properties : properties.filter(p => p.type === activeFilter);
  
  // Dynamic Grouping
  const activeTypes = Array.from(new Set(filtered.map(p => p.type)));
  const grouped = {};
  activeTypes.forEach(type => {
    grouped[type] = filtered.filter(p => p.type === type);
  });

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] overflow-hidden px-8 py-6 gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight">Calendario</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(startDate, "d MMM", { locale: es })} — {format(addDays(startDate, DAYS_VISIBLE - 1), "d MMM yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter pills */}
          <div className="flex bg-secondary border border-border rounded-full p-1 gap-0.5">
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150',
                  activeFilter === f.id
                    ? 'bg-card text-foreground font-semibold shadow-apple-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f.label}
                <span className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
                  activeFilter === f.id ? 'bg-accent text-primary' : 'bg-border text-muted-foreground'
                )}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm">
            <Download size={14} />
            Exportar
          </Button>
        </div>
      </div>

      {/* Timeline panel */}
      <div className="flex-1 bg-card rounded-[20px] border border-border shadow-apple-md overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto scrollbar-thin">
          {/* Sticky header row */}
          <div className="flex sticky top-0 z-20 bg-card border-b border-border">
            {/* Left column header */}
            <div className="w-[220px] shrink-0 h-[52px] flex items-center px-5 border-r border-border sticky left-0 bg-card z-30">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Propiedad</span>
            </div>
            {/* Day headers */}
            {days.map((day, i) => {
              const isToday = isSameDay(day, TODAY);
              return (
                <div
                  key={i}
                  className={cn(
                    'shrink-0 h-[52px] flex flex-col items-center justify-center gap-0.5 border-r border-border',
                    isToday && 'bg-accent/30'
                  )}
                  style={{ width: CELL_W }}
                >
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {format(day, 'EEE', { locale: es })}
                  </span>
                  <span className={cn(
                    'text-[15px] font-semibold leading-none',
                    isToday
                      ? 'bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-sm'
                      : 'text-foreground'
                  )}>
                    {format(day, 'd')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Property rows */}
          {Object.entries(grouped).map(([type, props]) => {
            if (!props.length) return null;
            const info = TYPE_INFO[type];
            return (
              <div key={type}>
                {/* Group header */}
                <div className="flex items-center h-9 bg-background border-b border-border sticky left-0">
                  <div className="w-[220px] shrink-0 flex items-center gap-2 px-5 sticky left-0 bg-background z-10">
                    <span className="text-sm">{info?.emoji || '🏷️'}</span>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      {info?.label || type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 border-b border-border" />
                </div>

                {/* Rows */}
                {props.map((property) => {
                  const propBookings = allBookings.filter(b => b.propertyId?.toLowerCase() === property.id?.toLowerCase());
                  return (
                    <div key={property.id} className="flex h-16 border-b border-border hover:bg-background/50 group">
                      {/* Property info */}
                      <div className="w-[220px] shrink-0 flex items-center gap-3 px-4 border-r border-border bg-card sticky left-0 z-10 group-hover:bg-background/50">
                        <div className="w-9 h-9 rounded-[8px] overflow-hidden shrink-0">
                          <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{property.name}</div>
                          <div className="text-[11px] text-muted-foreground">{property.id}</div>
                        </div>
                      </div>

                      {/* Grid */}
                      <div className="relative flex-1" style={{ width: CELL_W * DAYS_VISIBLE }}>
                        {/* Day cells */}
                        {days.map((day, i) => (
                          <div
                            key={i}
                            onClick={() => handleCellClick(property, day)}
                            className={cn(
                              'absolute top-0 bottom-0 border-r border-border cursor-pointer group/cell flex items-center justify-center hover:bg-secondary transition-colors',
                              isSameDay(day, TODAY) && 'bg-accent/10'
                            )}
                            style={{ left: i * CELL_W, width: CELL_W }}
                          >
                            <div className="w-5 h-5 rounded flex items-center justify-center bg-card shadow-sm border border-border opacity-0 group-hover/cell:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                              <Plus size={12} strokeWidth={3} />
                            </div>
                          </div>
                        ))}

                        {/* Booking blocks */}
                        {propBookings.map((booking) => {
                          const style = getBlockStyle(booking, startDate);
                          if (!style) return null;
                          const config = statusConfig[booking.status] || {};
                          const isSpecial = booking.status === 'maintenance' || booking.status === 'cleaning';

                          return (
                            <button
                              key={booking.id}
                              className="absolute top-[10px] h-[44px] rounded-[6px] flex items-center px-3 cursor-pointer transition-all duration-150 hover:brightness-95 hover:-translate-y-px hover:shadow-apple-sm overflow-hidden border-l-[3px]"
                              style={{
                                left: style.left,
                                width: style.width,
                                background: config.bg,
                                color: config.color,
                                borderColor: config.color,
                              }}
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <span className="flex items-center gap-1.5 text-xs font-semibold truncate whitespace-nowrap">
                                {isSpecial && (
                                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: config.color }} />
                                )}
                                {isSpecial ? config.label : `${booking.guestName} · ${booking.nights}n`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-5">
          {Object.entries(statusConfig).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full" style={{ background: val.color }} />
              {val.label}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-7 h-7 flex items-center justify-center bg-card border border-border rounded-[6px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs text-muted-foreground font-medium px-2">
            {format(startDate, "d MMM", { locale: es })} – {format(addDays(startDate, DAYS_VISIBLE - 1), "d MMM", { locale: es })}
          </span>
          <button
            onClick={() => navigate(1)}
            className="w-7 h-7 flex items-center justify-center bg-card border border-border rounded-[6px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
