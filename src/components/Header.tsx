import { Crown } from 'lucide-react';

interface HeaderProps {
  onAdminClick: () => void;
  isAdminUnlocked: boolean;
}

export default function Header({ onAdminClick, isAdminUnlocked }: HeaderProps) {
  return (
    <header className="relative w-full flex flex-col items-center pt-8 pb-6 px-4">
      {/* Hidden/Subtle Admin Trigger */}
      <button
        id="admin-trigger"
        onClick={onAdminClick}
        className="absolute top-4 right-4 bg-transparent text-gold/30 hover:text-gold transition-colors p-2 text-xs font-mono select-none"
        title="Admin settings"
      >
        {isAdminUnlocked ? '[ADMIN ✓]' : '[ADMIN CODE]'}
      </button>

      {/* Luxury Brand Header */}
      <div className="flex flex-col items-center select-none text-center">
        {/* Crown Accent */}
        <div className="text-gold mb-2 drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)] animate-pulse">
          <Crown className="w-9 h-9" strokeWidth={1.5} />
        </div>

        {/* Brand Title */}
        <h1 className="text-4xl md:text-5xl font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-gold-light via-gold to-gold font-extrabold uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
          Golden Number
        </h1>

        {/* Subtitle Accent Lines */}
        <div className="flex items-center gap-3 mt-2 w-full max-w-xs">
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-gold/50" />
          <span className="text-[10px] md:text-xs font-sans tracking-[0.3em] text-gold-light/90 font-medium uppercase">
            Forty-Two Chances to Win
          </span>
          <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-gold/50" />
        </div>
      </div>
    </header>
  );
}
