
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/types/nodes';
import { BacktestParams, BacktestResult, runBacktest } from '@/services/backtest';
import { validateAlgorithm } from '@/utils/algorithmValidation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BacktestPanelProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
}

const BacktestPanel: React.FC<BacktestPanelProps> = ({ nodes, edges }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [params, setParams] = useState<BacktestParams>({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    endDate: new Date(),
    initialCapital: 10000,
    commission: 0.99
  });
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setParams(prev => ({
      ...prev,
      [field]: new Date(value)
    }));
  };

  const handleNumberChange = (field: 'initialCapital' | 'commission', value: string) => {
    setParams(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleRunBacktest = async () => {
    // Validate the algorithm first
    const validation = validateAlgorithm(nodes, edges);
    setValidationErrors(validation.errors);
    setValidationWarnings(validation.warnings);
    
    if (!validation.isValid) {
      return;
    }
    
    setIsRunning(true);
    try {
      const backtestResult = await runBacktest(nodes, edges, params);
      setResult(backtestResult);
    } catch (error) {
      console.error('Backtest failed:', error);
      setValidationErrors([`Backtest failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Backtest</CardTitle>
        <CardDescription>Test your trading algorithm with historical data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={params.startDate.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={params.endDate.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="initial-capital">Initial Capital ($)</Label>
              <Input
                id="initial-capital"
                type="number"
                min="100"
                step="100"
                value={params.initialCapital}
                onChange={(e) => handleNumberChange('initialCapital', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="commission">Commission ($ per trade)</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                step="0.01"
                value={params.commission}
                onChange={(e) => handleNumberChange('commission', e.target.value)}
              />
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded p-3 text-sm">
              <strong>Errors:</strong>
              <ul className="list-disc pl-5 mt-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {validationWarnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-3 text-sm">
              <strong>Warnings:</strong>
              <ul className="list-disc pl-5 mt-1">
                {validationWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <Button 
            onClick={handleRunBacktest}
            disabled={isRunning} 
            className="w-full"
          >
            {isRunning ? 'Running...' : 'Run Backtest'}
          </Button>

          {result && (
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold">Results</h3>
              
              <div className="bg-gray-50 p-4 rounded border">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>Total Return:</div>
                  <div className={result.performance.totalReturnPct >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {result.performance.totalReturn.toFixed(2)} ({result.performance.totalReturnPct.toFixed(2)}%)
                  </div>
                  
                  <div>Number of Trades:</div>
                  <div>{result.performance.numberOfTrades}</div>
                  
                  <div>Win Rate:</div>
                  <div>{result.performance.winRate.toFixed(2)}%</div>
                  
                  <div>Max Drawdown:</div>
                  <div className="text-red-600">{result.performance.maxDrawdown.toFixed(2)}%</div>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={result.equity.map(point => ({
                      date: point.date.toLocaleDateString(),
                      equity: point.equity
                    }))}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      interval="preserveEnd" 
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="equity" 
                      stroke="#3b82f6" 
                      name="Portfolio Value ($)" 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {result.trades.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold mb-2">Recent Trades</h4>
                  <div className="max-h-40 overflow-y-auto">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1 text-left">Date</th>
                          <th className="px-2 py-1 text-left">Ticker</th>
                          <th className="px-2 py-1 text-left">Side</th>
                          <th className="px-2 py-1 text-right">Qty</th>
                          <th className="px-2 py-1 text-right">Price</th>
                          <th className="px-2 py-1 text-right">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.trades.slice(-5).reverse().map((trade, index) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="px-2 py-1">{trade.date.toLocaleDateString()}</td>
                            <td className="px-2 py-1">{trade.ticker}</td>
                            <td className={`px-2 py-1 ${trade.side === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                              {trade.side}
                            </td>
                            <td className="px-2 py-1 text-right">{trade.quantity}</td>
                            <td className="px-2 py-1 text-right">${trade.price.toFixed(2)}</td>
                            <td className="px-2 py-1 text-right">${trade.value.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BacktestPanel;
