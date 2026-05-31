import React, { useState, useEffect } from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { db } from './lib/supabase';
import { getBrowserToken } from './lib/browserToken';
import { Table, Reservation } from './lib/types';

// Component imports
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import TableSelector from './components/TableSelector';
import NumberGrid from './components/NumberGrid';
import ReservationForm from './components/ReservationForm';
import AdminModal from './components/AdminModal';

export default function App() {
  const browserToken = getBrowserToken();

  // Application database states
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableNumber, setSelectedTableNumber] = useState<number>(1);
  const [tableReservations, setTableReservations] = useState<Reservation[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  // Connection and modal states
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [reservationModalOpen, setReservationModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync variables matching the reservation database schema
  const [nickname, setNickname] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadReservations = async () => {
    await fetchTables();
    await fetchReservations(selectedTableNumber);
  };

  // Initialize and register status listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register PWA service worker
    const isProd = (import.meta as any).env.PROD || (import.meta as any).env.MODE === 'production';
    if ('serviceWorker' in navigator && isProd) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => console.log('ServiceWorker registration successful:', reg.scope))
          .catch((err) => console.warn('ServiceWorker registration failed:', err));
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch initial tables and setup Real-time listener
  useEffect(() => {
    fetchTables();

    // Set up real-time listener.
    // Whenever anything updates on reservations/tables, refresh both lists.
    const unsubscribe = db.subscribe(() => {
      fetchTables();
      fetchReservations(selectedTableNumber);
    });

    return () => {
      unsubscribe();
    };
  }, [selectedTableNumber]);

  const fetchTables = async () => {
    try {
      const data = await db.getTables();
      setTables(data);
    } catch (err) {
      console.error('Failed to load tables:', err);
    }
  };

  const fetchReservations = async (tableNum: number) => {
    try {
      const data = await db.getReservations(tableNum);
      setTableReservations(data);
    } catch (err) {
      console.error(`Failed to load reservations for Table ${tableNum}:`, err);
    }
  };

  // When selected table changes, fetch reservations and reset chosen numbers
  useEffect(() => {
    fetchReservations(selectedTableNumber);
    setSelectedNumbers([]); // Clear selected numbers when table moves
  }, [selectedTableNumber]);

  // Derived Values
  const currentTable = tables.find((t) => t.table_number === selectedTableNumber) || null;
  const availableCount = 42 - tableReservations.length;

  const userPendingReservationsOnTable = tableReservations.filter(
    (r) => r.browser_token === browserToken && r.status === 'pending'
  );

  // Actions
  const handleReserve = async (name: string, phone: string, nums: number[] = selectedNumbers) => {
    setIsLoading(true);
    setError("");
    const reservationGroupId = crypto.randomUUID ? crypto.randomUUID() : 'group-' + Math.random().toString(36).substring(2, 11);
    
    // Construct rows payload for logs
    const rows = nums.map((number) => ({
      table_number: selectedTableNumber,
      number,
      name: name.trim(),
      normalized_name: name.trim().toLowerCase(),
      phone: phone.trim(),
      nickname: name.trim(),
      contact_phone: phone.trim(),
      status: "pending",
      reservation_group_id: reservationGroupId,
      browser_token: browserToken,
      price: 3,
    }));

    try {
      // 1. Availability check before insert
      const availCheck = await db.checkAvailability(selectedTableNumber, nums);
      
      if (availCheck.error) {
        console.error("Availability check failed:", availCheck.error);
        throw availCheck.error;
      }

      if (availCheck.data && availCheck.data.length > 0) {
        // Filter out those that are already taken
        const takenOnes = availCheck.data;
        setSelectedNumbers((prev) => prev.filter((n) => !takenOnes.includes(n)));
        setError("Some numbers were already taken. Please review your selection.");
        return;
      }

      // 2. Call DB reservation method
      const response = await db.reserveNumbers(
        selectedTableNumber,
        nums,
        name,
        phone,
        browserToken
      );

      if (!response.success) {
        if (response.takenNumbers && response.takenNumbers.length > 0) {
          const taken = response.takenNumbers;
          setSelectedNumbers((prev) => prev.filter((num) => !taken.includes(num)));
          throw new Error('Some numbers were already taken. Please review your selection.');
        }
        throw new Error(response.error);
      }

      // 3. Clear selections and show success states
      setSelectedNumbers([]);
      setNickname("");
      setContactPhone("");
      setError("");
      setReservationModalOpen(false);
      await loadReservations();
      setSuccess("Your numbers were reserved successfully.");
    } catch (err: any) {
      console.error("Reservation submit failed:", err);
      console.error("Selected numbers:", nums);
      console.error("Nickname:", name);
      console.error("Contact phone:", phone);
      console.error("Reservation rows payload:", rows);

      setError("Reservation system needs an update. Please contact admin.");
      throw err; // bubble up to ReservationForm
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReservation = async (num: number) => {
    const confirmation = window.confirm(`Cancel your pending reservation for slot #${num}?`);
    if (!confirmation) return;

    setIsLoading(true);
    try {
      const response = await db.cancelReservation(
        selectedTableNumber,
        num,
        browserToken
      );

      if (!response.success) {
        throw new Error(response.error);
      }

      await fetchReservations(selectedTableNumber);
      setSelectedNumbers((prev) => prev.filter((n) => n !== num));
    } catch (err: any) {
      alert(err.message || 'Could not cancel reservation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNumber = (num: number) => {
    setSelectedNumbers((prev) => {
      if (prev.includes(num)) {
        return prev.filter((n) => n !== num);
      } else {
        return [...prev, num];
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#050403] text-stone-100 flex flex-col justify-start items-center font-sans py-4 px-2 md:p-6 selection:bg-gold selection:text-black">
      
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="w-full max-w-xl mx-auto z-40 mb-4 bg-rose-950/80 border border-rose-800 text-rose-300 rounded p-3 text-xs flex items-center justify-center gap-2 animate-bounce">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span className="font-medium">Connection lost. Data will refresh when online.</span>
        </div>
      )}

      {/* Main Premium Card Wrapper with Dual Gold Borders */}
      <div className="w-full max-w-[720px] bg-[#050403] border-4 md:border-8 border-gold shadow-[0_8px_45px_rgba(212,175,55,0.2)] flex flex-col relative my-auto p-1 md:p-3 custom-shadow">
        {/* Inside border line for high fidelity depth */}
        <div className="border border-gold/30 p-2 md:p-4 flex flex-col min-h-full">
          
          {success && (
            <div className="w-full mb-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded p-3 text-xs flex items-center justify-between gap-2 animate-fade-in select-none">
              <span className="font-semibold">{success}</span>
              <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-200 font-extrabold cursor-pointer px-1">âœ•</button>
            </div>
          )}

          {/* Main Title Header Section */}
          <Header
            onAdminClick={() => {
              setIsAdminOpen(true);
              fetchTables();
            }}
            isAdminUnlocked={isAdminUnlocked}
          />

          {/* Table Selector Grid Column */}
          <TableSelector
            tables={tables}
            selectedTableNumber={selectedTableNumber}
            onTableSelect={(num) => setSelectedTableNumber(num)}
          />

          {/* Quick Metrics Statistics Row */}
          <StatsCards availableCount={availableCount} />

          {/* Responsive 42 Item Square Grid */}
          <NumberGrid
            selectedTable={currentTable}
            reservations={tableReservations}
            selectedNumbers={selectedNumbers}
            onNumberSelect={handleToggleNumber}
          />

          {/* Selected Numbers Sticky Summary Board */}
          {selectedNumbers.length > 0 && (
            <div className="w-full max-w-xl mx-auto px-4 mb-6 select-none animate-fade-in">
              <div className="bg-[#0b0804] border-2 border-gold p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(212,175,55,0.2)] rounded-none">
                <div className="text-center sm:text-left space-y-1">
                  <p className="text-[10px] tracking-widest text-gold/60 uppercase font-sans font-extrabold pb-0.5">
                    YOUR CURRENT SELECTION
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1">
                    <span className="text-stone-400 text-xs font-sans">Numbers chosen:</span>
                    <span className="text-gold font-serif font-bold text-sm">
                      {[...selectedNumbers]
                        .sort((a, b) => a - b)
                        .map((n) => String(n).padStart(2, '0'))
                        .join(', ')}
                    </span>
                  </div>
                  <p className="text-[9px] text-[#8e8a84] font-sans">
                    Total Selected: <span className="text-gold font-bold">{selectedNumbers.length}</span> | Est. Cost: <span className="text-[#FFFDD0] font-bold">${(selectedNumbers.length * 3).toFixed(2)} USD</span>
                  </p>
                </div>

                <button
                  onClick={() => setReservationModalOpen(true)}
                  className="px-5 py-2.5 bg-gold hover:opacity-90 active:scale-95 text-black border border-transparent font-sans tracking-widest font-extrabold uppercase text-[11px] transition-all cursor-pointer shrink-0"
                >
                  RESERVE SELECTED NUMBERS
                </button>
              </div>
            </div>
          )}

          {/* User's Current Pending Booking Cancellations - Frame Board */}
          {userPendingReservationsOnTable.length > 0 && (
            <div className="w-full max-w-xl mx-auto px-4 mb-6 select-none border-t border-gold/15 pt-5">
              <h3 className="text-[10px] tracking-widest text-gold-light font-bold uppercase mb-2.5 text-center font-sans">
                YOUR PENDING RESERVATIONS (TABLE {selectedTableNumber})
              </h3>
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {userPendingReservationsOnTable.map((res) => (
                  <div
                    key={res.number}
                    className="flex items-center justify-between p-2.5 bg-[#0a0703] border border-gold/20 rounded-none"
                  >
                    <div className="flex items-center gap-1.5 font-sans">
                      <span className="text-sm font-serif font-bold text-gold">
                        #{String(res.number).padStart(2, '0')}
                      </span>
                      <span className="text-stone-600 text-xs">|</span>
                      <span className="text-stone-300 text-xs truncate max-w-[140px]">
                        {res.name}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCancelReservation(res.number)}
                      disabled={isLoading}
                      className="text-[9px] hover:text-white text-rose-400 hover:bg-rose-950/20 border border-rose-500/30 font-bold px-2 py-1 rounded-none tracking-wide transition-colors uppercase cursor-pointer"
                    >
                      CANCEL RESERVATION
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Elegant Footer Slogan */}
          <footer className="mt-auto py-4 border-t border-gold/20 flex flex-col items-center select-none text-center gap-1">
            <div className="flex items-center gap-1.5 text-gold/40 text-[10px] uppercase font-mono tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SECURE MULTI-USER RAFFLE SYNC</span>
            </div>
            <p className="text-[9px] text-stone-600 font-sans tracking-wide">
              GOLDEN NUMBER Â© 2026. ALL RIGHTS RESERVED.
            </p>
          </footer>

        </div>
      </div>

      {/* Reservation Input Dialog Sheet */}
      <ReservationForm
        selectedNumbers={selectedNumbers}
        tableNumber={selectedTableNumber}
        browserToken={browserToken}
        tableReservations={tableReservations}
        onReserve={handleReserve}
        isLoading={isLoading}
        isOpen={reservationModalOpen}
        onClose={() => setReservationModalOpen(false)}
        nickname={nickname}
        setNickname={setNickname}
        contactPhone={contactPhone}
        setContactPhone={setContactPhone}
        error={error}
        setError={setError}
        success={success}
        setSuccess={setSuccess}
      />

      {/* Admin Panel Modal Sheet */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          setIsAdminUnlocked(false); // require PIN verification next time
        }}
        selectedTableNumber={selectedTableNumber}
        tableReservations={tableReservations}
        currentTable={currentTable}
        onRefreshData={() => {
          fetchTables();
          fetchReservations(selectedTableNumber);
        }}
      />
    </div>
  );
}

