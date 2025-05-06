
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Filter } from 'lucide-react';
import { ConditionData } from '../../types/nodes';

const ConditionNode = ({ data, isConnectable }) => {
  const nodeData: ConditionData = data;
  
  const getConditionLabel = () => {
    if (nodeData.conditionType && nodeData.operator && nodeData.value !== undefined) {
      if (nodeData.conditionType === 'technical' && nodeData.indicator) {
        return `${nodeData.indicator} ${nodeData.operator} ${nodeData.value}`;
      } else if (nodeData.conditionType === 'price') {
        return `Price ${nodeData.operator} $${nodeData.value}`;
      } else if (nodeData.conditionType === 'time' && nodeData.timeframe) {
        return `Time: ${nodeData.timeframe}`;
      }
    }
    return 'No condition set';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm min-w-[220px]">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
          <Filter className="h-4 w-4 text-purple-600" />
        </div>
        <div>
          <div className="font-medium">{nodeData.label || 'Condition'}</div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-2 rounded text-sm mb-2">
        {getConditionLabel()}
      </div>
      
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
        id="outTrue"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500 border-2 border-white left-[25%]"
      />
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="outFalse"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-red-500 border-2 border-white left-[75%]"
      />
    </div>
  );
};

export default ConditionNode;
