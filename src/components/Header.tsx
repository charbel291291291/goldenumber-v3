import { useRef, useState } from 'react';
import { Crown } from 'lucide-react';

interface HeaderProps {
  onAdminClick: () => void;
  isAdminUnlocked: boolean;
}

export default function Header({ onAdminClick }: HeaderProps) {
  const [crownClicks, setCrownClicks] = useState(0);
  const timerRef = useRef<number | null>(null);

  const handleCrownClick = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    const nextClicks = crownClicks + 1;
    setCrownClicks(nextClicks);

    if (nextClicks >= 5) {
      setCrownClicks(0);
      onAdminClick();
      return;
    }

    timerRef.current = window.setTimeout(() => {
      setCrownClicks(0);
    }, 2500);
  };

  return (
    <header className="relative text-center py-6 select-none">
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleCrownClick}
          aria-label="Golden Number Crown"
          className="group p-2 rounded-full border border-transparent hover:border-gold/25 active:scale-95 transition-all cursor-pointer"
        >
          <Crown className="w-10 h-10 text-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.45)] group-hover:text-gold-light transition-colors" />
        </button>

        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-black tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-b from-gold-light via-gold to-gold-dark uppercase">
            Golden Number
          </h1>
          <p className="mt-2 text-[10px] md:text-xs tracking-[0.35em] uppercase text-stone-400 font-sans">
            Forty-two chances to win
          </p>
        </div>
      </div>
    </header>
  );
}
