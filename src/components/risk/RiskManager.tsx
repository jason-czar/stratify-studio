
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BarChart, Percent, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function RiskManager() {
  const [positionSize, setPositionSize] = useState<number>(1000);
  const [accountSize, setAccountSize] = useState<number>(10000);
  const [stopLossPercent, setStopLossPercent] = useState<number>(2);
  const [riskPerTradePercent, setRiskPerTradePercent] = useState<number>(1);
  const { toast } = useToast();

  // Calculate maximum position size based on risk parameters
  const calculateMaxPositionSize = () => {
    const maxRiskAmount = (accountSize * riskPerTradePercent) / 100;
    return maxRiskAmount / (stopLossPercent / 100);
  };

  const maxPositionSize = calculateMaxPositionSize();
  const riskAmount = (positionSize * stopLossPercent) / 100;
  const riskPercentOfAccount = (riskAmount / accountSize) * 100;

  // Risk assessment
  const getRiskLevel = () => {
    if (riskPercentOfAccount > 3) return { level: 'high', color: 'text-red-500' };
    if (riskPercentOfAccount > 1) return { level: 'moderate', color: 'text-amber-500' };
    return { level: 'low', color: 'text-green-500' };
  };

  const riskAssessment = getRiskLevel();

  const handleSaveRiskSettings = () => {
    toast({
      title: "Risk settings saved",
      description: "Your risk management parameters have been updated",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Risk Management</CardTitle>
        <CardDescription>
          Analyze and control your trading risk exposure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calculator">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="calculator">Position Sizer</TabsTrigger>
            <TabsTrigger value="settings">Risk Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="account-size">Account Size ($)</Label>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    id="account-size"
                    type="number"
                    value={accountSize}
                    onChange={(e) => setAccountSize(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="risk-per-trade">Risk Per Trade (%)</Label>
                  <span className="text-sm">{riskPerTradePercent}%</span>
                </div>
                <Slider
                  id="risk-per-trade"
                  min={0.1}
                  max={5}
                  step={0.1}
                  value={[riskPerTradePercent]}
                  onValueChange={(value) => setRiskPerTradePercent(value[0])}
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="stop-loss">Stop Loss (%)</Label>
                  <span className="text-sm">{stopLossPercent}%</span>
                </div>
                <Slider
                  id="stop-loss"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={[stopLossPercent]}
                  onValueChange={(value) => setStopLossPercent(value[0])}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="position-size">Position Size ($)</Label>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    id="position-size"
                    type="number"
                    value={positionSize}
                    onChange={(e) => setPositionSize(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>
              </div>
              
              <div className="rounded-md border p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Maximum Position Size:</span>
                  <span className="font-medium">${maxPositionSize.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Risk Amount:</span>
                  <span className="font-medium">${riskAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Account % at Risk:</span>
                  <span className={`font-medium ${riskAssessment.color}`}>{riskPercentOfAccount.toFixed(2)}%</span>
                </div>
              </div>
              
              {riskPercentOfAccount > riskPerTradePercent && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Risk Warning</AlertTitle>
                  <AlertDescription>
                    Your position size exceeds your risk parameters. 
                    Consider reducing your position to ${maxPositionSize.toFixed(2)} or less.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="max-risk-per-trade">Default Risk Per Trade</Label>
                <div className="flex items-center">
                  <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    id="max-risk-per-trade"
                    type="number"
                    value={riskPerTradePercent}
                    onChange={(e) => setRiskPerTradePercent(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="max-open-positions">Maximum Open Positions</Label>
                <Input
                  id="max-open-positions"
                  type="number"
                  defaultValue="5"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="max-daily-drawdown">Maximum Daily Drawdown (%)</Label>
                <div className="flex items-center">
                  <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    id="max-daily-drawdown"
                    type="number"
                    defaultValue="3"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="max-correlation">Maximum Sector Concentration (%)</Label>
                <div className="flex items-center">
                  <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    id="max-correlation"
                    type="number"
                    defaultValue="25"
                  />
                </div>
              </div>
              
              <Button className="w-full" onClick={handleSaveRiskSettings}>
                Save Risk Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
