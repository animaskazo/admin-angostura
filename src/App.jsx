import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { TimelineView } from '@/components/timeline/TimelineView';
import { PropertiesView } from '@/components/properties/PropertiesView';
import { BookingsView } from '@/components/bookings/BookingsView';
import { GuestsView } from '@/components/guests/GuestsView';
import { NewBookingModal } from '@/components/bookings/NewBookingModal';
import { EditBookingModal } from '@/components/bookings/EditBookingModal';
import { PropertyModal } from '@/components/properties/PropertyModal';
import { BookingDrawer } from '@/components/bookings/BookingDrawer';
import { GuestModal } from '@/components/guests/GuestModal';
import { useStore } from '@/store/useStore';
import './index.css';

function PlaceholderView({ title }) {
  return (
    <div className="p-16">
      <h1 className="text-[30px] font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground text-sm mt-2">Esta sección estará disponible próximamente.</p>
    </div>
  );
}

function App() {
  const fetchAll = useStore(s => s.fetchAll);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="ml-[240px] pt-[60px] flex-1 min-h-screen overflow-y-auto">
          <Topbar />
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/timeline" element={<TimelineView />} />
            <Route path="/properties" element={<PropertiesView />} />
            <Route path="/bookings" element={<BookingsView />} />
            <Route path="/guests" element={<GuestsView />} />
            <Route path="/settings" element={<PlaceholderView title="Configuración" />} />
            <Route path="/help" element={<PlaceholderView title="Ayuda" />} />
          </Routes>
        </div>
        <NewBookingModal />
        <EditBookingModal />
        <PropertyModal />
        <BookingDrawer />
        <GuestModal />
      </div>
    </BrowserRouter>
  );
}

export default App;
