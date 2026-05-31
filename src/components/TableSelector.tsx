import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Table } from '../lib/types';

interface TableSelectorProps {
  tables: Table[];
  selectedTableNumber: number;
  onTableSelect: (tableNumber: number) => void;
}

export default function TableSelector({
  tables,
  selectedTableNumber,
  onTableSelect,
}: TableSelectorProps) {
  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-6">
      <p className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37]/80 mb-3 text-center">
        Table Selector
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {Array.from({ length: 10 }, (_, i) => {
          const tableNum = i + 1;
          const tableInfo = tables.find((t) => t.table_number === tableNum);
          const isOpen = tableInfo ? tableInfo.is_open : false;
          const isSelected = selectedTableNumber === tableNum;

          return (
            <button
              key={tableNum}
              onClick={() => onTableSelect(tableNum)}
              id={`table-btn-${tableNum}`}
              className={`
                group relative flex flex-col items-center justify-center p-3 rounded-none border text-center transition-all duration-300 active:scale-95 cursor-pointer min-h-[56px]
                ${
                  isOpen
                    ? isSelected
                      ? 'gold-gradient border-gold text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : 'bg-[#0a0703] border-gold/30 text-gold-light hover:border-gold'
                    : 'bg-[#0a0703] border-[#332b1a] text-stone-600 opacity-60'
                }
              `}
            >
              <div className="flex items-center gap-1.5 justify-center">
                <span className={`text-xs tracking-wider uppercase ${isSelected && isOpen ? 'text-black font-bold' : 'text-stone-300'}`}>
                  TABLE {tableNum}
                </span>
                {isOpen ? (
                  <Unlock className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-gold'}`} />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-stone-700" />
                )}
              </div>
              <span className={`text-[10px] tracking-widest mt-0.5 uppercase ${
                isOpen 
                  ? isSelected 
                    ? 'text-black/80 font-bold' 
                    : 'text-gold/70' 
                  : 'text-stone-600/70'
              }`}>
                {isOpen ? 'OPEN' : 'LOCKED'}
              </span>

              {/* Inner highlight visual style */}
              {isSelected && isOpen && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-[#fffdd0]/60" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
