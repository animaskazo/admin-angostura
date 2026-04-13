import { useState } from 'react';
import { Search, Plus, Mail, Phone, User, FileText, MoreHorizontal, Edit2, Trash2, Calendar, LayoutGrid, List } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function GuestsView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('card');
  const guests = useStore(s => s.guests);
  const bookings = useStore(s => s.bookings);
  const properties = useStore(s => s.properties);
  const deleteGuest = useStore(s => s.deleteGuest);
  const setGuestModalOpen = useStore(s => s.setGuestModalOpen);
  const setSelectedGuest = useStore(s => s.setSelectedGuest);

  const filteredGuests = guests.filter(g => 
    g.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.phone.includes(searchTerm)
  );

  const getGuestStats = (guestId) => {
    const guestBookings = bookings.filter(b => b.guestId === guestId)
      .sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));
    return {
      count: guestBookings.length,
      totalSpent: guestBookings.reduce((sum, b) => sum + b.totalAmount, 0),
      recentBookings: guestBookings.slice(0, 3),
    };
  };

  const handleEdit = (guest) => {
    setSelectedGuest(guest);
    setGuestModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este huésped? Esta acción no se puede deshacer.')) {
      const { success, error } = await deleteGuest(id);
      if (!success) alert('Error: ' + error);
    }
  };

  return (
    <div className="p-10 max-w-[1400px] flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight">Huéspedes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {guests.length} clientes registrados en el sistema
          </p>
        </div>
        <Button onClick={() => setGuestModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Nuevo Huésped
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            className="pl-10 h-11 bg-card border-border/50 focus:border-primary/30 transition-all rounded-[12px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-card border border-border/50 p-1 rounded-[12px] h-11 shrink-0">
          <button
            onClick={() => setViewMode('card')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
              viewMode === 'card' ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
            title="Vista de Tarjetas"
          >
            <LayoutGrid size={16} /> Tarjetas
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
              viewMode === 'list' ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
            title="Vista de Lista"
          >
            <List size={16} /> Lista
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-card border border-border/50 rounded-[12px] overflow-hidden shadow-apple-sm">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="border-b border-border/50 text-muted-foreground text-left text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold rounded-tl-[12px]">Huésped</th>
                <th className="px-6 py-4 font-semibold">Contacto</th>
                <th className="px-6 py-4 font-semibold text-center">Reservas</th>
                <th className="px-6 py-4 font-semibold text-right">Inversión Total</th>
                <th className="px-6 py-4 font-semibold text-right rounded-tr-[12px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => {
                const stats = getGuestStats(guest.id);
                return (
                  <tr key={guest.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {guest.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-[15px]">{guest.fullName}</div>
                          <div className="text-xs text-muted-foreground">{guest.documentId || 'Sin doc'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-muted-foreground flex items-center gap-2 mb-1"><Mail size={12}/>{guest.email || '—'}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2"><Phone size={12}/>{guest.phone || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-primary/80 bg-primary/10 px-3 py-1 rounded-full">{stats.count}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-[#34C759]">${stats.totalSpent.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => handleEdit(guest)} className="p-2 text-muted-foreground hover:text-primary transition-colors bg-secondary/30 hover:bg-secondary rounded-lg">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(guest.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors bg-secondary/30 hover:bg-secondary rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredGuests.length === 0 && (
            <div className="text-center py-20 flex flex-col items-center gap-3 grayscale opacity-50">
              <User size={48} className="text-muted-foreground" />
              <div>
                <p className="font-bold text-lg">No se encontraron huéspedes</p>
                <p className="text-sm text-muted-foreground">Prueba con otros términos de búsqueda</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGuests.map((guest) => {
          const stats = getGuestStats(guest.id);
          return (
            <Card key={guest.id} className="group hover:shadow-apple-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary font-bold text-lg">
                      {guest.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-[17px] tracking-tight">{guest.fullName}</div>
                      <div className="text-xs text-muted-foreground">{guest.documentId || 'Sin documento'}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(guest)} 
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(guest.id)} 
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail size={14} />
                    <span className="truncate">{guest.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone size={14} />
                    <span>{guest.phone || '—'}</span>
                  </div>
                </div>

                {/* Booking History List */}
                {stats.count > 0 && (
                  <div className="space-y-2 py-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Últimas estancias</p>
                    <div className="space-y-1.5">
                      {stats.recentBookings.map(b => {
                        const prop = properties.find(p => p.id === b.propertyId);
                        return (
                          <div key={b.id} className="flex items-center justify-between text-[11px] bg-secondary/30 rounded-lg px-2 py-1.5 border border-transparent hover:border-border/50 transition-all">
                            <span className="font-semibold truncate max-w-[120px]">{prop?.name}</span>
                            <span className="text-muted-foreground">
                              {format(parseISO(b.checkIn), 'd MMM', { locale: es })}
                            </span>
                          </div>
                        );
                      })}
                      {stats.count > 3 && (
                        <button 
                          onClick={() => handleEdit(guest)}
                          className="text-[10px] text-primary font-bold hover:underline px-2 block w-full text-left"
                        >
                          Ver todas ({stats.count})...
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-secondary/50 rounded-[10px] p-2.5">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Reservas</div>
                    <div className="text-lg font-bold flex items-center gap-1.5">
                      <Calendar size={16} className="text-primary" />
                      {stats.count}
                    </div>
                  </div>
                  <div className="bg-secondary/50 rounded-[10px] p-2.5">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Total Invertido</div>
                    <div className="text-lg font-bold text-[#34C759]">
                      ${stats.totalSpent.toLocaleString()}
                    </div>
                  </div>
                </div>

                {guest.notes && (
                  <div className="bg-orange-50/50 border border-orange-100 rounded-[10px] p-2.5 flex gap-2">
                    <FileText size={14} className="text-orange-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-700 italic line-clamp-1">{guest.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredGuests.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center gap-3 grayscale opacity-50">
            <User size={48} className="text-muted-foreground" />
            <div>
              <p className="font-bold text-lg">No se encontraron huéspedes</p>
              <p className="text-sm text-muted-foreground">Prueba con otros términos de búsqueda</p>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
}
