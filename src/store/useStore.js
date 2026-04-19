import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convierte el snake_case de Postgres a camelCase para el frontend */
function mapProperty(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type || 'others',
    category: '',
    image: row.image,
    capacity: row.capacity,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    rate: row.rate,
    amenities: row.amenities ?? [],
    status: row.status,
    description: row.description ?? '',
  };
}

function mapBooking(row) {
  return {
    id: row.id,
    propertyId: row.property_id,
    guestId: row.guest_id, // Nuevo campo para relación 1:N
    guestName: row.guest_name,
    guestEmail: row.guest_email ?? '',
    guestPhone: row.guest_phone ?? '',
    checkIn: row.check_in,
    checkOut: row.check_out,
    nights: row.nights,
    adults: row.adults ?? 1,
    children: row.children ?? 0,
    status: row.status,
    pricePerNight: row.price_per_night ?? 0,
    totalAmount: row.total_amount ?? 0,
    paidAmount: row.paid_amount ?? 0,
    receiptUrl: row.receipt_url ?? '',
    notes: row.notes ?? '',
    createdAt: row.created_at?.slice(0, 10) ?? '',
  };
}

function mapGuest(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email ?? '',
    phone: row.phone ?? '',
    documentId: row.document_id ?? '',
    notes: row.notes ?? '',
    createdAt: row.created_at?.slice(0, 10) ?? '',
  };
}

// ─── ID Generators ──────────────────────────────────────────────────────────

function getNextBookingId(bookings) {
  const nums = bookings
    .map(b => parseInt(b.id.replace('BK-', '')))
    .filter(n => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `BK-${(max + 1).toString().padStart(3, '0')}`;
}

function getNextPropertyId(properties, type) {
  const prefix = 
    type === 'cabin' ? 'C-' : 
    type === 'suite' ? 'S-' : 
    type === 'house' ? 'H-' : 
    'O-';
  const nums = properties
    .filter(p => p.id.startsWith(prefix))
    .map(p => parseInt(p.id.replace(prefix, '')))
    .filter(n => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `${prefix}${(max + 1).toString().padStart(2, '0')}`;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useStore = create((set, get) => ({
  // ── Authentication ──────────────────────────────────────────────────────
  session: null,
  user: null,
  setSession: (session) => set({ session, user: session?.user ?? null }),

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },

  // ── Data State ──────────────────────────────────────────────────────────
  properties: [],
  bookings: [],
  guests: [],
  settings: { bank_details: '', booking_conditions: '' },
  loading: false,
  error: null,

  // ── Loaders ─────────────────────────────────────────────────────────────

  fetchProperties: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('id');
    if (error) {
      set({ loading: false, error: error.message });
    } else {
      set({ properties: data.map(mapProperty), loading: false });
    }
  },

  fetchBookings: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      set({ loading: false, error: error.message });
    } else {
      set({ bookings: data.map(mapBooking), loading: false });
    }
  },

  fetchGuests: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .order('full_name');
    if (error) {
      set({ loading: false, error: error.message });
    } else {
      set({ guests: data.map(mapGuest), loading: false });
    }
  },

  /** Carga properties, bookings, guests y settings en paralelo */
  fetchAll: async () => {
    set({ loading: true, error: null });
    const [propsResult, bookingsResult, guestsResult, settingsResult] = await Promise.all([
      supabase.from('properties').select('*').order('id'),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('guests').select('*').order('full_name'),
      supabase.from('settings').select('value').eq('id', 'general').single(),
    ]);

    if (propsResult.error || bookingsResult.error || guestsResult.error) {
      set({
        loading: false,
        error: propsResult.error?.message ?? bookingsResult.error?.message ?? guestsResult.error?.message,
      });
    } else {
      set({
        properties: propsResult.data.map(mapProperty),
        bookings: bookingsResult.data.map(mapBooking),
        guests: guestsResult.data.map(mapGuest),
        settings: settingsResult.data?.value || { bank_details: '', booking_conditions: '' },
        loading: false,
      });
    }
  },

  // ── Bookings CRUD ────────────────────────────────────────────────────────

  addBooking: async (booking, options = { skipEmail: false }) => {
    const nextId = getNextBookingId(get().bookings);
    const payload = {
      id: nextId,
      property_id: booking.propertyId,
      guest_id: booking.guestId || null,
      guest_name: booking.guestName,
      guest_email: booking.guestEmail || null,
      guest_phone: booking.guestPhone || null,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      nights: booking.nights,
      adults: booking.adults,
      children: booking.children,
      status: booking.status ?? 'pending',
      price_per_night: booking.pricePerNight ?? 0,
      total_amount: booking.totalAmount ?? 0,
      paid_amount: booking.paidAmount ?? 0,
      receipt_url: booking.receiptUrl || null,
      notes: booking.notes || null,
    };
    const { data, error } = await supabase
      .from('bookings')
      .insert(payload)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
    set((state) => ({ bookings: [mapBooking(data), ...state.bookings] }));

    // Enviar correo de confirmación solo si no se solicita omitirlo
    let emailResult = { success: false };
    if (!options.skipEmail) {
      const prop = get().properties.find(p => p.id === booking.propertyId);
      emailResult = await get().sendBookingEmail(payload, prop, 'confirmed');
    }

    return { success: true, emailSent: emailResult?.success, emailTo: booking.guestEmail };
  },

  updateBooking: async (id, updates) => {
    // Mapea keys camelCase → snake_case
    const payload = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.guestName !== undefined) payload.guest_name = updates.guestName;
    if (updates.guestEmail !== undefined) payload.guest_email = updates.guestEmail;
    if (updates.guestPhone !== undefined) payload.guest_phone = updates.guestPhone;
    if (updates.checkIn !== undefined) payload.check_in = updates.checkIn;
    if (updates.checkOut !== undefined) payload.check_out = updates.checkOut;
    if (updates.nights !== undefined) payload.nights = updates.nights;
    if (updates.adults !== undefined) payload.adults = updates.adults;
    if (updates.children !== undefined) payload.children = updates.children;
    if (updates.pricePerNight !== undefined) payload.price_per_night = updates.pricePerNight;
    if (updates.totalAmount !== undefined) payload.total_amount = updates.totalAmount;
    if (updates.paidAmount !== undefined) payload.paid_amount = updates.paidAmount;
    if (updates.receiptUrl !== undefined) payload.receipt_url = updates.receiptUrl;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const oldBooking = get().bookings.find(b => b.id === id);
    const { data, error } = await supabase
      .from('bookings')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? mapBooking(data) : b)),
    }));

    // Trigger emails for cancellation or modification
    const bookingForEmail = { ...oldBooking, ...mapBooking(data) };
    const prop = get().properties.find(p => p.id === (updates.propertyId || oldBooking?.propertyId));

    if (updates.status === 'cancelled') {
      console.log('🔄 Iniciando flujo de cancelación: Enviar y luego Borrar...');
      // Usamos await para asegurar que el mail sale antes del borrado
      await get().sendBookingEmail(bookingForEmail, prop, 'cancelled');
      await get().deleteBooking(id);
      console.log('🗑️ Reserva eliminada permanentemente tras el envío del correo.');
    } else if (updates.status && updates.status.startsWith('paid_') && oldBooking?.status === 'pending') {
      get().sendBookingEmail(bookingForEmail, prop, 'paid');
    } else if (Object.keys(updates).length > 1 || (updates.status !== undefined && updates.status !== oldBooking?.status)) {
      get().sendBookingEmail(bookingForEmail, prop, 'modified');
    }

    return { success: true };
  },

  deleteBooking: async (id) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
    set((state) => ({ bookings: state.bookings.filter((b) => b.id !== id) }));
    return { success: true };
  },

  // ── Properties CRUD ────────────────────────────────────────────────────────

  addProperty: async (property) => {
    const nextId = getNextPropertyId(get().properties, property.type);
    const payload = {
      ...property,
      id: nextId
    };

    const { data, error } = await supabase
      .from('properties')
      .insert(payload)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
    set((state) => ({ properties: [...state.properties, mapProperty(data)] }));
    return { success: true };
  },

  updateProperty: async (id, updates) => {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
    set((state) => ({
      properties: state.properties.map((p) => (p.id === id ? mapProperty(data) : p)),
    }));
    return { success: true };
  },

  deleteProperty: async (id) => {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
    set((state) => ({ properties: state.properties.filter((p) => p.id !== id) }));
    return { success: true };
  },

  // ── Guests CRUD ────────────────────────────────────────────────────────────

  addGuest: async (guest) => {
    const payload = {
      full_name: guest.fullName,
      email: guest.email || null,
      phone: guest.phone || null,
      document_id: guest.documentId || null,
      notes: guest.notes || null,
    };

    const { data, error } = await supabase
      .from('guests')
      .insert(payload)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
    set((state) => ({ guests: [...state.guests, mapGuest(data)] }));
    return { success: true, data: mapGuest(data) };
  },

  updateGuest: async (id, updates) => {
    const payload = {};
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.documentId !== undefined) payload.document_id = updates.documentId;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const { data, error } = await supabase
      .from('guests')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
    set((state) => ({
      guests: state.guests.map((g) => (g.id === id ? mapGuest(data) : g)),
    }));
    return { success: true };
  },

  deleteGuest: async (id) => {
    const { error } = await supabase.from('guests').delete().eq('id', id);
    if (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
    set((state) => ({ guests: state.guests.filter((g) => g.id !== id) }));
    return { success: true };
  },

  // ── Settings ─────────────────────────────────────────────────────────────

  fetchSettings: async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 'general')
      .single();
    if (data && !error) {
      set({ settings: data.value });
    }
  },

  updateSettings: async (newSettings) => {
    const { error } = await supabase
      .from('settings')
      .update({ value: newSettings, updated_at: new Date() })
      .eq('id', 'general');
    if (!error) {
      set({ settings: newSettings });
      return { success: true };
    }
    return { success: false, error: error.message };
  },

  sendBookingEmail: async (booking, property, type = 'confirmed') => {
    const { settings } = get();
    const apiKey = import.meta.env.VITE_RESEND_API_KEY;

    // Check settings
    const settingKey = `email_${type}`;
    if (settings[settingKey] === false) {
      console.log(`Email ${type} desactivado por configuración`);
      return { success: false, error: 'Disabled in settings' };
    }

    const titles = {
      confirmed: 'Reserva Confirmada',
      cancelled: 'Reserva Cancelada',
      modified: 'Reserva Modificada',
      paid: 'Pago Recibido'
    };

    const formatDate = (dateStr) => {
      try {
        const date = parseISO(dateStr + 'T12:00:00');
        return format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
      } catch (e) {
        return dateStr;
      }
    };

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
           <img src="https://via.placeholder.com/150x50?text=LOGO+COMPLEJO" alt="Complejo Angostura" style="max-width: 150px; height: auto;" />
        </div>
        <div style="text-align: center; margin-bottom: 32px;">
           <h1 style="font-size: 24px; font-weight: 800; color: #1d1d1f; margin: 0; letter-spacing: -0.5px;">${titles[type] || 'Notificación de Reserva'}</h1>
           <p style="color: #86868b; font-size: 14px; margin-top: 8px;">ID de Reserva: ${booking.id || booking.id}</p>
        </div>

        <p style="color: #1d1d1f; font-size: 16px; line-height: 1.6;">Hola <strong>${booking.guest_name || booking.guestName}</strong>,</p>
        <p style="color: #424245; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
${settings[`msg_${type}`] || (
        type === 'confirmed' ? 'Tu estadía ha sido confirmada.' :
          type === 'cancelled' ? 'Lamentamos informarte que tu reserva ha sido cancelada.' :
            type === 'modified' ? 'Se han realizado cambios en los detalles de tu reserva.' :
              type === 'paid' ? '¡Gracias! Hemos recibido tu pago correctamente.' : ''
      )}
        </p>
        
        <div style="background: #f5f5f7; padding: 24px; border-radius: 16px; margin: 32px 0;">
          <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #1d1d1f; border-bottom: 1px solid #e5e5e7; padding-bottom: 12px;">${property?.name || property?.name || 'Tu Alojamiento'}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #86868b; font-size: 13px; width: 40%;">Check-in</td>
              <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 600;">${formatDate(booking.check_in || booking.checkIn)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #86868b; font-size: 13px;">Check-out</td>
              <td style="padding: 8px 0; color: #1d1d1f; font-size: 14px; font-weight: 600;">${formatDate(booking.check_out || booking.checkOut)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #86868b; font-size: 13px;">Total</td>
              <td style="padding: 8px 0; color: #1d1d1f; font-size: 16px; font-weight: 700;">$${(booking.total_amount || booking.totalAmount || 0).toLocaleString('es-CL')}</td>
            </tr>
          </table>
        </div>

        ${type !== 'cancelled' ? `
        <div style="margin-top: 32px;">
          <h3 style="font-size: 16px; font-weight: 700; color: #1d1d1f; margin-bottom: 12px;">Información de Pago</h3>
          <div style="background: #f0f7ff; border: 1px solid #cce3ff; padding: 20px; border-radius: 12px;">
            <p style="margin: 0; color: #007aff; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${settings.bank_details || 'Por favor, contáctanos para coordinar el pago.'}</p>
          </div>
        </div>
        ` : ''}

        <div style="margin-top: 32px;">
          <h3 style="font-size: 16px; font-weight: 700; color: #1d1d1f; margin-bottom: 12px;">Condiciones del Servicio</h3>
          <div style="color: #424245; font-size: 13px; line-height: 1.6; white-space: pre-wrap; padding: 0 4px;">${settings.booking_conditions || 'Se aplican las condiciones generales del complejo.'}</div>
        </div>

        <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #f0f0f0; text-align: center;">
          <p style="font-size: 12px; color: #86868b; margin: 0;"><strong>Complejo Angostura</strong></p>
          <p style="font-size: 11px; color: #86868b; margin: 4px 0;">Ruta 5 Sur - Km 55, Angostura - Chile</p>
        </div>
      </div>
    `;

    try {
      const gEmail = booking.guest_email || booking.guestEmail;
      if (!gEmail) return { success: false, error: 'No guest email' };

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          to: [gEmail],
          subject: `${titles[type]} - ${property?.name || 'Reserva'}`,
          html: emailHtml
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error en la respuesta de la función');
      console.log(`✅ Email ${type} enviado exitosamente:`, data);
      return { success: true, data };
    } catch (e) {
      console.error(`Error crítico enviando email ${type}:`, e);
      return { success: false, error: e.message };
    }
  },

  initializeAuth: () => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      get().setSession(session);
    });

    // Listen for changes
    supabase.auth.onAuthStateChange((_event, session) => {
      get().setSession(session);
    });
  },

  sendGroupBookingEmail: async (bookingsList, guestData) => {
    const { settings, properties } = get();
    const apiKey = import.meta.env.VITE_RESEND_API_KEY;

    if (settings.email_confirmed === false) return { success: false };

    const formatDate = (dateStr) => {
      try {
        const date = parseISO(dateStr + 'T12:00:00'); 
        return format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
      } catch (e) { return dateStr; }
    };

    const totalGroup = bookingsList.reduce((acc, b) => acc + (b.totalAmount || b.total_amount || 0), 0);
    const checkIn = bookingsList[0].checkIn || bookingsList[0].check_in;
    const checkOut = bookingsList[0].checkOut || bookingsList[0].check_out;

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
           <img src="https://via.placeholder.com/150x50?text=LOGO+COMPLEJO" alt="Complejo Angostura" style="max-width: 150px; height: auto;" />
        </div>
        <div style="text-align: center; margin-bottom: 32px;">
           <h1 style="font-size: 26px; font-weight: 800; color: #1d1d1f; margin: 0; letter-spacing: -0.5px;">Reserva Grupal Confirmada</h1>
           <p style="color: #86868b; font-size: 14px; margin-top: 8px;">Tu itinerario completo en Complejo Angostura</p>
        </div>

        <p style="color: #1d1d1f; font-size: 16px; line-height: 1.6;">Hola <strong>${guestData.guestName}</strong>,</p>
        <p style="color: #424245; font-size: 15px; line-height: 1.6;">
          ¡Es un placer saludarte! Hemos preparado el detalle de tu reserva grupal. 
          Aquí tienes todas las unidades reservadas para tu estancia:
        </p>
        
        <div style="background: #f5f5f7; padding: 24px; border-radius: 16px; margin: 24px 0;">
           <div style="margin-bottom: 20px;">
             <div style="font-[10px] color: #86868b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold; margin-bottom: 4px;">FECHAS DE ESTANCIA</div>
             <div style="font-size: 16px; font-weight: 700; color: #1d1d1f;">${formatDate(checkIn)} al ${formatDate(checkOut)}</div>
           </div>

           <table style="width: 100%; border-collapse: collapse;">
             <thead>
               <tr>
                 <th style="text-align: left; padding: 8px 0; border-bottom: 1px solid #e5e5e7; color: #86868b; font-size: 11px;">UNIDAD</th>
                 <th style="text-align: right; padding: 8px 0; border-bottom: 1px solid #e5e5e7; color: #86868b; font-size: 11px;">POR NOCHE</th>
                 <th style="text-align: right; padding: 8px 0; border-bottom: 1px solid #e5e5e7; color: #86868b; font-size: 11px;">TOTAL</th>
               </tr>
             </thead>
             <tbody>
               ${bookingsList.map(b => {
                 const p = properties.find(pr => pr.id === (b.propertyId || b.property_id));
                 const nightly = b.pricePerNight || b.price_per_night || 0;
                 return `
                   <tr>
                     <td style="padding: 12px 0; font-size: 14px; color: #1d1d1f;"><strong>${p?.name || 'Unidad'}</strong></td>
                     <td style="padding: 12px 0; font-size: 14px; text-align: right; color: #424245;">$${nightly.toLocaleString('es-CL')}</td>
                     <td style="padding: 12px 0; font-size: 14px; text-align: right; color: #1d1d1f; font-weight: 600;">$${(b.totalAmount || b.total_amount || 0).toLocaleString('es-CL')}</td>
                   </tr>
                 `;
               }).join('')}
             </tbody>
             <tfoot>
               <tr>
                 <td colspan="2" style="padding: 20px 0 0 0; font-size: 16px; font-weight: 800; color: #1d1d1f; border-top: 2px solid #1d1d1f;">TOTAL DE LA ESTANCIA</td>
                 <td style="padding: 20px 0 0 0; font-size: 20px; font-weight: 900; text-align: right; color: #1d1d1f; border-top: 2px solid #1d1d1f;">$${totalGroup.toLocaleString('es-CL')}</td>
               </tr>
             </tfoot>
           </table>
        </div>

        <div style="margin-top: 32px;">
          <h3 style="font-size: 16px; font-weight: 700; color: #1d1d1f; margin-bottom: 12px;">Información de Pago</h3>
          <div style="background: #f0f7ff; border: 1px solid #cce3ff; padding: 20px; border-radius: 12px;">
            <p style="margin: 0; color: #007aff; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${settings.bank_details || 'Por favor, contáctanos para coordinar el pago.'}</p>
          </div>
        </div>

        <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #f0f0f0; text-align: center;">
          <p style="font-size: 12px; color: #86868b; margin: 0;"><strong>Complejo Angostura</strong></p>
          <p style="font-size: 11px; color: #86868b; margin: 4px 0;">Ruta 5 Sur - Km 55, Angostura - Chile</p>
        </div>
      </div>
    `;

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          to: [guestData.guestEmail],
          subject: `Confirmación de Estancia Grupal - Complejo Angostura`,
          html: emailHtml
        })
      });
      return { success: response.ok };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // ── UI State ─────────────────────────────────────────────────────────────
  selectedBooking: null,
  setSelectedBooking: (booking) => set({ selectedBooking: booking }),

  isNewBookingModalOpen: false,
  setNewBookingModalOpen: (open) => set({ isNewBookingModalOpen: open }),

  isEditBookingModalOpen: false,
  setEditBookingModalOpen: (open) => set({ isEditBookingModalOpen: open }),

  preselectedPropertyId: null,
  setPreselectedPropertyId: (id) => set({ preselectedPropertyId: id }),

  preselectedCheckIn: null,
  setPreselectedCheckIn: (date) => set({ preselectedCheckIn: date }),

  isPropertyModalOpen: false,
  setPropertyModalOpen: (open) => set({ isPropertyModalOpen: open }),

  selectedProperty: null,
  setSelectedProperty: (property) => set({ selectedProperty: property }),

  isGuestModalOpen: false,
  setGuestModalOpen: (open) => set({ isGuestModalOpen: open }),

  selectedGuest: null,
  setSelectedGuest: (guest) => set({ selectedGuest: guest }),
}));
