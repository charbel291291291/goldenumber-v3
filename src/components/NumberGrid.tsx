import React, { useState } from 'react';
import { Reservation, Table } from '../lib/types';
import { AlertTriangle } from 'lucide-react';

interface NumberGridProps {
  selectedTable: Table | null;
  reservations: Reservation[];
  selectedNumbers: number[];
  onNumberSelect: (num: number) => void;
  onNumberTakenAlert?: (msg: string) => void;
}

export default function NumberGrid({
  selectedTable,
  reservations,
  selectedNumbers,
  onNumberSelect,
  onNumberTakenAlert,
}: NumberGridProps) {
  const [gridError, setGridError] = useState<string | null>(null);

  if (!selectedTable) return null;

  const isOpen = selectedTable.is_open;

  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-6">
      {/* Table Status Text */}
      <div className="text-center mb-4">
        {isOpen ? (
          <p className="text-xs md:text-sm font-sans text-gold-light italic">
            Table {selectedTable.table_number} is open. Choose one or more lucky numbers.
          </p>
        ) : (
          <p className="text-sm font-sans text-rose-500 font-bold tracking-widest uppercase">
            This table is locked.
          </p>
        )}
      </div>

      {/* Local grid error banner for quick taken feedback */}
      {gridError && (
        <div className="mb-3 flex items-center justify-center gap-2 bg-rose-950/80 border border-rose-800 text-rose-300 text-[11px] py-1.5 px-3 rounded-none animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{gridError}</span>
        </div>
      )}

      {/* Grid Container - 7 columns x 6 rows */}
      <div className="grid grid-cols-7 gap-1.5 bg-[#050403] p-3 border-4 border-gold custom-shadow rounded-none">
        {Array.from({ length: 42 }, (_, i) => {
          const num = i + 1;
          const reservation = reservations.find((r) => r.number === num);
          const isSelected = selectedNumbers.includes(num);

          const isAvailable = !reservation;
          const isPending = reservation?.status === 'pending' || reservation?.status === 'reserved';
          const isPaid = reservation?.status === 'paid' || reservation?.status === 'confirmed';

          return (
            <button
              key={num}
              disabled={!isOpen}
              onClick={() => {
                if (isOpen) {
                  if (isAvailable) {
                    onNumberSelect(num);
                  } else {
                    const statusText = isPaid ? 'confirmed' : 'already reserved';
                    const msg = `Slot #${String(num).padStart(2, '0')} is already taken (${statusText}).`;
                    setGridError(msg);
                    if (onNumberTakenAlert) {
                      onNumberTakenAlert(msg);
                    }
                    // Clear after 2.5s
                    const timer = setTimeout(() => setGridError(null), 2500);
                  }
                }
              }}
              id={`grid-cell-${num}`}
              className={`
                relative aspect-square w-full rounded-none flex flex-col justify-between p-1 transition-all duration-200 select-none overflow-hidden
                ${!isOpen ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                ${
                  isSelected && isAvailable
                    ? 'bg-gold-light/40 border-2 border-gold text-white scale-105 z-10 shadow-[0_0_12px_rgba(212,175,55,0.5)]'
                    : isAvailable
                    ? 'bg-[#FFFDD0] hover:bg-[#f1d592] text-black active:scale-95'
                    : isPending
                    ? 'bg-rose-950/20 border border-rose-800/60 text-rose-300'
                    : 'bg-[#FFFDD0] text-black/35 shadow-inner'
                }
              `}
            >
              {/* Lucky Number */}
              <span
                className={`
                  font-serif font-bold text-base md:text-xl leading-none
                  ${isSelected && isAvailable ? 'text-white' : ''}
                  ${isAvailable && !isSelected ? 'text-black' : ''}
                  ${isPaid ? 'text-black/35 opacity-40' : ''}
                  ${isPending ? 'text-rose-500 font-bold opacity-60' : ''}
                `}
              >
                {String(num).padStart(2, '0')}
              </span>

              {/* Status Mark / Nickname labels */}
              {isPending && reservation && (
                <>
                  {/* Red X Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none">
                    <span className="serif text-rose-600 text-4xl md:text-5xl font-light leading-none opacity-95">X</span>
                  </div>
                  {/* Pending Nickname bottom label */}
                  <div className="w-full text-center truncate absolute bottom-0 inset-x-0 py-0.5 bg-black/80 z-20 text-[7px] md:text-[8px] font-sans font-medium text-rose-300 uppercase tracking-wider px-1">
                    {reservation.nickname || reservation.name}
                  </div>
                </>
              )}

              {isPaid && reservation && (
                <>
                  {/* Gold serif X overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none">
                    <span className="serif text-[#d4af37] text-4xl md:text-5xl font-light leading-none opacity-90">X</span>
                  </div>
                  {/* Paid Nickname bottom label */}
                  <div className="w-full text-center truncate absolute bottom-0 inset-x-0 py-0.5 bg-black/80 z-20 text-[7px] md:text-[8px] font-sans font-medium text-[#FFFDD0] uppercase tracking-wider px-1">
                    {reservation.nickname || reservation.name}
                  </div>
                </>
              )}

              {/* Selected Available indicator */}
              {isSelected && isAvailable && (
                <div className="w-full text-center absolute bottom-0 inset-x-0 z-20 bg-gold py-0.5">
                  <span className="text-[7px] md:text-[8px] font-bold tracking-wider uppercase text-black font-sans block leading-none">
                    CHOSEN
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
