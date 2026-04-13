import { createClient } from '@supabase/supabase-js';
import { addDays, format } from 'date-fns';

const SUPABASE_URL = 'https://lpychtqwfoqzxcewyhla.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxweWNodHF3Zm9xenhjZXd5aGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDIwNzMsImV4cCI6MjA5MTM3ODA3M30.1yHBtl5eX2h4T8smiIrEKcDke-62RVW2IvYl8rXPO_k';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const today = new Date();

const properties = [
  { id: 'C-01', name: 'Cabaña Alpine',     type: 'cabin', category: 'Lujo',            image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=500&q=80', capacity: 4,  bedrooms: 2, bathrooms: 1, rate: 180, amenities: ['Chimenea','Jacuzzi','Vista montaña','Cocina completa','Terraza'], status: 'occupied',     description: 'Cabaña de lujo con vista panorámica a la montaña y chimenea de leña.' },
  { id: 'C-02', name: 'Cabaña del Lago',   type: 'cabin', category: 'Waterfront',      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80', capacity: 6,  bedrooms: 3, bathrooms: 2, rate: 220, amenities: ['Vista lago','Muelle privado','BBQ','Kayaks','Wi-Fi'],            status: 'available',    description: 'Cabaña frente al lago con muelle privado y kayaks incluidos.' },
  { id: 'C-03', name: 'Cabaña del Bosque', type: 'cabin', category: 'Ecológica',       image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80', capacity: 2,  bedrooms: 1, bathrooms: 1, rate: 120, amenities: ['Rodeada de árboles','Bañera exterior','Hamacas','Wi-Fi'],        status: 'cleaning',     description: 'Refugio íntimo en medio del bosque nativo. Perfecta para parejas.' },
  { id: 'S-04', name: 'Suite Panorámica',  type: 'suite', category: 'Premium',         image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=80', capacity: 2,  bedrooms: 1, bathrooms: 1, rate: 280, amenities: ['Jacuzzi','Vista 360°','Servicio de cuarto','Minibar','Smart TV'], status: 'maintenance',  description: 'Suite de altura con jacuzzi y vistas de 360° al complejo.' },
  { id: 'S-05', name: 'Suite Jardín',      type: 'suite', category: 'Estándar',        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&q=80', capacity: 2,  bedrooms: 1, bathrooms: 1, rate: 160, amenities: ['Jardín privado','Terraza','Desayuno incluido','Smart TV','AC'],   status: 'confirmed',    description: 'Suite con jardín privado y terraza. Tranquilidad garantizada.' },
  { id: 'S-06', name: 'Suite Executive',   type: 'suite', category: 'Executive',       image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80', capacity: 3,  bedrooms: 1, bathrooms: 2, rate: 320, amenities: ['Sala de estar','Kitchenette','Bañera hidromasaje','Vista piscina','VIP'], status: 'available', description: 'La experiencia más premium de las suites con sala separada.' },
  { id: 'S-07', name: 'Suite Ático',       type: 'suite', category: 'Penthouse',       image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&q=80', capacity: 4,  bedrooms: 2, bathrooms: 2, rate: 450, amenities: ['Terraza propia','Piscina privada','Cocina de diseño','Butler','Cine'], status: 'available', description: 'El ático del complejo. Piscina privada y terraza de 80m².' },
  { id: 'H-08', name: 'Casa del Valle',    type: 'house', category: 'Villa',           image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&q=80', capacity: 8,  bedrooms: 4, bathrooms: 3, rate: 580, amenities: ['Piscina','BBQ','Jardín','Estacionamiento','Cocina de chef'],       status: 'occupied',     description: 'Gran villa familiar con piscina privada y jardín de 500m².' },
  { id: 'H-09', name: 'Casa Colonial',     type: 'house', category: 'Histórica',       image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&q=80', capacity: 6,  bedrooms: 3, bathrooms: 2, rate: 420, amenities: ['Arquitectura colonial','Patio interior','Fogón','Sala de juegos','Wi-Fi'], status: 'available', description: 'Casa de estilo colonial con patio interior y fogón tradicional.' },
  { id: 'H-10', name: 'Casa Moderna',      type: 'house', category: 'Contemporánea',   image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=80', capacity: 10, bedrooms: 5, bathrooms: 4, rate: 780, amenities: ['Piscina infinita','Gym privado','Cine','Smart Home','Sauna'],     status: 'confirmed',    description: 'La casa más grande del complejo. Diseño contemporáneo premium.' },
];

const d = (n) => format(addDays(today, n), 'yyyy-MM-dd');

const bookings = [
  { id: 'BK-001', property_id: 'C-01', guest_name: 'Martínez, Familia', guest_email: 'familia.martinez@gmail.com',  guest_phone: '+54 9 11 4567-8901', check_in: d(0),   check_out: d(5),   nights: 5,  adults: 3, children: 1, status: 'occupied',     total_amount: 900,   paid_amount: 900,  notes: 'Solicitan cuna para bebé' },
  { id: 'BK-002', property_id: 'S-05', guest_name: 'González, Ana',     guest_email: 'ana.gonzalez@mail.com',       guest_phone: '+54 9 11 3456-7890', check_in: d(2),   check_out: d(6),   nights: 4,  adults: 2, children: 0, status: 'confirmed',    total_amount: 640,   paid_amount: 320,  notes: 'Aniversario de bodas' },
  { id: 'BK-003', property_id: 'H-08', guest_name: 'Rodríguez, Juan',   guest_email: 'jrodriguez@empresa.com',      guest_phone: '+54 9 11 2345-6789', check_in: d(-2),  check_out: d(8),   nights: 10, adults: 6, children: 2, status: 'occupied',     total_amount: 5800,  paid_amount: 5800, notes: 'Reunión familiar extendida' },
  { id: 'BK-004', property_id: 'H-10', guest_name: 'López, Carlos',     guest_email: 'carlos.lopez@corp.com',       guest_phone: '+54 9 11 1234-5678', check_in: d(5),   check_out: d(12),  nights: 7,  adults: 8, children: 2, status: 'confirmed',    total_amount: 5460,  paid_amount: 2730, notes: 'Evento corporativo' },
  { id: 'BK-005', property_id: 'C-02', guest_name: 'Pérez, Roberto',    guest_email: 'rperez@gmail.com',            guest_phone: '+54 9 11 9876-5432', check_in: d(8),   check_out: d(11),  nights: 3,  adults: 4, children: 2, status: 'confirmed',    total_amount: 660,   paid_amount: 0,    notes: '' },
  { id: 'BK-006', property_id: 'S-04', guest_name: 'MANTENIMIENTO',     guest_email: '',                            guest_phone: '',                   check_in: d(-1),  check_out: d(3),   nights: 4,  adults: 0, children: 0, status: 'maintenance',  total_amount: 0,     paid_amount: 0,    notes: 'Reparación sistema de jacuzzi' },
  { id: 'BK-007', property_id: 'C-03', guest_name: 'LIMPIEZA',          guest_email: '',                            guest_phone: '',                   check_in: d(0),   check_out: d(1),   nights: 1,  adults: 0, children: 0, status: 'cleaning',     total_amount: 0,     paid_amount: 0,    notes: 'Limpieza post check-out' },
  { id: 'BK-008', property_id: 'S-06', guest_name: 'Torres, Patricia',  guest_email: 'ptorres@mail.com',            guest_phone: '+54 9 11 8765-4321', check_in: d(14),  check_out: d(18),  nights: 4,  adults: 2, children: 1, status: 'confirmed',    total_amount: 1280,  paid_amount: 640,  notes: '' },
  { id: 'BK-009', property_id: 'H-09', guest_name: 'Sánchez, Miguel',   guest_email: 'msanchez@hotmail.com',        guest_phone: '+54 9 11 7654-3210', check_in: d(20),  check_out: d(25),  nights: 5,  adults: 2, children: 0, status: 'confirmed',    total_amount: 2100,  paid_amount: 0,    notes: 'Luna de miel' },
  { id: 'BK-010', property_id: 'S-07', guest_name: 'Fernández, Laura',  guest_email: 'lfernandez@gmail.com',        guest_phone: '+54 9 11 6543-2109', check_in: d(3),   check_out: d(7),   nights: 4,  adults: 3, children: 1, status: 'confirmed',    total_amount: 1800,  paid_amount: 900,  notes: 'Cumpleaños especial' },
  { id: 'BK-011', property_id: 'C-01', guest_name: 'Ortega, Diego',     guest_email: 'diego.ortega@work.com',       guest_phone: '+54 9 11 5432-1098', check_in: d(10),  check_out: d(14),  nights: 4,  adults: 2, children: 0, status: 'confirmed',    total_amount: 720,   paid_amount: 360,  notes: '' },
  { id: 'BK-012', property_id: 'H-08', guest_name: 'Vargas, Claudia',   guest_email: 'claudia.vargas@mail.com',     guest_phone: '+54 9 11 4321-0987', check_in: d(18),  check_out: d(24),  nights: 6,  adults: 4, children: 3, status: 'confirmed',    total_amount: 3480,  paid_amount: 0,    notes: 'Reunión de familia ampliada' },
];

async function seed() {
  console.log('🌱 Iniciando seed de Supabase...\n');

  // 1. Limpiar
  console.log('🗑️  Limpiando datos anteriores...');
  const { error: delBookings } = await supabase.from('bookings').delete().neq('id', '');
  const { error: delProps }    = await supabase.from('properties').delete().neq('id', '');
  if (delBookings) console.warn('  ⚠️  bookings:', delBookings.message);
  if (delProps)    console.warn('  ⚠️  properties:', delProps.message);

  // 2. Insertar propiedades
  console.log('🏠 Insertando propiedades...');
  const { data: propsData, error: propsError } = await supabase
    .from('properties')
    .insert(properties)
    .select();

  if (propsError) {
    console.error('❌ Error en properties:', propsError.message);
    process.exit(1);
  }
  console.log(`  ✓ ${propsData.length} propiedades insertadas`);

  // 3. Insertar reservas
  console.log('📅 Insertando reservas...');
  const { data: booksData, error: booksError } = await supabase
    .from('bookings')
    .insert(bookings)
    .select();

  if (booksError) {
    console.error('❌ Error en bookings:', booksError.message);
    process.exit(1);
  }
  console.log(`  ✓ ${booksData.length} reservas insertadas`);

  console.log('\n✅ Seed completado exitosamente!');
}

seed().catch(console.error);
