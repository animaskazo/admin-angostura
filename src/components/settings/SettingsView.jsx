import { useState, useEffect } from 'react';
import { Save, Building, FileText, CheckCircle2, Mail, Bell } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function SettingsView() {
  const { settings, updateSettings, loading } = useStore();
  const [formData, setFormData] = useState({
    bank_details: '',
    booking_conditions: '',
    email_confirmed: true,
    email_cancelled: true,
    email_modified: true,
    email_paid: true,
    msg_confirmed: '',
    msg_paid: '',
    msg_cancelled: '',
    msg_modified: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        bank_details: settings.bank_details || '',
        booking_conditions: settings.booking_conditions || '',
        email_confirmed: settings.email_confirmed ?? true,
        email_cancelled: settings.email_cancelled ?? true,
        email_modified: settings.email_modified ?? true,
        email_paid: settings.email_paid ?? true,
        msg_confirmed: settings.msg_confirmed || '',
        msg_paid: settings.msg_paid || '',
        msg_cancelled: settings.msg_cancelled || '',
        msg_modified: settings.msg_modified || '',
      });
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const { success } = await updateSettings(formData);
    setIsSaving(false);
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="p-10 w-full max-w-[800px] flex flex-col gap-8">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight">Configuración</h1>
          <p className="text-sm text-muted-foreground mt-1">Administra los textos legales, de pago y preferencias de comunicación.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email Settings */}
          <Card className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                <Bell size={18} />
              </div>
              <h2 className="text-lg font-semibold">Notificaciones por Email</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">
              Controla qué correos automáticos se envían a los huéspedes.
            </p>
            
            <div className="flex flex-col gap-2">
              {[
                { id: 'email_confirmed', label: 'Confirmación de reserva', desc: 'Se envía al crear una reserva con éxito.' },
                { id: 'email_cancelled', label: 'Cancelación de reserva', desc: 'Se envía cuando se marca como cancelada.' },
                { id: 'email_modified',  label: 'Modificaciones de reserva', desc: 'Se envía al editar fechas o propiedad.' },
                { id: 'email_paid',      label: 'Notificación de pago', desc: 'Se envía al marcar una reserva como pagada.' },
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-secondary/50 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-[11px] text-muted-foreground">{item.desc}</span>
                  </div>
                  <Switch 
                    checked={formData[item.id]} 
                    onCheckedChange={val => setFormData(f => ({ ...f, [item.id]: val }))}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Custom Messages */}
          <Card className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <Mail size={18} />
              </div>
              <h2 className="text-lg font-semibold">Cuerpo de los Mensajes</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Personaliza el texto introductorio para cada tipo de correo.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div className="flex flex-col gap-2">
                <Label className="text-xs uppercase tracking-wider opacity-70">Confirmación de Reserva</Label>
                <Textarea 
                  placeholder="Ej: Tu estadía ha sido confirmada con éxito..."
                  className="min-h-[100px] text-sm"
                  value={formData.msg_confirmed}
                  onChange={e => setFormData(f => ({ ...f, msg_confirmed: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs uppercase tracking-wider opacity-70">Confirmación de Pago</Label>
                <Textarea 
                  placeholder="Ej: ¡Excelente! Hemos recibido tu pago y tu reserva está garantizada..."
                  className="min-h-[100px] text-sm"
                  value={formData.msg_paid}
                  onChange={e => setFormData(f => ({ ...f, msg_paid: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs uppercase tracking-wider opacity-70">Cancelación</Label>
                <Textarea 
                  placeholder="Ej: Lamentamos informarte que tu reserva ha sido cancelada..."
                  className="min-h-[100px] text-sm"
                  value={formData.msg_cancelled}
                  onChange={e => setFormData(f => ({ ...f, msg_cancelled: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs uppercase tracking-wider opacity-70">Modificación</Label>
                <Textarea 
                  placeholder="Ej: Se han realizado cambios en los detalles de tu estadía..."
                  className="min-h-[100px] text-sm"
                  value={formData.msg_modified}
                  onChange={e => setFormData(f => ({ ...f, msg_modified: e.target.value }))}
                />
              </div>
            </div>
          </Card>

          {/* Bank Details */}
          <Card className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Building size={18} />
              </div>
              <h2 className="text-lg font-semibold">Datos de Transferencia</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Esta información se incluirá en el correo de confirmación. Incluye Banco, Tipo de cuenta, CBU/Alias y Rut/DNI.
            </p>
            <Textarea 
              placeholder="Ej: Banco Estado, Cuenta Corriente, N° 12345..."
              className="min-h-[150px] text-sm leading-relaxed font-mono"
              value={formData.bank_details}
              onChange={e => setFormData(f => ({ ...f, bank_details: e.target.value }))}
            />
          </Card>

          {/* Conditions */}
          <Card className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <FileText size={18} />
              </div>
              <h2 className="text-lg font-semibold">Condiciones de la Reserva</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Políticas de cancelación, horarios de check-in/out y normas del complejo.
            </p>
            <Textarea 
              placeholder="Ej: Check-in a partir de las 15:00 hrs. La cancelación con menos de 48 hrs..."
              className="min-h-[150px] text-sm leading-relaxed"
              value={formData.booking_conditions}
              onChange={e => setFormData(f => ({ ...f, booking_conditions: e.target.value }))}
            />
          </Card>

          {/* Fixed Footer Bar */}
          <div className="fixed bottom-0 left-[240px] right-0 bg-background/80 backdrop-blur-md border-t border-border p-4 z-50 rounded-t-3xl shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.1)]">
            <div className="max-w-[800px] mx-auto flex items-center justify-between px-6">
              <div className="flex items-center gap-2">
                {showSuccess && (
                  <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium animate-in fade-in slide-in-from-left-2">
                    <CheckCircle2 size={16} />
                    Cambios guardados con éxito
                  </div>
                )}
              </div>
              <Button type="submit" disabled={isSaving} className="shadow-apple-md h-11 px-8 rounded-xl font-bold">
                <Save size={16} className="mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </form>
        <div className="h-32" /> {/* Spacer for fixed footer */}
      </div>
    </div>
  );
}
