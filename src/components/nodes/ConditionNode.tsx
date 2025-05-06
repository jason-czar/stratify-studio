
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Filter } from 'lucide-react';
import { ConditionData } from '../../types/nodes';

const ConditionNode: React.FC<NodeProps<ConditionData>> = ({ data, isConnectable }) => {
  const getConditionLabel = () => {
    if (data.conditionType && data.operator && data.value !== undefined) {
      if (data.conditionType === 'technical' && data.indicator) {
        return `${data.indicator} ${data.operator} ${data.value}`;
      } else if (data.conditionType === 'price') {
        return `Price ${data.operator} $${data.value}`;
      } else if (data.conditionType === 'time' && data.timeframe) {
        return `Time: ${data.timeframe}`;
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
          <div className="font-medium">{data.label || 'Condition'}</div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-2 rounded text-sm mb-2">
        {getConditionLabel()}
      </div>
      
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
