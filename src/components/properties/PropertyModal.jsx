import { useState, useEffect } from 'react';
import { X, Building2, Layout, Image as ImageIcon, Users, BedDouble, Bath, DollarSign, Tag, FileText, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

const DEFAULT_FORM = {
  id: '',
  name: '',
  type: 'cabin',
  category: '',
  image: '',
  capacity: 2,
  bedrooms: 1,
  bathrooms: 1,
  rate: 100,
  amenities: [],
  status: 'available',
  description: '',
};

const PROPERTY_TYPES = [
  { id: 'cabin', label: 'Cabaña', icon: '🏕️' },
  { id: 'suite', label: 'Suite', icon: '🛏️' },
  { id: 'house', label: 'Casa', icon: '🏡' },
  { id: 'others', label: 'Otros', icon: '🏷️' },
];

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

export function PropertyModal() {
  const isOpen = useStore(s => s.isPropertyModalOpen);
  const setOpen = useStore(s => s.setPropertyModalOpen);
  const selectedProperty = useStore(s => s.selectedProperty);
  const setSelectedProperty = useStore(s => s.setSelectedProperty);
  const properties = useStore(s => s.properties);
  const addProperty = useStore(s => s.addProperty);
  const updateProperty = useStore(s => s.updateProperty);

  const [form, setForm] = useState(DEFAULT_FORM);
  const [newAmenity, setNewAmenity] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isEditing = !!selectedProperty;

  useEffect(() => {
    if (selectedProperty) {
      setForm(selectedProperty);
    } else {
      // Suggest next ID when creating new
      const nextId = suggestNextId('cabin');
      setForm({ ...DEFAULT_FORM, id: nextId });
    }
  }, [selectedProperty, isOpen]);

  function suggestNextId(type) {
    const prefix = 
      type === 'cabin' ? 'C-' : 
      type === 'suite' ? 'S-' : 
      type === 'house' ? 'H-' : 
      'O-';
    const typeProps = properties.filter(p => p.id.startsWith(prefix));
    const maxNum = typeProps.reduce((max, p) => {
      const num = parseInt(p.id.split('-')[1]);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    return `${prefix}${String(maxNum + 1).padStart(2, '0')}`;
  }

  const update = (key, val) => {
    setForm(f => {
      const newForm = { ...f, [key]: val };
      // If type changed and it's a new property, suggest a new ID
      if (!isEditing && key === 'type') {
        newForm.id = suggestNextId(val);
      }
      return newForm;
    });
  };

  const addAmenity = () => {
    if (!newAmenity.trim()) return;
    if (form.amenities.includes(newAmenity.trim())) {
      setNewAmenity('');
      return;
    }
    update('amenities', [...form.amenities, newAmenity.trim()]);
    setNewAmenity('');
  };

  const removeAmenity = (index) => {
    update('amenities', form.amenities.filter((_, i) => i !== index));
  };

  function handleOpenChange(open) {
    if (!open) {
      setTimeout(() => {
        setForm(DEFAULT_FORM);
        setSelectedProperty(null);
        setSubmitted(false);
        setSaving(false);
      }, 200);
    }
    setOpen(open);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.id || !form.name) return;

    setSaving(true);
    let result;
    if (isEditing) {
      result = await updateProperty(form.id, form);
    } else {
      result = await addProperty(form);
    }
    setSaving(false);

    if (result?.success) {
      setSubmitted(true);
      setTimeout(() => {
        handleOpenChange(false);
      }, 1600);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <div>
            <DialogTitle>{isEditing ? 'Editar Propiedad' : 'Nueva Propiedad'}</DialogTitle>
            <DialogDescription>
              {isEditing ? `Modifica los detalles de ${form.id}` : 'Completa los datos para dar de alta una nueva unidad'}
            </DialogDescription>
          </div>
          <button
            onClick={() => handleOpenChange(false)}
            className="w-8 h-8 flex items-center justify-center bg-secondary border border-border rounded-[8px] text-muted-foreground hover:bg-[#FFECEA] hover:border-[#FF3B30] hover:text-[#FF3B30] transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-16 px-8 text-center animate-scale-in">
            <div className="w-14 h-14 rounded-full bg-[#E8F8ED] text-[#34C759] flex items-center justify-center text-2xl font-bold">✓</div>
            <div className="text-xl font-bold">Propiedad {isEditing ? 'actualizada' : 'registrada'}</div>
            <p className="text-sm text-muted-foreground">La propiedad {form.name} se ha guardado correctamente.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            {/* Identificación */}
            <div className="px-6 py-5 border-b border-border flex flex-col gap-4">
              <SectionHeader icon={Building2}>Identificación</SectionHeader>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="ID de unidad *">
                  <Input
                    placeholder="Ej: C-01"
                    value={form.id}
                    onChange={e => update('id', e.target.value.toUpperCase())}
                    disabled={isEditing}
                    required
                  />
                </FormField>
                <FormField label="Nombre *">
                  <Input
                    className="col-span-2"
                    placeholder="Ej: Cabaña Alpine"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    required
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Tipo">
                  <select
                    value={form.type}
                    onChange={e => update('type', e.target.value)}
                    className="flex h-9 w-full rounded-[8px] border border-border bg-secondary px-3 text-sm text-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/15 appearance-none cursor-pointer"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23aeaeb2' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                  >
                    {PROPERTY_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Estado">
                  <select
                    value={form.status}
                    onChange={e => update('status', e.target.value)}
                    className="flex h-9 w-full rounded-[8px] border border-border bg-secondary px-3 text-sm text-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/15 appearance-none cursor-pointer"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23aeaeb2' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                  >
                    <option value="available">Disponible</option>
                    <option value="occupied">Ocupada</option>
                    <option value="cleaning">Limpieza</option>
                    <option value="maintenance">Mantenimiento</option>
                  </select>
                </FormField>
              </div>
            </div>

            {/* Multimedia */}
            <div className="px-6 py-5 border-b border-border flex flex-col gap-4">
              <SectionHeader icon={ImageIcon}>Media</SectionHeader>
              <FormField label="URL de imagen">
                <div className="flex gap-3">
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={form.image}
                    onChange={e => update('image', e.target.value)}
                  />
                  {form.image && (
                    <div className="w-9 h-9 border border-border rounded-[8px] overflow-hidden shrink-0">
                      <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </FormField>
            </div>

            {/* Características */}
            <div className="px-6 py-5 border-b border-border flex flex-col gap-4">
              <SectionHeader icon={Layout}>Características</SectionHeader>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Huéspedes">
                  <div className="relative">
                    <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="number" className="pl-9" min={1} value={form.capacity} onChange={e => update('capacity', parseInt(e.target.value))} />
                  </div>
                </FormField>
                <FormField label="Habitaciones">
                  <div className="relative">
                    <BedDouble size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="number" className="pl-9" min={1} value={form.bedrooms} onChange={e => update('bedrooms', parseInt(e.target.value))} />
                  </div>
                </FormField>
                <FormField label="Baños">
                  <div className="relative">
                    <Bath size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="number" className="pl-9" min={1} value={form.bathrooms} onChange={e => update('bathrooms', parseInt(e.target.value))} />
                  </div>
                </FormField>
              </div>
              <FormField label="Tarifa por noche (CLP)">
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input type="number" className="pl-9 font-semibold" min={0} value={form.rate} onChange={e => update('rate', parseInt(e.target.value))} />
                </div>
              </FormField>
            </div>

            {/* Amenidades */}
            <div className="px-6 py-5 border-b border-border flex flex-col gap-4">
              <SectionHeader icon={Tag}>Amenidades</SectionHeader>
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: Wi-Fi, Piscina, Parrilla..."
                  value={newAmenity}
                  onChange={e => setNewAmenity(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                />
                <Button type="button" variant="secondary" onClick={addAmenity}>Agregar</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.amenities.map((a, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-secondary border border-border rounded-full text-xs font-medium">
                    {a}
                    <button type="button" onClick={() => removeAmenity(i)} className="text-muted-foreground hover:text-[#FF3B30] transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {form.amenities.length === 0 && <span className="text-xs text-muted-foreground italic">Sin amenidades registradas</span>}
              </div>
            </div>

            {/* Descripción */}
            <div className="px-6 py-5 border-b border-border flex flex-col gap-4">
              <SectionHeader icon={FileText}>Descripción</SectionHeader>
              <Textarea
                rows={3}
                placeholder="Describe los puntos fuertes de esta propiedad..."
                value={form.description}
                onChange={e => update('description', e.target.value)}
              />
            </div>

            {/* Acciones */}
            <div className="flex justify-between items-center px-6 py-5">
              <div className="flex items-center gap-2">
                {isEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-[#FF3B30] hover:bg-[#FFECEA] hover:text-[#FF3B30]"
                    onClick={() => {
                        if (confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) {
                          useStore.getState().deleteProperty(form.id);
                          handleOpenChange(false);
                        }
                    }}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)} disabled={saving}>Cancelar</Button>
                <Button type="submit" disabled={!form.id || !form.name || saving}>
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      {isEditing ? 'Guardando...' : 'Creando...'}
                    </>
                  ) : (
                    isEditing ? 'Guardar Cambios' : 'Crear Propiedad'
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
