interface StatsCardsProps {
  availableCount: number;
}

export default function StatsCards({ availableCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 px-4 w-full max-w-xl mx-auto mb-6">
      {/* Price Card */}
      <div className="bg-[#070605] border border-gold/30 rounded-none p-2 text-center shadow-lg">
        <p className="text-[9px] tracking-widest text-[#d4af37]/70 font-sans uppercase">PRICE</p>
        <p className="text-xl md:text-2xl font-serif text-gold">$3</p>
      </div>

      {/* Prize Card */}
      <div className="bg-[#070605] border border-[#d4af37] rounded-none p-2 text-center shadow-lg relative overflow-hidden group">
        {/* Subtle glowing element */}
        <div className="absolute inset-0 bg-gold/5 pointer-events-none" />
        <p className="text-[9px] tracking-widest text-[#d4af37]/70 font-sans uppercase">PRIZE</p>
        <p className="text-xl md:text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-gold-light to-gold font-bold">$88</p>
      </div>

      {/* Available Card */}
      <div className="bg-[#070605] border border-gold/30 rounded-none p-2 text-center shadow-lg">
        <p className="text-[9px] tracking-widest text-[#d4af37]/70 font-sans uppercase">AVAILABLE</p>
        <p className="text-xl md:text-2xl font-serif text-gold-light">
          {availableCount}
        </p>
      </div>
    </div>
  );
}
