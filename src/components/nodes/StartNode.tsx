
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Play } from 'lucide-react';
import { StartNodeData } from '../../types/nodes';

const StartNode: React.FC<NodeProps<StartNodeData>> = ({ data, isConnectable }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm min-w-[180px]">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
          <Play className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <div className="font-medium">{data.label || 'Start'}</div>
          <div className="text-xs text-gray-500">{data.description || 'Algorithm entry point'}</div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </div>
  );
};

export default StartNode;
