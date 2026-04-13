import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convierte el snake_case de Postgres a camelCase para el frontend */
function mapProperty(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
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
  const prefix = type === 'cabin' ? 'C-' : type === 'suite' ? 'S-' : 'H-';
  const nums = properties
    .filter(p => p.id.startsWith(prefix))
    .map(p => parseInt(p.id.replace(prefix, '')))
    .filter(n => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `${prefix}${(max + 1).toString().padStart(2, '0')}`;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useStore = create((set, get) => ({
  // ── Data ────────────────────────────────────────────────────────────────
  properties: [],
  bookings: [],
  guests: [],
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

  /** Carga properties, bookings y guests en paralelo */
  fetchAll: async () => {
    set({ loading: true, error: null });
    const [propsResult, bookingsResult, guestsResult] = await Promise.all([
      supabase.from('properties').select('*').order('id'),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('guests').select('*').order('full_name'),
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
        loading: false,
      });
    }
  },

  // ── Bookings CRUD ────────────────────────────────────────────────────────

  addBooking: async (booking) => {
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
    return { success: true };
  },

  updateBooking: async (id, updates) => {
    // Mapea keys camelCase → snake_case
    const payload = {};
    if (updates.status !== undefined)      payload.status       = updates.status;
    if (updates.guestName !== undefined)   payload.guest_name   = updates.guestName;
    if (updates.guestEmail !== undefined)  payload.guest_email  = updates.guestEmail;
    if (updates.guestPhone !== undefined)  payload.guest_phone  = updates.guestPhone;
    if (updates.checkIn !== undefined)     payload.check_in     = updates.checkIn;
    if (updates.checkOut !== undefined)    payload.check_out    = updates.checkOut;
    if (updates.nights !== undefined)      payload.nights       = updates.nights;
    if (updates.adults !== undefined)      payload.adults       = updates.adults;
    if (updates.children !== undefined)    payload.children     = updates.children;
    if (updates.totalAmount !== undefined) payload.total_amount = updates.totalAmount;
    if (updates.paidAmount !== undefined)  payload.paid_amount  = updates.paidAmount;
    if (updates.receiptUrl !== undefined)  payload.receipt_url  = updates.receiptUrl;
    if (updates.notes !== undefined)       payload.notes        = updates.notes;

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
    if (updates.fullName !== undefined)   payload.full_name   = updates.fullName;
    if (updates.email !== undefined)      payload.email      = updates.email;
    if (updates.phone !== undefined)      payload.phone      = updates.phone;
    if (updates.documentId !== undefined) payload.document_id = updates.documentId;
    if (updates.notes !== undefined)      payload.notes      = updates.notes;

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
