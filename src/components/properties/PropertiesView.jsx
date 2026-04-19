import { useState } from 'react';
import { Users, BedDouble, Bath, DollarSign, Edit2, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { cn, formatCurrency } from '@/lib/utils';

const TYPE_FILTERS = [
  { id: 'cabin', label: 'Cabañas' },
  { id: 'suite', label: 'Suites' },
  { id: 'house', label: 'Casas' },
  { id: 'others', label: 'Otros' },
];

function PropertyCard({ property, onBook, onEdit }) {
  return (
    <Card
      className="overflow-hidden hover:shadow-apple-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
      onClick={() => onEdit(property)}
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <StatusBadge 
            status={property.status} 
            size="sm" 
            className="shadow-apple-sm border border-black/10 backdrop-blur-md" 
          />
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(property); }}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shadow-sm"
          >
            <Edit2 size={14} />
          </button>
        </div>
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-0.5">
          {formatCurrency(property.rate)}/noche
        </div>
      </div>

      <CardContent className="p-5 flex flex-col gap-3">
        <div>
          <div className="text-[17px] font-bold tracking-tight">{property.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{property.id}</div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{property.description}</p>

        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users size={13} />{property.capacity} huéspedes
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BedDouble size={13} />{property.bedrooms} habs.
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Bath size={13} />{property.bathrooms} baños
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {property.amenities.slice(0, 3).map(a => (
            <span key={a} className="px-2 py-0.5 bg-secondary rounded-full text-xs text-muted-foreground">{a}</span>
          ))}
          {property.amenities.length > 3 && (
            <span className="px-2 py-0.5 bg-accent text-primary rounded-full text-xs font-medium">
              +{property.amenities.length - 3}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <Button onClick={(e) => { e.stopPropagation(); onBook(property); }} className="w-full">Reservar</Button>
          <Button variant="secondary" onClick={(e) => { e.stopPropagation(); onEdit(property); }} className="w-full">Ver detalles</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PropertiesView() {
  const [activeFilter, setActiveFilter] = useState('cabin');
  const setNewBookingModalOpen = useStore(s => s.setNewBookingModalOpen);
  const setPreselectedPropertyId = useStore(s => s.setPreselectedPropertyId);
  const setPropertyModalOpen = useStore(s => s.setPropertyModalOpen);
  const setSelectedProperty = useStore(s => s.setSelectedProperty);
  const properties = useStore(s => s.properties);

  const filtered = properties.filter(p => p.type === activeFilter);
  const available = properties.filter(p => p.status === 'available').length;

  const handleEdit = (property) => {
    setSelectedProperty(property);
    setPropertyModalOpen(true);
  };

  return (
    <div className="p-10 max-w-[1400px] flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight">Propiedades</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {properties.length} propiedades · {available} disponibles
          </p>
        </div>
        <Button onClick={() => setPropertyModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Nueva propiedad
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {TYPE_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150',
              activeFilter === f.id
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
        {filtered.map(property => (
          <PropertyCard
            key={property.id}
            property={property}
            onBook={(p) => {
              setPreselectedPropertyId(p.id);
              setNewBookingModalOpen(true);
            }}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
}
