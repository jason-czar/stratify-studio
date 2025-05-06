
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StockSelectionData } from '../../types/nodes';

interface StockSelectionConfigProps {
  data: StockSelectionData;
  onChange: (data: Partial<StockSelectionData>) => void;
}

const StockSelectionConfig: React.FC<StockSelectionConfigProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="node-label">Label</Label>
        <Input
          id="node-label"
          value={data.label || ''}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="Stock Selection"
        />
      </div>

      <div>
        <Label htmlFor="ticker">Ticker Symbol</Label>
        <Input
          id="ticker"
          value={data.ticker || ''}
          onChange={(e) => onChange({ ticker: e.target.value.toUpperCase() })}
          placeholder="AAPL"
        />
      </div>

      <div>
        <Label htmlFor="market-type">Market Type</Label>
        <Select
          value={data.marketType || ''}
          onValueChange={(value) => onChange({ marketType: value as StockSelectionData['marketType'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select market type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stock">Stock</SelectItem>
            <SelectItem value="crypto">Cryptocurrency</SelectItem>
            <SelectItem value="forex">Forex</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="exchange">Exchange</Label>
        <Input
          id="exchange"
          value={data.exchange || ''}
          onChange={(e) => onChange({ exchange: e.target.value })}
          placeholder="NASDAQ"
        />
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

export default StockSelectionConfig;
