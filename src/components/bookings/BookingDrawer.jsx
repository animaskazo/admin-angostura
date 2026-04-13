import { X, Mail, Phone, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useStore } from '@/store/useStore';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function BookingDrawer() {
  const booking = useStore(s => s.selectedBooking);
  const setSelectedBooking = useStore(s => s.setSelectedBooking);
  const properties = useStore(s => s.properties);
  const deleteBooking = useStore(s => s.deleteBooking);
  const setEditBookingModalOpen = useStore(s => s.setEditBookingModalOpen);

  if (!booking) return null;
  const prop = properties.find(p => p.id === booking.propertyId);
  const paidPct = booking.totalAmount > 0 ? Math.round((booking.paidAmount / booking.totalAmount) * 100) : 0;

  const onClose = () => setSelectedBooking(null);

  const handleCancel = async () => {
    if (confirm('¿Estás seguro de que deseas cancelar/eliminar esta reserva? Esta acción no se puede deshacer.')) {
      const { success, error } = await deleteBooking(booking.id);
      if (success) {
        onClose();
      } else {
        alert('Error: ' + error);
      }
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200] animate-fade-in"
        onClick={onClose}
      />
      {/* Drawer */}
      <aside className="fixed top-0 right-0 bottom-0 w-[380px] bg-card border-l border-border shadow-apple-xl z-[201] flex flex-col overflow-y-auto animate-slide-in-right scrollbar-thin">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border shrink-0">
          <div>
            <div className="text-lg font-bold tracking-tight mb-2">{booking.id}</div>
            <StatusBadge status={booking.status} />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-secondary border border-border rounded-[8px] text-muted-foreground hover:bg-border hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Property */}
        {prop && (
          <div className="px-6 py-5 border-b border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Propiedad</p>
            <div className="flex items-center gap-4">
              <img src={prop.image} alt={prop.name} className="w-16 h-16 rounded-[10px] object-cover shrink-0" />
              <div>
                <div className="font-semibold">{prop.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{prop.id}</div>
                <div className="text-sm text-primary font-medium mt-1">${prop.rate}/noche</div>
              </div>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="px-6 py-5 border-b border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Fechas</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 bg-secondary rounded-[10px] p-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Check-in</div>
              <div className="text-sm font-semibold capitalize">
                {format(new Date(booking.checkIn + 'T00:00:00'), "d MMM yyyy", { locale: es })}
              </div>
            </div>
            <span className="text-muted-foreground text-lg">→</span>
            <div className="flex-1 bg-secondary rounded-[10px] p-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Check-out</div>
              <div className="text-sm font-semibold capitalize">
                {format(new Date(booking.checkOut + 'T00:00:00'), "d MMM yyyy", { locale: es })}
              </div>
            </div>
          </div>
          <span className="inline-block text-xs bg-secondary px-3 py-1 rounded-full text-muted-foreground">
            {booking.nights} noches · {booking.adults} adultos{booking.children > 0 ? ` · ${booking.children} niños` : ''}
          </span>
        </div>

        {/* Guest */}
        {(booking.guestName || booking.guestEmail) && (
          <div className="px-6 py-5 border-b border-border flex flex-col gap-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Huésped</p>
            <div className="font-semibold">{booking.guestName}</div>
            {booking.guestEmail && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail size={13} />{booking.guestEmail}</div>}
            {booking.guestPhone && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone size={13} />{booking.guestPhone}</div>}
          </div>
        )}

        {/* Payment */}
        {booking.totalAmount > 0 && (
          <div className="px-6 py-5 border-b border-border flex flex-col gap-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Pago</p>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total</span><strong className="text-foreground">${booking.totalAmount.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Pagado</span><strong className="text-[#34C759]">${booking.paidAmount.toLocaleString()}</strong>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-[#34C759] rounded-full transition-all" style={{ width: `${paidPct}%` }} />
            </div>
            <div className="text-[11px] text-muted-foreground text-right">{paidPct}% pagado</div>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="px-6 py-5 border-b border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Notas</p>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <FileText size={13} className="mt-0.5 shrink-0" />{booking.notes}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-5 flex flex-col gap-2 mt-auto border-t border-border">
          <Button variant="secondary" className="w-full" onClick={() => setEditBookingModalOpen(true)}>Editar reserva</Button>
          <Button variant="destructive" className="w-full" onClick={handleCancel}>Cancelar reserva</Button>
        </div>
      </aside>
    </>
  );
}
