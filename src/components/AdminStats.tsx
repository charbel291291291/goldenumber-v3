import { DollarSign, ShieldAlert, CheckCircle2, Ticket } from 'lucide-react';
import { AppStats } from '../lib/types';

interface AdminStatsProps {
  stats: AppStats | null;
}

export default function AdminStats({ stats }: AdminStatsProps) {
  if (!stats) return <p className="text-[#d4af37] text-xs italic text-center py-4">Loading operational reports...</p>;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Total Profit Card */}
        <div className="bg-[#070605] border border-gold/30 p-3 rounded-none shadow-md flex items-center gap-2.5">
          <div className="p-1.5 rounded-none bg-gold/10 text-gold border border-gold/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[9px] tracking-wider text-gold/70 font-sans uppercase">TOTAL PROFIT</span>
            <span className="text-lg font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-gold-light to-gold">
              ${stats.totalProfit}
            </span>
            <span className="block text-[8px] text-stone-500 leading-tight">Never resets</span>
          </div>
        </div>

        {/* This Week Profit */}
        <div className="bg-[#070605] border border-gold/30 p-3 rounded-none shadow-md flex items-center gap-2.5">
          <div className="p-1.5 rounded-none bg-gold/10 text-gold-light border border-gold/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[9px] tracking-wider text-[#f1d592]/70 font-sans uppercase">THIS WEEK</span>
            <span className="text-lg font-serif font-bold text-gold-light">
              ${stats.thisWeekProfit}
            </span>
            <span className="block text-[8px] text-stone-500 leading-tight">Since Monday</span>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-[#070605] border border-gold/30 p-3 rounded-none shadow-md flex items-center gap-2.5">
          <div className="p-1.5 rounded-none bg-[#0a0703] border border-gold/20 text-gold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[9px] tracking-wider text-stone-400 font-sans uppercase">PENDING</span>
            <span className="text-lg font-serif font-bold text-gold-light">
              ${stats.pendingAmount}
            </span>
            <span className="block text-[8px] text-stone-400 leading-tight font-sans">
              {stats.pendingCount} numbers
            </span>
          </div>
        </div>

        {/* Confirmed Card */}
        <div className="bg-[#070605] border border-gold/30 p-3 rounded-none shadow-md flex items-center gap-2.5">
          <div className="p-1.5 rounded-none bg-[#FFFDD0]/10 border border-[#FFFDD0]/35 text-[#FFFDD0]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[9px] tracking-wider text-stone-300 font-sans uppercase">CONFIRMED</span>
            <span className="text-lg font-serif font-bold text-[#FFFDD0]">
              ${stats.confirmedAmount}
            </span>
            <span className="block text-[8px] text-stone-400 leading-tight font-sans">
              {stats.confirmedCount} numbers
            </span>
          </div>
        </div>
      </div>

      {/* Per Table Status Section */}
      <div className="bg-[#070605] p-4 border border-gold/30 rounded-none">
        <h4 className="text-[10px] tracking-widest text-gold font-bold uppercase mb-3 text-center border-b border-gold/20 pb-2 flex items-center justify-center gap-1.5 select-none">
          <Ticket className="w-3.5 h-3.5 text-gold" />
          PER TABLE PERFORMANCE
        </h4>

        <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
          {Array.from({ length: 10 }, (_, i) => {
            const tNum = i + 1;
            const tStat = stats.tableStats[tNum] || {
              totalAmount: 0,
              pendingAmount: 0,
              confirmedAmount: 0,
              isClosed: false,
            };

            const isAllSold = tStat.confirmedAmount === 126; // 42 * $3 = $126

            return (
              <div
                key={tNum}
                className="flex flex-col gap-1.5 p-2 bg-[#0a0703]/80 hover:bg-[#0a0703] border border-gold/20 rounded-none text-xs transition-colors"
              >
                <div className="flex items-center justify-between font-medium">
                  <span className="text-gold font-sans tracking-wide">
                    TABLE {tNum}
                  </span>
                  <span className="text-[10px] tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-light">
                    Total: ${tStat.totalAmount}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-500 select-none font-mono">
                  <span>
                    Pending: <span className="text-gold-light">${tStat.pendingAmount}</span>
                  </span>
                  <span>|</span>
                  <span>
                    Confirmed: <span className="text-gold">${tStat.confirmedAmount}</span>
                  </span>
                  <span>|</span>
                  <span>
                    Closed: <span className={tStat.isClosed || isAllSold ? 'text-gold font-bold' : 'text-stone-600'}>
                      {tStat.isClosed || isAllSold ? 'YES' : 'NO'}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
