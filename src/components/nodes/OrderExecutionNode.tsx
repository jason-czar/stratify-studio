
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { DollarSign } from 'lucide-react';
import { OrderExecutionData } from '../../types/nodes';

const OrderExecutionNode: React.FC<NodeProps<OrderExecutionData>> = ({ data, isConnectable }) => {
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
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm min-w-[220px]">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
          <DollarSign className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <div className="font-medium">{data.label || 'Execute Order'}</div>
        </div>
      </div>
      
      <div className={`p-2 rounded text-sm mb-2 ${
        data.side === 'buy' ? 'bg-green-50 text-green-800' : 
        data.side === 'sell' ? 'bg-red-50 text-red-800' : 'bg-gray-50'
      }`}>
        {getOrderSummary()}
      </div>
      
      {data.timeInForce && (
        <div className="text-xs bg-gray-50 p-1 rounded inline-block">
          TIF: {data.timeInForce.toUpperCase()}
        </div>
      )}
      
      {data.description && (
        <div className="text-xs text-gray-500 mt-1">{data.description}</div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </div>
  );
};

export default OrderExecutionNode;
