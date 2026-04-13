import { addDays, subDays, format } from 'date-fns';

const today = new Date(2025, 3, 9);

export const properties = [
  { id: 'C-01', name: 'Cabaña Alpine', type: 'cabin', category: 'Lujo', image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=400&q=80', capacity: 4, bedrooms: 2, bathrooms: 1, rate: 180, amenities: ['Chimenea', 'Jacuzzi', 'Vista montaña', 'Cocina completa', 'Terraza'], status: 'occupied', description: 'Cabaña de lujo con vista panorámica a la montaña y chimenea de leña.' },
  { id: 'C-02', name: 'Cabaña del Lago', type: 'cabin', category: 'Waterfront', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', capacity: 6, bedrooms: 3, bathrooms: 2, rate: 220, amenities: ['Vista lago', 'Muelle privado', 'BBQ', 'Kayaks', 'Wi-Fi'], status: 'available', description: 'Cabaña frente al lago con muelle privado y kayaks incluidos.' },
  { id: 'C-03', name: 'Cabaña del Bosque', type: 'cabin', category: 'Ecológica', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', capacity: 2, bedrooms: 1, bathrooms: 1, rate: 120, amenities: ['Rodeada de árboles', 'Bañera exterior', 'Hamacas', 'Wi-Fi'], status: 'cleaning', description: 'Refugio íntimo en medio del bosque nativo. Perfecta para parejas.' },
  { id: 'S-04', name: 'Suite Panorámica', type: 'suite', category: 'Premium', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80', capacity: 2, bedrooms: 1, bathrooms: 1, rate: 280, amenities: ['Jacuzzi', 'Vista 360°', 'Servicio de cuarto', 'Minibar', 'Smart TV'], status: 'maintenance', description: 'Suite de altura con jacuzzi y vistas de 360° al complejo.' },
  { id: 'S-05', name: 'Suite Jardín', type: 'suite', category: 'Estándar', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&q=80', capacity: 2, bedrooms: 1, bathrooms: 1, rate: 160, amenities: ['Jardín privado', 'Terraza', 'Desayuno incluido', 'Smart TV', 'AC'], status: 'confirmed', description: 'Suite con jardín privado y terraza. Tranquilidad garantizada.' },
  { id: 'S-06', name: 'Suite Executive', type: 'suite', category: 'Executive', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', capacity: 3, bedrooms: 1, bathrooms: 2, rate: 320, amenities: ['Sala de estar', 'Kitchenette', 'Bañera hidromasaje', 'Vista piscina', 'Servicio VIP'], status: 'available', description: 'La experiencia más premium de las suites con sala separada.' },
  { id: 'S-07', name: 'Suite Ático', type: 'suite', category: 'Penthouse', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&q=80', capacity: 4, bedrooms: 2, bathrooms: 2, rate: 450, amenities: ['Terraza propia', 'Piscina privada', 'Cocina de diseño', 'Butler service', 'Cine'], status: 'available', description: 'El ático del complejo. Piscina privada y terraza de 80m².' },
  { id: 'H-08', name: 'Casa del Valle', type: 'house', category: 'Villa', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80', capacity: 8, bedrooms: 4, bathrooms: 3, rate: 580, amenities: ['Piscina', 'BBQ', 'Jardín amplio', 'Estacionamiento', 'Cocina de chef'], status: 'occupied', description: 'Gran villa familiar con piscina privada y jardín de 500m².' },
  { id: 'H-09', name: 'Casa Colonial', type: 'house', category: 'Histórica', image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80', capacity: 6, bedrooms: 3, bathrooms: 2, rate: 420, amenities: ['Arquitectura colonial', 'Patio interior', 'Fogón', 'Sala de juegos', 'Wi-Fi'], status: 'available', description: 'Casa de estilo colonial con patio interior y fogón tradicional.' },
  { id: 'H-10', name: 'Casa Moderna', type: 'house', category: 'Contemporánea', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80', capacity: 10, bedrooms: 5, bathrooms: 4, rate: 780, amenities: ['Piscina infinita', 'Gym privado', 'Cine', 'Smart Home', 'Sauna'], status: 'confirmed', description: 'La casa más grande del complejo. Diseño contemporáneo premium.' },
];

export const bookings = [
  { id: 'BK-001', propertyId: 'C-01', guestName: 'Martínez, Familia', guestEmail: 'familia.martinez@gmail.com', guestPhone: '+54 9 11 4567-8901', checkIn: format(today, 'yyyy-MM-dd'), checkOut: format(addDays(today, 5), 'yyyy-MM-dd'), nights: 5, adults: 3, children: 1, status: 'occupied', totalAmount: 900, paidAmount: 900, notes: 'Solicitan cuna para bebé', createdAt: format(subDays(today, 15), 'yyyy-MM-dd') },
  { id: 'BK-002', propertyId: 'S-05', guestName: 'González, Ana', guestEmail: 'ana.gonzalez@mail.com', guestPhone: '+54 9 11 3456-7890', checkIn: format(addDays(today, 2), 'yyyy-MM-dd'), checkOut: format(addDays(today, 6), 'yyyy-MM-dd'), nights: 4, adults: 2, children: 0, status: 'pending', totalAmount: 640, paidAmount: 320, notes: 'Aniversario de bodas', createdAt: format(subDays(today, 8), 'yyyy-MM-dd') },
  { id: 'BK-003', propertyId: 'H-08', guestName: 'Rodríguez, Juan', guestEmail: 'jrodriguez@empresa.com', guestPhone: '+54 9 11 2345-6789', checkIn: format(subDays(today, 2), 'yyyy-MM-dd'), checkOut: format(addDays(today, 8), 'yyyy-MM-dd'), nights: 10, adults: 6, children: 2, status: 'occupied', totalAmount: 5800, paidAmount: 5800, notes: 'Reunión familiar extendida', createdAt: format(subDays(today, 20), 'yyyy-MM-dd') },
  { id: 'BK-004', propertyId: 'H-10', guestName: 'López, Carlos', guestEmail: 'carlos.lopez@corp.com', guestPhone: '+54 9 11 1234-5678', checkIn: format(addDays(today, 5), 'yyyy-MM-dd'), checkOut: format(addDays(today, 12), 'yyyy-MM-dd'), nights: 7, adults: 8, children: 2, status: 'paid_transfer', totalAmount: 5460, paidAmount: 2730, notes: 'Evento corporativo', createdAt: format(subDays(today, 5), 'yyyy-MM-dd') },
  { id: 'BK-005', propertyId: 'C-02', guestName: 'Pérez, Roberto', guestEmail: 'rperez@gmail.com', guestPhone: '+54 9 11 9876-5432', checkIn: format(addDays(today, 8), 'yyyy-MM-dd'), checkOut: format(addDays(today, 11), 'yyyy-MM-dd'), nights: 3, adults: 4, children: 2, status: 'paid_cash', totalAmount: 660, paidAmount: 0, notes: '', createdAt: format(subDays(today, 2), 'yyyy-MM-dd') },
  { id: 'BK-006', propertyId: 'S-04', guestName: 'MANTENIMIENTO', guestEmail: '', guestPhone: '', checkIn: format(subDays(today, 1), 'yyyy-MM-dd'), checkOut: format(addDays(today, 3), 'yyyy-MM-dd'), nights: 4, adults: 0, children: 0, status: 'maintenance', totalAmount: 0, paidAmount: 0, notes: 'Reparación sistema de jacuzzi', createdAt: format(subDays(today, 3), 'yyyy-MM-dd') },
  { id: 'BK-007', propertyId: 'C-03', guestName: 'LIMPIEZA', guestEmail: '', guestPhone: '', checkIn: format(today, 'yyyy-MM-dd'), checkOut: format(addDays(today, 1), 'yyyy-MM-dd'), nights: 1, adults: 0, children: 0, status: 'cleaning', totalAmount: 0, paidAmount: 0, notes: 'Limpieza post check-out', createdAt: format(today, 'yyyy-MM-dd') },
  { id: 'BK-008', propertyId: 'S-06', guestName: 'Torres, Patricia', guestEmail: 'ptorres@mail.com', guestPhone: '+54 9 11 8765-4321', checkIn: format(addDays(today, 14), 'yyyy-MM-dd'), checkOut: format(addDays(today, 18), 'yyyy-MM-dd'), nights: 4, adults: 2, children: 1, status: 'pending', totalAmount: 1280, paidAmount: 640, notes: '', createdAt: format(subDays(today, 1), 'yyyy-MM-dd') },
];

export const stats = {
  occupancyRate: 63,
  monthlyRevenue: 14280,
  activeBookings: 4,
  availableUnits: 4,
  checkInsToday: 1,
  checkOutsToday: 0,
  maintenanceUnits: 1,
};

export const statusConfig = {
  occupied:      { label: 'Ocupado',       color: '#34C759', bg: '#E8F8ED' },
  pending:       { label: 'Pago Pendiente',color: '#007AFF', bg: '#E1EFFF' },
  paid_cash:     { label: 'Pagado Efectivo',color: '#34C759', bg: '#E8F8ED' },
  paid_transfer: { label: 'Pagado Transf.',color: '#34C759', bg: '#E8F8ED' },
  maintenance:   { label: 'Mantenimiento', color: '#FF3B30', bg: '#FFECEA' },
  cleaning:      { label: 'Limpieza',      color: '#FF9500', bg: '#FFF3E0' },
  available:     { label: 'Disponible',    color: '#34C759', bg: '#E8F8ED' },
  cancelled:     { label: 'Cancelado',     color: '#8E8E93', bg: '#F2F2F7' },
};
