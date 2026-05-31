export interface Table {
  id: string;
  table_number: number;
  is_open: boolean;
  draw_date: string | null;
  created_at: string;
}

export type ReservationStatus = 'pending' | 'paid' | 'reserved' | 'confirmed';

export interface Reservation {
  id: string;
  table_number: number;
  number: number;
  name?: string;
  normalized_name?: string;
  phone?: string;
  nickname?: string;
  contact_phone?: string;
  status: ReservationStatus;
  price: number;
  created_at: string;
  paid_at: string | null;
  browser_token: string | null;
  reservation_group_id?: string | null;
}

export interface ProfitEntry {
  id: string;
  table_number: number;
  number: number;
  amount: number;
  type: 'paid' | 'reset' | 'clear';
  created_at: string;
}

export interface AppStats {
  totalProfit: number;
  thisWeekProfit: number;
  pendingAmount: number;
  pendingCount: number;
  confirmedAmount: number;
  confirmedCount: number;
  tableStats: {
    [table_number: number]: {
      totalAmount: number;
      pendingAmount: number;
      confirmedAmount: number;
      isClosed: boolean; // all 42 sold or similar, or closed state
    };
  };
}
