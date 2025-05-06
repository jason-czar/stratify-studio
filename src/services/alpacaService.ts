
import { supabase } from "@/integrations/supabase/client";

export interface AlpacaAccount {
  id: string;
  account_number: string;
  status: string;
  equity: string;
  cash: string;
  buying_power: string;
  currency: string;
  portfolio_value: string;
  trading_blocked: boolean;
  account_blocked: boolean;
  created_at: string;
}

export interface AlpacaPosition {
  asset_id: string;
  symbol: string;
  qty: string;
  cost_basis: string;
  market_value: string;
  avg_entry_price: string;
  side: string;
  current_price: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  change_today: string;
}

export interface AlpacaOrder {
  id: string;
  client_order_id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  qty: string;
  filled_qty: string;
  status: string;
  created_at: string;
  filled_at: string | null;
  limit_price: string | null;
  stop_price: string | null;
  time_in_force: 'day' | 'gtc' | 'ioc' | 'fok';
}

export interface NewOrder {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  qty: number | string;
  time_in_force: 'day' | 'gtc' | 'ioc' | 'fok';
  limit_price?: number;
  stop_price?: number;
}

export class AlpacaService {
  /**
   * Get account information from Alpaca
   */
  static async getAccount(): Promise<AlpacaAccount> {
    try {
      const { data, error } = await supabase.functions.invoke('alpaca/account');
      
      if (error) {
        throw new Error(`Error fetching account: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching Alpaca account:', error);
      throw error;
    }
  }
  
  /**
   * Get all positions
   */
  static async getPositions(): Promise<AlpacaPosition[]> {
    try {
      const { data, error } = await supabase.functions.invoke('alpaca/positions');
      
      if (error) {
        throw new Error(`Error fetching positions: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching Alpaca positions:', error);
      throw error;
    }
  }
  
  /**
   * Get orders with optional status filter
   */
  static async getOrders(status?: string): Promise<AlpacaOrder[]> {
    try {
      const { data, error } = await supabase.functions.invoke('alpaca/orders', {
        query: status ? { status } : undefined
      });
      
      if (error) {
        throw new Error(`Error fetching orders: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching Alpaca orders:', error);
      throw error;
    }
  }
  
  /**
   * Place a new order
   */
  static async placeOrder(order: NewOrder): Promise<AlpacaOrder> {
    try {
      const { data, error } = await supabase.functions.invoke('alpaca/place-order', {
        method: 'POST',
        body: order
      });
      
      if (error) {
        throw new Error(`Error placing order: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error placing order with Alpaca:', error);
      throw error;
    }
  }
  
  /**
   * Verify connection to Alpaca
   */
  static async verifyConnection(): Promise<boolean> {
    try {
      const account = await this.getAccount();
      return !!account?.id;
    } catch (error) {
      console.error('Failed to verify Alpaca connection:', error);
      return false;
    }
  }
}
