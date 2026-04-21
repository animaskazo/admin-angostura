import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lpychtqwfoqzxcewyhla.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxweWNodHF3Zm9xenhjZXd5aGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDIwNzMsImV4cCI6MjA5MTM3ODA3M30.1yHBtl5eX2h4T8smiIrEKcDke-62RVW2IvYl8rXPO_k'

const supabase = createClient(supabaseUrl, supabaseKey)

const newHouses = [
  { id: 'H-11', name: 'Casa de la Colina', type: 'house', category: 'Premium', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&q=80', capacity: 10, bedrooms: 5, bathrooms: 4, rate: 780.00, amenities: ['Piscina infinita','Gym privado','Cine','Smart Home','Sauna'], status: 'available', description: 'Casa premium con vistas panorámicas.' },
  { id: 'H-12', name: 'Casa del Bosque Real', type: 'house', category: 'Premium', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&q=80', capacity: 10, bedrooms: 5, bathrooms: 4, rate: 780.00, amenities: ['Piscina infinita','Gym privado','Cine','Smart Home','Sauna'], status: 'available', description: 'Residencia de gran tamaño en entorno natural.' },
  { id: 'H-13', name: 'Casa del Lago Superior', type: 'house', category: 'Premium', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80', capacity: 10, bedrooms: 5, bathrooms: 4, rate: 780.00, amenities: ['Piscina infinita','Gym privado','Cine','Smart Home','Sauna'], status: 'available', description: 'Vista inmejorable al lago y terminaciones de lujo.' },
  { id: 'H-14', name: 'Casa de Cristal', type: 'house', category: 'Premium', image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=500&q=80', capacity: 10, bedrooms: 5, bathrooms: 4, rate: 780.00, amenities: ['Piscina infinita','Gym privado','Cine','Smart Home','Sauna'], status: 'available', description: 'Diseño moderno con grandes ventanales y mucha luz.' }
]

async function insert() {
  console.log('Iniciando inserción de 4 casas...');
  const { data, error } = await supabase.from('properties').insert(newHouses).select()
  if (error) {
    console.error('❌ Error al insertar casas:', error.message)
    process.exit(1)
  } else {
    console.log('✅ Casas insertadas con éxito en la base de datos.')
    console.log('Detalle:', data.map(d => d.id).join(', '))
    process.exit(0)
  }
}

insert()
