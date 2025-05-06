
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Search } from 'lucide-react';
import { StockSelectionData } from '../../types/nodes';
import { useTheme } from '@/contexts/ThemeContext';

const StockSelectionNode: React.FC<NodeProps<StockSelectionData>> = ({ data, isConnectable }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`${theme === 'dark' ? 'bg-[#2C2C2C] text-white border-[#3A3A3A]' : 'bg-white text-foreground border-gray-200'} border rounded-lg p-4 shadow-md min-w-[200px] backdrop-blur-sm`}>
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 rounded-full bg-blue-100/20 flex items-center justify-center mr-2">
          <Search className="h-4 w-4 text-blue-500" />
        </div>
        <div>
          <div className="font-medium">{data.label || 'Select Stock'}</div>
        </div>
      </div>
      
      {data.ticker && (
        <div className={`${theme === 'dark' ? 'bg-[#3A3A3A]' : 'bg-gray-50'} p-2 rounded text-sm mb-2`}>
          <span className="font-semibold">Ticker:</span> {data.ticker}
          {data.exchange && <span className="ml-1 text-muted-foreground">({data.exchange})</span>}
        </div>
      )}
      
      {data.description && (
        <div className="text-xs text-muted-foreground mt-1">{data.description}</div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-gray-400 border-2 border-background"
      />
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500 border-2 border-background"
      />
    </div>
  );
};

export default StockSelectionNode;
