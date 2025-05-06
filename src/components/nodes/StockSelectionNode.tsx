
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Search } from 'lucide-react';
import { StockSelectionData } from '../../types/nodes';

const StockSelectionNode = ({ data, isConnectable }) => {
  const nodeData: StockSelectionData = data;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm min-w-[200px]">
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
          <Search className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <div className="font-medium">{nodeData.label || 'Select Stock'}</div>
        </div>
      </div>
      
      {nodeData.ticker && (
        <div className="bg-gray-50 p-2 rounded text-sm mb-2">
          <span className="font-semibold">Ticker:</span> {nodeData.ticker}
          {nodeData.exchange && <span className="ml-1 text-gray-500">({nodeData.exchange})</span>}
        </div>
      )}
      
      {nodeData.description && (
        <div className="text-xs text-gray-500 mt-1">{nodeData.description}</div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );
};

export default StockSelectionNode;
