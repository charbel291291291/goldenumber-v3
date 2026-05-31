import React, { useState, useEffect } from 'react';
import { User, Phone, CheckCircle, XCircle, X } from 'lucide-react';
import { validateName, validatePhone } from '../lib/validators';
import { Reservation } from '../lib/types';
import { luxuryAudio } from '../lib/audio';

interface ReservationFormProps {
  selectedNumbers: number[];
  tableNumber: number;
  browserToken: string;
  tableReservations: Reservation[];
  onReserve: (nickname: string, contactPhone: string) => Promise<void>;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  nickname: string;
  setNickname: (val: string) => void;
  contactPhone: string;
  setContactPhone: (val: string) => void;
  error: string;
  setError: (val: string) => void;
  success: string;
  setSuccess: (val: string) => void;
}

export default function ReservationForm({
  selectedNumbers,
  tableNumber,
  browserToken,
  tableReservations,
  onReserve,
  isLoading,
  isOpen,
  onClose,
  nickname,
  setNickname,
  contactPhone,
  setContactPhone,
  error,
  setError,
  success,
  setSuccess,
}: ReservationFormProps) {

  // Reset error of modal on open/close
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (selectedNumbers.length === 0) {
      setError('Choose at least one lucky number on the grid first.');
      return;
    }

    // Name Validate
    const nameVal = validateName(nickname);
    if (!nameVal.isValid) {
      setError(nameVal.error || 'Name is required.');
      return;
    }

    // Phone Validate
    const phoneVal = validatePhone(contactPhone);
    if (!phoneVal.isValid) {
      setError(phoneVal.error || 'Phone is required.');
      return;
    }

    const rows = selectedNumbers.map((number) => ({
      table_number: tableNumber,
      number,
      nickname: nickname.trim(),
      contact_phone: contactPhone.trim(),
      status: 'reserved',
      reservation_group_id: 'shared-group-uuid-placeholder',
    }));

    try {
      await onReserve(nickname, contactPhone);
      luxuryAudio.praiseSparkle();
    } catch (err: any) {
      console.error('Reservation submit failed:', err);
      console.error('Selected numbers:', selectedNumbers);
      console.error('Nickname:', nickname);
      console.error('Contact phone:', contactPhone);
      console.error('Reservation rows payload:', rows);

      setError('Reservation system needs an update. Please contact admin.');
    }
  };

  const sortedSelected = [...selectedNumbers].sort((a, b) => a - b);
  const totalPrice = selectedNumbers.length * 3.00;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#070605] border-4 border-gold p-1 shadow-[0_0_50px_rgba(212,175,55,0.45)] my-auto relative">
        <div className="border border-gold/35 p-5">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gold/60 hover:text-gold transition-colors p-1 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="serif text-xl tracking-widest text-gold font-bold uppercase mb-4 text-center select-none">
            RESERVATION DETAILS
          </h2>

          {/* Selected Numbers Summary Board */}
          <div className="flex flex-col items-center justify-center py-3 bg-[#0a0703] rounded-none border border-gold/30 mb-4 select-none">
            <span className="text-[10px] tracking-wider text-gold/75 uppercase font-sans font-bold">
              SELECTED LUCKY NUMBERS ({selectedNumbers.length})
            </span>
            <span className="text-lg md:text-xl font-serif font-bold text-gold-light mt-1.5 px-4 text-center leading-tight">
              {sortedSelected.length > 0 ? sortedSelected.map((n) => String(n).padStart(2, '0')).join(', ') : '--'}
            </span>
            <span className="text-[10px] text-stone-500 font-mono mt-1 font-semibold">
              Total Price: ${totalPrice.toFixed(2)} USD
            </span>
          </div>

          {success ? (
            <div className="space-y-4 select-none animate-fade-in pt-2">
              <div className="flex items-start gap-2.5 text-gold-light bg-[#0a0703] border border-gold/40 p-4">
                <CheckCircle className="w-5 h-5 shrink-0 text-gold-light mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-gold uppercase">RESERVATION PLACED SUCCESSFULLY</p>
                  <p className="text-stone-300 leading-normal">{success}</p>
                </div>
              </div>

              <div className="bg-black/90 p-3.5 border border-gold/20 text-[10px] text-stone-400 leading-relaxed font-sans">
                <p className="font-bold text-gold uppercase mb-1">How to Complete Payment:</p>
                <p>Transfer $3.00 per number (${totalPrice.toFixed(2)} total) to the organizer. Once verified, your slot numbers will be officially confirmed with a Golden X.</p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-gold hover:opacity-95 text-black font-sans tracking-widest font-extrabold uppercase transition-all duration-200 cursor-pointer text-xs"
              >
                CLOSE BOARD
              </button>
            </div>
          ) : (
            /* Action Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-widest text-gold/85 font-sans uppercase mb-1.5 font-bold">
                  NICKNAME / NAME
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gold/45">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Alex G."
                    className="w-full bg-[#0a0703] text-stone-200 text-sm pl-9 pr-4 py-2.5 rounded-none border border-gold focus:outline-2 focus:outline-gold-light placeholder-stone-600 transition-all font-sans"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest text-gold/85 font-sans uppercase mb-1.5 font-bold">
                  CONTACT PHONE
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gold/45">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+961 -- --- ---"
                    className="w-full bg-[#0a0703] text-stone-200 text-sm pl-9 pr-4 py-2.5 rounded-none border border-gold focus:outline-2 focus:outline-gold-light placeholder-stone-600 transition-all font-sans"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-[9px] text-[#8e8a84] font-sans mt-1">
                  We use your contact details to verify transfers and raffle announcements.
                </p>
              </div>

              {/* Messages Alert */}
              {error && (
                <div className="flex items-start gap-2.5 bg-rose-950/40 border border-rose-800/60 text-rose-300 p-3 rounded-none text-xs select-none">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isLoading || selectedNumbers.length === 0}
                className={`
                  w-full py-3.5 rounded-none text-xs font-sans tracking-widest font-extrabold uppercase transition-all duration-300 select-none cursor-pointer active:scale-[0.98]
                  ${
                    selectedNumbers.length === 0
                      ? 'bg-[#0a0703] border border-[#332b1a] text-[#555] cursor-not-allowed'
                      : 'gold-gradient text-black hover:opacity-90'
                  }
                `}
              >
                {isLoading ? 'RESERVING NUMBERS...' : `CONFIRM ${selectedNumbers.length} RESERVATION${selectedNumbers.length > 1 ? 'S' : ''}`}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
