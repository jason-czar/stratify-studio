
import React from 'react';
import { BacktestResult, BacktestTrade } from '@/services/backtest';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceChart } from './PerformanceChart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BacktestResultsProps {
  result: BacktestResult;
}

export function BacktestResults({ result }: BacktestResultsProps) {
  // Format equity curve data for charting
  const equityData = result.equity.map(point => ({
    date: point.date.toLocaleDateString(),
    value: point.equity,
  }));

  // Calculate daily returns for returns chart
  const dailyReturns = result.equity.map((point, index, array) => {
    if (index === 0) return { date: point.date.toLocaleDateString(), value: 0 };
    const previousValue = array[index - 1].equity;
    const dailyReturn = ((point.equity - previousValue) / previousValue) * 100;
    return {
      date: point.date.toLocaleDateString(),
      value: parseFloat(dailyReturn.toFixed(2)),
    };
  }).slice(1); // Remove first point which is always 0

  return (
    <div className="space-y-6">
      {!result.success ? (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Backtest Failed</CardTitle>
            <CardDescription>The backtest could not be completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.errors.map((error, index) => (
                <div key={index} className="p-3 bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Return</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  +{result.performance.totalReturnPct.toFixed(2)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {result.performance.winRate.toFixed(0)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  -{result.performance.maxDrawdown.toFixed(2)}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="equity">
            <TabsList className="mb-4">
              <TabsTrigger value="equity">Equity Curve</TabsTrigger>
              <TabsTrigger value="returns">Returns</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="equity">
              <PerformanceChart 
                title="Equity Curve" 
                description="Account equity over time" 
                data={equityData} 
                valuePrefix="$" 
                height={400}
              />
            </TabsContent>
            
            <TabsContent value="returns">
              <PerformanceChart 
                title="Daily Returns" 
                description="Percentage returns by day" 
                data={dailyReturns} 
                valueSuffix="%" 
                height={400}
              />
            </TabsContent>
            
            <TabsContent value="trades">
              <Card>
                <CardHeader>
                  <CardTitle>Trades</CardTitle>
                  <CardDescription>All trades executed during the backtest</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Side</TableHead>
                          <TableHead>Symbol</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.trades.map((trade, index) => (
                          <TableRow key={index}>
                            <TableCell>{trade.date.toLocaleDateString()}</TableCell>
                            <TableCell>
                              <span className={`font-medium ${
                                trade.side === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                              }`}>
                                {trade.side.toUpperCase()}
                              </span>
                            </TableCell>
                            <TableCell>{trade.ticker}</TableCell>
                            <TableCell className="text-right">${trade.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{trade.quantity}</TableCell>
                            <TableCell className="text-right">${trade.value.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  Showing {result.trades.length} trades
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Statistics</CardTitle>
                  <CardDescription>Detailed backtest performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Return</span>
                        <span className="font-medium">{result.performance.totalReturnPct.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Return ($)</span>
                        <span className="font-medium">${result.performance.totalReturn.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annualized Return</span>
                        <span className="font-medium">{result.performance.annualizedReturn.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sharpe Ratio</span>
                        <span className="font-medium">{result.performance.sharpeRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Drawdown</span>
                        <span className="font-medium">{result.performance.maxDrawdown.toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Win Rate</span>
                        <span className="font-medium">{result.performance.winRate.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Number of Trades</span>
                        <span className="font-medium">{result.performance.numberOfTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profit Factor</span>
                        <span className="font-medium">{result.performance.profitFactor.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average Trade</span>
                        <span className="font-medium">
                          ${(result.performance.totalReturn / result.performance.numberOfTrades).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
