import { Node, Edge } from 'reactflow';
import { NodeData, StockSelectionData, ConditionData, OrderExecutionData } from '@/types/nodes';
import { evaluateCondition } from '@/hooks/useConditionEvaluation';

export interface HistoricalDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

export interface BacktestParams {
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  commission?: number; // Per trade commission fee
}

export interface BacktestResult {
  trades: BacktestTrade[];
  performance: BacktestPerformance;
  equity: EquityPoint[];
  success: boolean;
  errors: string[];
}

export interface BacktestTrade {
  date: Date;
  side: 'buy' | 'sell';
  ticker: string;
  quantity: number;
  price: number;
  value: number;
  commission: number;
}

export interface BacktestPerformance {
  totalReturn: number;
  totalReturnPct: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  numberOfTrades: number;
  profitFactor: number;
}

export interface EquityPoint {
  date: Date;
  equity: number;
}

export const mockHistoricalData = (ticker: string, startDate: Date, endDate: Date): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  let currentDate = new Date(startDate);
  let currentPrice = 100 + Math.random() * 200; // Random start price between 100 and 300
  
  while (currentDate <= endDate) {
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // Skip weekends
      const dailyChange = (Math.random() - 0.48) * 5; // Slightly biased toward growth
      currentPrice = Math.max(currentPrice + dailyChange, 1); // Ensure price doesn't go below 1
      
      data.push({
        date: new Date(currentDate),
        open: currentPrice - (Math.random() * 2),
        high: currentPrice + (Math.random() * 2),
        low: currentPrice - (Math.random() * 2),
        close: currentPrice,
        volume: Math.floor(Math.random() * 1000000) + 100000
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return data;
};

export class BacktestService {
  private nodes: Node<NodeData>[];
  private edges: Edge[];
  private params: BacktestParams;
  private historicalData: Record<string, HistoricalDataPoint[]> = {};

  constructor(nodes: Node<NodeData>[], edges: Edge[], params: BacktestParams) {
    this.nodes = nodes;
    this.edges = edges;
    this.params = params;
  }

  async loadHistoricalData(tickers: string[]): Promise<void> {
    // In a real implementation, this would call an API
    // For now, we'll use mock data
    for (const ticker of tickers) {
      this.historicalData[ticker] = mockHistoricalData(
        ticker, 
        this.params.startDate, 
        this.params.endDate
      );
    }
  }

  private findNextNodes(nodeId: string): Node<NodeData>[] {
    const outgoingEdges = this.edges.filter(edge => edge.source === nodeId);
    return outgoingEdges.map(edge => 
      this.nodes.find(node => node.id === edge.target)
    ).filter(Boolean) as Node<NodeData>[];
  }

  private findNextNodesWithCondition(nodeId: string, condition: boolean): Node<NodeData>[] {
    const outgoingEdges = this.edges.filter(edge => 
      edge.source === nodeId && 
      ((condition && edge.sourceHandle === 'outTrue') || 
      (!condition && edge.sourceHandle === 'outFalse'))
    );
    
    return outgoingEdges.map(edge => 
      this.nodes.find(node => node.id === edge.target)
    ).filter(Boolean) as Node<NodeData>[];
  }

  async runBacktest(): Promise<BacktestResult> {
    const result: BacktestResult = {
      trades: [],
      performance: {
        totalReturn: 0,
        totalReturnPct: 0,
        annualizedReturn: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        winRate: 0,
        numberOfTrades: 0,
        profitFactor: 0
      },
      equity: [],
      success: false,
      errors: []
    };

    // Find start node
    const startNode = this.nodes.find(node => node.type === 'start');
    if (!startNode) {
      result.errors.push('No start node found');
      return result;
    }

    // Find all stock selection nodes to know which tickers we need data for
    const stockNodes = this.nodes.filter(node => node.type === 'stockSelection') as Node<StockSelectionData>[];
    const tickers = stockNodes.map(node => node.data.ticker).filter(Boolean) as string[];
    
    if (tickers.length === 0) {
      result.errors.push('No tickers specified in stock selection nodes');
      return result;
    }

    // Load historical data
    await this.loadHistoricalData(tickers);

    // Initialize portfolio
    let cash = this.params.initialCapital;
    const positions: Record<string, { quantity: number, avgPrice: number }> = {};
    
    // Prepare data structure for each day
    const tradingDays = new Set<string>();
    Object.values(this.historicalData).forEach(tickerData => {
      tickerData.forEach(dataPoint => {
        tradingDays.add(dataPoint.date.toISOString().split('T')[0]);
      });
    });

    const sortedDays = [...tradingDays].sort();
    let prevEquity = this.params.initialCapital;
    
    // Simulate for each day
    for (const day of sortedDays) {
      const currentDate = new Date(day);
      
      // For each stock, evaluate the algorithm
      for (const ticker of tickers) {
        const dataPoint = this.historicalData[ticker].find(
          d => d.date.toISOString().split('T')[0] === day
        );
        
        if (!dataPoint) continue;

        // Prepare market data for this ticker on this day
        const marketData = {
          ticker,
          price: dataPoint.close,
          open: dataPoint.open,
          high: dataPoint.high,
          low: dataPoint.low,
          close: dataPoint.close,
          volume: dataPoint.volume,
          timestamp: dataPoint.date,
          indicators: {} // Would populate with actual indicators in a real implementation
        };

        // Execute the algorithm starting from stock selection nodes for this ticker
        for (const stockNode of stockNodes) {
          if (stockNode.data.ticker !== ticker) continue;

          // Follow the algorithm flow
          let currentNodes = this.findNextNodes(stockNode.id);
          
          while (currentNodes.length > 0) {
            const nextNodes: Node<NodeData>[] = [];
            
            for (const node of currentNodes) {
              switch (node.type) {
                case 'condition': {
                  // Evaluate condition using the imported function
                  const conditionResult = evaluateCondition(
                    node.data as ConditionData, 
                    marketData
                  );
                  
                  // Follow the correct path based on condition result
                  const nextNodesForCondition = this.findNextNodesWithCondition(node.id, conditionResult);
                  nextNodes.push(...nextNodesForCondition);
                  break;
                }
                
                case 'orderExecution': {
                  const orderData = node.data as OrderExecutionData;
                  if (!orderData.orderType || !orderData.side || orderData.quantity === undefined) {
                    continue;
                  }
                  
                  // Execute the order
                  const price = dataPoint.close; // For simplicity, using close price
                  let quantity: number;
                  
                  if (orderData.quantity === 'all') {
                    // Sell all if selling, or use all cash if buying
                    if (orderData.side === 'sell') {
                      quantity = positions[ticker]?.quantity || 0;
                    } else {
                      quantity = Math.floor(cash / price);
                    }
                  } else {
                    quantity = Number(orderData.quantity);
                  }
                  
                  // Skip if quantity is zero
                  if (quantity <= 0) continue;
                  
                  const value = price * quantity;
                  const commission = (this.params.commission || 0) * quantity;
                  
                  // Process the trade
                  if (orderData.side === 'buy') {
                    if (cash >= value + commission) {
                      // Deduct cash
                      cash -= (value + commission);
                      
                      // Add to position
                      if (!positions[ticker]) {
                        positions[ticker] = { quantity: 0, avgPrice: 0 };
                      }
                      
                      // Update average price
                      const totalShares = positions[ticker].quantity + quantity;
                      const totalCost = (positions[ticker].quantity * positions[ticker].avgPrice) + value;
                      positions[ticker].avgPrice = totalCost / totalShares;
                      positions[ticker].quantity = totalShares;
                      
                      // Record the trade
                      result.trades.push({
                        date: currentDate,
                        side: 'buy',
                        ticker,
                        quantity,
                        price,
                        value,
                        commission
                      });
                    }
                  } else if (orderData.side === 'sell') {
                    const availableShares = positions[ticker]?.quantity || 0;
                    if (availableShares >= quantity) {
                      // Add cash
                      cash += (value - commission);
                      
                      // Reduce position
                      positions[ticker].quantity -= quantity;
                      if (positions[ticker].quantity === 0) {
                        delete positions[ticker];
                      }
                      
                      // Record the trade
                      result.trades.push({
                        date: currentDate,
                        side: 'sell',
                        ticker,
                        quantity,
                        price,
                        value,
                        commission
                      });
                    }
                  }
                  
                  // Order execution nodes don't have outgoing connections
                  break;
                }
                
                default:
                  // For any other node, just follow to the next ones
                  nextNodes.push(...this.findNextNodes(node.id));
              }
            }
            
            currentNodes = nextNodes;
          }
        }
      }
      
      // Calculate equity at the end of this day
      let equity = cash;
      for (const [ticker, position] of Object.entries(positions)) {
        const latestPrice = this.historicalData[ticker].find(
          d => d.date.toISOString().split('T')[0] === day
        )?.close || 0;
        
        equity += position.quantity * latestPrice;
      }
      
      // Record equity point
      result.equity.push({
        date: new Date(day),
        equity
      });
      
      prevEquity = equity;
    }
    
    // Calculate performance metrics
    const finalEquity = result.equity.length ? result.equity[result.equity.length - 1].equity : this.params.initialCapital;
    result.performance.totalReturn = finalEquity - this.params.initialCapital;
    result.performance.totalReturnPct = (result.performance.totalReturn / this.params.initialCapital) * 100;
    
    // More elaborate metrics would be calculated here in a real implementation
    result.performance.numberOfTrades = result.trades.length;
    
    // Calculate win rate
    const profitableTrades = result.trades.filter(trade => {
      if (trade.side === 'buy') return false; // Can't determine profit on buys alone
      const correspondingBuy = result.trades.find(t => 
        t.side === 'buy' && t.ticker === trade.ticker && t.date < trade.date
      );
      return correspondingBuy && trade.price > correspondingBuy.price;
    });
    
    result.performance.winRate = result.trades.length ? 
      (profitableTrades.length / result.trades.length) * 100 : 0;
    
    // Calculate max drawdown
    let maxEquity = this.params.initialCapital;
    let maxDrawdown = 0;
    
    for (const point of result.equity) {
      if (point.equity > maxEquity) {
        maxEquity = point.equity;
      }
      
      const drawdown = (maxEquity - point.equity) / maxEquity;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    result.performance.maxDrawdown = maxDrawdown * 100;
    result.success = true;
    
    return result;
  }
}

export const runBacktest = async (
  nodes: Node<NodeData>[], 
  edges: Edge[], 
  params: BacktestParams
): Promise<BacktestResult> => {
  const service = new BacktestService(nodes, edges, params);
  return await service.runBacktest();
};
