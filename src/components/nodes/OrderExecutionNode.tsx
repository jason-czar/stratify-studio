
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { DollarSign } from 'lucide-react';
import { OrderExecutionData } from '../../types/nodes';
import { useTheme } from '@/contexts/ThemeContext';

const OrderExecutionNode: React.FC<NodeProps<OrderExecutionData>> = ({ data, isConnectable }) => {
  const { theme } = useTheme();
  
  const getOrderSummary = () => {
    if (data.side && data.orderType) {
      const quantityText = data.quantity === 'all' 
        ? 'All available' 
        : data.quantity ? `${data.quantity} shares` : '';
      
      const priceText = data.price ? `@ $${data.price}` : '';
      
      return `${data.side.toUpperCase()} ${data.orderType} ${quantityText} ${priceText}`;
    }
    return 'Order not configured';
  };

  // Determine background colors based on side (buy/sell) and theme
  const getBgColor = () => {
    if (theme === 'dark') {
      return data.side === 'buy' ? 'bg-green-950/50 text-green-400' : 
             data.side === 'sell' ? 'bg-red-950/50 text-red-400' : 'bg-[#3A3A3A]';
    } else {
      return data.side === 'buy' ? 'bg-green-50 text-green-800' : 
             data.side === 'sell' ? 'bg-red-50 text-red-800' : 'bg-gray-50';
    }
  };
  
  return (
    <div className={`${theme === 'dark' ? 'bg-[#2C2C2C] text-white border-[#3A3A3A]' : 'bg-white text-foreground border-gray-200'} border rounded-lg p-4 shadow-md min-w-[220px] backdrop-blur-sm`}>
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 rounded-full bg-green-100/20 flex items-center justify-center mr-2">
          <DollarSign className="h-4 w-4 text-green-500" />
        </div>
        <div>
          <div className="font-medium">{data.label || 'Execute Order'}</div>
        </div>
      </div>
      
      <div className={`p-2 rounded text-sm mb-2 ${getBgColor()}`}>
        {getOrderSummary()}
      </div>
      
      {data.timeInForce && (
        <div className={`text-xs ${theme === 'dark' ? 'bg-[#3A3A3A]' : 'bg-gray-50'} p-1 rounded inline-block`}>
          TIF: {data.timeInForce.toUpperCase()}
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
    </div>
  );
};

export default OrderExecutionNode;
