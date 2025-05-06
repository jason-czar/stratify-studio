
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Play } from 'lucide-react';
import { StartNodeData } from '../../types/nodes';
import { useTheme } from '@/contexts/ThemeContext';

const StartNode: React.FC<NodeProps<StartNodeData>> = ({ data, isConnectable }) => {
  const { theme } = useTheme();

  return (
    <div className={`${theme === 'dark' ? 'bg-[#2C2C2C] text-white border-[#3A3A3A]' : 'bg-white text-foreground border-gray-200'} border rounded-lg p-4 shadow-md min-w-[180px] backdrop-blur-sm`}>
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-green-100/20 flex items-center justify-center mr-2">
          <Play className="h-4 w-4 text-green-500" />
        </div>
        <div>
          <div className="font-medium">{data.label || 'Start'}</div>
          <div className="text-xs text-muted-foreground">{data.description || 'Algorithm entry point'}</div>
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
