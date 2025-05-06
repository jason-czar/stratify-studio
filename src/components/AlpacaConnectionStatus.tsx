
import React, { useState, useEffect } from 'react';
import { AlpacaService } from '@/services/alpacaService';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw, DollarSign } from 'lucide-react';

export function AlpacaConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkConnection = async () => {
    try {
      setIsLoading(true);
      const connected = await AlpacaService.verifyConnection();
      setIsConnected(connected);
      
      if (connected) {
        const account = await AlpacaService.getAccount();
        setAccountInfo(account);
        toast({
          title: "Connection successful",
          description: "Successfully connected to Alpaca API",
        });
      }
    } catch (error) {
      console.error("Error checking Alpaca connection:", error);
      toast({
        title: "Connection failed",
        description: "Failed to connect to Alpaca API. Check your API keys.",
        variant: "destructive",
      });
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(value));
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
            Alpaca Connection
          </CardTitle>
          {isConnected !== null && (
            <Badge variant={isConnected ? "success" : "destructive"} className={`${isConnected ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <RefreshCw className="h-5 w-5 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Checking connection...</span>
          </div>
        ) : (
          <div>
            {isConnected ? (
              <div className="space-y-3">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" /> 
                  <span>Successfully connected to Alpaca API</span>
                </div>
                
                {accountInfo && (
                  <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <div className="text-gray-500">Account ID:</div>
                    <div className="font-medium">{accountInfo.id}</div>
                    
                    <div className="text-gray-500">Account Status:</div>
                    <div className="font-medium">{accountInfo.status}</div>
                    
                    <div className="text-gray-500">Cash Balance:</div>
                    <div className="font-medium">{formatCurrency(accountInfo.cash)}</div>
                    
                    <div className="text-gray-500">Portfolio Value:</div>
                    <div className="font-medium">{formatCurrency(accountInfo.portfolio_value)}</div>
                    
                    <div className="text-gray-500">Buying Power:</div>
                    <div className="font-medium">{formatCurrency(accountInfo.buying_power)}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <XCircle className="h-5 w-5 mr-2" />
                <span>Failed to connect to Alpaca API. Please check your API keys.</span>
              </div>
            )}
            
            <Button 
              onClick={checkConnection} 
              variant="outline" 
              className="mt-4 w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Connection
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AlpacaConnectionStatus;
