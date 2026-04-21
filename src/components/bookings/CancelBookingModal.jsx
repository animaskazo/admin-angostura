import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export function CancelBookingModal() {
  const isOpen = useStore(s => s.isCancelBookingModalOpen);
  const setOpen = useStore(s => s.setCancelBookingModalOpen);
  const booking = useStore(s => s.selectedBooking);
  const setSelectedBooking = useStore(s => s.setSelectedBooking);
  const properties = useStore(s => s.properties);
  const deleteBooking = useStore(s => s.deleteBooking);
  const sendBookingEmail = useStore(s => s.sendBookingEmail);
  
  const [isDeleting, setIsDeleting] = useState(false);

  const prop = booking ? properties.find(p => p.id === (booking.propertyId || booking.property_id)) : null;

  const handleConfirmCancel = async () => {
    if (!booking) return;
    setIsDeleting(true);
    try {
      // 1. Enviar Email de cancelación
      await sendBookingEmail(booking, prop, 'cancelled');
      
      // 2. Borrar de DB físicamente
      const { success } = await deleteBooking(booking.id);
      
      if (success) {
        setOpen(false);
        setSelectedBooking(null);
      }
    } catch (error) {
      console.error('Error al cancelar:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen && !!booking} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-apple-2xl">
        <div className="bg-card p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#FFECEA] rounded-[20px] flex items-center justify-center text-[#FF3B30] mb-6 animate-in zoom-in-50 duration-300">
            <AlertTriangle size={32} />
          </div>
          
          <div className="flex flex-col items-center gap-2 mb-8">
            <h2 className="text-xl font-bold text-foreground">¿Cancelar reserva?</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Esta acción eliminará la reserva <span className="font-bold text-foreground">{booking?.id}</span> y enviará un correo de notificación a <span className="font-medium text-foreground">{booking?.guestName}</span>.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <Button 
              variant="destructive" 
              className="h-12 rounded-xl font-bold text-[14px] shadow-apple-md active:scale-[0.98] transition-all"
              onClick={handleConfirmCancel}
              disabled={isDeleting}
            >
              {isDeleting ? 'Cancelando...' : 'Confirmar Cancelación'}
            </Button>
            <Button 
              type="button"
              variant="secondary" 
              className="h-12 rounded-xl font-bold text-[14px] bg-secondary border border-border hover:bg-border transition-all"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
            >
              No, mantener reserva
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
