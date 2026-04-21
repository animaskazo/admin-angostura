import { useState, useEffect } from 'react';
import { X, Calendar, Users, FileText, Building2, Activity, CheckCircle2, Download, Home, UserCheck, ChevronLeft } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { formatCurrency, cn } from '@/lib/utils';

const TODAY_STR = format(new Date(), 'yyyy-MM-dd');
const DEFAULT_FORM = {
  selectedProperties: [], // Array de { id, pricePerNight }
  guestId: null,
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  checkIn: TODAY_STR,
  checkOut: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
  adults: 2,
  children: 0,
  notes: '',
  status: 'pending',
  receiptUrl: '',
  pricingMode: 'per_property', // 'per_property' | 'per_person' | 'blocked'
  extraChargeLabel: '',
  extraChargeAmount: 0,
  extraChargeQuantity: 1,
  extraChargeIsDaily: false,
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

export function NewBookingModal() {
  // Fixed: use individual selectors to avoid Zustand infinite loop
  const isOpen = useStore(s => s.isNewBookingModalOpen);
  const setOpen = useStore(s => s.setNewBookingModalOpen);
  const preselectedPropertyId = useStore(s => s.preselectedPropertyId);
  const setPreselectedPropertyId = useStore(s => s.setPreselectedPropertyId);
  const preselectedCheckIn = useStore(s => s.preselectedCheckIn);
  const setPreselectedCheckIn = useStore(s => s.setPreselectedCheckIn);
  const addBooking = useStore(s => s.addBooking);
  const addGuest = useStore(s => s.addGuest);
  const properties = useStore(s => s.properties);
  const guests = useStore(s => s.guests);
  const allBookings = useStore(s => s.bookings);
  const sendGroupBookingEmail = useStore(s => s.sendGroupBookingEmail);

  const [form, setForm] = useState(DEFAULT_FORM);
  const [step, setStep] = useState('select_mode'); // 'select_mode' | 'form'
  const [searchTerm, setSearchTerm] = useState('');
  const [showGuestChips, setShowGuestChips] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailStatus, setEmailStatus] = useState({ sending: false, sent: false, to: '' });

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  useEffect(() => {
    if (isOpen) {
      setForm(f => {
        const checkInVal = preselectedCheckIn || TODAY_STR;
        const checkOutVal = preselectedCheckIn
          ? format(addDays(new Date(preselectedCheckIn + 'T00:00:00'), 3), 'yyyy-MM-dd')
          : f.checkOut;

        return {
          ...f,
          selectedProperties: preselectedPropertyId
            ? [{ id: preselectedPropertyId, pricePerNight: properties.find(p => p.id === preselectedPropertyId)?.rate || 0 }]
            : f.selectedProperties,
          checkIn: checkInVal,
          checkOut: checkOutVal,
        };
      });
    }
  }, [isOpen, preselectedPropertyId, preselectedCheckIn, properties]);

  const checkInDate = new Date(form.checkIn + 'T00:00:00');
  const checkOutDate = new Date(form.checkOut + 'T00:00:00');
  const nights = Math.max(1, Math.round((checkOutDate - checkInDate) / 86400000));
  const totalPersons = Math.max(1, form.adults);

  function calcPropAmount(pricePerNight) {
    if (form.pricingMode === 'per_person') {
      return pricePerNight * totalPersons * nights;
    }
    return pricePerNight * nights;
  }

  const extraAmountBase = parseFloat(form.extraChargeAmount) || 0;
  const extraQty = parseInt(form.extraChargeQuantity) || 1;
  const extraTotal = form.extraChargeIsDaily ? (extraAmountBase * extraQty * nights) : (extraAmountBase * extraQty);
  const total = form.selectedProperties.reduce((acc, p) => acc + calcPropAmount(p.pricePerNight), 0) + extraTotal;
  const availableProps = properties;

  function handleOpenChange(open) {
    if (!open) {
      setForm(DEFAULT_FORM);
      setStep('select_mode');
      setSearchTerm('');
      setShowGuestChips(false);
      setSubmitted(false);
      setSaving(false);
      setErrorMsg('');
      setPreselectedPropertyId(null);
      setPreselectedCheckIn(null);
    }
    setOpen(open);
  }

  function handleSelectMode(mode) {
    setForm(f => ({ ...f, pricingMode: mode }));
    setStep('form');
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
    setErrorMsg('');

    // Validar solapamiento para cada propiedad seleccionada
    const overlappingProps = form.selectedProperties.filter(sp => {
      return allBookings.some(b => {
        if (b.propertyId !== sp.id) return false;
        if (b.status === 'cancelled') return false;
        const bIn = new Date(b.checkIn + 'T00:00:00');
        const bOut = new Date(b.checkOut + 'T00:00:00');
        return checkInDate < bOut && checkOutDate > bIn;
      });
    });

    if (overlappingProps.length > 0) {
      const names = overlappingProps.map(p => properties.find(pr => pr.id === p.id)?.name).join(', ');
      setErrorMsg(`Superposición detectada en: ${names}. Elige otras fechas o unidades.`);
      return;
    }

    if (form.selectedProperties.length === 0) {
      setErrorMsg('Selecciona al menos una propiedad.');
      return;
    }

    setSaving(true);

    let currentGuestId = form.guestId;

    // Si es un huésped nuevo (no seleccionado de la lista)
    if (!currentGuestId) {
      const guestRes = await addGuest({
        fullName: form.guestName,
        email: form.guestEmail,
        phone: form.guestPhone,
      });
      if (guestRes.success) {
        currentGuestId = guestRes.data.id;
      }
    }

    // Crear una reserva por cada propiedad seleccionada de forma secuencial para evitar colisión de IDs
    const results = [];
    const isGroup = form.selectedProperties.length > 1;

    for (let i = 0; i < form.selectedProperties.length; i++) {
      const prop = form.selectedProperties[i];
      let propTotal = calcPropAmount(prop.pricePerNight);

      // Añadir cargo extra solo a la primera propiedad para no duplicar
      if (i === 0) {
        propTotal += extraTotal;
      }

      const res = await addBooking({
        ...form,
        propertyId: prop.id,
        pricePerNight: form.pricingMode === 'blocked' ? 0 : prop.pricePerNight,
        guestId: form.pricingMode === 'blocked' ? null : currentGuestId,
        guestName: form.pricingMode === 'blocked' ? 'PROPIEDAD BLOQUEADA' : form.guestName,
        status: form.pricingMode === 'blocked' ? 'blocked' : 'pending',
        nights,
        totalAmount: form.pricingMode === 'blocked' ? 0 : propTotal,
        paidAmount: 0
      }, { skipEmail: isGroup || form.pricingMode === 'blocked' }); // Omitir email individual si es un grupo o bloqueo
      results.push(res);
    }

    const allSuccess = results.every(r => r.success);

    if (allSuccess) {
      if (isGroup) {
        // Enviar un solo email consolidado para el grupo
        setEmailStatus({ sending: true, sent: false, to: form.guestEmail });
        const groupEmailRes = await sendGroupBookingEmail(
          form.selectedProperties.map((p, i) => ({
            ...form,
            propertyId: p.id,
            pricePerNight: p.pricePerNight,
            totalAmount: calcPropAmount(p.pricePerNight) + (i === 0 ? extraTotal : 0)
          })),
          { guestName: form.guestName, guestEmail: form.guestEmail }
        );
        setEmailStatus(prev => ({ ...prev, sending: false, sent: groupEmailRes?.success }));
      } else {
        // Para una sola propiedad, el email ya se envió dentro de addBooking (flujo normal)
        const lastResult = results[0];
        setEmailStatus({ sending: false, sent: lastResult.emailSent, to: lastResult.emailTo || form.guestEmail });
      }
    }

    setSaving(false);
    if (allSuccess) {
      setSubmitted(true);
      setTimeout(() => {
        handleOpenChange(false);
      }, 3000);
    } else {
      const error = results.find(r => !r.success)?.error;
      setErrorMsg(error || 'Error al crear algunas reservas. Revisa el calendario.');
    }
  }

  const filteredGuests = searchTerm.length > 1
    ? guests.filter(g => g.fullName.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[1000px] h-[90vh] max-h-[850px] gap-0 p-0 overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0 flex flex-row items-start justify-between">
          <div className="flex flex-col">
            <DialogTitle>Nueva Reserva</DialogTitle>
            <DialogDescription>
              {step === 'select_mode'
                ? 'Elige el tipo de cobro para esta reserva'
                : 'Completa los datos para registrar la reserva'
              }
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            {step === 'form' && (
              <button
                type="button"
                onClick={() => setStep('select_mode')}
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border border-border bg-secondary/50 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all group"
              >
                <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Volver</span>
                <span className="opacity-40 mx-0.5">|</span>
                <span className="text-foreground/70">
                  {form.pricingMode === 'per_property' ? 'Propiedad' : form.pricingMode === 'per_person' ? 'Persona' : 'Bloqueo'}
                </span>
              </button>
            )}

            <button
              onClick={() => setOpen(false)}
              className="w-9 h-9 flex items-center justify-center bg-secondary/50 border border-border rounded-xl text-muted-foreground hover:bg-[#FFECEA] hover:border-[#FF3B30] hover:text-[#FF3B30] transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </DialogHeader>

        {/* STEP 0: Selección de modo */}
        {step === 'select_mode' && (
          <div className="flex flex-col items-center gap-6 py-14 px-10 animate-in fade-in slide-in-from-bottom-2">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">¿Cómo se calculará el precio de esta reserva?</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-[520px]">
              <button
                type="button"
                onClick={() => handleSelectMode('per_property')}
                className="group flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left"
              >
                <div className="w-14 h-14 rounded-2xl bg-secondary group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <Home size={26} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex flex-col gap-1 text-center">
                  <span className="text-base font-bold">Monto Fijo</span>
                  <span className="text-[11px] text-muted-foreground leading-relaxed">Se cobra una tarifa fija por día, independiente del número de personas</span>
                  <span className="mt-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">tarifa × noches</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleSelectMode('per_person')}
                className="group flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left"
              >
                <div className="w-14 h-14 rounded-2xl bg-secondary group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <UserCheck size={26} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex flex-col gap-1 text-center">
                  <span className="text-base font-bold">Por Persona</span>
                  <span className="text-[11px] text-muted-foreground leading-relaxed">El precio se multiplica por el número de personas en la reserva</span>
                  <span className="mt-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">tarifa × personas × noches</span>
                </div>
              </button>
            </div>

            <div className="w-full max-w-[520px]">
              <button
                type="button"
                onClick={() => handleSelectMode('blocked')}
                className="group w-full flex items-center gap-6 p-6 rounded-2xl border-2 border-border bg-card hover:border-[#1d1d1f] hover:bg-[#F2F2F7] transition-all duration-200 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary group-hover:bg-foreground/5 flex items-center justify-center transition-colors">
                  <Activity size={24} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-bold">Bloquear Propiedad</span>
                  <span className="text-[11px] text-muted-foreground">Marca la unidad como no disponible (mantenimiento, uso personal, etc.)</span>
                </div>
                <div className="ml-auto w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-white transition-all">
                  <ChevronLeft size={16} className="rotate-180" />
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 'form' && submitted ? (
          <div className="flex flex-col items-center gap-4 py-16 px-8 text-center animate-scale-in">
            <div className="w-14 h-14 rounded-full bg-[#E8F8ED] text-[#34C759] flex items-center justify-center text-2xl font-bold mb-2">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <div className="text-xl font-bold">¡Reserva creada!</div>
              <p className="text-sm text-muted-foreground mt-1">La reserva fue registrada con éxito.</p>
            </div>

            <div className="mt-4 pt-4 border-t border-border w-full max-w-[280px]">
              {emailStatus.sending ? (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse">
                  <Activity size={12} className="animate-spin" />
                  Enviando correo de confirmación...
                </div>
              ) : emailStatus.sent ? (
                <div className="flex flex-col items-center gap-1 text-xs text-[#34C759] font-medium bg-[#E8F8ED] py-2 px-3 rounded-[8px] animate-in fade-in slide-in-from-bottom-1">
                  <div className="flex items-center gap-1.5 uppercase tracking-wider font-bold text-[9px]">
                    <FileText size={10} /> Correo Enviado
                  </div>
                  <span className="opacity-90">{emailStatus.to}</span>
                </div>
              ) : (
                <div className="text-[10px] text-muted-foreground italic">
                  No se envió correo (sin email configurado)
                </div>
              )}
            </div>
          </div>
        ) : step === 'form' ? (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0 overflow-hidden">
              {/* Columna Izquierda: Listado de Propiedades */}
              <div className="p-6 border-r border-border bg-secondary/30 flex flex-col gap-4 overflow-y-auto">
                <SectionHeader icon={Building2}>Selección de Unidades</SectionHeader>
                <div className="flex flex-col gap-4 pr-2">
                  {(() => {
                    const uniqueTypes = Array.from(new Set(availableProps.map(p => p.type)));
                    const TYPE_LABELS = {
                      cabin: 'Cabañas',
                      suite: 'Suites',
                      house: 'Casas',
                      others: 'Otros'
                    };

                    return uniqueTypes.map(type => {
                      const props = availableProps.filter(p => p.type === type);
                      if (props.length === 0) return null;

                      return (
                        <div key={type} className="flex flex-col gap-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 ml-1">
                            {TYPE_LABELS[type] || type.toUpperCase()}
                          </span>
                          {props.map(p => {
                            const isSelected = form.selectedProperties.some(sp => sp.id === p.id);
                            const selectedData = form.selectedProperties.find(sp => sp.id === p.id);

                            return (
                              <div key={p.id} className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
                                isSelected ? "bg-card border-primary/40 shadow-apple-sm ring-1 ring-primary/5" : "bg-card/50 border-border border-dashed opacity-70 hover:opacity-100 hover:bg-card hover:border-solid"
                              )}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      update('selectedProperties', [...form.selectedProperties, { id: p.id, pricePerNight: p.rate }]);
                                    } else {
                                      update('selectedProperties', form.selectedProperties.filter(sp => sp.id !== p.id));
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold truncate leading-tight">{p.name}</div>
                                  <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">ID: {p.id} · Cap: {p.capacity}</div>
                                </div>

                                {isSelected && (
                                  <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-1">
                                    <Input
                                      type="number"
                                      className="h-8 w-24 text-[12px] px-2 font-medium bg-secondary border-none"
                                      value={selectedData.pricePerNight}
                                      onChange={(e) => {
                                        const newVal = parseFloat(e.target.value) || 0;
                                        update('selectedProperties', form.selectedProperties.map(sp =>
                                          sp.id === p.id ? { ...sp, pricePerNight: newVal } : sp
                                        ));
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Columna Derecha: Datos de la reserva */}
              <div className="flex flex-col overflow-y-auto scrollbar-thin">
                {/* Fechas */}
                <div className="p-6 border-b border-border flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <SectionHeader icon={Calendar}>Periodo de Estancia</SectionHeader>
                    {nights > 0 && (
                      <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1 rounded-full animate-in zoom-in-50">
                        {nights} {nights === 1 ? 'noche' : 'noches'}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Check-in">
                      <Input type="date" value={form.checkIn} onChange={e => update('checkIn', e.target.value)} required className="bg-secondary/50" />
                    </FormField>
                    <FormField label="Check-out">
                      <Input type="date" value={form.checkOut} min={form.checkIn} onChange={e => update('checkOut', e.target.value)} required className="bg-secondary/50" />
                    </FormField>
                  </div>
                </div>

                {/* Huésped (Oculto en Bloqueo) */}
                {form.pricingMode !== 'blocked' ? (
                  <div className="p-6 border-b border-border flex flex-col gap-4">
                    <SectionHeader icon={Users}>Información del Huésped</SectionHeader>
                    <div className="relative">
                      <FormField label="Nombre completo *">
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
                          className="bg-secondary/50"
                        />
                      </FormField>
                      {showGuestChips && filteredGuests.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-card border border-border rounded-xl shadow-apple-lg z-50 overflow-hidden">
                          {filteredGuests.map(g => (
                            <button key={g.id} type="button" className="w-full px-4 py-2.5 text-left text-sm hover:bg-secondary flex flex-col" onClick={() => handleSelectGuest(g)}>
                              <span className="font-semibold">{g.fullName}</span>
                              <span className="text-[10px] text-muted-foreground">{g.email || g.phone}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Teléfono">
                        <Input
                          type="tel"
                          placeholder="Ej: +56 9 1234 5678"
                          value={form.guestPhone}
                          onChange={e => update('guestPhone', e.target.value)}
                          className="bg-secondary/50"
                        />
                      </FormField>
                      <FormField label="Email">
                        <Input
                          type="email"
                          placeholder="Ej: nombre@correo.com"
                          value={form.guestEmail}
                          onChange={e => update('guestEmail', e.target.value)}
                          className="bg-secondary/50"
                        />
                      </FormField>
                    </div>
                    <FormField label="Notas adicionales">
                      <Textarea
                        placeholder="Alguna observación..."
                        className="bg-secondary/50 min-h-[40px] py-2"
                        value={form.notes}
                        onChange={e => update('notes', e.target.value)}
                      />
                    </FormField>
                  </div>
                ) : (
                  <div className="p-6 border-b border-border flex flex-col gap-4 animate-in fade-in">
                    <SectionHeader icon={Activity}>Motivo del Bloqueo</SectionHeader>
                    <FormField label="Razón o Descripción">
                      <Textarea
                        placeholder="Ej: Mantenimiento anual, reparación de filtración, reserva de dueño, etc."
                        className="bg-secondary/50 min-h-[100px]"
                        value={form.notes}
                        onChange={e => update('notes', e.target.value)}
                        required
                      />
                    </FormField>
                  </div>
                )}


                {/* Administración (Oculto en Bloqueo) */}
                {form.pricingMode !== 'blocked' && (
                  <div className="p-6 flex flex-col gap-4">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Personas (solo visible en modo per_person) */}
                      {form.pricingMode === 'per_person' && (
                        <FormField label="Personas">
                          <Input
                            type="number" min={1} max={99}
                            value={form.adults}
                            onChange={e => update('adults', parseInt(e.target.value) || 1)}
                            className="bg-secondary/50"
                          />
                        </FormField>
                      )}
                    </div>

                    {/* Cobro Extra */}
                    <div className="flex flex-col gap-2 p-3 rounded-xl border border-dashed border-border bg-secondary/5">
                      <Label className="text-[10px] uppercase tracking-wider font-bold opacity-50">Cobro Extra (Opcional)</Label>
                      <div className="grid grid-cols-[1fr,100px,100px] gap-3">
                        <div className="flex flex-col gap-1">
                          <Label className="text-[9px] uppercase font-bold opacity-70">Concepto</Label>
                          <Input
                            placeholder="Mascotas, Tina, etc."
                            value={form.extraChargeLabel}
                            onChange={e => update('extraChargeLabel', e.target.value)}
                            className="h-9 text-xs bg-secondary border-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-[9px] uppercase font-bold opacity-70">Valor $</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={form.extraChargeAmount || ''}
                            onChange={e => update('extraChargeAmount', parseFloat(e.target.value) || 0)}
                            className="h-9 text-xs font-semibold bg-secondary border-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-[9px] uppercase font-bold opacity-70">Cantidad</Label>
                          <Input
                            type="number"
                            placeholder="1"
                            min={1}
                            value={form.extraChargeQuantity}
                            onChange={e => update('extraChargeQuantity', parseInt(e.target.value) || 1)}
                            className="h-9 text-xs bg-secondary border-none"
                          />
                        </div>
                      </div>
                      {form.extraChargeAmount > 0 && (
                        <div className="flex items-center gap-2 mt-1 animate-in fade-in slide-in-from-top-1">
                          <input
                            type="checkbox"
                            id="isDaily"
                            checked={form.extraChargeIsDaily}
                            onChange={e => update('extraChargeIsDaily', e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                          />
                          <Label htmlFor="isDaily" className="text-[11px] cursor-pointer text-muted-foreground select-none">
                            Costo diario <span className="opacity-50">(se multiplica por {nights} noches)</span>
                          </Label>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Summary & Actions */}
            <div className="p-5 bg-card border-t border-border flex flex-col gap-4 mt-auto shrink-0 z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
              {form.selectedProperties.length > 0 && (
                <div className="flex items-center justify-between gap-4 py-1 border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded uppercase tracking-wider">
                      {form.selectedProperties.length} Prop.
                    </span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {form.selectedProperties.map(sp => {
                        const p = properties.find(pr => pr.id === sp.id);
                        return (
                          <span key={sp.id} className="text-[11px] text-muted-foreground font-medium">
                            {p?.name} <span className="text-foreground/50">({formatCurrency(calcPropAmount(sp.pricePerNight))})</span>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
                      {form.pricingMode === 'blocked' ? 'Estado del Bloqueo' : form.pricingMode === 'per_person'
                        ? `Total · ${totalPersons} persona${totalPersons !== 1 ? 's' : ''} · ${nights} noches`
                        : `Total · ${nights} noche${nights !== 1 ? 's' : ''}`
                      }
                    </span>
                    <span className={cn("text-xl font-bold leading-none tabular-nums", form.pricingMode === 'blocked' ? 'text-muted-foreground' : 'text-primary')}>
                      {form.pricingMode === 'blocked' ? 'FECHAS BLOQUEADAS' : formatCurrency(total)}
                    </span>
                  </div>
                </div>
              )}

              {/* Error & Submit */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  {errorMsg && (
                    <div className="text-[#FF3B30] text-[11px] font-semibold flex items-center gap-1.5">
                      ⚠️ {errorMsg}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      const itemsHtml = form.selectedProperties.map(sp => {
                        const p = properties.find(pr => pr.id === sp.id);
                        return `
                          <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 12px 0;">
                              <div style="font-weight: 600; color: #1d1d1f;">${p?.name}</div>
                              <div style="font-size: 11px; color: #86868b;">${p?.id}</div>
                            </td>
                            <td style="padding: 12px 0; text-align: right; color: #424245;">$${sp.pricePerNight.toLocaleString('es-CL')}</td>
                             <td style="padding: 12px 0; text-align: right; font-weight: 600;">$${calcPropAmount(sp.pricePerNight).toLocaleString('es-CL')}</td>
                          </tr>
                        `;
                      }).join('') + (extraTotal > 0 ? `
                        <tr style="border-bottom: 1px solid #eee;">
                          <td style="padding: 12px 0;">
                            <div style="font-weight: 600; color: #1d1d1f;">${form.extraChargeLabel || 'Cobro Extra'}</div>
                            <div style="font-size: 11px; color: #86868b;">
                              ${form.extraChargeQuantity > 1 ? `Cantidad: ${form.extraChargeQuantity}` : ''} 
                              ${form.extraChargeIsDaily ? `${form.extraChargeQuantity > 1 ? ' · ' : ''}${nights} noches` : ''}
                            </div>
                          </td>
                          <td style="padding: 12px 0; text-align: right; color: #424245;">$${extraAmountBase.toLocaleString('es-CL')}</td>
                          <td style="padding: 12px 0; text-align: right; font-weight: 600;">$${extraTotal.toLocaleString('es-CL')}</td>
                        </tr>
                      ` : '');

                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Resumen de Reserva - ${form.guestName}</title>
                            <style>
                              body { font-family: -apple-system, sans-serif; padding: 40px; color: #1d1d1f; line-height: 1.4; }
                              .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #1d1d1f; padding-bottom: 20px; }
                              .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
                              .voucher-title { font-size: 12px; font-weight: 700; color: #86868b; text-transform: uppercase; letter-spacing: 1px; }
                              .info-grid { display: grid; grid-cols: 2; gap: 40px; margin-bottom: 40px; }
                              .section-label { font-size: 10px; font-weight: 700; color: #86868b; text-transform: uppercase; margin-bottom: 8px; }
                              table { width: 100%; border-collapse: collapse; }
                              th { text-align: left; font-size: 10px; color: #86868b; text-transform: uppercase; border-bottom: 1px solid #1d1d1f; padding-bottom: 8px; }
                              .total-row { margin-top: 30px; padding-top: 20px; border-top: 2px solid #1d1d1f; display: flex; justify-content: space-between; align-items: center; }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <div style="display: flex; align-items: center; gap: 12px;">
                                <img src="https://lpychtqwfoqzxcewyhla.supabase.co/storage/v1/object/public/files/logo.png" style="width: 40px; height: 40px; object-fit: contain;" />
                                <div class="logo">COMPLEJO ANGOSTURA</div>
                              </div>
                              <div class="voucher-title">Resumen de Reserva</div>
                            </div>

                            <div style="display: flex; gap: 80px; margin-bottom: 40px;">
                              <div>
                                <div class="section-label">Huésped</div>
                                <div style="font-size: 16px; font-weight: 700;">${form.guestName}</div>
                                <div style="color: #424245;">${form.guestEmail || ''}</div>
                                <div style="color: #424245;">${form.guestPhone || ''}</div>
                              </div>
                              <div>
                                <div class="section-label">Estadía</div>
                                <div style="font-size: 16px; font-weight: 700;">${nights} Noches</div>
                                <div style="color: #424245;">Del ${form.checkIn} al ${form.checkOut}</div>
                              </div>
                            </div>

                            <table>
                              <thead>
                                <tr>
                                  <th>Descripción de Unidades</th>
                                  <th style="text-align: right;">${form.pricingMode === 'per_person' ? 'Tarifa (' + totalPersons + 'p \u00d7 ' + nights + 'n)' : 'Precio/Noche'}</th>
                                  <th style="text-align: right;">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${itemsHtml}
                              </tbody>
                            </table>

                            <div class="total-row">
                              <div style="font-size: 14px; font-weight: 700;">TOTAL A PAGAR (CLP)</div>
                              <div style="font-size: 24px; font-weight: 800;">$${total.toLocaleString('es-CL')}</div>
                            </div>

                            <div style="margin-top: 60px; font-size: 11px; color: #86868b; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
                              Gracias por elegir Complejo Angostura. Este documento es un resumen informativo de reserva.
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
                    }}
                    className="gap-2 h-9"
                  >
                    <Download size={14} />
                    Resumen PDF
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={
                      form.selectedProperties.length === 0 || 
                      (form.pricingMode !== 'blocked' && !form.guestName) || 
                      (form.pricingMode === 'blocked' && !form.notes) ||
                      saving
                    } 
                    className="px-6 h-9"
                  >
                    {saving 
                      ? 'Guardando...' 
                      : form.pricingMode === 'blocked' 
                        ? `Bloquear (${form.selectedProperties.length})` 
                        : `Reservar (${form.selectedProperties.length})`
                    }
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : null}

      </DialogContent>
    </Dialog>
  );
}
