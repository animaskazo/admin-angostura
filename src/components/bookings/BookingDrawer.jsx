import { X, Mail, Phone, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useStore } from '@/store/useStore';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

export function BookingDrawer() {
  const booking = useStore(s => s.selectedBooking);
  const setSelectedBooking = useStore(s => s.setSelectedBooking);
  const properties = useStore(s => s.properties);
  const deleteBooking = useStore(s => s.deleteBooking);
  const setEditBookingModalOpen = useStore(s => s.setEditBookingModalOpen);
  const updateBooking = useStore(s => s.updateBooking);
  const sendBookingEmail = useStore(s => s.sendBookingEmail);
  const setCancelBookingModalOpen = useStore(s => s.setCancelBookingModalOpen);

  if (!booking) return null;

  const prop = properties.find(p => p.id === (booking.propertyId || booking.property_id));
  const paidPct = (booking.totalAmount || booking.total_amount) > 0 
    ? Math.round(((booking.paidAmount || booking.paid_amount || 0) / (booking.totalAmount || booking.total_amount)) * 100) 
    : 0;

  const onClose = () => setSelectedBooking(null);

  const handleCancel = () => {
    setCancelBookingModalOpen(true);
  };

  const renderDate = (dateStr) => {
    if (!dateStr) return '---';
    try {
      // Intentar manejar formato ISO o simple
      const cleanDate = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`;
      return format(new Date(cleanDate), "d MMM yyyy", { locale: es });
    } catch (e) {
      return dateStr;
    }
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    const nightly = booking.pricePerNight || booking.price_per_night || prop?.rate || 0;
    const totalAmount = booking.totalAmount || booking.total_amount || (nightly * booking.nights) || 0;

    printWindow.document.write(`
      <html>
        <head>
          <title>Resumen de Reserva - ${booking.guestName}</title>
          <style>
            body { font-family: -apple-system, sans-serif; padding: 40px; color: #1d1d1f; line-height: 1.4; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #1d1d1f; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
            .voucher-title { font-size: 12px; font-weight: 700; color: #86868b; text-transform: uppercase; letter-spacing: 1px; }
            .section-label { font-size: 10px; font-weight: 700; color: #86868b; text-transform: uppercase; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; font-size: 10px; color: #86868b; text-transform: uppercase; border-bottom: 1px solid #1d1d1f; padding-bottom: 8px; }
            .total-row { margin-top: 30px; padding-top: 20px; border-top: 2px solid #1d1d1f; display: flex; justify-content: space-between; align-items: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="/logo.png" style="width: 40px; height: 40px; object-fit: contain;" />
              <div style="font-size: 24px; font-weight: 800;">COMPLEJO ANGOSTURA</div>
            </div>
            <div class="voucher-title">Cupón de Reserva</div>
          </div>

          <div style="display: flex; gap: 80px; margin-bottom: 40px;">
            <div>
              <div class="section-label">Huésped</div>
              <div style="font-size: 16px; font-weight: 700;">${booking.guestName}</div>
              <div style="color: #424245;">${booking.guestEmail || ''}</div>
              <div style="color: #424245;">${booking.guestPhone || ''}</div>
            </div>
            <div>
              <div class="section-label">Estadía</div>
              <div style="font-size: 16px; font-weight: 700;">${booking.nights} Noches</div>
              <div style="color: #424245;">Del ${booking.checkIn || booking.check_in} al ${booking.checkOut || booking.check_out}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Unidad</th>
                <th style="text-align: right;">Precio/Noche</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 12px 0;">
                  <div style="font-weight: 600;">${prop?.name || 'Habitación'}</div>
                  <div style="font-size: 11px; color: #86868b;">ID: ${booking.propertyId}</div>
                </td>
                <td style="padding: 12px 0; text-align: right;">$${nightly.toLocaleString('es-CL')}</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 600;">$${totalAmount.toLocaleString('es-CL')}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-row">
            <div style="font-size: 14px; font-weight: 700;">TOTAL DE LA RESERVA</div>
            <div style="font-size: 24px; font-weight: 800;">$${totalAmount.toLocaleString('es-CL')}</div>
          </div>

          <div style="margin-top: 60px; font-size: 11px; color: #86868b; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            Voucher generado el ${new Date().toLocaleDateString('es-CL')}. Documento informativo.
          </div>

          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              title="Descargar PDF"
              className="w-8 h-8 flex items-center justify-center bg-secondary border border-border rounded-[8px] text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Download size={16} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center bg-secondary border border-border rounded-[8px] text-muted-foreground hover:bg-border hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>
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
                <div className="text-sm text-primary font-medium mt-1">{formatCurrency(prop.rate)}/noche</div>
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
                {renderDate(booking.checkIn || booking.check_in)}
              </div>
            </div>
            <span className="text-muted-foreground text-lg">→</span>
            <div className="flex-1 bg-secondary rounded-[10px] p-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Check-out</div>
              <div className="text-sm font-semibold capitalize">
                {renderDate(booking.checkOut || booking.check_out)}
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
              <span>Total</span><strong className="text-foreground">{formatCurrency(booking.totalAmount)}</strong>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Pagado</span><strong className="text-[#34C759]">{formatCurrency(booking.paidAmount)}</strong>
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
