
// Common interface for all node types
export interface BaseNodeData {
  label: string;
  description?: string;
}

export interface StockSelectionData extends BaseNodeData {
  ticker?: string;
  marketType?: 'stock' | 'crypto' | 'forex';
  exchange?: string;
}

export interface ConditionData extends BaseNodeData {
  conditionType?: 'price' | 'technical' | 'fundamental' | 'time';
  operator?: '>' | '<' | '=' | '>=' | '<=';
  value?: number;
  indicator?: string;
  timeframe?: string;
}

export interface OrderExecutionData extends BaseNodeData {
  orderType?: 'market' | 'limit' | 'stop' | 'stop_limit';
  side?: 'buy' | 'sell';
  quantity?: number | 'all';
  price?: number;
  timeInForce?: 'day' | 'gtc' | 'ioc' | 'fok';
}
