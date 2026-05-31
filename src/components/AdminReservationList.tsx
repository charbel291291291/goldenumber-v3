import { ShieldAlert, Check, RefreshCw, Download } from 'lucide-react';
import { Reservation } from '../lib/types';

interface AdminReservationListProps {
  reservations: Reservation[];
  onConfirm: (num: number) => Promise<void>;
  onReset: (num: number) => Promise<void>;
  onExportCSV?: () => void;
}

export default function AdminReservationList({
  reservations,
  onConfirm,
  onReset,
  onExportCSV,
}: AdminReservationListProps) {
  if (reservations.length === 0) {
    return (
      <div className="text-center py-8 bg-[#0a0703]/40 rounded-none border border-gold/20 p-4 border-dashed">
        <p className="text-xs text-stone-500 font-sans tracking-wide">
          No numbers reserved on this table.
        </p>
      </div>
    );
  }

  // Sort by number ascending for clean receipt layouts
  const sorted = [...reservations].sort((a, b) => a.number - b.number);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-gold/20 pb-2 select-none">
        <h4 className="text-[10px] tracking-widest text-gold uppercase font-sans font-extrabold">
          ACTIVE RESERVATIONS (TABLE {reservations[0]?.table_number})
        </h4>
        {onExportCSV && (
          <button
            onClick={onExportCSV}
            title="Export to CSV"
            className="flex items-center gap-1 px-2.5 py-1 text-[9px] bg-black border border-gold/40 hover:border-gold text-gold hover:text-black font-sans font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
          >
            <Download className="w-3 h-3" />
            EXPORT CSV
          </button>
        )}
      </div>
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {sorted.map((res) => {
          const isPending = res.status === 'pending';

          return (
            <div
              key={res.id}
              className="flex items-center justify-between p-3 rounded-none bg-[#0a0703]/80 border border-gold/30 shadow-md group hover:border-gold/50 transition-colors"
            >
              {/* Gold Serif Number and Info */}
              <div className="flex items-center gap-3">
                <span className="text-2xl font-serif font-black ml-1 text-transparent bg-clip-text bg-gradient-to-b from-gold-light to-gold w-8 inline-block select-none">
                  #{String(res.number).padStart(2, '0')}
                </span>
                <span className="text-stone-700 font-mono">|</span>
                <div className="text-xs">
                  <p className="font-sans font-bold text-stone-200 uppercase truncate max-w-[120px]">
                    {res.name || res.nickname || 'Unknown'}
                  </p>
                  <p className="font-mono text-[10px] text-stone-400 mt-0.5">
                    {res.phone || res.contact_phone || 'No phone'}
                  </p>
                  {res.reservation_group_id && (
                    <p className="font-mono text-[8px] text-stone-600 mt-0.5 select-all" title="Reservation group ID">
                      Group: {res.reservation_group_id}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Indicator & Instant Admin Controls */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-[8px] font-sans font-bold tracking-wider uppercase px-2 py-1 rounded-none border select-none
                    ${
                      isPending
                        ? 'bg-amber-950/20 text-gold-light border-gold/30'
                        : 'bg-emerald-950/20 text-emerald-400 border-emerald-500/30'
                    }
                  `}
                >
                  {res.status}
                </span>

                <div className="flex items-center gap-1">
                  {/* Confirm Action */}
                  {isPending && (
                    <button
                      onClick={() => onConfirm(res.number)}
                      title="Confirm payment"
                      className="p-1.5 rounded-none text-emerald-400 hover:text-black hover:bg-emerald-500 bg-black border border-emerald-500/30 hover:border-emerald-500/60 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Reset Action */}
                  <button
                    onClick={() => onReset(res.number)}
                    title="Reset slot"
                    className="p-1.5 rounded-none text-rose-400 hover:text-white hover:bg-rose-950 bg-black border border-rose-500/30 hover:border-rose-500/60 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
