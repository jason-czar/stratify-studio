
import React from 'react';
import { Button } from '@/components/ui/button';
import { SaveAlgorithmDialog } from '@/components/SaveAlgorithmDialog';
import { useNavigate } from 'react-router-dom';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/types/nodes';

interface AlgorithmControlsProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onSaveSuccess: () => void;
}

export const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({ nodes, edges, onSaveSuccess }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-center space-x-4">
      <SaveAlgorithmDialog 
        nodes={nodes}
        edges={edges}
        onSaveSuccess={onSaveSuccess}
      />
      
      <Button 
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4"
        onClick={() => {
          // This would trigger deployment to Alpaca
          // For now, just navigate to dashboard
          navigate('/dashboard');
        }}
      >
        Deploy to Alpaca
      </Button>
    </div>
  );
};
