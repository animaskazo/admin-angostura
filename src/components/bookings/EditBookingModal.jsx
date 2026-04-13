import { useState, useEffect } from 'react';
import { X, Calendar, Users, FileText, Building2, DollarSign, Activity } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

const DEFAULT_FORM = {
  propertyId: '',
  guestId: null,
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  checkIn: '',
  checkOut: '',
  adults: 2,
  children: 0,
  notes: '',
  status: 'pending',
  paidAmount: 0,
  receiptUrl: '',
};

function SectionHeader({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
      <Icon size={13} />{children}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function EditBookingModal() {
  const isOpen = useStore(s => s.isEditBookingModalOpen);
  const setOpen = useStore(s => s.setEditBookingModalOpen);
  const updateBooking = useStore(s => s.updateBooking);
  const addGuest = useStore(s => s.addGuest);
  const properties = useStore(s => s.properties);
  const guests = useStore(s => s.guests);
  const allBookings = useStore(s => s.bookings);
  const booking = useStore(s => s.selectedBooking);
  const setSelectedBooking = useStore(s => s.setSelectedBooking);

  const [form, setForm] = useState(DEFAULT_FORM);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGuestChips, setShowGuestChips] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  useEffect(() => {
    if (isOpen && booking) {
      setForm({
        propertyId: booking.propertyId || '',
        guestId: booking.guestId || null,
        guestName: booking.guestName || '',
        guestEmail: booking.guestEmail || '',
        guestPhone: booking.guestPhone || '',
        checkIn: booking.checkIn || '',
        checkOut: booking.checkOut || '',
        adults: booking.adults || 2,
        children: booking.children || 0,
        notes: booking.notes || '',
        status: booking.status || 'pending',
        paidAmount: booking.paidAmount || 0,
        receiptUrl: booking.receiptUrl || '',
      });
      setSearchTerm(booking.guestName || '');
    }
  }, [isOpen, booking]);

  const checkInDate = new Date(form.checkIn + 'T00:00:00');
  const checkOutDate = new Date(form.checkOut + 'T00:00:00');
  const nights = Math.max(1, Math.round((checkOutDate - checkInDate) / 86400000));
  const selectedProp = properties.find(p => p.id === form.propertyId);
  const total = selectedProp ? selectedProp.rate * nights : 0;
  const availableProps = properties; // For editing, we might want to allow changing to any property

  function handleOpenChange(open) {
    if (!open) {
      setForm(DEFAULT_FORM);
      setSearchTerm('');
      setShowGuestChips(false);
      setSubmitted(false);
      setSaving(false);
      setErrorMsg('');
    }
    setOpen(open);
  }

  const handleSelectGuest = (guest) => {
    setForm(f => ({
      ...f,
      guestId: guest.id,
      guestName: guest.fullName,
      guestEmail: guest.email,
      guestPhone: guest.phone,
    }));
    setSearchTerm(guest.fullName);
    setShowGuestChips(false);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.propertyId || !form.guestName || !booking) return;

    setErrorMsg('');
    const hasOverlap = allBookings.some(b => {
      if (b.id === booking.id) return false;
      if (b.propertyId !== form.propertyId) return false;
      if (b.status === 'cancelled') return false;
      
      const bIn = new Date(b.checkIn + 'T00:00:00');
      const bOut = new Date(b.checkOut + 'T00:00:00');
      return checkInDate < bOut && checkOutDate > bIn;
    });

    if (hasOverlap && form.status !== 'cancelled') {
      setErrorMsg('Las fechas se superponen con otra reserva existente en esta propiedad.');
      return;
    }

    setSaving(true);

    let currentGuestId = form.guestId;

    if (!currentGuestId && form.guestName !== booking.guestName) {
      const guestRes = await addGuest({
        fullName: form.guestName,
        email: form.guestEmail,
        phone: form.guestPhone,
      });
      if (guestRes.success) {
        currentGuestId = guestRes.data.id;
      }
    }

    const payload = { 
      ...form, 
      guestId: currentGuestId,
      nights, 
      totalAmount: total, 
    };

    const result = await updateBooking(booking.id, payload);

    setSaving(false);
    if (result?.success) {
      setSelectedBooking({ ...booking, ...payload }); // Update the selected booking so drawer reflects changes
      setSubmitted(true);
      setTimeout(() => {
        handleOpenChange(false);
      }, 1600);
    } else {
      alert('Error updating booking');
    }
  }

  const filteredGuests = searchTerm.length > 1 
    ? guests.filter(g => g.fullName.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div>
            <DialogTitle>Editar Reserva</DialogTitle>
            <DialogDescription>Modifica los datos de la reserva {booking?.id}</DialogDescription>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center bg-secondary border border-border rounded-[8px] text-muted-foreground hover:bg-[#FFECEA] hover:border-[#FF3B30] hover:text-[#FF3B30] transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-16 px-8 text-center animate-scale-in">
            <div className="w-14 h-14 rounded-full bg-[#E8F8ED] text-[#34C759] flex items-center justify-center text-2xl font-bold">✓</div>
            <div className="text-xl font-bold">¡Reserva actualizada!</div>
            <p className="text-sm text-muted-foreground">Los cambios fueron guardados con éxito.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            {/* Propiedad */}
            <div className="px-6 py-5 border-b border-border flex flex-col gap-4">
              <SectionHeader icon={Building2}>Propiedad</SectionHeader>
              <FormField label="Seleccionar propiedad *">
                <select
                  value={form.propertyId}
                  onChange={e => update('propertyId', e.target.value)}
                  required
                  className="flex h-9 w-full rounded-[8px] border border-border bg-secondary px-3 text-sm text-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/15 appearance-none cursor-pointer"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23aeaeb2' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  <option value="">Elegir propiedad...</option>
                  <optgroup label="Cabañas">
                    {availableProps.filter(p => p.type === 'cabin').map(p => (
                      <option key={p.id} value={p.id}>{p.name} — ${p.rate}/noche</option>
                    ))}
                  </optgroup>
                  <optgroup label="Suites">
                    {availableProps.filter(p => p.type === 'suite').map(p => (
                      <option key={p.id} value={p.id}>{p.name} — ${p.rate}/noche</option>
                    ))}
                  </optgroup>
                  <optgroup label="Casas">
                    {availableProps.filter(p => p.type === 'house').map(p => (
                      <option key={p.id} value={p.id}>{p.name} — ${p.rate}/noche</option>
                    ))}
                  </optgroup>
                </select>
              </FormField>
              {selectedProp && (
                <div className="flex items-center gap-3 bg-secondary rounded-[10px] p-3 border border-border">
                  <img src={selectedProp.image} alt={selectedProp.name} className="w-14 h-14 rounded-[8px] object-cover shrink-0" />
                  <div>
                    <div className="text-sm font-semibold">{selectedProp.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{selectedProp.id} · Máx {selectedProp.capacity} huéspedes</div>
                  </div>
                </div>
              )}
            </div>

            {/* Fechas */}
            <div className="px-6 py-5 border-b border-border flex flex-col gap-4">
              <SectionHeader icon={Calendar}>Fechas</SectionHeader>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Check-in">
                  <Input type="date" value={form.checkIn} onChange={e => update('checkIn', e.target.value)} required />
                </FormField>
                <FormField label="Check-out">
                  <Input type="date" value={form.checkOut} min={form.checkIn} onChange={e => update('checkOut', e.target.value)} required />
                </FormField>
              </div>
              {nights > 0 && (
                <span className="inline-block self-start text-xs bg-accent text-primary font-semibold px-3 py-1 rounded-full">
                  {nights} {nights === 1 ? 'noche' : 'noches'}
                </span>
              )}
            </div>

            {/* Huésped */}
            <div className="px-6 py-5 border-b border-border flex flex-col gap-4">
              <SectionHeader icon={Users}>Huésped</SectionHeader>
              
              <div className="relative">
                <FormField label="Buscar o ingresar nombre *">
                  <Input 
                    placeholder="Ej: García, Roberto" 
                    value={searchTerm || form.guestName} 
                    onChange={e => {
                      const val = e.target.value;
                      setSearchTerm(val);
                      update('guestName', val);
                      if (form.guestId) update('guestId', null);
                      setShowGuestChips(true);
                    }} 
                    onFocus={() => setShowGuestChips(true)}
                    required 
                  />
                </FormField>
                
                {showGuestChips && filteredGuests.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-card border border-border rounded-[10px] shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/50">Huéspedes existentes</p>
                    {filteredGuests.map(g => (
                      <button
                        key={g.id}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-secondary flex flex-col transition-colors border-t border-border/50"
                        onClick={() => handleSelectGuest(g)}
                      >
                        <span className="font-semibold text-foreground">{g.fullName}</span>
                        <span className="text-[10px] text-muted-foreground">{g.email || g.phone || 'Sin datos de contacto'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Email">
                  <Input type="email" placeholder="correo@email.com" value={form.guestEmail} onChange={e => update('guestEmail', e.target.value)} />
                </FormField>
                <FormField label="Teléfono">
                  <Input type="tel" placeholder="+54 9 11..." value={form.guestPhone} onChange={e => update('guestPhone', e.target.value)} />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Adultos">
                  <Input type="number" min={1} max={20} value={form.adults} onChange={e => update('adults', parseInt(e.target.value))} />
                </FormField>
                <FormField label="Niños">
                  <Input type="number" min={0} max={10} value={form.children} onChange={e => update('children', parseInt(e.target.value))} />
                </FormField>
              </div>
            </div>

            {/* Administracion: Estado y Monto */}
            <div className="px-6 py-5 border-b border-border flex flex-col gap-4">
              <SectionHeader icon={Activity}>Estado y Pago</SectionHeader>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Estado">
                  <select
                    value={form.status}
                    onChange={e => update('status', e.target.value)}
                    required
                    className="flex h-9 w-full rounded-[8px] border border-border bg-secondary px-3 text-sm text-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/15 appearance-none cursor-pointer"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23aeaeb2' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                  >
                    <option value="pending">Pago pendiente</option>
                    <option value="paid_cash">Pagado Efectivo</option>
                    <option value="paid_transfer">Pagado con Transferencia</option>
                    <option disabled>──────────</option>
                    <option value="occupied">Ocupado / En curso</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </FormField>
                <FormField label="Monto Pagado ($)">
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input 
                      type="number" 
                      min={0} 
                      className="pl-8" 
                      value={form.paidAmount} 
                      onChange={e => update('paidAmount', parseInt(e.target.value) || 0)} 
                    />
                  </div>
                </FormField>
              </div>
              {form.status === 'paid_transfer' && (
                <div className="mt-1 animate-in fade-in slide-in-from-top-1">
                  <FormField label="Comprobante (URL o Foto)">
                    <Input 
                      placeholder="https://enlace-al-comprobante..." 
                      value={form.receiptUrl} 
                      onChange={e => update('receiptUrl', e.target.value)} 
                    />
                  </FormField>
                </div>
              )}
            </div>

            {/* Notas */}
            <div className="px-6 py-5 border-b border-border flex flex-col gap-4">
              <SectionHeader icon={FileText}>Notas especiales</SectionHeader>
              <Textarea
                rows={3}
                placeholder="Solicitudes especiales, preferencias..."
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
              />
            </div>

            {/* Summary */}
            {selectedProp && (
              <div className="px-6 py-4 bg-secondary border-b border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">${selectedProp.rate} × {nights} noches</span>
                  <strong className="text-lg font-bold">${total.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted-foreground">Monto Pendiente</span>
                  <strong className="text-xs font-semibold text-[#FF3B30]">${Math.max(0, total - form.paidAmount).toLocaleString()}</strong>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="px-6 py-3 bg-[#FFECEA] border-b border-border text-[#FF3B30] text-xs font-semibold flex items-center gap-2">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 px-6 py-5">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" disabled={!form.propertyId || !form.guestName || saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
