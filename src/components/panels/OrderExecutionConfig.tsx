
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderExecutionData } from '../../types/nodes';

interface OrderExecutionConfigProps {
  data: OrderExecutionData;
  onChange: (data: Partial<OrderExecutionData>) => void;
}

const OrderExecutionConfig: React.FC<OrderExecutionConfigProps> = ({ data, onChange }) => {
  const handleQuantityTypeChange = (type: string) => {
    if (type === 'all') {
      onChange({ quantity: 'all' });
    } else if (type === 'specific') {
      onChange({ quantity: 1 });
    }
  };

  const isSpecificQuantity = data.quantity !== 'all' && data.quantity !== undefined;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="node-label">Label</Label>
        <Input
          id="node-label"
          value={data.label || ''}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="Order Execution"
        />
      </div>

      <div>
        <Label htmlFor="order-side">Order Side</Label>
        <Select
          value={data.side || ''}
          onValueChange={(value) => onChange({ side: value as OrderExecutionData['side'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select order side" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buy">Buy</SelectItem>
            <SelectItem value="sell">Sell</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="order-type">Order Type</Label>
        <Select
          value={data.orderType || ''}
          onValueChange={(value) => onChange({ orderType: value as OrderExecutionData['orderType'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select order type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="market">Market</SelectItem>
            <SelectItem value="limit">Limit</SelectItem>
            <SelectItem value="stop">Stop</SelectItem>
            <SelectItem value="stop_limit">Stop Limit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Quantity</Label>
        <div className="flex space-x-2">
          <Select
            value={isSpecificQuantity ? 'specific' : 'all'}
            onValueChange={handleQuantityTypeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Quantity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="specific">Specific amount</SelectItem>
              <SelectItem value="all">All available</SelectItem>
            </SelectContent>
          </Select>

          {isSpecificQuantity && (
            <Input
              type="number"
              value={data.quantity?.toString() || '1'}
              onChange={(e) => onChange({ quantity: parseInt(e.target.value) || 1 })}
              min="1"
              className="flex-1"
            />
          )}
        </div>
      </div>

      {(data.orderType === 'limit' || data.orderType === 'stop' || data.orderType === 'stop_limit') && (
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={data.price?.toString() || ''}
            onChange={(e) => onChange({ price: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            step="0.01"
          />
        </div>
      )}

      <div>
        <Label htmlFor="time-in-force">Time In Force</Label>
        <Select
          value={data.timeInForce || ''}
          onValueChange={(value) => onChange({ timeInForce: value as OrderExecutionData['timeInForce'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select time in force" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="gtc">Good Till Canceled (GTC)</SelectItem>
            <SelectItem value="ioc">Immediate or Cancel (IOC)</SelectItem>
            <SelectItem value="fok">Fill or Kill (FOK)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Optional description"
        />
      </div>
    </div>
  );
};

export default OrderExecutionConfig;
