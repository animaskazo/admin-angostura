import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, FileText, Calendar, Wallet, CheckCircle2, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/badge';

const DEFAULT_FORM = {
  fullName: '',
  email: '',
  phone: '',
  documentId: '',
  notes: '',
};

export function GuestModal() {
  const isOpen = useStore((s) => s.isGuestModalOpen);
  const setOpen = useStore((s) => s.setGuestModalOpen);
  const selectedGuest = useStore((s) => s.selectedGuest);
  const setSelectedGuest = useStore((s) => s.setSelectedGuest);
  const addGuest = useStore((s) => s.addGuest);
  const updateGuest = useStore((s) => s.updateGuest);
  const bookings = useStore((s) => s.bookings);
  const properties = useStore((s) => s.properties);

  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'history'

  useEffect(() => {
    if (selectedGuest) {
      setForm({
        fullName: selectedGuest.fullName || '',
        email: selectedGuest.email || '',
        phone: selectedGuest.phone || '',
        documentId: selectedGuest.documentId || '',
        notes: selectedGuest.notes || '',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [selectedGuest]);

  if (!isOpen) return null;

  const handleClose = () => {
    setOpen(false);
    setSelectedGuest(null);
    setForm(DEFAULT_FORM);
    setActiveTab('info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selectedGuest) {
        await updateGuest(selectedGuest.id, form);
      } else {
        await addGuest(form);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving guest:', error);
    } finally {
      setSaving(false);
    }
  };

  const guestBookings = selectedGuest 
    ? bookings.filter(b => b.guestId === selectedGuest.id)
        .sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn))
    : [];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-[600px] bg-card border border-border rounded-[28px] shadow-apple-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-secondary/30">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {selectedGuest ? 'Editar Huésped' : 'Nuevo Huésped'}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {selectedGuest ? 'Actualiza la información del cliente' : 'Registra un nuevo cliente en el sistema'}
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        {selectedGuest && (
          <div className="px-8 pt-4 flex gap-6 border-b border-border">
            <button
              onClick={() => setActiveTab('info')}
              className={cn(
                "pb-3 text-sm font-semibold transition-all relative",
                activeTab === 'info' ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Información
              {activeTab === 'info' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "pb-3 text-sm font-semibold transition-all relative flex items-center gap-2",
                activeTab === 'history' ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Historial
              <span className="bg-secondary px-1.5 py-0.5 rounded-full text-[10px]">{guestBookings.length}</span>
              {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto p-8 scrollbar-thin">
            {activeTab === 'info' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2.5 col-span-2">
                    <label className="text-[13px] font-semibold flex items-center gap-2 px-1">
                      <User size={14} className="text-primary" />
                      Nombre Completo
                    </label>
                    <Input 
                      required
                      placeholder="Ej: Juan Pérez"
                      className="h-11 bg-secondary/50 border-border/50 focus:border-primary/30 rounded-[14px]"
                      value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2.5">
                    <label className="text-[13px] font-semibold flex items-center gap-2 px-1">
                      <Mail size={14} className="text-primary" />
                      Email
                    </label>
                    <Input 
                      type="email"
                      placeholder="email@ejemplo.com"
                      className="h-11 bg-secondary/50 border-border/50 focus:border-primary/30 rounded-[14px]"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[13px] font-semibold flex items-center gap-2 px-1">
                      <Phone size={14} className="text-primary" />
                      Teléfono
                    </label>
                    <Input 
                      placeholder="+54 9..."
                      className="h-11 bg-secondary/50 border-border/50 focus:border-primary/30 rounded-[14px]"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2.5 col-span-2">
                    <label className="text-[13px] font-semibold flex items-center gap-2 px-1">
                      <FileText size={14} className="text-primary" />
                      Documento / ID
                    </label>
                    <Input 
                      placeholder="DNI, Pasaporte..."
                      className="h-11 bg-secondary/50 border-border/50 focus:border-primary/30 rounded-[14px]"
                      value={form.documentId}
                      onChange={e => setForm({ ...form, documentId: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2.5 col-span-2">
                    <label className="text-[13px] font-semibold flex items-center gap-2 px-1">
                      <FileText size={14} className="text-primary" />
                      Notas
                    </label>
                    <textarea 
                      rows={3}
                      placeholder="Información adicional, requerimientos especiales..."
                      className="w-full bg-secondary/50 border border-border/50 focus:border-primary/30 rounded-[14px] p-4 text-sm outline-none resize-none transition-all"
                      value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {guestBookings.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-3">
                    <Calendar size={32} strokeWidth={1.5} />
                    <p className="text-sm">Este huésped no tiene reservas registradas todavía.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {guestBookings.map(b => {
                      const prop = properties.find(p => p.id === b.propertyId);
                      return (
                        <div key={b.id} className="p-4 rounded-[18px] bg-secondary/30 border border-border/40 hover:border-primary/20 transition-all flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[12px] bg-card overflow-hidden shadow-apple-sm group-hover:scale-105 transition-transform">
                              <img src={prop?.image} alt={prop?.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="font-bold text-sm tracking-tight">{prop?.name}</div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <Calendar size={11} />
                                {format(parseISO(b.checkIn), 'd MMM', { locale: es })} - {format(parseISO(b.checkOut), 'd MMM yyyy', { locale: es })}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1.5">
                            <div className="text-sm font-bold text-foreground">${b.totalAmount.toLocaleString()}</div>
                            <StatusBadge status={b.status} size="sm" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-8 border-t border-border flex gap-3">
            <Button 
              type="button" 
              variant="secondary" 
              className="flex-1 h-12 rounded-[16px] font-bold"
              onClick={handleClose}
            >
              Cerrar
            </Button>
            {activeTab === 'info' && (
              <Button 
                disabled={saving}
                className="flex-[2] h-12 rounded-[16px] font-bold shadow-apple-md"
              >
                {saving ? 'Guardando...' : (selectedGuest ? 'Guardar Cambios' : 'Crear Huésped')}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
