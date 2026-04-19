import { useState } from 'react';
import { Search, X, Mail, Phone, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useStore } from '@/store/useStore';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';

const STATUS_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'occupied', label: 'Ocupado' },
  { id: 'confirmed', label: 'Confirmado' },
  { id: 'maintenance', label: 'Mantenimiento' },
  { id: 'cleaning', label: 'Limpieza' },
];



export function BookingsView() {
  const bookings = useStore(s => s.bookings);
  const properties = useStore(s => s.properties);
  const selectedBooking = useStore(s => s.selectedBooking);
  const setSelectedBooking = useStore(s => s.setSelectedBooking);
  const setNewBookingModalOpen = useStore(s => s.setNewBookingModalOpen);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = bookings
    .filter(b => {
      const matchSearch = !search ||
        b.guestName.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase()) ||
        b.propertyId.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));

  return (
    <div className="p-10 max-w-[1400px] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight">Reservas</h1>
          <p className="text-sm text-muted-foreground mt-1">{bookings.length} reservas en el sistema</p>
        </div>
        <Button onClick={() => setNewBookingModalOpen(true)}>+ Nueva reserva</Button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8"
            placeholder="Buscar por huésped, ID, propiedad..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
                statusFilter === f.id
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent cursor-default">
              <TableHead>ID</TableHead>
              <TableHead>Propiedad</TableHead>
              <TableHead>Huésped</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Noches</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(booking => {
              const prop = properties.find(p => p.id === booking.propertyId);
              return (
                <TableRow
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  data-state={selectedBooking?.id === booking.id ? 'selected' : undefined}
                >
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground font-semibold">{booking.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {prop && <img src={prop.image} alt={prop.name} className="w-9 h-9 rounded-[6px] object-cover shrink-0" />}
                      <span className="font-medium text-sm truncate max-w-[160px]">{prop?.name || booking.propertyId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{booking.guestName || '—'}</TableCell>
                  <TableCell className="capitalize text-muted-foreground whitespace-nowrap">
                    {(() => {
                      try {
                        const d = booking.checkIn || booking.check_in;
                        return d ? format(new Date(d + 'T12:00:00'), "d MMM", { locale: es }) : '—';
                      } catch (e) { return '---'; }
                    })()}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground whitespace-nowrap">
                    {(() => {
                      try {
                        const d = booking.checkOut || booking.check_out;
                        return d ? format(new Date(d + 'T12:00:00'), "d MMM", { locale: es }) : '—';
                      } catch (e) { return '---'; }
                    })()}
                  </TableCell>
                  <TableCell className="font-semibold text-muted-foreground">{booking.nights}</TableCell>
                  <TableCell className="font-semibold">
                    {booking.totalAmount > 0 ? formatCurrency(booking.totalAmount) : '—'}
                  </TableCell>
                  <TableCell><StatusBadge status={booking.status} size="sm" /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
            <Search size={32} />
            <p className="text-sm">Sin resultados para "{search}"</p>
          </div>
        )}
      </Card>

    </div>
  );
}
