import { useMemo, useState } from 'react';
import { ShieldAlert, Check, RefreshCw, Download, Search, Users, Square, CheckSquare } from 'lucide-react';
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
  const [selected, setSelected] = useState<number[]>([]);
  const [query, setQuery] = useState('');
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...reservations].sort((a, b) => a.number - b.number),
    [reservations]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;

    return sorted.filter((res) => {
      const name = (res.name || res.nickname || '').toLowerCase();
      const phone = (res.phone || res.contact_phone || '').toLowerCase();
      const number = String(res.number);
      const status = res.status.toLowerCase();

      return (
        name.includes(q) ||
        phone.includes(q) ||
        number.includes(q) ||
        status.includes(q)
      );
    });
  }, [sorted, query]);

  const users = useMemo(() => {
    const map = new Map<string, Reservation[]>();

    for (const res of sorted) {
      const name = res.name || res.nickname || 'Unknown';
      const phone = res.phone || res.contact_phone || 'No phone';
      const key = `${name.toLowerCase()}__${phone}`;

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(res);
    }

    return Array.from(map.values())
      .map((items) => {
        const first = items[0];
        const pending = items.filter((r) => r.status === 'pending').length;
        const paid = items.filter((r) => r.status === 'paid').length;
        const total = items.reduce((sum, r) => sum + Number(r.price || 0), 0);

        return {
          key: `${first.name || first.nickname || 'Unknown'}-${first.phone || first.contact_phone || 'No phone'}`,
          name: first.name || first.nickname || 'Unknown',
          phone: first.phone || first.contact_phone || 'No phone',
          numbers: items.map((r) => r.number).sort((a, b) => a - b),
          pending,
          paid,
          total,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sorted]);

  const selectedReservations = sorted.filter((res) => selected.includes(res.number));
  const selectedPending = selectedReservations.filter((res) => res.status === 'pending');

  const toggleSelected = (num: number) => {
    setSelected((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const selectAllFiltered = () => {
    setSelected(filtered.map((res) => res.number));
  };

  const selectAllPending = () => {
    setSelected(sorted.filter((res) => res.status === 'pending').map((res) => res.number));
  };

  const clearSelection = () => {
    setSelected([]);
  };

  const approveSelected = async () => {
    if (selectedPending.length === 0) return;

    const ok = window.confirm(`Confirm payment for ${selectedPending.length} selected pending number(s)?`);
    if (!ok) return;

    try {
      setBusyAction('approve');
      for (const res of selectedPending) {
        await onConfirm(res.number);
      }
      setSelected([]);
    } finally {
      setBusyAction(null);
    }
  };

  const resetSelected = async () => {
    if (selected.length === 0) return;

    const ok = window.confirm(`Reset ${selected.length} selected number(s)? This releases them from the table.`);
    if (!ok) return;

    try {
      setBusyAction('reset');
      for (const num of selected) {
        await onReset(num);
      }
      setSelected([]);
    } finally {
      setBusyAction(null);
    }
  };

  if (reservations.length === 0) {
    return (
      <div className="text-center py-8 bg-[#0a0703]/40 rounded-none border border-gold/20 p-4 border-dashed">
        <p className="text-xs text-stone-500 font-sans tracking-wide">
          No numbers reserved on this table.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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

      <div className="bg-[#070605] border border-gold/25 p-3 rounded-none space-y-3">
        <div className="flex items-center gap-2 bg-black border border-gold/30 px-2.5 py-2">
          <Search className="w-3.5 h-3.5 text-gold" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, number, status"
            className="flex-1 bg-transparent text-xs text-stone-200 placeholder-stone-600 outline-none font-sans"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={selectAllFiltered}
            className="px-2 py-2 bg-black border border-gold/30 text-gold text-[9px] font-bold uppercase tracking-wider"
          >
            Select visible
          </button>
          <button
            onClick={selectAllPending}
            className="px-2 py-2 bg-black border border-gold/30 text-gold text-[9px] font-bold uppercase tracking-wider"
          >
            Select pending
          </button>
          <button
            onClick={approveSelected}
            disabled={busyAction !== null || selectedPending.length === 0}
            className="px-2 py-2 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 disabled:opacity-40 text-[9px] font-bold uppercase tracking-wider"
          >
            Approve selected ({selectedPending.length})
          </button>
          <button
            onClick={resetSelected}
            disabled={busyAction !== null || selected.length === 0}
            className="px-2 py-2 bg-rose-950/40 border border-rose-500/40 text-rose-300 disabled:opacity-40 text-[9px] font-bold uppercase tracking-wider"
          >
            Reset selected ({selected.length})
          </button>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center justify-between gap-2 text-[10px] text-stone-400 font-mono">
            <span>Selected: {selected.sort((a, b) => a - b).join(', ')}</span>
            <button onClick={clearSelection} className="text-gold underline uppercase">
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="bg-[#070605] border border-gold/20 p-3 rounded-none space-y-2">
        <div className="flex items-center gap-2 text-gold">
          <Users className="w-3.5 h-3.5" />
          <h4 className="text-[10px] tracking-widest uppercase font-sans font-extrabold">
            USERS / PARTICIPANTS
          </h4>
        </div>

        <div className="space-y-2 max-h-[210px] overflow-y-auto pr-1">
          {users.map((user) => (
            <div key={user.key} className="bg-black/70 border border-gold/15 p-2.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-stone-100 font-bold uppercase">{user.name}</p>
                  <p className="text-[10px] text-stone-500 font-mono">{user.phone}</p>
                  <p className="text-[10px] text-gold-light font-mono mt-1">
                    Numbers: {user.numbers.join(', ')}
                  </p>
                </div>
                <div className="text-right text-[9px] font-mono">
                  <p className="text-stone-400">Total: ${user.total}</p>
                  <p className="text-gold-light">Pending: {user.pending}</p>
                  <p className="text-emerald-400">Paid: {user.paid}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-6 bg-[#0a0703]/40 border border-gold/20">
          <p className="text-xs text-stone-500">No matching reservations.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
          {filtered.map((res) => {
            const isPending = res.status === 'pending';
            const isChecked = selected.includes(res.number);

            return (
              <div
                key={res.id}
                className="flex items-center justify-between p-3 rounded-none bg-[#0a0703]/80 border border-gold/30 shadow-md group hover:border-gold/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleSelected(res.number)}
                    className="text-gold hover:text-gold-light"
                    title="Select number"
                  >
                    {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>

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
                  </div>
                </div>

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
                    {isPending && (
                      <button
                        onClick={() => onConfirm(res.number)}
                        title="Confirm payment"
                        className="p-1.5 rounded-none text-emerald-400 hover:text-black hover:bg-emerald-500 bg-black border border-emerald-500/30 hover:border-emerald-500/60 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}

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
      )}
    </div>
  );
}
