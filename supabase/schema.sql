-- ============================================================
-- COMPLEJO ADMIN — Schema + Seed Data
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Propiedades ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS properties (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('cabin','suite','house')),
  category     TEXT NOT NULL,
  image        TEXT,
  capacity     INT NOT NULL DEFAULT 2,
  bedrooms     INT NOT NULL DEFAULT 1,
  bathrooms    INT NOT NULL DEFAULT 1,
  rate         NUMERIC(10,2) NOT NULL,
  amenities    TEXT[] DEFAULT '{}',
  status       TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','occupied','confirmed','maintenance','cleaning')),
  description  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Reservas ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id            TEXT PRIMARY KEY,
  property_id   TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  guest_name    TEXT NOT NULL,
  guest_email   TEXT,
  guest_phone   TEXT,
  check_in      DATE NOT NULL,
  check_out     DATE NOT NULL,
  nights        INT NOT NULL,
  adults        INT NOT NULL DEFAULT 1,
  children      INT NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','occupied','maintenance','cleaning','pending','cancelled')),
  total_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
  paid_amount   NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes         TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RLS: desactivado para demo ───────────────────────────────
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings   DISABLE ROW LEVEL SECURITY;

-- ─── Limpiar data anterior ────────────────────────────────────
TRUNCATE bookings, properties RESTART IDENTITY CASCADE;

-- ─── Seed: Propiedades ────────────────────────────────────────
INSERT INTO properties (id, name, type, category, image, capacity, bedrooms, bathrooms, rate, amenities, status, description) VALUES

-- CABAÑAS
('C-01', 'Cabaña Alpine',      'cabin', 'Lujo',       'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=500&q=80', 4, 2, 1, 180.00, ARRAY['Chimenea','Jacuzzi','Vista montaña','Cocina completa','Terraza'], 'occupied',  'Cabaña de lujo con vista panorámica a la montaña y chimenea de leña.'),
('C-02', 'Cabaña del Lago',    'cabin', 'Waterfront', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80', 6, 3, 2, 220.00, ARRAY['Vista lago','Muelle privado','BBQ','Kayaks','Wi-Fi'],            'available', 'Cabaña frente al lago con muelle privado y kayaks incluidos.'),
('C-03', 'Cabaña del Bosque',  'cabin', 'Ecológica',  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80', 2, 1, 1, 120.00, ARRAY['Rodeada de árboles','Bañera exterior','Hamacas','Wi-Fi'],        'cleaning',  'Refugio íntimo en medio del bosque nativo. Perfecta para parejas.'),

-- SUITES
('S-04', 'Suite Panorámica',  'suite', 'Premium',   'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=80', 2, 1, 1, 280.00, ARRAY['Jacuzzi','Vista 360°','Servicio de cuarto','Minibar','Smart TV'],        'maintenance', 'Suite de altura con jacuzzi y vistas de 360° al complejo.'),
('S-05', 'Suite Jardín',       'suite', 'Estándar',  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&q=80', 2, 1, 1, 160.00, ARRAY['Jardín privado','Terraza','Desayuno incluido','Smart TV','AC'],           'confirmed',   'Suite con jardín privado y terraza. Tranquilidad garantizada.'),
('S-06', 'Suite Executive',    'suite', 'Executive', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80', 3, 1, 2, 320.00, ARRAY['Sala de estar','Kitchenette','Bañera hidromasaje','Vista piscina','VIP'],  'available',   'La experiencia más premium de las suites con sala separada.'),
('S-07', 'Suite Ático',        'suite', 'Penthouse', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&q=80', 4, 2, 2, 450.00, ARRAY['Terraza propia','Piscina privada','Cocina de diseño','Butler','Cine'],    'available',   'El ático del complejo. Piscina privada y terraza de 80m².'),

-- CASAS
('H-08', 'Casa del Valle',    'house', 'Villa',           'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&q=80', 8,  4, 3, 580.00, ARRAY['Piscina','BBQ','Jardín','Estacionamiento','Cocina de chef'],       'occupied',  'Gran villa familiar con piscina privada y jardín de 500m².'),
('H-09', 'Casa Colonial',     'house', 'Histórica',       'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&q=80', 6,  3, 2, 420.00, ARRAY['Arquitectura colonial','Patio interior','Fogón','Sala de juegos','Wi-Fi'], 'available', 'Casa de estilo colonial con patio interior y fogón tradicional.'),
('H-10', 'Casa Moderna',      'house', 'Contemporánea',   'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=80', 10, 5, 4, 780.00, ARRAY['Piscina infinita','Gym privado','Cine','Smart Home','Sauna'],     'confirmed', 'La casa más grande del complejo. Diseño contemporáneo premium.');

-- ─── Seed: Reservas ───────────────────────────────────────────
INSERT INTO bookings (id, property_id, guest_name, guest_email, guest_phone, check_in, check_out, nights, adults, children, status, total_amount, paid_amount, notes) VALUES

('BK-001', 'C-01', 'Martínez, Familia',  'familia.martinez@gmail.com',  '+54 9 11 4567-8901', CURRENT_DATE,       CURRENT_DATE + 5,  5,  3, 1, 'occupied',     900.00,  900.00,  'Solicitan cuna para bebé'),
('BK-002', 'S-05', 'González, Ana',      'ana.gonzalez@mail.com',       '+54 9 11 3456-7890', CURRENT_DATE + 2,   CURRENT_DATE + 6,  4,  2, 0, 'confirmed',    640.00,  320.00,  'Aniversario de bodas'),
('BK-003', 'H-08', 'Rodríguez, Juan',    'jrodriguez@empresa.com',      '+54 9 11 2345-6789', CURRENT_DATE - 2,   CURRENT_DATE + 8,  10, 6, 2, 'occupied',    5800.00, 5800.00, 'Reunión familiar extendida'),
('BK-004', 'H-10', 'López, Carlos',      'carlos.lopez@corp.com',       '+54 9 11 1234-5678', CURRENT_DATE + 5,   CURRENT_DATE + 12, 7,  8, 2, 'confirmed',   5460.00, 2730.00, 'Evento corporativo - Wi-Fi premium'),
('BK-005', 'C-02', 'Pérez, Roberto',     'rperez@gmail.com',            '+54 9 11 9876-5432', CURRENT_DATE + 8,   CURRENT_DATE + 11, 3,  4, 2, 'confirmed',    660.00,    0.00,  ''),
('BK-006', 'S-04', 'MANTENIMIENTO',      '',                            '',                   CURRENT_DATE - 1,   CURRENT_DATE + 3,  4,  0, 0, 'maintenance',    0.00,    0.00,  'Reparación sistema de jacuzzi'),
('BK-007', 'C-03', 'LIMPIEZA',           '',                            '',                   CURRENT_DATE,       CURRENT_DATE + 1,  1,  0, 0, 'cleaning',       0.00,    0.00,  'Limpieza post check-out'),
('BK-008', 'S-06', 'Torres, Patricia',   'ptorres@mail.com',            '+54 9 11 8765-4321', CURRENT_DATE + 14,  CURRENT_DATE + 18, 4,  2, 1, 'confirmed',   1280.00,  640.00,  ''),
('BK-009', 'H-09', 'Sánchez, Miguel',    'msanchez@hotmail.com',        '+54 9 11 7654-3210', CURRENT_DATE + 20,  CURRENT_DATE + 25, 5,  2, 0, 'confirmed',   2100.00,    0.00,  'Luna de miel'),
('BK-010', 'S-07', 'Fernández, Laura',   'lfernandez@gmail.com',        '+54 9 11 6543-2109', CURRENT_DATE + 3,   CURRENT_DATE + 7,  4,  3, 1, 'confirmed',   1800.00,  900.00,  'Cumpleaños especial'),
('BK-011', 'C-01', 'Ortega, Diego',      'diego.ortega@work.com',       '+54 9 11 5432-1098', CURRENT_DATE + 10,  CURRENT_DATE + 14, 4,  2, 0, 'confirmed',    720.00,  360.00,  ''),
('BK-012', 'H-08', 'Vargas, Claudia',    'claudia.vargas@mail.com',     '+54 9 11 4321-0987', CURRENT_DATE + 18,  CURRENT_DATE + 24, 6,  4, 3, 'confirmed',   3480.00,    0.00,  'Reunión de familia ampliada');
